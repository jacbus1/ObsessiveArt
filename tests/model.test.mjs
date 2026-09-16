import test from 'node:test';
import assert from 'node:assert/strict';
import { starterWorkspace, validateWorkspace, createNote, placeNote, removePlacement, relations, resolveLink, searchNotes, safeUrl } from '../public/model.mjs';
import { markdown } from '../public/markdown.mjs';

test('starter data validates and has independently identified note placements',()=>{const w=starterWorkspace();assert.deepEqual(validateWorkspace(w),w);assert.equal(w.notes.length,4);assert.notEqual(w.notes[0].id,w.boards[0].placements[0].id);});
test('the same note is shared across boards without copying its body',()=>{const w=starterWorkspace();const b={id:'second',title:'Second',placements:[],edges:[]};w.boards.push(b);placeNote(b,w.notes[0].id);w.notes[0].body='Shared edit';assert.equal(w.notes.find(n=>n.id===b.placements[0].noteId).body,'Shared edit');assert.equal(validateWorkspace(w).notes.length,4);});
test('removing a placement retains its note and removes dangling connectors',()=>{const w=starterWorkspace(),b=w.boards[0],p=b.placements[0];removePlacement(b,p.id);assert.ok(w.notes.some(n=>n.id===p.noteId));assert.ok(b.edges.every(e=>e.from!==p.id&&e.to!==p.id));validateWorkspace(w);});
test('deleting a board does not delete notes',()=>{const w=starterWorkspace();w.boards=[];assert.equal(validateWorkspace(w).notes.length,4);});
test('stable links survive note rename',()=>{const w=starterWorkspace();const before=relations(w);w.notes[1].title='改名以後';assert.deepEqual(relations(w),before);});
test('ambiguous title links do not invent a relationship',()=>{const w=starterWorkspace();w.notes[0].title=w.notes[1].title='Same';assert.equal(resolveLink(w,'Same'),null);});
test('deleted notes leave placements intact but leave the knowledge graph',()=>{const w=starterWorkspace(),id=w.notes[0].id;w.notes[0].deletedAt=new Date().toISOString();assert.ok(w.boards[0].placements.some(p=>p.noteId===id));assert.ok(relations(w).every(r=>r.from!==id&&r.to!==id));});
test('code blocks and inline code do not create semantic relations',()=>{const w=starterWorkspace();w.notes.forEach(n=>n.body='');w.notes[0].body='```\n[['+w.notes[1].id+']]\n```\n`[['+w.notes[2].id+']]`';assert.equal(relations(w).length,0);});
test('repeated links deduplicate and board arrows never become semantic links',()=>{const w=starterWorkspace();w.notes.forEach(n=>n.body='');w.notes[0].body=`[[${w.notes[1].id}]] [[${w.notes[1].id}]]`;assert.equal(relations(w).length,1);});
test('search handles Chinese text, tags and multiple terms',()=>{const w=starterWorkspace();w.notes[0].body='線性代數 主成分';w.notes[0].tags=['研究'];assert.equal(searchNotes(w,'主成分 研究')[0].id,w.notes[0].id);});
test('URL policy rejects scripts, relative URLs, credentials and control characters',()=>{for(const u of ['javascript:alert(1)','data:text/html,x','//example.com','https://user:pass@example.com','https://example.com/\nhi','file:///etc/passwd'])assert.equal(safeUrl(u),null);assert.equal(safeUrl('https://example.com/path'),'https://example.com/path');});
test('Markdown escapes raw HTML and unsafe link targets',()=>{const out=markdown('<img src=x onerror=alert(1)>\n\n[x](javascript:alert)\n\n<script>alert(1)</script>',starterWorkspace());assert.ok(!out.includes('<img'));assert.ok(!out.includes('<script'));assert.ok(!out.includes('href="javascript:'));assert.ok(out.includes('&lt;img'));});
test('Markdown treats fenced code literally and renders supported emphasis',()=>{const out=markdown('**Bold**\n\n```\n<script>\n```',starterWorkspace());assert.ok(out.includes('<strong>Bold</strong>'));assert.ok(out.includes('<pre><code>&lt;script&gt;'));});
test('Markdown attributes remain escaped for malicious titles and labels',()=>{const w=starterWorkspace();w.notes[0].title='" onclick="alert(1)';const out=markdown(`[[${w.notes[0].id}]] [label](https://example.com/\"x)`,w);assert.ok(out.includes('&quot;'));assert.ok(!out.includes(' onclick="'));});
const invalidCases={
  'unknown schema':w=>w.schemaVersion=2,
  'duplicate note id':w=>w.notes.push({...w.notes[0]}),
  'duplicate board id':w=>w.boards.push(structuredClone(w.boards[0])),
  'duplicate placement id':w=>w.boards[0].placements.push({...w.boards[0].placements[0]}),
  'dangling note id':w=>w.boards[0].placements[0].noteId='missing',
  'dangling edge':w=>w.boards[0].edges[0].to='missing',
  'self edge':w=>w.boards[0].edges[0].to=w.boards[0].edges[0].from,
  'HTML in identifier':w=>w.notes[0].id='\"><svg',
  'nonfinite coordinate':w=>w.boards[0].placements[0].x=NaN,
  'out of range size':w=>w.boards[0].placements[0].width=100000,
  'unknown color':w=>w.notes[0].color='url(javascript:alert)',
  'overlong note':w=>w.notes[0].body='x'.repeat(100001),
  'empty title':w=>w.notes[0].title='',
  'unsafe source':w=>w.notes[0].source='javascript:alert(1)',
  'missing tags':w=>delete w.notes[0].tags,
  'bad date':w=>w.notes[0].updatedAt='not-a-date'
};
for(const [name,mutate]of Object.entries(invalidCases))test(`schema rejects ${name}`,()=>{const w=starterWorkspace();mutate(w);assert.throws(()=>validateWorkspace(w));});
test('unknown fields are stripped rather than entering storage',()=>{const w=starterWorkspace();w.secret='unexpected';w.notes[0].html='<script>';const clean=validateWorkspace(w);assert.equal(clean.secret,undefined);assert.equal(clean.notes[0].html,undefined);});
