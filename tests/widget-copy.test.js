const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const nodes = Array.from({length:2}, () => {
  const fields = {};
  return {
    fields,
    querySelector(selector) { return fields[selector] ||= {textContent:''}; },
    setAttribute() {}
  };
});
const context = {
  window:{WIDGET_DAILY:{'11-08':{title:'뢴트겐, X선 발견',year:1895,summary:'뢴트겐이 새로운 광선을 발견했다. 의료 영상이 발전했다.'}}},
  document:{querySelectorAll:()=>nodes,body:{classList:{add(){}}}},
  location:{search:''},
  URLSearchParams,
  Intl,
  Date:class extends Date { constructor(...args) { super(...(args.length ? args : ['2026-11-07T16:00:00Z'])); } }
};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../widget.js'),'utf8'),context);
for (const node of nodes) {
  assert.equal(node.fields['.widget-title'].textContent,'뢴트겐, X선 발견');
  assert.equal(node.fields['.widget-summary'].textContent,'뢴트겐이 새로운 광선을 발견했다.');
}
console.log('PASS: both widget previews show a title and one story sentence');
