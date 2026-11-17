/**
 * Fertilikey Worker: serves the static site from ./public and the two JSON
 * endpoints the React app calls, backed by D1.
 */

const CANONICAL_HOST = 'fertilikey.org';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const redirect = canonicalRedirect(url);
    if (redirect) {
      return redirect;
    }

    const path = url.pathname.replace(/\/+$/, '');
    if (path === '/api/institutions') {
      return institutions(request, env);
    }
    if (path === '/api/search-log') {
      return searchLog(request, env);
    }
    if (path.startsWith('/api')) {
      return json({ message: 'Not found', status: 404 }, 404);
    }

    return env.ASSETS.fetch(request);
  },
};

/**
 * Sends www and plain-http requests for the production domain to
 * https://fertilikey.org. Other hosts (workers.dev, localhost) are left alone.
 */
function canonicalRedirect(url) {
  const is_www = url.hostname === `www.${CANONICAL_HOST}`;
  const is_insecure = url.hostname === CANONICAL_HOST && url.protocol === 'http:';
  if (!is_www && !is_insecure) {
    return null;
  }
  return Response.redirect(`https://${CANONICAL_HOST}${url.pathname}${url.search}`, 301);
}

async function institutions(request, env) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: CORS_HEADERS });
  }
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return json({ message: 'Only GET method is allowed', status: 405 }, 405);
  }

  try {
    const { results } = await env.DB.prepare('SELECT * FROM institutions').all();
    return json({
      message: 'Institutions retrieved successfully',
      status: 200,
      data: results.map(blankDashes),
    });
  } catch (error) {
    console.error('Failed to fetch institutions', error);
    return json({ message: 'Failed to fetch institutions', status: 500, data: [] }, 500);
  }
}

/**
 * Values that are only a hyphen or an en dash mean "no data" in the source
 * spreadsheet; the frontend treats an empty string as missing.
 */
function blankDashes(row) {
  const cleaned = {};
  for (const [key, value] of Object.entries(row)) {
    const is_dash = typeof value === 'string' && ['-', '–'].includes(value.trim());
    cleaned[key] = is_dash ? '' : value;
  }
  return cleaned;
}

async function searchLog(request, env) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: CORS_HEADERS });
  }
  if (request.method !== 'POST') {
    return json({ message: 'Only POST method is allowed', status: 405 }, 405);
  }

  let data = null;
  try {
    data = await request.json();
  } catch {
    return json({ message: 'Error: Request body must be JSON', status: 400, data: null }, 400);
  }

  if (!data || typeof data.institution_name !== 'string' || data.institution_name === '') {
    return json({ message: 'Error: Institution name is required', status: 400, data }, 400);
  }

  const ip_address = request.headers.get('CF-Connecting-IP') ?? 'localhost';
  const country_code = request.cf?.country ?? request.headers.get('CF-IPCountry') ?? '';
  const is_debug = env.APP_ENV === 'production' ? 0 : 1;

  try {
    await env.DB.prepare(
      'INSERT INTO searchLog (sponsor_code, institution_name, ip_address, is_debug, country_code) VALUES (?, ?, ?, ?, ?)'
    )
      .bind(data.sponsor_code ?? null, data.institution_name, ip_address, is_debug, country_code)
      .run();
  } catch (error) {
    console.error('Failed to write search log', error);
    return json({ message: 'Database error', status: 500, data }, 500);
  }

  return json({ message: 'Search logged successfully', status: 201, data }, 201);
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=UTF-8' },
  });
}
