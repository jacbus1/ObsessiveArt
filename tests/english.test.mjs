import test from 'node:test';
import assert from 'node:assert/strict';
import {blankWorkspace,seedWorkspace,wikiLinks,resolveNote,serialize,parseBackup,copy} from '../src/core.js';

test('new empty and sample workspaces default to English',()=>{
  assert.equal(blankWorkspace().settings.language,'en');
  assert.equal(seedWorkspace().settings.language,'en');
});
test('built-in sample titles, text, tags and visual labels are English',()=>{
  const ws=seedWorkspace();
  const text=[ws.name,...ws.notes.flatMap(n=>[n.title,n.text,...n.tags]),...ws.boards.flatMap(b=>[b.title,...b.edges.map(e=>e.label)])].join('\n');
  assert(!/\p{Script=Han}/u.test(text));
  assert.match(text,/Welcome to ObsessiveArt/);
  assert.match(text,/Shared notes, independent placements/);
});
test('translated samples keep stable identities and resolved graph references',()=>{
  const ws=seedWorkspace();
  assert.deepEqual(ws.notes.map(n=>n.id),['welcome','pca','svd','clustering','workflow','question']);
  for(const n of ws.notes)for(const link of wikiLinks(n.text))assert(resolveNote(ws.notes,link.target),link.target);
  assert(ws.boards.every(b=>b.nodes.some(n=>n.noteId==='pca')));
});
test('English first-run defaults do not translate existing Chinese backups',()=>{
  const original=seedWorkspace();original.settings.language='zh';original.notes[0].title='我的私人筆記';original.notes[0].text='保留我的文字和 [[pca]]';original.notes[0].tags=['學習'];
  const restored=parseBackup(serialize(original));
  assert.deepEqual(restored,original);
  assert.equal(restored.settings.language,'zh');
});
test('changing UI language preserves note content, boards and history',()=>{
  const ws=seedWorkspace(),before=copy(ws);ws.settings.language='zh';
  const restored=parseBackup(serialize(ws));restored.settings.language='en';
  assert.deepEqual(restored,before);
});
