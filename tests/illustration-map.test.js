const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {novemberArtwork}=require('../illustration-map');
for(let day=1;day<=30;day++) {
  const id=`11-${String(day).padStart(2,'0')}-01`;
  const art=novemberArtwork({month:11,day,id});
  assert.ok(art,`${id} has an artwork`);
  assert.ok(fs.existsSync(path.join(__dirname,'..',art.sheet)),`${id} sheet exists`);
  assert.ok(art.panel>=0&&art.panel<8);
  if(day<=7) assert.equal(art.panel,day-1);
  else assert.equal(art.panel,(day-8)%8);
  assert.equal(novemberArtwork({month:11,day,id:`11-${String(day).padStart(2,'0')}-02`}),null);
}
assert.equal(novemberArtwork({month:12,day:1,id:'12-01-01'}),null);
console.log('PASS: all 30 November main images and secondary fallback mapping');
