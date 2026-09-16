import { COLORS, LIMITS, createNote, placeNote, removePlacement, relations, searchNotes, validateWorkspace } from './model.mjs';
import { markdown, escapeHtml as esc } from './markdown.mjs';
import { request, readDraft, writeDraft, clearDraft, download } from './storage.mjs';
const $ = selector => document.querySelector(selector);
const en = { library:'All notes', canvas:'Whiteboard', graph:'Connections', trash:'Trash', search:'Search notes, tags, ideas…', workspace:'Workspace', boards:'YOUR BOARDS', newBoard:'New board', newNote:'New note', export:'Export', import:'Import', history:'History', saved:'Saved to local server', saving:'Saving…', unsaved:'Changes pending', failed:'Save needs attention', local:'Recovery draft saved in browser', recoveryFailed:'Browser recovery unavailable', subtitle:'A little structure. More room to think.', allTitle:'Your ideas, in good company.', canvasSubtitle:'One note. Many contexts. Space to see the bigger picture.', graphTitle:'Find the thread.', graphSubtitle:'Knowledge links connect your notes. Board arrows stay on the board.', trashTitle:'Nothing is lost just yet.', trashSubtitle:'Restore notes to recover their existing board placements.', notes:'notes', connections:'connections', edit:'Write', preview:'Read', source:'Source URL', tags:'Tags · comma-separated', backlinks:'Linked from', color:'Card color', close:'Close', cancel:'Cancel', create:'Create', addExisting:'Add existing', connect:'Connect cards', stopConnect:'Stop connecting', fit:'Fit', undo:'Undo', redo:'Redo', removeBoard:'Delete board', remove:'Remove from board', archive:'Move to trash', restore:'Restore note', link:'Link note', markdown:'Export Markdown', empty:'No notes here yet. A good idea can start with a single question.', boardEmpty:'Create a board to give your ideas some space.', name:'Name', pick:'Choose a note', noLinks:'No incoming links yet.', boardHint:'Drag to pan · scroll to zoom · Shift-select cards', beta:'Personal beta · v0.1', privacy:'Your content stays on this server. No analytics. No model calls.', retry:'Retry save', reload:'Load server version', conflict:'A newer revision exists', conflictText:'Your draft has not overwritten the newer server version. Export your draft first, then load the saved version and reapply your edits.', replace:'Replace workspace', replaceText:'This replaces current notes and boards. Export a backup first. The last 50 server snapshots are retained; they are not a substitute for an independent backup.', noteTitle:'Note title', noteBody:'Markdown content', signIn:'Open workspace', password:'Workspace password', signOut:'Sign out', loginText:'Your personal space for connected thinking.', inTrash:'In trash', selectSecond:'Choose a second card to draw an arrow.', recover:'Recovered your browser draft.', boardUses:'board placements', done:'Done', focus:'Focus selected note', allGraph:'Show all', loading:'Opening workspace…', noSource:'https://…', readOnly:'Single owner · no live collaboration', saveDetails:'Save status', exportRecovery:'Export recovery', offline:'Server unavailable. Keep this tab open and export your draft.', mdImported:'Markdown note imported.', confirmRestore:'Restore this revision as a new current revision?', language:'繁體中文' };
const zh = { library:'全部筆記',canvas:'白板',graph:'關係圖',trash:'垃圾桶',search:'搜尋筆記、標籤、想法…',workspace:'工作空間',boards:'你的白板',newBoard:'新增白板',newNote:'新增筆記',export:'匯出',import:'匯入',history:'歷史版本',saved:'已儲存至本機伺服器',saving:'儲存中…',unsaved:'有待儲存變更',failed:'儲存需要處理',local:'瀏覽器復原草稿已儲存',recoveryFailed:'瀏覽器復原儲存無法使用',subtitle:'留一點結構，給思考更多空間。',allTitle:'讓想法在這裡相遇。',canvasSubtitle:'一份筆記，多個視角。在空間中看見關係。',graphTitle:'找出想法之間的連結。',graphSubtitle:'筆記連結形成關係圖；白板箭頭保留視覺用途。',trashTitle:'想法仍在，可以找回。',trashSubtitle:'還原筆記後，原有白板位置會一併恢復顯示。',notes:'則筆記',connections:'個連結',edit:'編寫',preview:'閱讀',source:'來源網址',tags:'標籤 · 以逗號分隔',backlinks:'被這些筆記引用',color:'卡片顏色',close:'關閉',cancel:'取消',create:'建立',addExisting:'加入已有筆記',connect:'連接卡片',stopConnect:'結束連接',fit:'適合畫面',undo:'復原',redo:'重做',removeBoard:'刪除白板',remove:'從白板移除',archive:'移至垃圾桶',restore:'還原筆記',link:'連結筆記',markdown:'匯出 Markdown',empty:'這裡還沒有筆記。一個問題，就是思考的開始。',boardEmpty:'建立白板，為你的想法留一個空間。',name:'名稱',pick:'選擇筆記',noLinks:'目前沒有反向連結。',boardHint:'拖曳平移 · 捲動縮放 · Shift 多選卡片',beta:'個人測試版 · v0.1',privacy:'內容保存在此伺服器。不使用分析追蹤，也不呼叫模型。',retry:'重試儲存',reload:'載入伺服器版本',conflict:'已有較新的版本',conflictText:'你的草稿沒有覆蓋伺服器上的新版本。請先匯出草稿，再載入已儲存版本並重新套用修改。',replace:'取代工作空間',replaceText:'這會取代目前的筆記與白板。請先匯出備份。伺服器保留最近 50 個快照，但不能取代獨立備份。',noteTitle:'筆記標題',noteBody:'Markdown 正文',signIn:'開啟工作空間',password:'工作空間密碼',signOut:'登出',loginText:'讓想法彼此連結的個人空間。',inTrash:'已在垃圾桶',selectSecond:'選擇另一張卡片以建立箭頭。',recover:'已復原瀏覽器草稿。',boardUses:'個白板位置',done:'完成',focus:'聚焦所選筆記',allGraph:'顯示全部',loading:'正在開啟工作空間…',noSource:'https://…',readOnly:'單一擁有人 · 不含即時協作',saveDetails:'儲存狀態',exportRecovery:'匯出復原草稿',offline:'伺服器無法連接。請保留此分頁並匯出草稿。',mdImported:'已匯入 Markdown 筆記。',confirmRestore:'將此歷史版本還原為新的目前版本？',language:'English' };
const state = {w:null,revision:0,view:'canvas',boardId:null,noteId:null,query:'',preview:true,lang:localStorage.getItem('obsessart-language') || 'en',dirty:false,sequence:0,blocked:false,error:null,localOK:true,undo:[],redo:[],selection:new Set(),transforms:new Map(),connecting:false,connectFrom:null,focus:false,passwordRequired:false};
const t = key => (state.lang === 'zh-Hant' ? zh : en)[key] || en[key] || key;
let timer, savePromise, draftQueue = Promise.resolve(), noticeTimer, gesture, lastDrag = 0;
const activeBoard = () => state.w.boards.find(b => b.id === state.boardId);
const activeNote = () => state.w.notes.find(n => n.id === state.noteId);
const transform = () => { if (!state.transforms.has(state.boardId)) state.transforms.set(state.boardId,{x:20,y:15,z:.8}); return state.transforms.get(state.boardId); };
function toast(message) { $('#notice').textContent = message; $('#notice').style.display='block'; clearTimeout(noticeTimer); noticeTimer = setTimeout(() => $('#notice').style.display='none',5000); }
function run(task) { Promise.resolve().then(task).catch(error => toast(error.message)); }
function status() {
  const el = $('#save-state'); if (!el) return;
  el.textContent = t(state.error ? 'failed' : savePromise ? 'saving' : state.dirty ? 'unsaved' : 'saved');
  el.className = `save-status ${state.error ? 'error' : state.dirty ? 'pending' : ''}`;
  el.title = state.error?.message || t('saveDetails');
}
function queueDraft() {
  const value = {baseRevision:state.revision,workspace:structuredClone(state.w)};
  draftQueue = draftQueue.catch(() => {}).then(() => writeDraft(value)).then(() => {state.localOK=true;}).catch(() => {state.localOK=false;});
  return draftQueue;
}
function remember(before) { state.undo.push(before); if (state.undo.length>30) state.undo.shift(); state.redo=[]; }
function changed(before, paint = true) {
  if (state.blocked && [422,413].includes(state.error?.status)) state.blocked=false;
  if (!state.w.boards.some(b=>b.id===state.boardId)) state.boardId=state.w.boards[0]?.id;
  if (before) remember(before);
  state.sequence++; state.dirty=true; queueDraft(); status();
  clearTimeout(timer); timer=setTimeout(() => run(flush),550);
  if (paint) { renderView(); renderEditor(); updateCounts(); }
}
function change(fn, {paint=true, history=true}={}) { const before=history ? structuredClone(state.w) : null; fn(); changed(before,paint); }
async function flush() {
  clearTimeout(timer);
  if (savePromise) return savePromise;
  if (!state.dirty || state.blocked) return;
  savePromise = (async () => {
    while (state.dirty && !state.blocked) {
      const snapshot=structuredClone(state.w), sequence=state.sequence;
      await queueDraft();
      try {
        const ack = await request('/api/workspace','PUT',{workspace:snapshot,expectedRevision:state.revision});
        state.revision=ack.revision; state.error=null;
        if (sequence===state.sequence) {
          state.dirty=false;
          draftQueue=draftQueue.catch(() => {}).then(clearDraft).catch(() => {state.localOK=false;});
          await draftQueue;
        } else await queueDraft();
      } catch (error) {
        state.error=error; state.blocked=[409,401,422,413].includes(error.status);
        toast(`${error.message}${state.localOK ? ` · ${t('local')}` : ` · ${t('recoveryFailed')}`}`); break;
      }
    }
  })();
  status();
  try { await savePromise; } finally {savePromise=null;status();}
}
function ask(title,html,buttons=[['cancel',t('cancel')],['ok',t('done')]]) {
  const dialog=$('#dialog');
  $('#dialog-title').textContent=title; $('#dialog-body').innerHTML=html;
  $('#dialog-footer').innerHTML=buttons.map(([value,label]) => `<button value="${esc(value)}" class="${value==='ok'?'primary':''}">${esc(label)}</button>`).join('');
  const close=dialog.querySelector('header button');close.type='button';close.onclick=()=>dialog.close('cancel');
  dialog.querySelector('form').onsubmit=event=>{event.preventDefault();dialog.close(event.submitter?.value || 'ok');};
  dialog.showModal();
  return new Promise(resolve=>{dialog.onclose=()=>resolve({value:dialog.returnValue,input:$('#dialog-input')?.value || ''});const input=$('#dialog-input');if(input)input.focus();});
}
async function pickNote(exclude) {
  const notes=state.w.notes.filter(n=>!n.deletedAt && n.id!==exclude);
  const promise=ask(t('pick'),`<div class="picker">${notes.map(n=>`<button type="button" data-pick="${esc(n.id)}">${esc(n.title)}</button>`).join('') || `<p>${esc(t('empty'))}</p>`}</div>`,[['cancel',t('cancel')]]);
  $('#dialog-body').onclick=e=>{const button=e.target.closest('[data-pick]');if(button)$('#dialog').close(button.dataset.pick);};
  const result=await promise; $('#dialog-body').onclick=null;
  return state.w.notes.find(n=>n.id===result.value);
}
async function named(title, defaultName='') {
  const result=await ask(title,`<label for="dialog-input" class="field-label">${esc(t('name'))}</label><input id="dialog-input" maxlength="200" required value="${esc(defaultName)}" autocomplete="off">`,[['cancel',t('cancel')],['ok',t('create')]]);
  return result.value==='ok' && result.input.trim() ? result.input.trim() : null;
}
async function exportBackup() {
  const workspace=validateWorkspace(state.w);
  const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(workspace)));
  const sha256=[...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,'0')).join('');
  download(`ObsessArt-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify({format:'obsessart-backup',formatVersion:1,exportedAt:new Date().toISOString(),sha256,workspace},null,2));
}
function exportRecovery() {download('ObsessArt-recovery.json',JSON.stringify({format:'obsessart-recovery',baseRevision:state.revision,workspace:state.w},null,2));}
async function reloadSaved() {
  const remote=await request('/api/workspace');
  state.w=remote.workspace;state.revision=remote.revision;state.dirty=false;state.error=null;state.blocked=false;state.undo=[];state.redo=[];state.selection.clear();
  state.boardId=state.w.boards[0]?.id;state.noteId=null;
  draftQueue=draftQueue.catch(()=>{}).then(clearDraft);await draftQueue;
  render();
}
async function saveDetails() {
  const result=await ask(t('saveDetails'),`<p>${esc(state.error?.message || t('saved'))}</p><p>${esc(t(state.localOK?'local':'recoveryFailed'))}</p>${state.blocked ? `<p>${esc(t('conflictText'))}</p>`:''}`,[['cancel',t('close')],['export',t('exportRecovery')],['retry',t('retry')],['reload',t('reload')]]);
  if(result.value==='export') exportRecovery();
  if(result.value==='retry') {state.blocked=false;await flush();}
  if(result.value==='reload' && (await ask(t('reload'),`<p>${esc(t('conflictText'))}</p>`)).value==='ok') await reloadSaved();
}
function updateCounts(){ const el=$('#note-count');if(el)el.textContent=state.w.notes.filter(n=>!n.deletedAt).length; }
function render() {
  document.documentElement.lang=state.lang;
  const view=state.view; const board=activeBoard();
  const title=view==='canvas' ? (board?.title || t('canvas')) : t(view==='graph'?'graphTitle':view==='trash'?'trashTitle':'allTitle');
  const subtitle=t(view==='canvas'?'canvasSubtitle':view==='graph'?'graphSubtitle':view==='trash'?'trashSubtitle':'subtitle');
  $('#app').setAttribute('aria-busy','false');
  $('#app').innerHTML=`<aside class="sidebar"><div class="brand"><span class="brand-mark" aria-hidden="true">✳</span>ObsessArt</div><div class="brand-sub">ROOM TO THINK</div>
    <input class="search" id="search" type="search" aria-label="${esc(t('search'))}" placeholder="${esc(t('search'))}" value="${esc(state.query)}">
    <div class="section-label">${esc(t('workspace').toUpperCase())}</div>
    ${[['library','▤'],['canvas','▧'],['graph','⌘'],['trash','♧']].map(([name,symbol])=>`<button class="nav-item ${view===name?'active':''}" data-view="${name}"><span class="nav-symbol" aria-hidden="true">${symbol}</span>${esc(t(name))}${name==='library'?`<span class="count" id="note-count">${state.w.notes.filter(n=>!n.deletedAt).length}</span>`:''}</button>`).join('')}
    <div class="section-label">${esc(t('boards'))}</div><div class="board-list">${state.w.boards.map(b=>`<button class="board-item ${b.id===state.boardId && view==='canvas'?'active':''}" data-board="${esc(b.id)}">◇ &nbsp;${esc(b.title)}</button>`).join('')}</div>
    <button class="board-item muted" data-action="new-board">＋ ${esc(t('newBoard'))}</button>
    <div class="sidebar-foot"><button data-action="history">${esc(t('history'))}</button><button data-action="language">${esc(t('language'))}</button>${state.passwordRequired?`<button data-action="logout">${esc(t('signOut'))}</button>`:''}</div>
    <p class="sidebar-note">${esc(t('beta'))}<br>${esc(t('privacy'))}</p></aside>
    <section class="workspace"><header class="topbar"><button class="mobile-menu icon-button" data-action="menu" aria-label="Menu">☰</button><div class="breadcrumb">${esc(t('workspace'))} &nbsp;/&nbsp; <strong>${esc(state.w.title)}</strong></div>
    <div class="top-actions"><button id="save-state" class="save-status" data-action="save-details" aria-live="polite"></button><button data-action="import">${esc(t('import'))}</button><button data-action="export">${esc(t('export'))} ↗</button><button class="primary" data-action="new-note">＋ ${esc(t('newNote'))}</button></div></header>
    <div class="content-heading"><div><div class="eyebrow">${esc(t('readOnly'))}</div><h1>${esc(title)}</h1><p>${esc(subtitle)}</p></div><div class="view-switch" aria-label="Views">${['library','canvas','graph'].map(v=>`<button data-view="${v}" class="${view===v?'active':''}">${esc(t(v))}</button>`).join('')}</div></div>
    <main id="main" class="work-area" tabindex="-1"><div id="view" class="view"></div><aside id="editor" class="editor" hidden></aside></main></section>`;
  $('#search').oninput=e=>{state.query=e.target.value;renderView();};
  renderView();renderEditor();status();
}
function renderView() {
  const view=$('#view');if(!view)return;
  if(state.view==='canvas'){renderCanvas();return;}
  if(state.view==='graph'){renderGraph();return;}
  view.className='view library';
  const notes=searchNotes(state.w,state.query,state.view==='trash');
  view.innerHTML=notes.length?`<div class="cards-grid">${notes.map(n=>`<button class="note-tile" data-note="${esc(n.id)}"><span class="tile-color" data-color="${n.color}"></span><h3>${esc(n.title)}</h3><p>${esc(summary(n.body))}</p><div class="tags">${n.tags.map(tag=>`<span class="tag">${esc(tag)}</span>`).join('')}</div></button>`).join('')}</div>`:`<div class="empty">${esc(t('empty'))}</div>`;
}
function summary(body) {return body.replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g,'$2').replace(/\[\[([^\]]+)\]\]/g,'$1').replace(/^#{1,6}\s/gm,'').replaceAll('**','').slice(0,450);}
function renderEditor() {
  const editor=$('#editor');if(!editor)return;const n=activeNote();editor.hidden=!n;if(!n)return;
  const incoming=relations(state.w).filter(r=>r.to===n.id).map(r=>state.w.notes.find(n=>n.id===r.from));
  const placements=state.w.boards.reduce((count,b)=>count+b.placements.filter(p=>p.noteId===n.id).length,0);
  editor.innerHTML=`<div class="editor-bar"><span class="tag">${esc(n.deletedAt?t('inTrash'):t('notes'))}</span><span class="muted">${placements} ${esc(t('boardUses'))}</span><button class="icon-button close" data-action="close-note" aria-label="${esc(t('close'))}">×</button></div>
    <div class="editor-scroll"><input id="note-title" class="note-title" aria-label="${esc(t('noteTitle'))}" maxlength="200" value="${esc(n.title)}" ${n.deletedAt?'disabled':''}>
    <div class="editor-modes"><button data-action="write" class="${!state.preview?'active':''}">${esc(t('edit'))}</button><button data-action="read" class="${state.preview?'active':''}">${esc(t('preview'))}</button><button data-action="link-note" ${n.deletedAt?'disabled':''}>↗ ${esc(t('link'))}</button></div>
    ${state.preview?`<article class="prose">${markdown(n.body,state.w)}</article>`:`<textarea id="note-body" class="note-body" aria-label="${esc(t('noteBody'))}" maxlength="100000" spellcheck="false" ${n.deletedAt?'disabled':''}>${esc(n.body)}</textarea>`}
    <label class="field-label" for="note-tags">${esc(t('tags'))}</label><input id="note-tags" class="meta-input" maxlength="1000" value="${esc(n.tags.join(', '))}" ${n.deletedAt?'disabled':''}>
    <label class="field-label" for="note-source">${esc(t('source'))}</label><input id="note-source" class="meta-input" type="url" maxlength="2000" placeholder="https://…" value="${esc(n.source)}" ${n.deletedAt?'disabled':''}>
    <div class="field-label">${esc(t('color'))}</div><div class="swatches">${COLORS.map(c=>`<button class="swatch ${n.color===c?'active':''}" data-color="${c}" data-swatch="${c}" aria-label="${c}" ${n.deletedAt?'disabled':''}></button>`).join('')}</div>
    <div class="field-label">${esc(t('backlinks'))}</div>${incoming.map(n=>`<button class="backlink" data-note="${esc(n.id)}">↗ ${esc(n.title)}</button>`).join('')||`<p class="muted" style="font-size:12px">${esc(t('noLinks'))}</p>`}</div>
    <footer class="editor-footer"><button data-action="export-md">${esc(t('markdown'))}</button><button class="${n.deletedAt?'':'danger'}" data-action="${n.deletedAt?'restore-note':'trash-note'}">${esc(t(n.deletedAt?'restore':'archive'))}</button></footer>`;
  for(const [selector,key] of [['#note-title','title'],['#note-body','body'],['#note-tags','tags'],['#note-source','source']]){
    const input=$(selector);if(!input)continue;
    const apply=e=>{if(e.isComposing)return;const current=activeNote();if(!current||current.deletedAt)return;
      let value=input.value;
      if(key==='title')value=value.trim()||'Untitled note';
      if(key==='tags')value=[...new Set(value.split(',').map(x=>x.trim()).filter(Boolean))].slice(0,20).map(x=>x.slice(0,50));
      change(()=>{current[key]=value;current.updatedAt=new Date().toISOString();},{paint:false,history:false});
      renderView();updateCounts();
    };input.oninput=apply;input.oncompositionend=apply;
  }
}
function edgeMarkup(board) {
  return board.edges.map(e=>{const a=board.placements.find(p=>p.id===e.from),b=board.placements.find(p=>p.id===e.to);if(!a||!b)return'';const x=a.x+a.width,y=a.y+a.height/2,tx=b.x,ty=b.y+b.height/2,bend=Math.max(65,Math.abs(tx-x)/2);return `<path d="M ${x} ${y} C ${x+bend} ${y} ${tx-bend} ${ty} ${tx} ${ty}" fill="none" stroke="#bcb1cf" stroke-width="1.7" marker-end="url(#arrow)"><title>${esc(e.label)}</title></path>`;}).join('');
}
function renderCanvas() {
  const view=$('#view'),board=activeBoard();view.className='view canvas';
  if(!board){view.innerHTML=`<div class="empty"><p>${esc(t('boardEmpty'))}</p><button class="primary" data-action="new-board">${esc(t('newBoard'))}</button></div>`;return;}
  const matching=new Set(searchNotes(state.w,state.query).map(n=>n.id));
  view.innerHTML=`<div class="canvas-tools"><button data-action="new-note">＋ ${esc(t('newNote'))}</button><button data-action="add-existing">${esc(t('addExisting'))}</button><button data-action="connect" class="${state.connecting?'active':''}">↝ ${esc(t(state.connecting?'stopConnect':'connect'))}</button><button data-action="undo" aria-label="${esc(t('undo'))}" ${state.undo.length?'':'disabled'}>↶</button><button data-action="redo" aria-label="${esc(t('redo'))}" ${state.redo.length?'':'disabled'}>↷</button><button class="danger" data-action="delete-board" aria-label="${esc(t('removeBoard'))}">×</button></div>
    <div class="canvas-world"><svg class="edge-layer" aria-hidden="true"><defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#bcb1cf"/></marker></defs><g id="edges">${edgeMarkup(board)}</g></svg>
    ${board.placements.map(p=>{const n=state.w.notes.find(n=>n.id===p.noteId);if(!n)return'';return `<article class="board-card ${state.selection.has(p.id)?'selected':''} ${state.connectFrom===p.id?'connecting':''}" data-placement="${esc(p.id)}" style="left:${p.x}px;top:${p.y}px;width:${p.width}px;height:${p.height}px;opacity:${state.query&&!matching.has(n.id)?'.28':'1'}"><button class="card-handle" data-drag="${esc(p.id)}" data-color="${n.color}" data-note="${esc(n.id)}"><span>${esc(n.title)}</span><span aria-hidden="true">⠿</span></button><div class="card-content">${esc(n.deletedAt?t('inTrash'):summary(n.body))}</div><div class="card-foot"><span>${esc(n.tags[0] || t('notes'))}</span><button data-remove="${esc(p.id)}" aria-label="${esc(t('remove'))}">×</button></div><button class="resize-handle" data-resize="${esc(p.id)}" aria-label="Resize card"></button></article>`;}).join('')}</div>
    <div class="canvas-hint">${esc(t('boardHint'))}</div><div class="zoom-controls"><button data-action="zoom-out" aria-label="Zoom out">−</button><span id="zoom-label"></span><button data-action="zoom-in" aria-label="Zoom in">＋</button><button data-action="fit">${esc(t('fit'))}</button></div>`;
  applyTransform();
}
function applyTransform(){const el=$('.canvas-world');if(!el)return;const {x,y,z}=transform();el.style.transform=`translate(${x}px,${y}px) scale(${z})`;$('#zoom-label').textContent=`${Math.round(z*100)}%`;}
function fit(){const b=activeBoard(),v=$('#view');if(!b?.placements.length)return;const minX=Math.min(...b.placements.map(p=>p.x)),minY=Math.min(...b.placements.map(p=>p.y)),maxX=Math.max(...b.placements.map(p=>p.x+p.width)),maxY=Math.max(...b.placements.map(p=>p.y+p.height));const z=Math.max(.1,Math.min(1.3,(v.clientWidth-80)/(maxX-minX),(v.clientHeight-140)/(maxY-minY)));Object.assign(transform(),{z,x:(v.clientWidth-(maxX-minX)*z)/2-minX*z,y:75-minY*z});applyTransform();}
function zoom(factor, cx=$('#view').clientWidth/2,cy=$('#view').clientHeight/2){const v=transform(),old=v.z,next=Math.max(.1,Math.min(2.5,old*factor));v.x=cx-(cx-v.x)*next/old;v.y=cy-(cy-v.y)*next/old;v.z=next;applyTransform();}
function renderGraph(){
  const el=$('#view');el.className='view graph';let notes=searchNotes(state.w,state.query);const links=relations(state.w);
  if(state.focus && state.noteId){const included=new Set([state.noteId]);links.forEach(r=>{if(r.from===state.noteId)included.add(r.to);if(r.to===state.noteId)included.add(r.from);});notes=notes.filter(n=>included.has(n.id));}
  const limited=notes.length>250;notes=notes.slice(0,250);
  const coords=new Map(notes.map((n,i)=>{if(notes.length===1)return[n.id,{x:500,y:300}];const angle=(i/notes.length)*Math.PI*2-Math.PI/2;const radius=notes.length>15?(i%2?180:260):225;return[n.id,{x:500+Math.cos(angle)*radius*1.45,y:315+Math.sin(angle)*radius}];}));
  const shown=links.filter(r=>coords.has(r.from)&&coords.has(r.to));
  el.innerHTML=`<div class="canvas-tools"><button data-action="graph-focus" ${state.noteId?'':'disabled'}>${esc(t(state.focus?'allGraph':'focus'))}</button></div><svg viewBox="0 0 1000 640" role="group" aria-label="Knowledge graph">${shown.map(r=>{const a=coords.get(r.from),b=coords.get(r.to);return `<line class="graph-line" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/>`;}).join('')}${notes.map(n=>{const p=coords.get(n.id);const degree=links.filter(r=>r.from===n.id||r.to===n.id).length;return `<g class="graph-node" role="button" tabindex="0" aria-label="${esc(n.title)}" data-note="${esc(n.id)}"><circle cx="${p.x}" cy="${p.y}" r="${Math.min(30,16+degree*2)}" fill="var(--${n.color})"/><text x="${p.x}" y="${p.y+48}" text-anchor="middle">${esc(n.title.slice(0,32))}${n.title.length>32?'…':''}</text></g>`;}).join('')}</svg><div class="graph-caption">${notes.length} ${esc(t('notes'))} · ${shown.length} ${esc(t('connections'))}${limited?' · preview limited to 250 notes':''}</div>`;
}
async function newNote(){const title=await named(t('newNote'));if(!title)return;const note=createNote(title);change(()=>{state.w.notes.push(note);const b=activeBoard();if(state.view==='canvas'&&b){const v=transform();placeNote(b,note.id,(80-v.x)/v.z,(100-v.y)/v.z);}state.noteId=note.id;state.preview=false;});$('#note-body')?.focus();}
async function newBoard(){const title=await named(t('newBoard'));if(!title)return;change(()=>{const b={id:crypto.randomUUID(),title,placements:[],edges:[]};state.w.boards.push(b);state.boardId=b.id;state.view='canvas';state.selection.clear();});render();}
async function showHistory(){
  await flush();if(state.dirty){await saveDetails();return;}
  const rows=await request('/api/history');
  const waiting=ask(t('history'),`<div class="picker">${rows.map(row=>`<div class="history-row"><span>r${row.revision} · ${esc(new Date(row.savedAt).toLocaleString())} · ${esc(row.kind)}</span><button type="button" data-revision="${row.revision}" ${row.revision===state.revision?'disabled':''}>${esc(t('restore'))}</button></div>`).join('')}</div>`,[['cancel',t('close')]]);
  $('#dialog-body').onclick=e=>{const target=e.target.closest('[data-revision]');if(target)$('#dialog').close(`revision:${target.dataset.revision}`);};
  const result=await waiting;$('#dialog-body').onclick=null;
  if(!result.value.startsWith('revision:'))return;
  const chosen=Number(result.value.slice(9));
  if((await ask(t('history'),`<p>${esc(t('confirmRestore'))}</p>`)).value!=='ok')return;
  await request('/api/restore','POST',{revision:chosen,expectedRevision:state.revision});await reloadSaved();
}
const actions = {
  'new-note':newNote,'new-board':newBoard,'export':exportBackup,'import':()=>$('#import-file').click(),'history':showHistory,
  'language':()=>{state.lang=state.lang==='en'?'zh-Hant':'en';localStorage.setItem('obsessart-language',state.lang);render();},
  'menu':()=>$('.sidebar').classList.toggle('open'),
  'close-note':()=>{state.noteId=null;renderEditor();},
  'write':()=>{state.preview=false;renderEditor();},'read':()=>{state.preview=true;renderEditor();},
  'save-details':saveDetails,
  'add-existing':async()=>{const n=await pickNote();const b=activeBoard();if(n&&b){const v=transform();change(()=>placeNote(b,n.id,(100-v.x)/v.z,(130-v.y)/v.z));}},
  'link-note':async()=>{const current=activeNote();if(!current||current.deletedAt)return;const target=await pickNote(current.id);if(target){change(()=>{current.body+=`\n\n[[${target.id}|${target.title.replace(/[\]|]/g,'')}]]`;current.updatedAt=new Date().toISOString();});}},
  'connect':()=>{state.connecting=!state.connecting;state.connectFrom=null;renderCanvas();if(state.connecting)toast(t('selectSecond'));},
  'zoom-in':()=>zoom(1.2),'zoom-out':()=>zoom(1/1.2),'fit':fit,
  'delete-board':async()=>{const b=activeBoard();if(!b)return;const message=state.lang==='en'?'Delete this board? Its notes will remain in All notes.':'刪除此白板？筆記仍會保留在全部筆記中。';if((await ask(t('removeBoard'),`<p>${esc(message)}</p>`)).value==='ok'){change(()=>{state.w.boards=state.w.boards.filter(x=>x.id!==b.id);state.boardId=state.w.boards[0]?.id;state.selection.clear();});render();}},
  'trash-note':async()=>{const n=activeNote();if(!n)return;if((await ask(t('archive'),`<p>${esc(n.title)}</p>`)).value==='ok')change(()=>{n.deletedAt=new Date().toISOString();});},
  'restore-note':()=>{const n=activeNote();if(n)change(()=>{n.deletedAt=null;});},
  'export-md':()=>{const n=activeNote();if(n)download(`${n.title.replace(/[\\/:*?"<>|]/g,'_').slice(0,100)}.md`,n.body,'text/markdown;charset=utf-8');},
  'graph-focus':()=>{state.focus=!state.focus;renderGraph();},
  'undo':()=>{if(!state.undo.length)return;state.redo.push(structuredClone(state.w));state.w=state.undo.pop();changed(null);render();},
  'redo':()=>{if(!state.redo.length)return;state.undo.push(structuredClone(state.w));state.w=state.redo.pop();changed(null);render();},
  'logout':async()=>{await flush();if(state.dirty){await saveDetails();return;}await request('/api/logout','POST',{});await clearDraft();state.w=null;location.reload();}
};
$('#app').addEventListener('click',event=>run(async()=>{
  if(Date.now()-lastDrag<180)return;
  const viewButton=event.target.closest('[data-view]');
  if(viewButton){state.view=viewButton.dataset.view;state.connecting=false;state.connectFrom=null;render();return;}
  const boardButton=event.target.closest('[data-board]');
  if(boardButton){state.boardId=boardButton.dataset.board;state.view='canvas';state.selection.clear();render();return;}
  const remove=event.target.closest('[data-remove]');
  if(remove){change(()=>removePlacement(activeBoard(),remove.dataset.remove));return;}
  const swatch=event.target.closest('[data-swatch]');
  if(swatch && activeNote() && !activeNote().deletedAt){change(()=>{activeNote().color=swatch.dataset.swatch;});return;}
  const card=event.target.closest('[data-placement]');
  if(card && state.connecting){
    const id=card.dataset.placement;
    if(!state.connectFrom){state.connectFrom=id;renderCanvas();return;}
    if(state.connectFrom!==id){const b=activeBoard(),from=state.connectFrom;change(()=>{const found=b.edges.find(e=>e.from===from&&e.to===id);if(found)b.edges=b.edges.filter(e=>e!==found);else b.edges.push({id:crypto.randomUUID(),from,to:id,label:''});});}
    state.connectFrom=null;renderCanvas();return;
  }
  const noteButton=event.target.closest('[data-note]');
  if(noteButton && state.w.notes.some(n=>n.id===noteButton.dataset.note)){
    if(event.shiftKey && card)return;
    state.noteId=noteButton.dataset.note;renderEditor();if(state.view==='graph')renderGraph();return;
  }
  const action=event.target.closest('[data-action]')?.dataset.action;
  if(actions[action])await actions[action]();
}));
$('#app').addEventListener('pointerdown',event=>{
  if(state.view!=='canvas'||event.button!==0)return;
  const canvas=event.target.closest('.canvas');if(!canvas || event.target.closest('.canvas-tools,.zoom-controls'))return;
  const drag=event.target.closest('[data-drag]'),resize=event.target.closest('[data-resize]');
  if(state.connecting)return;
  if((drag||resize) && activeBoard()){
    const id=(drag||resize).dataset[drag?'drag':'resize'];
    if(event.shiftKey){if(state.selection.has(id))state.selection.delete(id);else state.selection.add(id);}
    else if(!state.selection.has(id)){state.selection.clear();state.selection.add(id);}
    const placement=activeBoard().placements.find(p=>p.id===id);
    gesture={kind:resize?'resize':'cards',id,startX:event.clientX,startY:event.clientY,before:structuredClone(state.w),positions:activeBoard().placements.filter(p=>state.selection.has(p.id)).map(p=>({...p})),placement:{...placement},pointerId:event.pointerId,moved:false};
    document.querySelectorAll('.board-card').forEach(el=>el.classList.toggle('selected',state.selection.has(el.dataset.placement)));
    event.preventDefault();return;
  }
  if(event.target.closest('.board-card,button'))return;
  gesture={kind:'pan',startX:event.clientX,startY:event.clientY,initial:{...transform()},pointerId:event.pointerId,moved:false};
  event.preventDefault();
});
window.addEventListener('pointermove',event=>{
  if(!gesture || event.pointerId!==gesture.pointerId)return;
  const dx=event.clientX-gesture.startX,dy=event.clientY-gesture.startY;
  if(Math.abs(dx)+Math.abs(dy)<4 && !gesture.moved)return;gesture.moved=true;
  if(gesture.kind==='pan'){const v=transform();v.x=gesture.initial.x+dx;v.y=gesture.initial.y+dy;applyTransform();return;}
  const z=transform().z,b=activeBoard();if(!b)return;
  if(gesture.kind==='cards')for(const original of gesture.positions){const p=b.placements.find(p=>p.id===original.id);p.x=Math.max(-100000,Math.min(100000,original.x+dx/z));p.y=Math.max(-100000,Math.min(100000,original.y+dy/z));}
  else {const p=b.placements.find(p=>p.id===gesture.id);p.width=Math.max(200,Math.min(800,gesture.placement.width+dx/z));p.height=Math.max(140,Math.min(1000,gesture.placement.height+dy/z));}
  for(const p of b.placements){const el=document.querySelector(`[data-placement="${p.id}"]`);if(el){el.style.left=`${p.x}px`;el.style.top=`${p.y}px`;el.style.width=`${p.width}px`;el.style.height=`${p.height}px`;}}
  const edges=$('#edges');if(edges)edges.innerHTML=edgeMarkup(b);
});
function endGesture(event){if(!gesture || (event?.pointerId!==undefined && event.pointerId!==gesture.pointerId))return;const previous=gesture;gesture=null;if(previous.moved){lastDrag=Date.now();if(previous.kind!=='pan')changed(previous.before);}}
window.addEventListener('pointerup',endGesture);window.addEventListener('pointercancel',endGesture);window.addEventListener('blur',()=>endGesture());
$('#app').addEventListener('wheel',event=>{if(state.view==='canvas'&&event.target.closest('.canvas')){event.preventDefault();const box=$('#view').getBoundingClientRect();zoom(Math.exp(-Math.max(-150,Math.min(150,event.deltaY))*.002),event.clientX-box.left,event.clientY-box.top);}},{passive:false});
window.addEventListener('keydown',event=>{
  const input=event.target.closest('input,textarea,[contenteditable="true"]');
  if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='s'){event.preventDefault();run(flush);}
  if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){event.preventDefault();$('.sidebar')?.classList.add('open');$('#search')?.focus();}
  if(!input&&(event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='z'){event.preventDefault();actions[event.shiftKey?'redo':'undo']();}
  if(!input&&(event.key==='Enter'||event.key===' ')&&event.target.matches('.graph-node')){event.preventDefault();event.target.dispatchEvent(new MouseEvent('click',{bubbles:true}));}
  if(event.key==='Escape'&&!$('#dialog').open){state.connecting=false;state.connectFrom=null;$('.sidebar')?.classList.remove('open');}
});
window.addEventListener('beforeunload',event=>{if(state.dirty){event.preventDefault();event.returnValue='';}});
window.addEventListener('online',()=>run(flush));
$('#import-file').onchange=event=>run(async()=>{
  const file=event.target.files[0];event.target.value='';if(!file)return;
  if(file.size>LIMITS.bytes)throw new Error('Import exceeds 2 MB');
  const text=await file.text();
  if(file.name.toLowerCase().endsWith('.md')){
    const n=createNote(file.name.replace(/\.md$/i,'').slice(0,200)||'Imported note');n.body=text;
    const candidate=structuredClone(state.w);candidate.notes.push(n);validateWorkspace(candidate);
    change(()=>{state.w.notes.push(n);state.noteId=n.id;state.view='library';});render();toast(t('mdImported'));return;
  }
  let backup;try{backup=JSON.parse(text);}catch{throw new Error('Invalid JSON');}
  if(backup.format!=='obsessart-backup'||backup.formatVersion!==1)throw new Error('Use an ObsessArt backup. Recovery files require manual reconciliation.');
  const clean=validateWorkspace(backup.workspace);
  const result=await ask(t('replace'),`<p>${esc(t('replaceText'))}</p><p>${clean.notes.length} ${esc(t('notes'))} · ${clean.boards.length} ${esc(t('canvas'))}</p>`,[['cancel',t('cancel')],['ok',t('replace')]]);
  if(result.value!=='ok')return;
  await flush();if(state.dirty){await saveDetails();return;}
  await request('/api/import','POST',{backup,expectedRevision:state.revision});await reloadSaved();
});
function login(){
  $('#app').innerHTML=`<section class="login"><form id="login-form"><div class="brand"><span class="brand-mark">✳</span>ObsessArt</div><h1>${esc(t('signIn'))}</h1><p>${esc(t('loginText'))}</p><label for="password">${esc(t('password'))}</label><input id="password" type="password" required maxlength="256" autocomplete="current-password"><button type="submit" class="primary">${esc(t('signIn'))}</button><p id="login-error" role="alert"></p></form></section>`;
  $('#login-form').onsubmit=event=>{event.preventDefault();run(async()=>{const button=event.submitter;button.disabled=true;try{await request('/api/login','POST',{password:$('#password').value});await boot();}catch(error){$('#login-error').textContent=error.message;}finally{if(button.isConnected)button.disabled=false;}});};
  $('#password').focus();
}
async function boot(){
  const session=await request('/api/session');state.passwordRequired=session.passwordRequired;if(!session.authenticated){login();return;}
  const remote=await request('/api/workspace');state.w=remote.workspace;state.revision=remote.revision;
  try{
    const draft=await readDraft();
    if(draft?.workspace?.id===state.w.id && JSON.stringify(draft.workspace)!==JSON.stringify(state.w)){
      state.w=validateWorkspace(draft.workspace);state.dirty=true;
      if(draft.baseRevision!==remote.revision){state.revision=draft.baseRevision;state.blocked=true;state.error=new Error(t('conflict'));state.error.status=409;}
      toast(t('recover'));
    }else if(draft)await clearDraft();
  }catch{state.localOK=false;toast(t('recoveryFailed'));}
  state.boardId=state.w.boards[0]?.id;render();
  requestAnimationFrame(()=>fit());
  if(state.dirty&&!state.blocked)run(flush);
}
boot().catch(error=>{ $('#app').innerHTML=`<section class="login"><div><h1>ObsessArt</h1><p>${esc(error.message)}</p><button id="reload-page">Reload</button></div></section>`;$('#reload-page').onclick=()=>location.reload(); });
