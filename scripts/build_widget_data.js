const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {topStories} = require('../story-selection.js');

const root = path.resolve(__dirname, '..');
const context = {window: {}};
vm.runInNewContext(fs.readFileSync(path.join(root, 'data/events.js'), 'utf8'), context);
const daily = {};
for (const date of context.window.EVENT_DATA.dates) {
  const story = topStories(date.events)[0];
  const key = `${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
  daily[key] = {id:story.id, title:story.title, year:story.year, summary:story.summary};
}
fs.writeFileSync(path.join(root, 'data/widget-daily.js'), `window.WIDGET_DAILY = ${JSON.stringify(daily)};\n`);
console.log(`Wrote ${Object.keys(daily).length} daily widget entries`);
