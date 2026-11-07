const assert = require('node:assert/strict');
const {elapsedWeekDates} = require('../week-calendar.js');
const d = (year,month,day) => new Date(year,month-1,day);
const keys = date => elapsedWeekDates(date).map(x=>`${x.year}-${x.month}-${x.day}`);

assert.deepEqual(keys(d(2026,11,1)), ['2026-10-26','2026-10-27','2026-10-28','2026-10-29','2026-10-30','2026-10-31','2026-11-1']);
assert.deepEqual(keys(d(2026,11,2)), ['2026-11-2']);
assert.deepEqual(keys(d(2026,11,8)), ['2026-11-2','2026-11-3','2026-11-4','2026-11-5','2026-11-6','2026-11-7','2026-11-8']);
assert.deepEqual(keys(d(2026,11,9)), ['2026-11-9']);
assert.deepEqual(keys(d(2027,1,3)), ['2026-12-28','2026-12-29','2026-12-30','2026-12-31','2027-1-1','2027-1-2','2027-1-3']);
console.log('PASS: weekly quiz dates follow Monday–Sunday across month and year boundaries');
