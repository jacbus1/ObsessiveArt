/* Pure domain functions. No UI, network or storage dependencies. */
export const VERSION = 1;
export const LIMITS = Object.freeze({ notes: 5000, boards: 150, nodes: 5000, attachments: 200, text: 250000, backupBytes: 40 * 1024 * 1024, attachmentBytes: 8 * 1024 * 1024 });
export const COLORS = ['violet', 'blue', 'green', 'amber', 'rose', 'gray'];
export const uid = () => crypto.randomUUID();
export const copy = value => structuredClone(value);
export const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
export function createNote(title = 'Untitled', text = '') {
  const at = Date.now();
  return {id: uid(), title, text, tags: [], color: 'violet', pinned: false, createdAt: at, updatedAt: at, deletedAt: null, history: []};
}
export function createBoard(title = 'New board') {
  return {id: uid(), title, nodes: [], edges: [], camera: {x: 60, y: 60, z: 1}};
}
export function placeNote(board, noteId, x = 100, y = 100) {
  const node = {id: uid(), kind: 'note', noteId, x, y, w: 280, h: 205, color: 'violet', text: ''};
  board.nodes.push(node);
  return node;
}
export function removePlacement(board, nodeId) {
  board.nodes = board.nodes.filter(n => n.id !== nodeId);
  board.edges = board.edges.filter(e => e.from !== nodeId && e.to !== nodeId);
}
export function purgeNote(workspace, noteId) {
  workspace.notes = workspace.notes.filter(n => n.id !== noteId);
  for (const board of workspace.boards) for (const node of [...board.nodes]) if (node.noteId === noteId) removePlacement(board, node.id);
}
export function remember(note) {
  const last = note.history[0];
  if (!last || last.text !== note.text || last.title !== note.title) {
    note.history.unshift({title: note.title, text: note.text, at: Date.now()});
    note.history = note.history.slice(0, 25);
  }
}
export function blankWorkspace() {
  return {format: 'obsessiveart', schema: VERSION, id: uid(), name: 'My knowledge studio', notes: [], boards: [createBoard('First canvas')], attachments: [], settings: {language: 'en', theme: 'light'}};
}
export function seedWorkspace() {
  const ws = blankWorkspace();
  ws.name = 'My knowledge studio';
  const content = [
    [
        "welcome",
        "From ideas to understanding",
        "# Welcome to ObsessiveArt\n\nThis is an editable example workspace, not a static demonstration.\n\n## One idea, three views\n- **Notes**: put a concept into your own words.\n- **Canvas**: arrange ideas, compare them and draw connections.\n- **Graph**: explore through `[[wikilinks]]`.\n\nDouble-click a card to edit it, then open the second canvas. The note is shared; each placement stays independent.\n\n[[pca|PCA: finding the main directions]] · [[workflow|My research workflow]]\n\n> Your content stays in this browser. Download a full backup from Data & settings regularly. Clearing site data removes local content.",
        [
            "Getting started",
            "Workspace"
        ],
        "violet"
    ],
    [
        "pca",
        "PCA · Finding the main directions",
        "# Principal Component Analysis\n\nPCA projects data onto orthogonal axes that successively capture the greatest variance.\n\n## A useful sequence\n1. Decide whether the features need scaling.\n2. Find the directions with the greatest variance.\n3. Choose how many components to retain.\n4. Review information loss and interpretability.\n\nPCA is closely related to [[svd|SVD]]. Compare it with [[clustering|K-means]] on the same canvas.\n\n**Ask yourself**: does high variance always mean useful signal?",
        [
            "Machine learning",
            "Dimensionality reduction"
        ],
        "blue"
    ],
    [
        "svd",
        "SVD · Another view of a matrix",
        "# Singular Value Decomposition\n\n`A = U Σ Vᵀ`\n\nSeparate a matrix into directions and scales to understand low-rank approximations.\n\n- U: left singular vectors.\n- Σ: singular values.\n- V: right singular vectors.\n\nThe SVD of centered data can be used to compute [[pca|PCA]].\n\n## Explore next\nCompare reconstruction errors at different retained dimensions.",
        [
            "Linear algebra",
            "Dimensionality reduction"
        ],
        "violet"
    ],
    [
        "clustering",
        "K-means · Discovering groups",
        "# Find groups through similarity\n\nK-means alternates between assigning observations and updating centers to reduce within-cluster squared distances.\n\n- Initialization can affect the result.\n- Feature scales affect distances.\n- Clusters do not necessarily represent real-world categories.\n\nUse a [[pca|PCA]] projection for visualization, but do not treat visual separation as complete evidence.",
        [
            "Machine learning",
            "Clustering"
        ],
        "green"
    ],
    [
        "workflow",
        "My research workflow",
        "# Turn information into understanding\n\n1. Collect the original source.\n2. Write one concept in your own words.\n3. Compare cards on a canvas.\n4. Connect notes with `[[a title]]` or Insert note link.\n5. Keep open questions, not just conclusions.\n\n[[question|A question worth pursuing]]\n\n> Canvas arrows are visual connectors. Only links inside notes appear in the knowledge graph.",
        [
            "Research methods"
        ],
        "amber"
    ],
    [
        "question",
        "A question worth pursuing",
        "# Do I really understand it?\n\n- Can I explain it without jargon?\n- Can I give a counterexample?\n- Under what conditions does the conclusion hold?\n- How could I test it next?\n\nReturn to [[workflow|the research workflow]] and give every question a next step.",
        [
            "Thinking",
            "Research methods"
        ],
        "rose"
    ]
];
  ws.notes = content.map(([id,title,text,tags,color]) => ({...createNote(title,text), id, tags, color, pinned: id === 'welcome'}));
  const board = ws.boards[0]; board.title = 'Learning, connected'; board.camera = {x: 40, y: 35, z: .86};
  const positions = [[60,60],[410,60],[770,60],[410,355],[60,355],[770,355]];
  ws.notes.forEach((n,i) => {const p = placeNote(board,n.id,...positions[i]); p.color = n.color;});
  const edge = (a,b,label) => board.edges.push({id:uid(),from:board.nodes[a].id,to:board.nodes[b].id,label});
  edge(0,1,'Explore'); edge(1,2,'Understand structure'); edge(1,3,'Compare'); edge(4,5,'Ask why');
  const second = createBoard('Linear algebra · Shared notes');
  placeNote(second,'pca',70,90); placeNote(second,'svd',460,90);
  second.edges.push({id:uid(),from:second.nodes[0].id,to:second.nodes[1].id,label:'Shared notes, independent placements'});
  ws.boards.push(second);
  return ws;
}
const norm = s => String(s).normalize('NFC').trim().toLocaleLowerCase().replace(/\.md$/i,'');
export function wikiLinks(text) {
  return [...String(text).replace(/```[\s\S]*?```/g,'').replace(/`[^`\n]*`/g,'').matchAll(/(?<!!)\[\[([^\]\n]+)\]\]/g)]
    .map(m => {const [target, ...alias] = m[1].split('|'); return {target: target.split('#')[0].trim(), label: alias.join('|').trim() || target};})
    .filter(l => l.target);
}
export function resolveNote(notes, target) {
  const active = notes.filter(n => !n.deletedAt);
  const direct = active.find(n => n.id === target);
  if (direct) return direct;
  const found = active.filter(n => norm(n.title) === norm(target) || (n.path && norm(n.path) === norm(target)));
  return found.length === 1 ? found[0] : null;
}
export function graphData(ws, query = '') {
  const q = norm(query);
  const notes = ws.notes.filter(n => !n.deletedAt && (!q || norm(`${n.title} ${n.tags.join(' ')} ${n.text}`).includes(q)));
  const ids = new Set(notes.map(n=>n.id)), keys = new Set(), edges = [];
  for (const n of notes) for (const link of wikiLinks(n.text)) {
    const target = resolveNote(ws.notes,link.target);
    if (target && ids.has(target.id) && target.id !== n.id) {
      const key = `${n.id}:${target.id}`;
      if (!keys.has(key)) {edges.push({from:n.id,to:target.id});keys.add(key);}
    }
  }
  return {notes,edges};
}
export function backlinks(ws, id) {
  return ws.notes.filter(n=>!n.deletedAt && n.id !== id && wikiLinks(n.text).some(l=>resolveNote(ws.notes,l.target)?.id === id));
}
export function plain(text, max=220) { return String(text).replace(/!\[[^\]]*\]\([^)]*\)/g,'').replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g,'$2').replace(/\[\[([^\]]+)\]\]/g,'$1').replace(/[#*`>_]/g,'').replace(/\s+/g,' ').trim().slice(0,max); }
export function safeUrl(value) {
  try {const u = new URL(value);return ['https:','http:','mailto:'].includes(u.protocol) ? u.href : null;} catch {return null;}
}
/* Raw HTML is ALWAYS text. Inline constructs are scanned without re-parsing generated HTML. */
export function inlineMarkdown(text, ws) {
  const pattern = /(`[^`\n]+`|\[\[[^\]\n]+\]\]|!\[[^\]\n]*\]\(asset:[a-zA-Z0-9_-]+\)|\[[^\]\n]+\]\([^\s)]+\)|\*\*[^*\n]+\*\*|\*[^*\n]+\*)/g;
  let out='', at=0;
  for (const m of text.matchAll(pattern)) {
    out += esc(text.slice(at,m.index)); const s=m[0]; at=m.index+s.length;
    if(s.startsWith('`')) out += `<code>${esc(s.slice(1,-1))}</code>`;
    else if(s.startsWith('[[')) {
      const [target,...aliases]=s.slice(2,-2).split('|'); const note=resolveNote(ws.notes,target.split('#')[0]);
      out += note ? `<button class="wikilink" data-action="open-note" data-id="${esc(note.id)}">${esc(aliases.join('|')||note.title)}</button>` : `<span class="missing-link" title="Missing or ambiguous link">${esc(aliases.join('|')||target)}</span>`;
    } else if(s.startsWith('![')) {
      const a=/!\[([^\]]*)\]\(asset:([^)]*)\)/.exec(s); const asset=ws.attachments.find(f=>f.id===a[2]);
      out += asset && asset.type.startsWith('image/') ? `<img class="md-image" src="${esc(asset.data)}" alt="${esc(a[1])}" loading="lazy">` : `<span>${esc(a[1])}</span>`;
    } else if(s.startsWith('[')) {
      const a=/\[([^\]]*)\]\(([^)]*)\)/.exec(s); const url=safeUrl(a[2]);
      const assetId=a[2].startsWith('asset:')?a[2].slice(6):null;
      if(assetId&&ws.attachments.some(f=>f.id===assetId)){out+=`<button class="wikilink" data-action="open-asset" data-id="${esc(assetId)}">${esc(a[1])} ↓</button>`;continue;}
      out += url ? `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(a[1])} ↗</a>` : esc(a[1]);
    } else if(s.startsWith('**')) out += `<strong>${esc(s.slice(2,-2))}</strong>`;
    else out += `<em>${esc(s.slice(1,-1))}</em>`;
  }
  return out+esc(text.slice(at));
}
export function markdown(text, ws) {
  const lines=String(text).replace(/\r\n/g,'\n').split('\n'); let out='',code=false, buffer=[],list='';
  const closeList=()=>{if(list){out+=`</${list}>`;list='';}};
  for(let i=0;i<lines.length;i++) {
    const line=lines[i];
    if(/^\s*```/.test(line)){closeList(); if(code){out+=`<pre><code>${esc(buffer.join('\n'))}</code></pre>`;buffer=[];}code=!code;continue;}
    if(code){buffer.push(line);continue;}
    if(!line.trim()){closeList();continue;}
    if(/^\|/.test(line)&&i+1<lines.length&&/^\|[\s:|\-]+\|?\s*$/.test(lines[i+1])) {
      closeList();const cells=v=>v.replace(/^\||\|$/g,'').split('|').map(c=>c.trim());
      out+='<div class="table-scroll"><table><thead><tr>'+cells(line).map(c=>`<th>${inlineMarkdown(c,ws)}</th>`).join('')+'</tr></thead><tbody>';i++;
      while(i+1<lines.length&&/^\|/.test(lines[i+1]))out+='<tr>'+cells(lines[++i]).map(c=>`<td>${inlineMarkdown(c,ws)}</td>`).join('')+'</tr>';
      out+='</tbody></table></div>';continue;
    }
    const li=/^\s*(?:([-*])|(\d+)\.)\s+(.+)/.exec(line);
    if(li){const type=li[2]?'ol':'ul';if(list!==type){closeList();out+=`<${type}>`;list=type;}out+=`<li>${inlineMarkdown(li[3],ws)}</li>`;continue;}
    closeList();
    const h=/^(#{1,6})\s+(.+)/.exec(line);
    if(h)out+=`<h${h[1].length}>${inlineMarkdown(h[2],ws)}</h${h[1].length}>`;
    else if(/^>\s?/.test(line))out+=`<blockquote>${inlineMarkdown(line.replace(/^>\s?/,''),ws)}</blockquote>`;
    else if(/^\s*---+\s*$/.test(line))out+='<hr>';
    else out+=`<p>${inlineMarkdown(line,ws)}</p>`;
  }
  closeList();if(code)out+=`<pre><code>${esc(buffer.join('\n'))}</code></pre>`;return out;
}
const fail = message => {throw new Error(message);};
const isId = x => typeof x==='string' && /^[A-Za-z0-9_-]{1,100}$/.test(x);
const str = (v,max=250000)=>typeof v==='string'&&v.length<=max;
const num = (v,min=-1e7,max=1e7)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
const arr = (v,max)=>Array.isArray(v)&&v.length<=max;
export function validateWorkspace(value) {
  const w=copy(value);
  if(!w||w.format!=='obsessiveart'||w.schema!==VERSION)fail('Unsupported backup format or schema.');
  if(!isId(w.id)||!str(w.name,200)||!arr(w.notes,LIMITS.notes)||!arr(w.boards,LIMITS.boards)||!w.boards.length||!arr(w.attachments,LIMITS.attachments))fail('Invalid workspace structure or size.');
  const unique=list=>{const ids=new Set();for(const o of list){if(!isId(o.id)||ids.has(o.id))fail('Duplicate or invalid ID.');ids.add(o.id);}return ids;};
  const noteIds=unique(w.notes);unique(w.boards);const assetIds=unique(w.attachments);
  let totalText=0, totalNodes=0;
  for(const n of w.notes){
    if(!str(n.title,300)||!str(n.text,LIMITS.text)||!arr(n.tags,30)||n.tags.some(t=>!str(t,80))||!COLORS.includes(n.color)||typeof n.pinned!=='boolean'||!num(n.createdAt,0,1e15)||!num(n.updatedAt,0,1e15)||(n.deletedAt!==null&&!num(n.deletedAt,0,1e15))||!arr(n.history,25)||(n.path!==undefined&&!str(n.path,500)))fail('Invalid note.');
    totalText+=n.text.length;
    for(const h of n.history){if(!str(h.title,300)||!str(h.text,LIMITS.text)||!num(h.at,0,1e15))fail('Invalid revision.');totalText+=h.text.length;}
  }
  if(totalText>16*1024*1024)fail('Text/history exceeds 16 MiB.');
  for(const a of w.attachments){
    if(!str(a.name,300)||!['image/png','image/jpeg','image/gif','image/webp','application/pdf'].includes(a.type)||!num(a.size,0,LIMITS.attachmentBytes)||!str(a.data,LIMITS.attachmentBytes*1.4)||!new RegExp(`^data:${a.type};base64,[A-Za-z0-9+/]*={0,2}$`).test(a.data))fail('Invalid attachment.');
  }
  for(const b of w.boards){
    if(!str(b.title,200)||!arr(b.nodes,LIMITS.nodes)||!arr(b.edges,10000)||!b.camera||!num(b.camera.x)||!num(b.camera.y)||!num(b.camera.z,.15,3))fail('Invalid board.');
    const nodeIds=unique(b.nodes);unique(b.edges);totalNodes+=b.nodes.length;
    for(const n of b.nodes){
      if(!['note','sticky','frame','image'].includes(n.kind)||!num(n.x)||!num(n.y)||!num(n.w,100,4000)||!num(n.h,70,4000)||!str(n.text,10000)||!COLORS.includes(n.color))fail('Invalid board object.');
      if(n.kind==='note'&&!noteIds.has(n.noteId))fail('Missing note reference.');
      if(n.kind==='image'&&!assetIds.has(n.assetId))fail('Missing attachment reference.');
    }
    for(const e of b.edges)if(!nodeIds.has(e.from)||!nodeIds.has(e.to)||e.from===e.to||!str(e.label,150))fail('Invalid connector.');
  }
  if(totalNodes>LIMITS.nodes)fail('Too many board objects.');
  if(!w.settings||!['zh','en'].includes(w.settings.language)||!['light','dark'].includes(w.settings.theme))fail('Invalid settings.');
  // Canonical projection discards unrecognised fields, including prototype keys.
  return {format:'obsessiveart',schema:VERSION,id:w.id,name:w.name,
    notes:w.notes.map(n=>({id:n.id,title:n.title,text:n.text,tags:[...n.tags],color:n.color,pinned:n.pinned,createdAt:n.createdAt,updatedAt:n.updatedAt,deletedAt:n.deletedAt,history:n.history.map(h=>({title:h.title,text:h.text,at:h.at})),...(n.path!==undefined?{path:n.path}:{})})),
    boards:w.boards.map(b=>({id:b.id,title:b.title,camera:{x:b.camera.x,y:b.camera.y,z:b.camera.z},nodes:b.nodes.map(n=>({id:n.id,kind:n.kind,x:n.x,y:n.y,w:n.w,h:n.h,color:n.color,text:n.text,...(n.kind==='note'?{noteId:n.noteId}:{}),...(n.kind==='image'?{assetId:n.assetId}:{})})),edges:b.edges.map(e=>({id:e.id,from:e.from,to:e.to,label:e.label}))})),
    attachments:w.attachments.map(a=>({id:a.id,name:a.name,type:a.type,size:a.size,data:a.data})),settings:{language:w.settings.language,theme:w.settings.theme}};
}
export function serialize(ws) {
  const text=JSON.stringify(validateWorkspace(ws),null,2);
  if(new TextEncoder().encode(text).length>LIMITS.backupBytes)fail('Workspace exceeds the 40 MiB backup limit. Export and remove unused attachments.');
  return text;
}
export function parseBackup(text) {
  if(new TextEncoder().encode(text).length>LIMITS.backupBytes)fail('Backup exceeds 40 MiB.');
  return validateWorkspace(JSON.parse(text));
}
export function filename(title) {
  return String(title).normalize('NFC').replace(/[\x00-\x1f<>:"/\\|?*]/g,'-').replace(/^\.+|[. ]+$/g,'').trim().slice(0,100)||'Untitled';
}
/* Stored ZIP writer: UTF-8 filenames, CRC32, no compression or third-party code. */
export function makeZip(files) {
  const enc=new TextEncoder(),parts=[],central=[];let offset=0;
  const crc32=bytes=>{let c=0xffffffff;for(const b of bytes){c^=b;for(let i=0;i<8;i++)c=(c>>>1)^((c&1)?0xedb88320:0);}return(c^0xffffffff)>>>0;};
  for(const file of files){
    const name=enc.encode(file.name),data=typeof file.data==='string'?enc.encode(file.data):file.data,crc=crc32(data);
    const h=new Uint8Array(30+name.length),v=new DataView(h.buffer);v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint16(6,0x800,true);v.setUint32(14,crc,true);v.setUint32(18,data.length,true);v.setUint32(22,data.length,true);v.setUint16(26,name.length,true);h.set(name,30);
    const c=new Uint8Array(46+name.length),cv=new DataView(c.buffer);cv.setUint32(0,0x02014b50,true);cv.setUint16(4,20,true);cv.setUint16(6,20,true);cv.setUint16(8,0x800,true);cv.setUint32(16,crc,true);cv.setUint32(20,data.length,true);cv.setUint32(24,data.length,true);cv.setUint16(28,name.length,true);cv.setUint32(42,offset,true);c.set(name,46);
    parts.push(h,data);central.push(c);offset+=h.length+data.length;
  }
  const centralSize=central.reduce((s,c)=>s+c.length,0),end=new Uint8Array(22),ev=new DataView(end.buffer);ev.setUint32(0,0x06054b50,true);ev.setUint16(8,files.length,true);ev.setUint16(10,files.length,true);ev.setUint32(12,centralSize,true);ev.setUint32(16,offset,true);
  return new Blob([...parts,...central,end],{type:'application/zip'});
}
export function markdownFiles(ws) {
  const active=ws.notes.filter(n=>!n.deletedAt),names=new Map(active.map(n=>[n.id,`${filename(n.title)}--${n.id}.md`]));
  const assets=new Map(ws.attachments.map(a=>[a.id,`attachments/${a.id}-${filename(a.name)}`]));
  const files=active.map(n=>({name:names.get(n.id),data:`---\nobsessiveart_id: ${n.id}\ntitle: ${JSON.stringify(n.title)}\ntags: ${JSON.stringify(n.tags)}\n---\n\n`+n.text.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,(m,t,a)=>{const dest=resolveNote(ws.notes,t);return dest?`[${a||dest.title}](${encodeURI(names.get(dest.id))})`:m;}).replace(/\(asset:([A-Za-z0-9_-]+)\)/g,(m,id)=>assets.has(id)?`(${encodeURI(assets.get(id))})`:m)}));
  for(const a of ws.attachments){const binary=atob(a.data.split(',')[1]);files.push({name:assets.get(a.id),data:Uint8Array.from(binary,c=>c.charCodeAt(0))});}
  files.push({name:'README.txt',data:'Readable Markdown export. Use a native ObsessiveArt JSON backup for full-fidelity restore (boards, history, IDs, attachments). Extract this ZIP before opening Markdown files.'});
  return files;
}
export function graphLayout(notes,edges) {
  const out=notes.map((n,i)=>({id:n.id,x:550+Math.cos(i*2*Math.PI/Math.max(notes.length,1))*260,y:360+Math.sin(i*2*Math.PI/Math.max(notes.length,1))*240}));
  const map=new Map(out.map(n=>[n.id,n]));
  for(let t=0;t<100;t++){
    const force=new Map(out.map(n=>[n.id,{x:(550-n.x)*.008,y:(360-n.y)*.008}]));
    for(let i=0;i<out.length;i++)for(let j=i+1;j<out.length;j++){
      const a=out[i],b=out[j],dx=a.x-b.x,dy=a.y-b.y,d2=Math.max(100,dx*dx+dy*dy),f=5500/d2;
      force.get(a.id).x+=dx*f;force.get(a.id).y+=dy*f;force.get(b.id).x-=dx*f;force.get(b.id).y-=dy*f;
    }
    for(const e of edges){const a=map.get(e.from),b=map.get(e.to);if(!a||!b)continue;const dx=b.x-a.x,dy=b.y-a.y,d=Math.max(1,Math.hypot(dx,dy)),f=(d-240)*.005;force.get(a.id).x+=dx*f;force.get(a.id).y+=dy*f;force.get(b.id).x-=dx*f;force.get(b.id).y-=dy*f;}
    for(const n of out){const f=force.get(n.id);n.x+=clamp(f.x,-12,12);n.y+=clamp(f.y,-12,12);}
  }
  return out;
}
