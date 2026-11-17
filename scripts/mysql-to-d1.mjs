#!/usr/bin/env node
/**
 * Converts a mysqldump of the Fertilikey tables into SQLite for D1.
 *
 *   node scripts/mysql-to-d1.mjs <dump.sql> --schema-out <file> --data-out <file> [--tables institutions,searchLog]
 *
 * The schema file becomes the first D1 migration; the data file is loaded once
 * with `wrangler d1 execute --file`. Expects a dump made with --skip-triggers
 * and without --routines (see MIGRATION.md).
 */
import { readFileSync, writeFileSync } from 'node:fs';

// D1 caps a single SQL statement at 100 KB; stay well under it.
const MAX_INSERT_BYTES = 90_000;

const args = parseArgs(process.argv.slice(2));
const dump = readFileSync(args.input, 'utf8');
const tables = new Set(args.tables);

const schema = [];
const indexes = [];
const data = [];
const seen = new Set();

for (const statement of splitStatements(dump)) {
  const create = statement.match(/^CREATE TABLE `([^`]+)`/i);
  if (create) {
    if (tables.has(create[1])) {
      seen.add(create[1]);
      const converted = convertCreateTable(statement);
      schema.push(converted.table);
      indexes.push(...converted.indexes);
    }
    continue;
  }

  const insert = statement.match(/^INSERT INTO `([^`]+)`/i);
  if (insert) {
    if (tables.has(insert[1])) {
      data.push(...convertInsert(statement));
    }
    continue;
  }

  if (!/^(DROP TABLE|LOCK TABLES|UNLOCK TABLES|SET )/i.test(statement)) {
    warn(`skipped statement: ${statement.slice(0, 80).replace(/\s+/g, ' ')}`);
  }
}

for (const table of tables) {
  if (!seen.has(table)) {
    console.error(`error: table \`${table}\` not found in ${args.input}`);
    process.exit(1);
  }
}

writeFileSync(args.schemaOut, [...schema, ...indexes].join('\n\n') + '\n');
writeFileSync(args.dataOut, data.join('\n') + '\n');
console.log(`schema: ${schema.length} tables, ${indexes.length} indexes -> ${args.schemaOut}`);
console.log(`data: ${data.length} INSERT statements -> ${args.dataOut}`);

function parseArgs(argv) {
  const parsed = { tables: ['institutions', 'searchLog'] };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--schema-out') parsed.schemaOut = argv[++i];
    else if (arg === '--data-out') parsed.dataOut = argv[++i];
    else if (arg === '--tables') parsed.tables = argv[++i].split(',').map((t) => t.trim());
    else parsed.input = arg;
  }
  if (!parsed.input || !parsed.schemaOut || !parsed.dataOut) {
    console.error('usage: mysql-to-d1.mjs <dump.sql> --schema-out <file> --data-out <file> [--tables a,b]');
    process.exit(1);
  }
  return parsed;
}

function warn(message) {
  console.error(`warning: ${message}`);
}

/**
 * Splits a dump into statements on `;`, ignoring semicolons inside strings,
 * and drops `--` comments and `/* *\/` blocks (including MySQL's `/*!` ones).
 */
function* splitStatements(sql) {
  let current = '';
  let i = 0;
  while (i < sql.length) {
    const ch = sql[i];
    if (ch === "'" || ch === '"' || ch === '`') {
      const end = endOfQuoted(sql, i);
      current += sql.slice(i, end);
      i = end;
    } else if (ch === '-' && sql[i + 1] === '-' && /\s/.test(sql[i + 2] ?? ' ')) {
      i = sql.indexOf('\n', i);
      if (i === -1) i = sql.length;
    } else if (ch === '/' && sql[i + 1] === '*') {
      const end = sql.indexOf('*/', i + 2);
      i = end === -1 ? sql.length : end + 2;
    } else if (ch === ';') {
      if (current.trim()) yield current.trim();
      current = '';
      i++;
    } else {
      current += ch;
      i++;
    }
  }
  if (current.trim()) yield current.trim();
}

