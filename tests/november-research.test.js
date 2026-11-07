const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const {topStories} = require("../story-selection.js");

const context = {window: {}};
vm.runInNewContext(fs.readFileSync("data/events.js", "utf8"), context);
vm.runInNewContext(fs.readFileSync("data/november-research.js", "utf8"), context);

const editorial = context.window.NOVEMBER_RESEARCH;
const existing = new Set([...fs.readFileSync("app.js", "utf8").matchAll(/"(11-0[1-7]-01)": \{ paragraphs:/g)].map(match => match[1]));
const shown = context.window.EVENT_DATA.dates.filter(day => day.month === 11).flatMap(day => topStories(day.events));

assert.equal(shown.length, 90);
assert.equal(existing.size, 7);
assert.equal(Object.keys(editorial).length, 83);
for (const event of shown) {
  if (existing.has(event.id)) continue;
  const entry = editorial[event.id];
  assert.ok(entry, `Missing researched story: ${event.id}`);
  assert.ok(event.summary.length > 30, `Missing lead: ${event.id}`);
  assert.ok(entry.detail.length > 45, `Thin context: ${event.id}`);
  assert.ok(entry.source.length > 2, `Missing source label: ${event.id}`);
  const url = new URL(entry.url);
  assert.equal(url.protocol, "https:", `Insecure source: ${event.id}`);
  assert.ok(url.pathname.length > 4, `Nonspecific source: ${event.id}`);
}
assert.deepEqual(Object.keys(editorial).filter(id => !shown.some(event => event.id === id)), []);
console.log("PASS: all 90 November top-three stories have a researched body and direct source link");
