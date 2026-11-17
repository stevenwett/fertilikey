-- One-time fix after loading the MySQL data: searchLog.date_created was
-- written in the VPS's local time (US Eastern), while D1 writes UTC.
-- Eastern daylight time runs from the second Sunday in March, 02:00, to the
-- first Sunday in November, 02:00 (UTC-4); the rest of the year is UTC-5.
-- Run it exactly once per load; a second run would shift the rows again.
UPDATE searchLog
SET date_created = datetime(
  date_created,
  CASE
    WHEN date_created >= date(substr(date_created, 1, 4) || '-03-01', 'weekday 0', '+7 days') || ' 02:00:00'
     AND date_created <  date(substr(date_created, 1, 4) || '-11-01', 'weekday 0') || ' 02:00:00'
    THEN '+4 hours'
    ELSE '+5 hours'
  END
)
WHERE date_created IS NOT NULL;