/** Index just past the quoted run starting at `start`, honouring MySQL escapes. */
function endOfQuoted(sql, start) {
  const quote = sql[start];
  let i = start + 1;
  while (i < sql.length) {
    if (sql[i] === '\\' && quote !== '`') {
      i += 2;
    } else if (sql[i] === quote) {
      if (sql[i + 1] === quote) {
        i += 2;
      } else {
        return i + 1;
      }
    } else {
      i++;
    }
  }
  throw new Error(`unterminated ${quote} quote at offset ${start}`);
}

function convertCreateTable(statement) {
  const table = statement.match(/^CREATE TABLE `([^`]+)`/i)[1];
  const body = statement.slice(statement.indexOf('(') + 1, statement.lastIndexOf(')'));
  const lines = body.split('\n').map((line) => line.trim().replace(/,$/, '')).filter(Boolean);

  const columns = [];
  const constraints = [];
  const indexes = [];
  let auto_increment_column = null;
  let primary_key = null;

  for (const line of lines) {
    if (line.startsWith('`')) {
      const column = convertColumn(line);
      if (column.auto_increment) auto_increment_column = column.name;
      columns.push(column);
    } else if (/^PRIMARY KEY/i.test(line)) {
      primary_key = indexColumns(line);
    } else if (/^UNIQUE KEY/i.test(line)) {
      constraints.push(`UNIQUE (${indexColumns(line).map(quoteIdent).join(', ')})`);
    } else if (/^KEY/i.test(line)) {
      const name = line.match(/^KEY `([^`]+)`/i)[1];
      const cols = indexColumns(line).map(quoteIdent).join(', ');
      indexes.push(`CREATE INDEX IF NOT EXISTS ${quoteIdent(`${table}_${name}`)} ON ${quoteIdent(table)} (${cols});`);
    } else {
      warn(`${table}: dropped "${line}"`);
    }
  }

  const single_auto_pk =
    auto_increment_column && primary_key?.length === 1 && primary_key[0] === auto_increment_column;
  if (auto_increment_column && !single_auto_pk) {
    warn(`${table}: AUTO_INCREMENT on ${auto_increment_column} is not the sole primary key; it will not auto-increment`);
  }

  const definitions = columns.map((column) => {
    if (single_auto_pk && column.name === auto_increment_column) {
      return `  ${quoteIdent(column.name)} INTEGER PRIMARY KEY AUTOINCREMENT`;
    }
    return `  ${quoteIdent(column.name)} ${column.definition}`.trimEnd();
  });
  if (primary_key && !single_auto_pk) {
    constraints.unshift(`PRIMARY KEY (${primary_key.map(quoteIdent).join(', ')})`);
  }
  definitions.push(...constraints.map((constraint) => `  ${constraint}`));

  return {
    table: `CREATE TABLE IF NOT EXISTS ${quoteIdent(table)} (\n${definitions.join(',\n')}\n);`,
    indexes,
  };
}

function convertColumn(line) {
  const match = line.match(/^`([^`]+)`\s+([a-z]+)(\([^)]*\))?(.*)$/i);
  if (!match) throw new Error(`cannot parse column: ${line}`);
  const [, name, mysql_type, , rest_raw] = match;

  let rest = rest_raw
    .replace(/\bunsigned\b|\bzerofill\b/gi, '')
    .replace(/\bCHARACTER SET \w+/gi, '')
    .replace(/\bCOLLATE \w+/gi, '')
    .replace(/\bON UPDATE CURRENT_TIMESTAMP(\(\d*\))?/gi, '')
    .replace(/\bCOMMENT '(?:[^'\\]|\\.|'')*'/gi, '')
    .replace(/\bDEFAULT_GENERATED\b/gi, '')
    .replace(/\bCURRENT_TIMESTAMP\(\d*\)/gi, 'CURRENT_TIMESTAMP')
    .replace(/\bDEFAULT \(?(now|current_timestamp)\(\)\)?/gi, 'DEFAULT CURRENT_TIMESTAMP');

  const auto_increment = /\bAUTO_INCREMENT\b/i.test(rest);
  rest = rest.replace(/\bAUTO_INCREMENT\b/gi, '');
  rest = rest.replace(/'((?:[^'\\]|\\.|'')*)'/g, (_, inner) => sqliteString(unescapeMysql(inner)));

  return {
    name,
    auto_increment,
    definition: `${sqliteType(mysql_type)} ${rest.replace(/\s+/g, ' ').trim()}`,
  };
}

function sqliteType(mysql_type) {
  const type = mysql_type.toLowerCase();
  if (/int$|^bit$|^bool/.test(type)) return 'INTEGER';
  if (['decimal', 'numeric'].includes(type)) return 'NUMERIC';
  if (['float', 'double', 'real'].includes(type)) return 'REAL';
  if (/blob$|binary$/.test(type)) return 'BLOB';
  return 'TEXT';
}

function indexColumns(line) {
  const list = line.slice(line.indexOf('(') + 1, line.lastIndexOf(')'));
  return [...list.matchAll(/`([^`]+)`/g)].map((m) => m[1]);
}

function quoteIdent(name) {
  return `"${name.replace(/"/g, '""')}"`;
}

/**
 * Rewrites one (possibly multi-row) mysqldump INSERT into SQLite INSERTs of
 * at most MAX_INSERT_BYTES each.
 */
function convertInsert(statement) {
  const values_at = statement.search(/\)\s*VALUES\s*\(|`\s*VALUES\s*\(/i);
  if (values_at === -1) throw new Error(`cannot find VALUES in: ${statement.slice(0, 120)}`);
  const head_end = statement.indexOf('VALUES', values_at) + 'VALUES'.length;
  const head = statement.slice(0, head_end).replace(/`([^`]*)`/g, (_, ident) => quoteIdent(ident));

  const rows = [];
  let i = head_end;
  while (i < statement.length) {
    while (i < statement.length && /[\s,]/.test(statement[i])) i++;
    if (i >= statement.length) break;
    if (statement[i] !== '(') throw new Error(`unexpected "${statement[i]}" in INSERT values`);
    const [row, next] = convertRow(statement, i);
    rows.push(row);
    i = next;
  }

  const statements = [];
  let batch = [];
  let size = head.length;
  for (const row of rows) {
    if (batch.length && size + row.length + 2 > MAX_INSERT_BYTES) {
      statements.push(`${head} ${batch.join(',')};`);
      batch = [];
      size = head.length;
    }
    batch.push(row);
    size += row.length + 1;
  }
  if (batch.length) statements.push(`${head} ${batch.join(',')};`);
  return statements;
}

/** Converts the parenthesised row starting at `start`; returns [sql, index after it]. */
function convertRow(sql, start) {
  let out = '(';
  let i = start + 1;
  let depth = 1;
  while (depth > 0) {
    const ch = sql[i];
    if (ch === undefined) throw new Error('unterminated row in INSERT');
    if (ch === "'") {
      const end = endOfQuoted(sql, i);
      out += sqliteString(unescapeMysql(sql.slice(i + 1, end - 1)));
      i = end;
    } else if (sql.startsWith('_binary ', i)) {
      i += '_binary '.length;
    } else if (ch === '0' && (sql[i + 1] === 'x' || sql[i + 1] === 'X') && /[,(\s]/.test(sql[i - 1])) {
      const hex = sql.slice(i + 2).match(/^[0-9a-fA-F]*/)[0];
      out += `X'${hex}'`;
      i += 2 + hex.length;
    } else {
      if (ch === '(') depth++;
      if (ch === ')') depth--;
      out += ch;
      i++;
    }
  }
  return [out, i];
}

/** Decodes the body of a MySQL single-quoted string literal. */
function unescapeMysql(body) {
  const escapes = { 0: '\0', b: '\b', n: '\n', r: '\r', t: '\t', Z: '\x1a', "'": "'", '"': '"', '\\': '\\' };
  let out = '';
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (ch === '\\' && i + 1 < body.length) {
      const next = body[++i];
      out += next in escapes ? escapes[next] : `\\${next}`;
    } else if (ch === "'" && body[i + 1] === "'") {
      out += "'";
      i++;
    } else {
      out += ch;
    }
  }
  return out;
}

function sqliteString(value) {
  if (value.includes('\0')) {
    warn('NUL byte removed from a string value');
    value = value.replace(/\0/g, '');
  }
  return `'${value.replace(/'/g, "''")}'`;
}
