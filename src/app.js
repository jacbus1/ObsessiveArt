import {uid,copy,esc,clamp,COLORS,LIMITS,createNote,createBoard,placeNote,removePlacement,purgeNote,remember,seedWorkspace,resolveNote,wikiLinks,backlinks,graphData,graphLayout,plain,markdown,serialize,parseBackup,validateWorkspace,filename,makeZip,markdownFiles} from './core.js';
import {openStore,readWorkspace,commitWorkspace,ConflictError} from './storage.js';

const I={
zh:{notes:'筆記',board:'白板',graph:'知識圖譜',workspace:'工作區',library:'筆記庫',canvases:'我的白板',search:'搜尋筆記、內容、標籤…',newNote:'新增筆記',newBoard:'新增白板',local:'只存本機',saved:'本機已儲存',saving:'儲存中…',pending:'有未儲存變更',error:'尚未儲存 · 請備份',settings:'資料與設定',help:'使用指南',all:'全部筆記',empty:'還沒有內容',edit:'編輯',preview:'閱讀',split:'並排',tags:'標籤，以逗號分隔',title:'筆記標題',body:'Markdown 內容',backlinks:'反向連結',locations:'出現的白板',noBacklinks:'尚無其他筆記連到這裡。',pin:'置頂',unpin:'取消置頂',history:'版本記錄',trash:'垃圾桶',moveTrash:'移至垃圾桶',restore:'還原',delete:'永久刪除',cancel:'取消',confirm:'確認',close:'關閉',save:'儲存',add:'加入',rename:'重新命名',name:'名稱',existing:'加入現有筆記',sticky:'便利貼',frame:'區段框',image:'圖片 / PDF',connect:'連接',link:'插入筆記連結',remove:'移除位置',color:'顏色',undo:'復原',redo:'重做',fit:'適合畫面',zoomIn:'放大',zoomOut:'縮小',clear:'清除',export:'完整備份',import:'匯入',markdown:'Markdown ZIP',exportBoard:'匯出 SVG',dataTitle:'你的知識，你的資料',dataSubtitle:'不需帳號。筆記及附件保存在這個瀏覽器，沒有上傳到伺服器。',backupText:'完整 JSON 包含筆記、白板、附件及歷史；用它還原完整工作區。',mdText:'下載可讀 Markdown 與附件。不是完整備份，不能保留全部白板與歷史。',importMD:'匯入 Markdown 檔案',restoreBackup:'還原 JSON 備份',restoreWarn:'將替換目前工作區。系統會先下載目前資料的備份。請確認下載已成功，再繼續。',storage:'瀏覽器儲存',persist:'申請持久儲存',persistText:'即使已獲准，清除網站資料仍會刪除內容。請另存備份。',theme:'外觀',light:'淺色',dark:'深色',language:'語言',warning:'請定期備份。不同瀏覽器、裝置、網址或連接埠的資料不會自動同步。',offline:'離線可用',viewNote:'開啟筆記',chooseNote:'選擇共用筆記',connectHint:'依序點選兩張卡片，建立白板連線。Esc 取消。',boardHint:'拖動卡片 · 拖動空白處平移 · Ctrl/⌘ + 滾輪縮放 · 雙擊開啟',graphHint:'只有筆記內的 [[連結]] 進入圖譜；白板箭頭不會自動建立知識關係。',graphFilter:'篩選圖譜…',nothing:'沒有符合的筆記',newTitle:'未命名筆記',newBoardTitle:'新的研究白板',noteCount:'張筆記',boardCount:'塊白板',objectCount:'個物件',edgeCount:'條關係',selected:'已選取',trashHint:'移入垃圾桶後不出現在搜尋及圖譜；還原會恢復所有白板引用。永久刪除會移除所有位置。',historyHint:'保留最近 25 個編輯階段的舊正文。還原前會先記錄目前版本。',noHistory:'還沒有舊版本。',insert:'插入',deleteBoard:'刪除白板',deleteBoardWarn:'只刪除白板、位置與箭頭，所有筆記會保留。',trashWarn:'這張筆記會在所有白板標示為已移除，可從垃圾桶還原。',deleteWarn:'永久刪除此筆記與所有白板位置。建議先下載備份。',label:'連線標籤',editObject:'編輯白板物件',frameText:'新主題',stickyText:'寫下你的想法…',edited:'最近修改',readOnly:'儲存已暫停。請下載完整備份，然後重新載入處理。',reload:'重新載入',backupDone:'備份下載已開始，請確認檔案已保存。',imported:'匯入完成',done:'已完成',fileLimit:'每個附件上限 8 MiB；只支援 PNG、JPEG、GIF、WebP、PDF。',recover:'下載上一個儲存版本',attachmentList:'附件庫',open:'開啟',menu:'選單',noteHelp:'支援 Markdown 標題、清單、表格、程式碼及 [[雙向連結]]。原始 HTML 不會執行。',shortcut:'快捷鍵',fullscreen:'關閉編輯側欄',recoveryTitle:'資料讀取失敗',recoveryText:'沒有覆蓋或重設你的資料。先下載原始資料，再嘗試還原。',downloadRaw:'下載原始資料',focus:'只看相鄰筆記',allGraph:'完整圖譜',exportHint:'SVG 匯出包含卡片文字與圖片，不是截圖。',boardName:'白板名稱',renameWorkspace:'工作區名稱',linkEmpty:'先建立另一張筆記。',removeConnector:'移除連線',statusConflict:'另一個分頁已更新，為避免覆蓋，這個分頁已停止儲存。',limits:'v0.1：單人、本機儲存；尚無跨裝置同步、多人協作、AI 或 PDF 摘錄定位。'},
en:{notes:'Notes',board:'Canvas',graph:'Graph',workspace:'WORKSPACE',library:'LIBRARY',canvases:'MY CANVASES',search:'Search notes, content, tags…',newNote:'New note',newBoard:'New canvas',local:'Local only',saved:'Saved on this device',saving:'Saving…',pending:'Unsaved changes',error:'Not saved · back up now',settings:'Data & settings',help:'Getting started',all:'All notes',empty:'Nothing here yet',edit:'Write',preview:'Read',split:'Split',tags:'Tags, separated by commas',title:'Note title',body:'Markdown content',backlinks:'Backlinks',locations:'On these canvases',noBacklinks:'No other notes link here yet.',pin:'Pin',unpin:'Unpin',history:'History',trash:'Trash',moveTrash:'Move to trash',restore:'Restore',delete:'Delete permanently',cancel:'Cancel',confirm:'Confirm',close:'Close',save:'Save',add:'Add',rename:'Rename',name:'Name',existing:'Place existing note',sticky:'Sticky note',frame:'Frame',image:'Image / PDF',connect:'Connect',link:'Insert note link',remove:'Remove placement',color:'Color',undo:'Undo',redo:'Redo',fit:'Fit to screen',zoomIn:'Zoom in',zoomOut:'Zoom out',clear:'Clear',export:'Full backup',import:'Import',markdown:'Markdown ZIP',exportBoard:'Export SVG',dataTitle:'Your knowledge. Your data.',dataSubtitle:'No account. Your notes and attachments stay in this browser; they are not uploaded to a server.',backupText:'JSON includes notes, boards, attachments and history. Use it for complete workspace restore.',mdText:'Readable Markdown and attachments. Not a full backup: canvas placements and history are not preserved.',importMD:'Import Markdown files',restoreBackup:'Restore JSON backup',restoreWarn:'This replaces the current workspace. First download the current backup and verify it was saved, then continue.',storage:'Browser storage',persist:'Request persistent storage',persistText:'Even when granted, clearing site data deletes your content. Keep an external backup.',theme:'Appearance',light:'Light',dark:'Dark',language:'Language',warning:'Back up regularly. Different browsers, devices, domains or ports have separate data and do not sync automatically.',offline:'Available offline',viewNote:'Open note',chooseNote:'Choose a shared note',connectHint:'Select two cards to connect them on this canvas. Esc to cancel.',boardHint:'Drag cards · Drag empty space to pan · Ctrl/⌘ + wheel to zoom · Double-click to open',graphHint:'Only [[links]] inside notes appear here. Canvas arrows are visual connectors, not knowledge relations.',graphFilter:'Filter graph…',nothing:'No matching notes',newTitle:'Untitled note',newBoardTitle:'New research canvas',noteCount:'notes',boardCount:'canvases',objectCount:'objects',edgeCount:'links',selected:'Selected',trashHint:'Trashed notes leave search and graph. Restore keeps their placements. Permanent deletion removes all placements.',historyHint:'Keeps the last 25 editing-session snapshots. Restoring first records the current text.',noHistory:'No earlier versions yet.',insert:'Insert',deleteBoard:'Delete canvas',deleteBoardWarn:'Only this canvas, its placements and connectors will be deleted. Notes remain in the library.',trashWarn:'The note will be marked as removed on every canvas. Restore it from Trash.',deleteWarn:'Permanently delete this note and all placements. Back up first.',label:'Connector label',editObject:'Edit canvas object',frameText:'New topic',stickyText:'Capture a thought…',edited:'Last edited',readOnly:'Saving is paused. Download your full backup before reloading.',reload:'Reload',backupDone:'Backup download started. Verify the file was saved.',imported:'Import complete',done:'Done',fileLimit:'8 MiB per attachment. PNG, JPEG, GIF, WebP and PDF only.',recover:'Download previous saved state',attachmentList:'Attachments',open:'Open',menu:'Menu',noteHelp:'Markdown headings, lists, tables, code and [[wikilinks]]. Raw HTML is never executed.',shortcut:'Shortcuts',fullscreen:'Close editor panel',recoveryTitle:'Could not read workspace',recoveryText:'Your data was not replaced or reset. Download the raw records before attempting recovery.',downloadRaw:'Download raw data',focus:'Adjacent notes only',allGraph:'Whole graph',exportHint:'SVG export renders card text and images, not just a screenshot.',boardName:'Canvas name',renameWorkspace:'Workspace name',linkEmpty:'Create another note first.',removeConnector:'Remove connector',statusConflict:'Another tab saved newer data. Saving is paused here to prevent overwriting it.',limits:'v0.1: single-user, local storage. No cross-device sync, multiplayer, AI or PDF highlight anchoring yet.'}
};
const ICONS={notes:'▤',board:'▦',graph:'⌘',plus:'+',search:'⌕',settings:'⚙',arrow:'↗',chevron:'›',close:'×',more:'⋯',trash:'⌫',check:'✓',undo:'↶',redo:'↷',link:'↔',image:'▧',fit:'⛶',help:'?',download:'↓',pin:'◇'};
const $=s=>document.querySelector(s);
const app=$('#app'),modal=$('#modal');
let db,ws,revision=0,changed=0,saved=0,saving=false,blocked=false,saveTimer,rawRecord;
let view='board',boardId,noteId,query='',graphQuery='',editorMode='edit',panel=false,selected=new Set(),connectFrom=null,tool='select',sidebar=false,graphFocus=null;
let undo=[],redo=[],editSession=null,searchTimer,channel;
const t=k=>I[ws?.settings.language||'zh'][k]||k;
const currentBoard=()=>ws.boards.find(b=>b.id===boardId)||ws.boards[0];
const currentNote=()=>ws.notes.find(n=>n.id===noteId&&!n.deletedAt);
const activeNotes=()=>ws.notes.filter(n=>!n.deletedAt);
const icon=(name)=>`<span class="icon" aria-hidden="true">${ICONS[name]||name}</span>`;
const button=(action,label,ico='',extra='',cls='')=>`<button type="button" data-action="${action}" ${extra} class="${cls}" title="${esc(label)}" aria-label="${esc(label)}">${ico?icon(ico):''}<span>${esc(label)}</span></button>`;
const small=(action,label,ico,extra='')=>button(action,label,ico,extra,'icon-button');
const date=at=>new Date(at).toLocaleString(ws.settings.language==='zh'?'zh-Hant':'en-CA',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
function notice(message,error=false){const n=document.createElement('div');n.className=`toast ${error?'error':''}`;n.textContent=message;$('#notices').append(n);setTimeout(()=>n.remove(),error?10000:4300);}
function download(name,data,type='application/json') {const blob=data instanceof Blob?data:new Blob([data],{type});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);}
function backup(){download(`ObsessiveArt-${new Date().toISOString().replace(/[:.]/g,'-')}.json`,serialize(ws));notice(t('backupDone'));}
function status(){const e=$('#save-status');if(e){e.textContent=blocked?t('error'):saving?t('saving'):changed!==saved?t('pending'):t('saved');e.className=`save-status ${blocked?'failed':changed!==saved?'pending':''}`;}const bar=$('#error-bar');if(bar){bar.hidden=!blocked;}}
function changedState(){changed++;clearTimeout(saveTimer);status();saveTimer=setTimeout(flush,220);}
async function flush(){
  clearTimeout(saveTimer);if(!db||blocked||saving||changed===saved)return;
  saving=true;status();const generation=changed,snapshot=copy(ws);
  try{revision=await commitWorkspace(db,revision,snapshot);saved=generation;channel?.postMessage({revision});}
  catch(e){blocked=true;notice(e instanceof ConflictError?t('statusConflict'):`${t('error')}: ${e.message}`,true);}
  finally{saving=false;status();if(!blocked&&saved!==changed)saveTimer=setTimeout(flush,0);}
}
function pushUndo(){undo.push(copy(ws));if(undo.length>15)undo.shift();redo=[];}
function mutate(fn,{history=true,renderUI=true}={}){
  if(blocked){notice(t('readOnly'),true);return;}
  if(history)pushUndo();fn();changedState();if(renderUI)render();
}
function ensureEditSession(){const n=currentNote();if(n&&editSession!==n.id){remember(n);editSession=n.id;undo=[];redo=[];}}
function endEditing(){editSession=null;}
function paintTheme(){document.documentElement.dataset.theme=ws.settings.theme;document.documentElement.lang=ws.settings.language==='zh'?'zh-Hant':'en';}
function render(){
  if(!ws)return;paintTheme();if(!ws.boards.some(b=>b.id===boardId))boardId=ws.boards[0].id;
  if(!currentNote())noteId=activeNotes()[0]?.id;
  const note=currentNote(),b=currentBoard();
  app.innerHTML=`<div class="shell ${sidebar?'sidebar-open':''}">
  <aside class="sidebar" aria-label="Navigation"><a class="brand" href="./"><div class="brand-symbol">O<span>A</span></div><div>ObsessiveArt<small>CONNECTED THINKING</small></div></a>
  <button class="workspace-switch" data-action="rename-workspace"><span class="workspace-avatar">${esc(ws.name.charAt(0).toUpperCase())}</span><span>${esc(ws.name)}<small>${t('local')}</small></span>${icon('chevron')}</button>
  <div class="section-label">${t('workspace')}</div>
  <nav>${['notes','board','graph'].map(v=>button(`view-${v}`,t(v),v,`aria-current="${view===v?'page':'false'}"`,view===v?'nav-item active':'nav-item')).join('')}</nav>
  <div class="section-heading"><span>${t('canvases')}</span>${small('new-board',t('newBoard'),'plus')}</div><div class="board-list">${ws.boards.map(b=>`<button class="board-link ${view==='board'&&b.id===boardId?'active':''}" data-action="select-board" data-id="${esc(b.id)}">${icon('board')}<span>${esc(b.title)}</span><small>${b.nodes.length}</small></button>`).join('')}</div>
  <div class="section-heading"><span>${t('library')} <b>${activeNotes().length}</b></span>${small('new-note',t('newNote'),'plus')}</div>
  <label class="searchbox">${icon('search')}<input id="search" value="${esc(query)}" placeholder="${t('search')}" aria-label="${t('search')}" autocomplete="off"></label>
  <div id="note-list" class="note-list">${noteList()}</div>
  <div class="sidebar-bottom">${button('trash',t('trash'),'trash')}${button('settings',t('settings'),'settings')}${button('help',t('help'),'help')}<div class="local-footer"><span class="status-dot"></span><span>${t('local')} · v0.1.0</span></div></div></aside>
  <div class="mobile-backdrop" data-action="toggle-sidebar"></div>
  <main id="main" class="main" tabindex="-1"><header class="topbar"><div class="breadcrumbs">${small('toggle-sidebar',t('menu'),'☰','id="mobile-menu"')}<span>${esc(ws.name)}</span>${icon('chevron')}<strong>${t(view)}</strong></div><div class="top-actions"><span id="save-status" role="status" class="save-status"></span>${small('export-backup',t('export'),'download')}${small('help',t('help'),'help')}</div></header>
  <div id="error-bar" class="error-bar" hidden>${t('readOnly')} ${button('export-backup',t('export'),'download')}${button('reload',t('reload'))}</div>
  <section class="view-heading"><div><div class="eyebrow">${view==='board'?'VISUAL WORKSPACE':view==='graph'?'FIND THE CONNECTIONS':'A PLACE FOR YOUR IDEAS'}</div><div class="heading-row"><h1>${esc(view==='board'?b.title:view==='graph'?t('graph'):t('all'))}</h1>${view==='board'?small('rename-board',t('rename'),'✎'):''}</div><p>${view==='board'?`${b.nodes.length} ${t('objectCount')} · ${t('boardHint')}`:view==='graph'?t('graphHint'):`${activeNotes().length} ${t('noteCount')} · ${t('noteHelp')}`}</p></div>${view==='board'?button('existing-note',t('existing'),'plus','','secondary'):button('new-note',t('newNote'),'plus','','primary')}</section>
  ${view==='board'?renderBoard():view==='graph'?renderGraph():renderNotes(note)}
  </main>${panel&&view!=='notes'&&note?`<aside class="inspector"><div class="inspector-heading"><span>${t('notes')}</span>${small('close-panel',t('fullscreen'),'close')}</div>${noteEditor(note,true)}</aside>`:''}</div>`;
  status();if(view==='board')bindBoard();bindEditor();
}
function noteList(){
 const q=query.toLocaleLowerCase(),notes=activeNotes().filter(n=>(n.title+' '+n.text+' '+n.tags.join(' ')).toLocaleLowerCase().includes(q)).sort((a,b)=>Number(b.pinned)-Number(a.pinned)||b.updatedAt-a.updatedAt);
 return notes.length?notes.slice(0,120).map(n=>`<button class="note-item ${n.id===noteId?'active':''}" data-action="open-note" data-id="${esc(n.id)}"><span class="note-dot ${n.color}"></span><span><strong>${n.pinned?'◇ ':''}${esc(n.title||t('newTitle'))}</strong><small>${esc(plain(n.text,60))||'—'}</small></span></button>`).join('')+(notes.length>120?`<p class="muted">120 / ${notes.length}</p>`:''):`<div class="list-empty">${t('nothing')}</div>`;
}
function renderNotes(note){return `<div class="notes-workspace">${note?noteEditor(note):`<div class="empty-state"><div>▤</div><h2>${t('empty')}</h2>${button('new-note',t('newNote'),'plus','','primary')}</div>`}</div>`;}
function noteEditor(n,compact=false){
 return `<section class="note-editor ${compact?'compact':''}" data-note="${esc(n.id)}"><div class="editor-toolbar"><div class="segmented">${['edit','preview',...(compact?[]:['split'])].map(v=>button('editor-mode',t(v),'',`data-mode="${v}" aria-pressed="${editorMode===v}"`,editorMode===v?'active':'')).join('')}</div><div class="editor-actions">${small('pin',t(n.pinned?'unpin':'pin'),'pin')}${small('history',t('history'),'↺')}${small('trash-note',t('moveTrash'),'trash')}</div></div>
 <input class="note-title-input" id="note-title" value="${esc(n.title)}" maxlength="300" placeholder="${t('newTitle')}" aria-label="${t('title')}" ${blocked?'disabled':''}>
 <input class="tags-input" id="note-tags" value="${esc(n.tags.join(', '))}" placeholder="${t('tags')}" aria-label="${t('tags')}" maxlength="2000" ${blocked?'disabled':''}>
 <div class="note-meta">${t('edited')} ${date(n.updatedAt)} · ${n.text.length.toLocaleString()} chars</div>
 <div class="format-toolbar">${['H2','B','•','code'].map(f=>button('format',f,'',`data-format="${f}"`)).join('')}${button('insert-link',t('link'),'link')}${small('upload',t('image'),'image','data-context="note"')}</div>
 <div class="editor-body mode-${editorMode}"><textarea id="note-body" spellcheck="false" aria-label="${t('body')}" maxlength="${LIMITS.text}" placeholder="${t('noteHelp')}" ${blocked?'disabled':''}>${esc(n.text)}</textarea><article class="markdown-preview" id="note-preview">${markdown(n.text,ws)}</article></div>
 <div class="note-context"><div><h3>${t('backlinks')} <span>${backlinks(ws,n.id).length}</span></h3>${backlinks(ws,n.id).map(b=>button('open-note',b.title,'notes',`data-id="${esc(b.id)}"`)).join('')||`<p>${t('noBacklinks')}</p>`}</div><div><h3>${t('locations')}</h3>${ws.boards.filter(b=>b.nodes.some(p=>p.noteId===n.id)).map(b=>button('select-board',b.title,'board',`data-id="${esc(b.id)}"`)).join('')||'<p>—</p>'}</div></div></section>`;
}
function bindEditor(){
 const title=$('#note-title'),body=$('#note-body'),tags=$('#note-tags');
 if(!body)return;
 title.addEventListener('input',()=>{if(blocked)return;ensureEditSession();const n=currentNote();n.title=title.value;n.updatedAt=Date.now();changedState();refreshNoteViews(n);});
 tags.addEventListener('input',()=>{if(blocked)return;ensureEditSession();const n=currentNote();n.tags=tags.value.split(/[,，]/).map(t=>t.trim().slice(0,80)).filter(Boolean).slice(0,30);n.updatedAt=Date.now();changedState();});
 body.addEventListener('input',()=>{if(blocked)return;ensureEditSession();const n=currentNote();n.text=body.value;n.updatedAt=Date.now();changedState();clearTimeout(searchTimer);searchTimer=setTimeout(()=>{if($('#note-preview'))$('#note-preview').innerHTML=markdown(n.text,ws);refreshNoteViews(n);},160);});
}
function refreshNoteViews(n){if($('#note-list'))$('#note-list').innerHTML=noteList();for(const el of document.querySelectorAll('.canvas-card[data-note-id]'))if(el.dataset.noteId===n.id){const title=el.querySelector('.card-title'),text=el.querySelector('.card-excerpt');if(title)title.textContent=n.title;if(text)text.textContent=plain(n.text,240);}}
function renderBoard(){
 const b=currentBoard();return `<div class="canvas-area"><div class="canvas-toolbar"><div class="tool-group">${small('new-note',t('newNote'),'plus')}${small('add-sticky',t('sticky'),'▣')}${small('add-frame',t('frame'),'▱')}${small('upload',t('image'),'image','data-context="board"')}${button('connect-mode',t('connect'),'link',`aria-pressed="${tool==='connect'}"`,tool==='connect'?'active':'')}</div><div class="tool-group">${small('undo',t('undo'),'undo',undo.length?'':'disabled')}${small('redo',t('redo'),'redo',redo.length?'':'disabled')}${small('export-svg',t('exportBoard'),'download')}${small('delete-board',t('deleteBoard'),'trash')}</div></div>
 <div class="canvas" id="canvas" tabindex="0" aria-label="${t('board')}" role="region"><div class="canvas-world" id="canvas-world"><svg class="connectors" id="connectors" aria-label="Connectors"><defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor"/></marker></defs>${edgesSVG(b)}</svg>${b.nodes.filter(n=>n.kind==='frame').map(nodeHTML).join('')}${b.nodes.filter(n=>n.kind!=='frame').map(nodeHTML).join('')}</div><div id="marquee" class="marquee" hidden></div></div>
 <div class="canvas-bottom"><span class="canvas-hint">${tool==='connect'?t('connectHint'):selected.size?`${selected.size} ${t('selected')}`:'ObsessiveArt · '+t('local')}</span><div class="zoom-controls">${small('zoom-out',t('zoomOut'),'−')}<button data-action="reset-zoom" id="zoom-value">${Math.round(b.camera.z*100)}%</button>${small('zoom-in',t('zoomIn'),'plus')}${small('fit',t('fit'),'fit')}</div></div>${selected.size?`<div class="selection-toolbar">${small('open-selected',t('open'),'arrow')}${COLORS.map(c=>`<button class="swatch ${c}" data-action="node-color" data-color="${c}" title="${t('color')}: ${c}" aria-label="${t('color')}: ${c}"></button>`).join('')}${small('remove-selected',t('remove'),'trash')}${small('clear-selection',t('clear'),'close')}</div>`:''}</div>`;
}
function nodeHTML(p){
 const n=p.kind==='note'?ws.notes.find(n=>n.id===p.noteId):null;
 const a=p.kind==='image'?ws.attachments.find(a=>a.id===p.assetId):null;
 const removed=n?.deletedAt;
 return `<div class="canvas-card kind-${p.kind} ${p.color} ${selected.has(p.id)?'selected':''} ${removed?'trashed':''}" data-node-id="${esc(p.id)}" ${n?`data-note-id="${esc(n.id)}"`:''} style="left:${p.x}px;top:${p.y}px;width:${p.w}px;height:${p.h}px" tabindex="0" role="group" aria-label="${esc(n?.title||p.text||a?.name||p.kind)}"><div class="card-dragbar"><span>${p.kind==='note'?t('notes'):p.kind==='sticky'?t('sticky'):p.kind==='frame'?t('frame'):'ATTACHMENT'}</span><button data-action="open-node" data-id="${esc(p.id)}" aria-label="${t('open')}">↗</button></div>${p.kind==='note'?`<div class="card-title">${esc(n?.title||'Missing note')}</div><div class="card-excerpt">${removed?t('trash'):esc(plain(n?.text||'',240))}</div><div class="card-tags">${n?.tags.slice(0,3).map(t=>`<span>${esc(t)}</span>`).join('')||''}</div>`:p.kind==='image'?`${a?.type.startsWith('image/')?`<img src="${esc(a.data)}" alt="${esc(a.name)}" draggable="false">`:`<div class="pdf-card">PDF<small>${esc(a?.name||'')}</small></div>`}`:`<div class="object-text">${esc(p.text)}</div>`}<span class="resize-handle" aria-hidden="true"></span></div>`;
}
function edgePath(b,e){const a=b.nodes.find(n=>n.id===e.from),z=b.nodes.find(n=>n.id===e.to);if(!a||!z)return null;const dx=z.x-a.x;let x1=a.x+(dx>=0?a.w:0),y1=a.y+a.h/2,x2=z.x+(dx>=0?0:z.w),y2=z.y+z.h/2;const bend=Math.max(60,Math.abs(x2-x1)*.45)*(dx>=0?1:-1);return {d:`M ${x1} ${y1} C ${x1+bend} ${y1}, ${x2-bend} ${y2}, ${x2} ${y2}`,x:(x1+x2)/2,y:(y1+y2)/2-10};}
function edgesSVG(b){return b.edges.map(e=>{const p=edgePath(b,e);return p?`<g class="edge" data-edge-id="${esc(e.id)}"><path class="edge-hit" d="${p.d}"/><path class="edge-line" d="${p.d}" marker-end="url(#arrow)"/><text x="${p.x}" y="${p.y}" text-anchor="middle">${esc(e.label)}</text></g>`:'';}).join('');}
function renderGraph(){
 const data=graphData(ws,graphQuery);let notes=data.notes;
 if(graphFocus){const near=new Set([graphFocus]);for(const e of data.edges)if(e.from===graphFocus||e.to===graphFocus){near.add(e.from);near.add(e.to);}notes=notes.filter(n=>near.has(n.id));}
 notes=notes.slice(0,200);const ids=new Set(notes.map(n=>n.id)),edges=data.edges.filter(e=>ids.has(e.from)&&ids.has(e.to)),layout=graphLayout(notes,edges),map=new Map(layout.map(n=>[n.id,n]));
 const minX=Math.min(0,...layout.map(n=>n.x-130)),minY=Math.min(0,...layout.map(n=>n.y-100)),maxX=Math.max(1100,...layout.map(n=>n.x+130)),maxY=Math.max(720,...layout.map(n=>n.y+100));
 return `<div class="graph-area"><div class="graph-toolbar"><label class="searchbox">${icon('search')}<input id="graph-search" aria-label="${t('graphFilter')}" placeholder="${t('graphFilter')}" value="${esc(graphQuery)}"></label><span>${notes.length} / ${data.notes.length} ${t('noteCount')} · ${edges.length} ${t('edgeCount')}</span>${button('toggle-graph-focus',graphFocus?t('allGraph'):t('focus'),'graph',graphFocus?'aria-pressed="true"':'')}</div><svg class="knowledge-graph" viewBox="${minX} ${minY} ${maxX-minX} ${maxY-minY}" role="img" aria-label="${t('graph')}"><defs><radialGradient id="graph-glow"><stop offset="0%" stop-color="#a397e8" stop-opacity=".12"/><stop offset="100%" stop-color="#a397e8" stop-opacity="0"/></radialGradient></defs><ellipse cx="550" cy="360" rx="460" ry="320" fill="url(#graph-glow)"/>${edges.map(e=>{const a=map.get(e.from),b=map.get(e.to);return `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" class="graph-edge"/>`;}).join('')}${notes.map(n=>{const p=map.get(n.id),degree=edges.filter(e=>e.from===n.id||e.to===n.id).length;return `<g class="graph-node ${n.color} ${n.id===noteId?'active':''}" data-action="open-note" data-id="${esc(n.id)}" tabindex="0" role="button" aria-label="${esc(n.title)}" transform="translate(${p.x} ${p.y})"><circle class="node-halo" r="${32+degree*2}"/><circle r="${15+degree*1.5}"/><text y="${48+degree}" text-anchor="middle">${esc(n.title.length>26?n.title.slice(0,26)+'…':n.title)}</text><title>${esc(n.title)}</title></g>`;}).join('')}</svg>${!notes.length?`<div class="graph-empty">${t('nothing')}</div>`:''}<div class="graph-legend"><span class="note-dot violet"></span> ${t('notes')} <span class="line-sample"></span> [[links]] <small>≤ 200 ${t('noteCount')} / view</small></div></div>`;
}

function dialog(title,html,submitLabel=null,onSubmit=null){
 if(modal.open)modal.close();modal.innerHTML=`<form method="dialog"><header><h2 id="dialog-title">${esc(title)}</h2>${small('close-modal',t('close'),'close')}</header><div class="dialog-content">${html}</div><footer>${button('close-modal',t('cancel'))}${submitLabel?`<button type="submit" class="primary">${esc(submitLabel)}</button>`:''}</footer></form>`;
 modal.querySelector('form').onsubmit=async e=>{e.preventDefault();const form=e.currentTarget;try{await onSubmit?.(new FormData(form));}catch(error){notice(error.message,true);}};
 modal.showModal();setTimeout(()=>modal.querySelector('input,textarea,button')?.focus(),0);
}
function ask(title,value,apply,{text=false,description='',max=200}={}){
 dialog(title,`${description?`<p>${esc(description)}</p>`:''}<label>${esc(title)}${text?`<textarea name="value" maxlength="${max}" required>${esc(value)}</textarea>`:`<input name="value" value="${esc(value)}" maxlength="${max}" required>`}</label>`,t('save'),f=>{const v=String(f.get('value')).trim();if(!v)return;modal.close();apply(v);});
}
function confirm(title,description,apply){dialog(title,`<p>${esc(description)}</p>`,t('confirm'),()=>{modal.close();apply();});}
function openNote(id){const n=ws.notes.find(n=>n.id===id&&!n.deletedAt);if(!n){notice(t('trash'));return;}endEditing();noteId=id;if(view!=='notes')panel=true;sidebar=false;render();}
function addNote(){
 if(ws.notes.length>=LIMITS.notes){notice('Note limit reached.',true);return;}
 endEditing();mutate(()=>{const n=createNote(t('newTitle'));ws.notes.push(n);noteId=n.id;if(view==='board'){const b=currentBoard(),c=centerPoint();const p=placeNote(b,n.id,c.x-140,c.y-100);selected=new Set([p.id]);panel=true;}else{view='notes';panel=false;}});$('#note-title')?.focus();$('#note-title')?.select();
}
function centerPoint(){const el=$('#canvas');const c=currentBoard().camera;return{x:((el?.clientWidth||900)/2-c.x)/c.z,y:((el?.clientHeight||600)/2-c.y)/c.z};}
function chooseNote(insert=false){
 const notes=activeNotes().filter(n=>!insert||n.id!==noteId);
 dialog(insert?t('link'):t('chooseNote'),`<label class="searchbox">${icon('search')}<input id="picker-search" placeholder="${t('search')}" aria-label="${t('search')}"></label><div class="picker-list">${notes.map(n=>button(insert?'pick-link':'pick-note',n.title,'notes',`data-id="${esc(n.id)}"`)).join('')||t('linkEmpty')}</div>`);
 $('#picker-search')?.addEventListener('input',e=>{const q=e.target.value.toLocaleLowerCase();for(const b of modal.querySelectorAll('.picker-list button'))b.hidden=!b.textContent.toLocaleLowerCase().includes(q);});
}
function insertText(before,after=''){
 const el=$('#note-body');if(!el)return;if(blocked){notice(t('readOnly'),true);return;}ensureEditSession();
 const start=el.selectionStart,end=el.selectionEnd,selectedText=el.value.slice(start,end),next=el.value.slice(0,start)+before+selectedText+after+el.value.slice(end);
 if(next.length>LIMITS.text){notice('Note text limit reached.',true);return;}
 el.value=next;el.focus();el.setSelectionRange(start+before.length,start+before.length+selectedText.length);el.dispatchEvent(new Event('input',{bubbles:true}));
}
function showSettings(){
 dialog(t('dataTitle'),`<p>${t('dataSubtitle')}</p><div class="callout">${t('warning')}</div>
 <div class="settings-section"><h3>${t('export')}</h3><p>${t('backupText')}</p>${button('export-backup',t('export'),'download','','primary')}${button('export-markdown',t('markdown'),'download')}<p class="muted">${t('mdText')}</p></div>
 <div class="settings-section"><h3>${t('import')}</h3>${button('import-md',t('importMD'),'plus')}${button('restore-backup',t('restoreBackup'),'↺')}${button('recovery-export',t('recover'),'download')}</div>
 <div class="settings-section"><h3>${t('attachmentList')} (${ws.attachments.length})</h3><div class="attachment-list">${ws.attachments.map(a=>button('open-asset',`${a.name} · ${(a.size/1024).toFixed(0)} KB`,'image',`data-id="${esc(a.id)}"`)).join('')||'—'}</div></div>
 <div class="settings-section"><h3>${t('storage')}</h3><p id="storage-info">…</p>${button('persist',t('persist'))}<p class="muted">${t('persistText')}</p></div>
 <div class="settings-section settings-inline"><div><h3>${t('theme')}</h3>${button('theme',t(ws.settings.theme==='light'?'dark':'light'),'◐')}</div><div><h3>${t('language')}</h3>${button('language',ws.settings.language==='zh'?'English':'繁體中文','文')}</div></div>
 <div class="callout subtle">${t('limits')}</div>`);
 navigator.storage?.estimate?.().then(async info=>{const el=$('#storage-info');if(el)el.textContent=`${((info.usage||0)/1024/1024).toFixed(1)} MiB / ${((info.quota||0)/1024/1024).toFixed(0)} MiB · persistent: ${await navigator.storage.persisted()}`;}).catch(()=>{if($('#storage-info'))$('#storage-info').textContent='Unavailable';});
}
function showHistory(){const n=currentNote();if(!n)return;dialog(t('history'),`<p>${t('historyHint')}</p><div class="history-list">${n.history.map((h,i)=>`<section><div><strong>${esc(h.title)}</strong><small>${date(h.at)} · ${h.text.length} chars</small></div>${button('restore-history',t('restore'),'↺',`data-index="${i}"`)}<details><summary>${t('preview')}</summary><pre>${esc(h.text)}</pre></details></section>`).join('')||t('noHistory')}</div>`);}
function showTrash(){dialog(t('trash'),`<p>${t('trashHint')}</p><div class="trash-list">${ws.notes.filter(n=>n.deletedAt).map(n=>`<section><div><strong>${esc(n.title)}</strong><small>${date(n.deletedAt)}</small></div>${button('restore-note',t('restore'),'↺',`data-id="${esc(n.id)}"`)}${small('purge-note',t('delete'),'trash',`data-id="${esc(n.id)}"`)}</section>`).join('')||t('empty')}</div>`);}
function showHelp(){const zh=ws.settings.language==='zh';dialog(t('help'),`<div class="help-intro"><div class="brand-symbol">O<span>A</span></div><div><h3>ObsessiveArt</h3><p>Write. Arrange. Connect.</p></div></div>${zh?`<p><strong>筆記</strong>：點左側筆記即可編輯。使用 [[筆記標題]]，或「插入筆記連結」建立不怕改名的 ID 連結。</p><p><strong>白板</strong>：用「加入現有筆記」重用內容。拖動卡片，右下角調整大小，Shift＋點擊多選；Shift＋拖動空白處框選。區段框移動時會帶著完全位於框內的卡片。</p><p><strong>圖譜</strong>：由筆記內連結產生。點節點開啟筆記。搜尋主題縮小範圍，每次最多顯示 200 張筆記。</p><p><strong>保存</strong>：只在顯示「本機已儲存」後完成 IndexedDB 交易。關閉瀏覽器再開仍保留；不同裝置不會同步。每次開始整理前／後都建議下載完整 JSON 備份。</p>`:`<p><strong>Notes:</strong> choose a note to edit. Use [[Note title]] or Insert note link for stable ID links that survive renaming.</p><p><strong>Canvas:</strong> reuse notes with Place existing note. Drag cards; resize from the bottom-right. Shift-click to multi-select; Shift-drag empty space to box-select. Moving a frame also moves fully enclosed cards.</p><p><strong>Graph:</strong> generated from links inside notes. Click a node to open it. Search narrows the view; maximum 200 notes per view.</p><p><strong>Storage:</strong> “Saved on this device” appears only after the IndexedDB transaction completes. Data survives reopening but does not sync between devices. Download full JSON backups regularly.</p>`}<h3>${t('shortcut')}</h3><table><tr><td>⌘ / Ctrl + S</td><td>${t('save')}</td></tr><tr><td>⌘ / Ctrl + K</td><td>${t('search')}</td></tr><tr><td>⌘ / Ctrl + Shift + N</td><td>${t('newNote')}</td></tr><tr><td>⌘ / Ctrl + Z</td><td>${t('undo')} (${zh?'文字編輯使用原生撤銷':'native text undo while editing'})</td></tr><tr><td>Delete / Backspace</td><td>${t('remove')}</td></tr><tr><td>Esc</td><td>${t('clear')}</td></tr></table><div class="callout">${t('limits')}</div>`);}
function openNode(id){const p=currentBoard().nodes.find(n=>n.id===id);if(!p)return;if(p.kind==='note')openNote(p.noteId);else if(p.kind==='image')openAsset(p.assetId);else ask(t('editObject'),p.text,v=>mutate(()=>{p.text=v;}),{text:true,max:10000});}
function openAsset(id){const a=ws.attachments.find(a=>a.id===id);if(!a)return;const binary=atob(a.data.split(',')[1]),blob=new Blob([Uint8Array.from(binary,c=>c.charCodeAt(0))],{type:a.type});download(filename(a.name),blob,a.type);}
function selectionToolbar(){
 document.querySelector('.selection-toolbar')?.remove();
 for(const el of document.querySelectorAll('[data-node-id]'))el.classList.toggle('selected',selected.has(el.dataset.nodeId));
 const area=$('.canvas-area');if(!area||!selected.size)return;
 const el=document.createElement('div');el.className='selection-toolbar';el.innerHTML=`${small('open-selected',t('open'),'arrow')}${COLORS.map(c=>`<button class="swatch ${c}" data-action="node-color" data-color="${c}" title="${t('color')}: ${c}" aria-label="${t('color')}: ${c}"></button>`).join('')}${small('remove-selected',t('remove'),'trash')}${small('clear-selection',t('clear'),'close')}`;area.append(el);
}
function paintCamera(){const c=currentBoard().camera,el=$('#canvas'),world=$('#canvas-world');if(!el||!world)return;world.style.transform=`translate(${c.x}px,${c.y}px) scale(${c.z})`;el.style.backgroundSize=`${24*c.z}px ${24*c.z}px`;el.style.backgroundPosition=`${c.x}px ${c.y}px`;if($('#zoom-value'))$('#zoom-value').textContent=`${Math.round(c.z*100)}%`;}
function zoom(factor,x,y){if(blocked)return;const b=currentBoard(),el=$('#canvas');if(!el)return;const c=b.camera,z=clamp(c.z*factor,.15,3);x=x??el.clientWidth/2;y=y??el.clientHeight/2;c.x=x-(x-c.x)*z/c.z;c.y=y-(y-c.y)*z/c.z;c.z=z;paintCamera();changedState();}
function fit(){const b=currentBoard(),el=$('#canvas');if(!el||!b.nodes.length)return;const minX=Math.min(...b.nodes.map(n=>n.x)),minY=Math.min(...b.nodes.map(n=>n.y)),maxX=Math.max(...b.nodes.map(n=>n.x+n.w)),maxY=Math.max(...b.nodes.map(n=>n.y+n.h));const z=clamp(Math.min((el.clientWidth-100)/(maxX-minX),(el.clientHeight-100)/(maxY-minY)),.15,1.4);mutate(()=>b.camera={x:(el.clientWidth-(maxX-minX)*z)/2-minX*z,y:(el.clientHeight-(maxY-minY)*z)/2-minY*z,z},{history:false,renderUI:false});paintCamera();}
function connectTo(id){
 if(!connectFrom){connectFrom=id;selected=new Set([id]);selectionToolbar();notice(t('connectHint'));return;}
 if(connectFrom===id)return;const from=connectFrom,b=currentBoard();tool='select';connectFrom=null;
 ask(t('label'),'',label=>mutate(()=>b.edges.push({id:uid(),from,to:id,label})),{max:150});
 /* Allow an unlabeled connector without requiring a label. */
 const input=modal.querySelector('input');input.required=false;
 modal.querySelector('form').onsubmit=e=>{e.preventDefault();const label=input.value.trim().slice(0,150);modal.close();mutate(()=>b.edges.push({id:uid(),from,to:id,label}));};
}
function bindBoard(){
 const el=$('#canvas'),b=currentBoard();paintCamera();let drag=null,pointers=new Map();
 const local=e=>{const r=el.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top};};
 el.addEventListener('wheel',e=>{e.preventDefault();if(blocked)return;const p=local(e);if(e.ctrlKey||e.metaKey)zoom(Math.exp(-e.deltaY*.006),p.x,p.y);else{b.camera.x=clamp(b.camera.x-e.deltaX,-1e7,1e7);b.camera.y=clamp(b.camera.y-e.deltaY,-1e7,1e7);paintCamera();changedState();}},{passive:false});
 el.addEventListener('pointerdown',e=>{
  if(blocked||e.button>1||e.target.closest('button')||e.target.closest('[data-edge-id]'))return;
  const p=local(e);pointers.set(e.pointerId,p);(e.target.closest('[data-node-id]')||el).setPointerCapture(e.pointerId);
  if(pointers.size===2){
    if(drag?.originalNodes)for(const original of drag.originalNodes){const n=b.nodes.find(n=>n.id===original.id);if(n)Object.assign(n,original);}
    const [a,c]=[...pointers.values()];drag={mode:'pinch',distance:Math.max(1,Math.hypot(a.x-c.x,a.y-c.y)),mid:{x:(a.x+c.x)/2,y:(a.y+c.y)/2},camera:copy(b.camera),moved:false};return;
  }
  const card=e.target.closest('[data-node-id]');
  if(card){const id=card.dataset.nodeId;if(tool==='connect'){connectTo(id);pointers.clear();return;}
    if(e.shiftKey){selected.has(id)?selected.delete(id):selected.add(id);}else if(!selected.has(id))selected=new Set([id]);
    selectionToolbar();const ids=new Set(selected);const node=b.nodes.find(n=>n.id===id);
    if(node.kind==='frame')for(const n of b.nodes)if(n.id!==id&&n.x>=node.x&&n.y>=node.y&&n.x+n.w<=node.x+node.w&&n.y+n.h<=node.y+node.h)ids.add(n.id);
    drag={mode:e.target.closest('.resize-handle')?'resize':'nodes',start:p,originalNodes:b.nodes.filter(n=>ids.has(n.id)).map(copy),nodeId:id,before:copy(ws),moved:false};
  }else if(e.shiftKey){drag={mode:'marquee',start:p,base:new Set(selected),moved:false};$('#marquee').hidden=false;}
  else{selected.clear();selectionToolbar();drag={mode:'pan',start:p,camera:copy(b.camera),moved:false};}
  el.classList.add('dragging');
 });
 el.addEventListener('pointermove',e=>{
  if(!drag||!pointers.has(e.pointerId))return;const p=local(e);pointers.set(e.pointerId,p);
  if(drag.mode==='pinch'&&pointers.size>=2){const[a,c]=[...pointers.values()],distance=Math.max(1,Math.hypot(a.x-c.x,a.y-c.y)),mid={x:(a.x+c.x)/2,y:(a.y+c.y)/2},z=clamp(drag.camera.z*distance/drag.distance,.15,3);b.camera={x:mid.x-(drag.mid.x-drag.camera.x)*z/drag.camera.z,y:mid.y-(drag.mid.y-drag.camera.y)*z/drag.camera.z,z};drag.moved=true;paintCamera();return;}
  if(drag.mode==='pinch')return;
  const dx=p.x-drag.start.x,dy=p.y-drag.start.y;if(Math.abs(dx)+Math.abs(dy)>3)drag.moved=true;
  if(drag.mode==='pan'){b.camera.x=clamp(drag.camera.x+dx,-1e7,1e7);b.camera.y=clamp(drag.camera.y+dy,-1e7,1e7);paintCamera();}
  else if(drag.mode==='marquee'){const box=$('#marquee'),x=Math.min(p.x,drag.start.x),y=Math.min(p.y,drag.start.y),w=Math.abs(dx),h=Math.abs(dy);Object.assign(box.style,{left:`${x}px`,top:`${y}px`,width:`${w}px`,height:`${h}px`});selected=new Set(drag.base);for(const n of b.nodes){const nx=n.x*b.camera.z+b.camera.x,ny=n.y*b.camera.z+b.camera.y;if(nx>=x&&ny>=y&&nx+n.w*b.camera.z<=x+w&&ny+n.h*b.camera.z<=y+h)selected.add(n.id);}selectionToolbar();}
  else for(const original of drag.originalNodes){const n=b.nodes.find(n=>n.id===original.id),dom=el.querySelector(`[data-node-id="${n.id}"]`);if(drag.mode==='resize'){if(n.id!==drag.nodeId)continue;n.w=clamp(original.w+dx/b.camera.z,100,4000);n.h=clamp(original.h+dy/b.camera.z,70,4000);}else{n.x=clamp(original.x+dx/b.camera.z,-1e7,1e7);n.y=clamp(original.y+dy/b.camera.z,-1e7,1e7);}Object.assign(dom.style,{left:`${n.x}px`,top:`${n.y}px`,width:`${n.w}px`,height:`${n.h}px`});}
  if(drag.mode==='resize'||drag.mode==='nodes')$('#connectors').innerHTML=$('#connectors').querySelector('defs').outerHTML+edgesSVG(b);
 });
 const finish=e=>{pointers.delete(e.pointerId);if(!drag)return;if(drag.mode==='pinch'&&pointers.size){return;}const was=drag;drag=null;el.classList.remove('dragging');$('#marquee').hidden=true;
  if(was.moved&&was.mode!=='marquee'){if(was.before){undo.push(was.before);undo=undo.slice(-15);redo=[];}changedState();render();}
  else selectionToolbar();
 };
 el.addEventListener('pointerup',finish);
 el.addEventListener('pointercancel',e=>{pointers.clear();if(drag?.before){ws=drag.before;}else if(drag?.camera){b.camera=drag.camera;}drag=null;render();});
 el.addEventListener('dblclick',e=>{const edge=e.target.closest('[data-edge-id]'),node=e.target.closest('[data-node-id]');if(edge){confirm(t('removeConnector'),t('removeConnector'),()=>mutate(()=>b.edges=b.edges.filter(v=>v.id!==edge.dataset.edgeId)));}else if(node)openNode(node.dataset.nodeId);});
}
function pickFiles(mode,context='board'){
 const input=$('#file-input');input.value='';input.accept=mode==='restore'?'.json':mode==='md'?'.md,.markdown,.txt':'.png,.jpg,.jpeg,.gif,.webp,.pdf';input.multiple=mode!=='restore';
 const captured={board:boardId,note:noteId,context};
 input.onchange=async()=>{const files=[...input.files];if(!files.length)return;try{if(mode==='restore')await restoreFile(files[0]);else if(mode==='md')await importMarkdown(files);else await importAssets(files,captured);}catch(e){notice(e.message,true);}};input.click();
}
async function restoreFile(file){
 if(file.size>LIMITS.backupBytes)throw new Error('Backup exceeds 40 MiB.');const incoming=parseBackup(await file.text());
 dialog(t('restoreBackup'),`<p>${t('restoreWarn')}</p><div class="import-summary"><strong>${esc(incoming.name)}</strong><p>${incoming.notes.length} ${t('noteCount')} · ${incoming.boards.length} ${t('boardCount')} · ${incoming.attachments.length} attachments</p></div>${button('export-backup',t('export'),'download','','primary')}<label class="checkbox"><input type="checkbox" name="verified" required>${ws.settings.language==='zh'?'我已下載並確認目前資料的備份。':'I downloaded and verified a backup of my current workspace.'}</label>`,t('restore'),()=>{if(blocked)throw new Error(t('readOnly'));modal.close();pushUndo();ws=incoming;boardId=ws.boards[0].id;noteId=activeNotes()[0]?.id;panel=false;selected.clear();view='board';endEditing();changedState();render();notice(t('done'));});
}
async function importMarkdown(files){
 if(files.length>500)throw new Error('Import at most 500 files at once.');
 const results=[],paths=new Set();
 for(const f of files){
  if(!/\.(md|markdown|txt)$/i.test(f.name))throw new Error('Only Markdown or text files.');
  if(f.size>1024*1024)throw new Error(`${f.name}: file exceeds 1 MiB.`);
  const text=await f.text();if(text.length>LIMITS.text)throw new Error(`${f.name}: note exceeds 250,000 characters.`);
  const path=(f.webkitRelativePath||f.name).slice(0,500);if(paths.has(path))throw new Error('Duplicate paths in the selected files.');paths.add(path);
  const existing=ws.notes.find(n=>n.path===path),title=f.name.replace(/\.(md|markdown|txt)$/i,'');
  results.push({path,text,title,status:existing?(existing.text===text?'same':'conflict'):'new'});
 }
 const add=results.filter(r=>r.status!=='same');
 if(ws.notes.length+add.length>LIMITS.notes)throw new Error('Note limit reached.');
 dialog(t('importMD'),`<p>${ws.settings.language==='zh'?'同路徑且內容相同的筆記會跳過。已變更的同路徑檔案會建立副本，不覆蓋原文。標準 Markdown 語法保留；外掛與 ZIP 匯入不支援。':'Identical files at the same path are skipped. Changed files become separate copies, never overwrite existing notes. Markdown text is preserved; plugins and ZIP import are not supported.'}</p><div class="import-preview">${results.map(r=>`<div><span>${esc(r.path)}</span><b>${esc(r.status)}</b></div>`).join('')}</div>`,`${t('import')} (${add.length})`,()=>{
  const candidate=copy(ws);for(const r of add){const n=createNote(r.title+(r.status==='conflict'?' (import copy)':''),r.text);n.path=r.status==='conflict'?`copy-${n.id}/${r.path}`:r.path;candidate.notes.push(n);}validateWorkspace(candidate);serialize(candidate);
  modal.close();mutate(()=>{ws=candidate;view='notes';noteId=add.length?ws.notes.at(-1).id:noteId;panel=false;});notice(t('imported'));
 });
}
async function importAssets(files,captured){
 if(ws.attachments.length+files.length>LIMITS.attachments)throw new Error('Attachment limit reached.');
 const assets=[];
 for(const file of files){
  if(file.size>LIMITS.attachmentBytes)throw new Error(t('fileLimit'));
  const bytes=new Uint8Array(await file.arrayBuffer());let type='';
  const prefix=String.fromCharCode(...bytes.slice(0,12));
  if(bytes[0]===0x89&&prefix.slice(1,4)==='PNG')type='image/png';else if(bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff)type='image/jpeg';else if(prefix.startsWith('GIF87a')||prefix.startsWith('GIF89a'))type='image/gif';else if(prefix.startsWith('RIFF')&&prefix.slice(8)==='WEBP')type='image/webp';else if(prefix.startsWith('%PDF-'))type='application/pdf';
  if(!type)throw new Error(`${file.name}: ${t('fileLimit')}`);
  const data=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.readAsDataURL(new Blob([bytes],{type}));});
  assets.push({id:uid(),name:file.name.slice(0,300),size:bytes.length,type,data});
 }
 const candidate=copy(ws),targetBoard=candidate.boards.find(b=>b.id===captured.board),targetNote=candidate.notes.find(n=>n.id===captured.note&&!n.deletedAt);candidate.attachments.push(...assets);
 if(captured.context==='note'&&!targetNote)throw new Error('The destination note no longer exists.');
 if(captured.context==='board'&&!targetBoard)throw new Error('The destination canvas no longer exists.');
 const center=centerPoint();
 for(const [i,a] of assets.entries())if(captured.context==='board')targetBoard.nodes.push({id:uid(),kind:'image',assetId:a.id,x:center.x-150+i*30,y:center.y-120+i*30,w:300,h:240,color:'gray',text:''});else{remember(targetNote);targetNote.text+=`\n\n${a.type.startsWith('image/')?'!':''}[${a.name.replace(/[\[\]]/g,'')}](asset:${a.id})`;targetNote.updatedAt=Date.now();}
 serialize(candidate);mutate(()=>ws=candidate);notice(t('done'));
}
function exportSVG(){
 const b=currentBoard();if(!b.nodes.length)return;
 const minX=Math.min(...b.nodes.map(n=>n.x))-40,minY=Math.min(...b.nodes.map(n=>n.y))-40,maxX=Math.max(...b.nodes.map(n=>n.x+n.w))+40,maxY=Math.max(...b.nodes.map(n=>n.y+n.h))+40;
 const palette={violet:'#eeeafa',blue:'#eaf1fc',green:'#e9f4ef',amber:'#fcf3df',rose:'#faeaf0',gray:'#f0f1f4'};
 const wrap=(text,width,lines)=>{const out=[];let row='',size=0;for(const c of text){const u=c.charCodeAt(0)>255?2:1;if(size+u>width){out.push(row);row='';size=0;if(out.length>=lines)break;}row+=c;size+=u;}if(row&&out.length<lines)out.push(row);return out;};
 const text=(content,x,y,width,max,size=14)=>wrap(content,Math.max(8,width/(size*.55)),max).map((row,i)=>`<text x="${x}" y="${y+i*(size*1.55)}" font-size="${size}">${esc(row)}</text>`).join('');
 const nodes=[...b.nodes.filter(n=>n.kind==='frame'),...b.nodes.filter(n=>n.kind!=='frame')].map(p=>{const n=ws.notes.find(n=>n.id===p.noteId),a=ws.attachments.find(a=>a.id===p.assetId);return `<g><rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" rx="12" fill="${palette[p.color]}" fill-opacity="${p.kind==='frame'?'.35':'1'}" stroke="#b8b6c9"/>${p.kind==='image'&&a?.type.startsWith('image/')?`<image href="${esc(a.data)}" x="${p.x+12}" y="${p.y+12}" width="${p.w-24}" height="${p.h-24}" preserveAspectRatio="xMidYMid meet"/>`:p.kind==='note'?text(n?.title||'',p.x+20,p.y+35,p.w-40,2,18)+text(n?.deletedAt?t('trash'):plain(n?.text||'',1000),p.x+20,p.y+90,p.w-40,Math.max(1,Math.floor((p.h-115)/22))):text(p.kind==='image'?a?.name||'PDF':p.text,p.x+20,p.y+36,p.w-40,Math.max(1,Math.floor((p.h-50)/24)),16)}</g>`;}).join('');
 const edges=b.edges.map(e=>{const p=edgePath(b,e);return p?`<path d="${p.d}" fill="none" stroke="#8b86a2" stroke-width="2" marker-end="url(#export-arrow)"/><text x="${p.x}" y="${p.y}" text-anchor="middle" font-size="12">${esc(e.label)}</text>`:'';}).join('');
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${maxX-minX} ${maxY-minY}" width="${Math.ceil(maxX-minX)}" height="${Math.ceil(maxY-minY)}"><title>${esc(b.title)}</title><defs><marker id="export-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#8b86a2"/></marker></defs><rect x="${minX}" y="${minY}" width="${maxX-minX}" height="${maxY-minY}" fill="#fff"/><g font-family="system-ui, sans-serif" fill="#343044">${edges}${nodes}</g></svg>`;
 download(`${filename(b.title)}.svg`,svg,'image/svg+xml');
}
async function action(name,el){
 const id=el?.dataset.id;
 if(name.startsWith('view-')){endEditing();view=name.slice(5);panel=false;selected.clear();sidebar=false;render();return;}
 switch(name){
 case 'toggle-sidebar':sidebar=!sidebar;render();break;
 case 'select-board':endEditing();boardId=id;view='board';panel=false;sidebar=false;selected.clear();render();break;
 case 'open-note':openNote(id);break;
 case 'new-note':addNote();break;
 case 'new-board':if(ws.boards.length>=LIMITS.boards)throw new Error('Canvas limit reached.');ask(t('newBoard'),t('newBoardTitle'),value=>mutate(()=>{const b=createBoard(value);ws.boards.push(b);boardId=b.id;view='board';panel=false;selected.clear();}));break;
 case 'rename-board':ask(t('boardName'),currentBoard().title,value=>mutate(()=>currentBoard().title=value));break;
 case 'rename-workspace':ask(t('renameWorkspace'),ws.name,value=>mutate(()=>ws.name=value));break;
 case 'delete-board':if(ws.boards.length===1){notice(ws.settings.language==='zh'?'至少保留一塊白板。':'Keep at least one canvas.',true);break;}confirm(t('deleteBoard'),t('deleteBoardWarn'),()=>mutate(()=>{ws.boards=ws.boards.filter(b=>b.id!==boardId);boardId=ws.boards[0].id;selected.clear();}));break;
 case 'editor-mode':endEditing();editorMode=el.dataset.mode;render();break;
 case 'close-panel':endEditing();panel=false;render();break;
 case 'pin':mutate(()=>currentNote().pinned=!currentNote().pinned);break;
 case 'trash-note':confirm(t('moveTrash'),t('trashWarn'),()=>mutate(()=>{currentNote().deletedAt=Date.now();panel=false;endEditing();}));break;
 case 'trash':showTrash();break;
 case 'restore-note':mutate(()=>{ws.notes.find(n=>n.id===id).deletedAt=null;});showTrash();break;
 case 'purge-note':confirm(t('delete'),t('deleteWarn'),()=>{mutate(()=>purgeNote(ws,id));showTrash();});break;
 case 'history':showHistory();break;
 case 'restore-history':{const n=currentNote(),h=copy(n.history[Number(el.dataset.index)]);if(!h)break;modal.close();mutate(()=>{remember(n);n.title=h.title;n.text=h.text;n.updatedAt=Date.now();endEditing();});break;}
 case 'insert-link':chooseNote(true);break;
 case 'pick-link':{const n=resolveNote(ws.notes,id);modal.close();if(editorMode==='preview'){editorMode='edit';render();}insertText(`[[${n.id}|${n.title.replace(/[\]|\n]/g,'')}]]`);break;}
 case 'format':{if(editorMode==='preview'){editorMode='edit';render();}const f=el.dataset.format;if(f==='B')insertText('**','**');else if(f==='code')insertText('`','`');else insertText(f==='H2'?'\n## ':'\n- ');break;}
 case 'existing-note':chooseNote();break;
 case 'pick-note':modal.close();mutate(()=>{const c=centerPoint(),p=placeNote(currentBoard(),id,c.x-140,c.y-100);selected=new Set([p.id]);});break;
 case 'add-sticky':case 'add-frame':{const kind=name==='add-frame'?'frame':'sticky';ask(t(kind),t(kind==='frame'?'frameText':'stickyText'),text=>mutate(()=>{const c=centerPoint();const p={id:uid(),kind,text,x:c.x-(kind==='frame'?250:130),y:c.y-100,w:kind==='frame'?520:260,h:kind==='frame'?400:210,color:kind==='frame'?'blue':'amber'};currentBoard().nodes.push(p);selected=new Set([p.id]);}),{text:true,max:10000});break;}
 case 'connect-mode':tool=tool==='connect'?'select':'connect';connectFrom=null;selected.clear();render();break;
 case 'open-node':openNode(id);break;
 case 'open-selected':if(selected.size)openNode([...selected][0]);break;
 case 'remove-selected':mutate(()=>{for(const id of selected)removePlacement(currentBoard(),id);selected.clear();});break;
 case 'node-color':mutate(()=>{for(const n of currentBoard().nodes)if(selected.has(n.id))n.color=el.dataset.color;});break;
 case 'clear-selection':selected.clear();tool='select';connectFrom=null;render();break;
 case 'undo':if(undo.length&&!blocked){redo.push(copy(ws));ws=undo.pop();endEditing();selected.clear();changedState();render();}break;
 case 'redo':if(redo.length&&!blocked){undo.push(copy(ws));ws=redo.pop();endEditing();selected.clear();changedState();render();}break;
 case 'fit':fit();break;
 case 'zoom-in':zoom(1.2);break;
 case 'zoom-out':zoom(1/1.2);break;
 case 'reset-zoom':zoom(1/currentBoard().camera.z);break;
 case 'toggle-graph-focus':graphFocus=graphFocus?null:noteId;render();break;
 case 'settings':showSettings();break;
 case 'help':showHelp();break;
 case 'close-modal':modal.close();break;
 case 'export-backup':backup();break;
 case 'export-markdown':download('ObsessiveArt-Markdown.zip',makeZip(markdownFiles(ws)));break;
 case 'export-svg':exportSVG();break;
 case 'restore-backup':pickFiles('restore');break;
 case 'import-md':pickFiles('md');break;
 case 'upload':pickFiles('asset',el.dataset.context||'board');break;
 case 'open-asset':openAsset(id);break;
 case 'recovery-export':{const r=await readWorkspace(db,'recovery');if(!r)throw new Error('No previous saved state.');download('ObsessiveArt-previous.json',JSON.stringify(r.value,null,2));break;}
 case 'theme':mutate(()=>ws.settings.theme=ws.settings.theme==='light'?'dark':'light',{history:false});showSettings();break;
 case 'language':mutate(()=>ws.settings.language=ws.settings.language==='zh'?'en':'zh',{history:false});showSettings();break;
 case 'persist':notice(await navigator.storage?.persist?.()?'Persistent storage granted.':'Persistent storage not granted. Keep backups.');showSettings();break;
 case 'reload':if(changed!==saved)confirm(t('reload'),t('readOnly'),()=>location.reload());else location.reload();break;
 case 'download-raw':{const raw={active:rawRecord,recovery:db?await readWorkspace(db,'recovery'):null};download('ObsessiveArt-raw-recovery.json',JSON.stringify(raw,null,2));break;}
 }
}
document.addEventListener('click',e=>{const el=e.target.closest('[data-action]');if(!el||el.disabled)return;Promise.resolve(action(el.dataset.action,el)).catch(error=>notice(error.message,true));});
document.addEventListener('input',e=>{
 if(e.target.id==='search'){query=e.target.value;$('#note-list').innerHTML=noteList();}
 if(e.target.id==='graph-search'){graphQuery=e.target.value;clearTimeout(searchTimer);searchTimer=setTimeout(()=>{const start=e.target.selectionStart;render();const input=$('#graph-search');input?.focus();input?.setSelectionRange(start,start);},220);}
});
document.addEventListener('keydown',e=>{
 const editing=e.target.matches('input,textarea,[contenteditable="true"]');const cmd=e.ctrlKey||e.metaKey;
 if(!ws)return;
 if(cmd&&e.key.toLowerCase()==='s'){e.preventDefault();flush();return;}
 if(modal.open)return;
 if(cmd&&e.key.toLowerCase()==='k'){e.preventDefault();if(window.innerWidth<800){sidebar=true;render();}$('#search')?.focus();return;}
 if(cmd&&e.shiftKey&&e.key.toLowerCase()==='n'){e.preventDefault();addNote();return;}
 if(editing)return;
 if(cmd&&e.key.toLowerCase()==='z'){e.preventDefault();action(e.shiftKey?'redo':'undo');}
 else if(e.key==='Escape'){panel=false;selected.clear();tool='select';connectFrom=null;render();}
 else if((e.key==='Delete'||e.key==='Backspace')&&view==='board'&&selected.size){e.preventDefault();action('remove-selected');}
 else if(e.key==='Enter'){const el=e.target.closest('[data-action]');if(el&&!el.matches('button')){e.preventDefault();action(el.dataset.action,el);}else if(e.target.closest('[data-node-id]'))openNode(e.target.closest('[data-node-id]').dataset.nodeId);}
});
window.addEventListener('beforeunload',e=>{if(changed!==saved){e.preventDefault();e.returnValue='';}});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')flush();});
async function boot(){
 try{
  db=await openStore();rawRecord=await readWorkspace(db);
  if(!rawRecord){const initial=seedWorkspace();try{revision=await commitWorkspace(db,0,initial);ws=initial;}catch(e){if(!(e instanceof ConflictError))throw e;rawRecord=await readWorkspace(db);ws=validateWorkspace(rawRecord.value);revision=rawRecord.revision;}}
  else{ws=validateWorkspace(rawRecord.value);revision=rawRecord.revision;}
  boardId=ws.boards[0].id;noteId=activeNotes()[0]?.id;
  if('BroadcastChannel' in window){channel=new BroadcastChannel('obsessiveart-updates');channel.onmessage=async e=>{
   if(e.data.revision<=revision)return;
   if(changed!==saved||saving){blocked=true;status();notice(t('statusConflict'),true);return;}
   try{const record=await readWorkspace(db);if(record.revision>revision){ws=validateWorkspace(record.value);revision=record.revision;undo=[];redo=[];endEditing();render();}}catch(error){blocked=true;status();notice(error.message,true);}
  };}
  render();
  if('serviceWorker' in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('./sw.js').catch(error=>console.warn('Offline cache unavailable:',error.message));
 }catch(error){
  app.innerHTML=`<div class="boot error-screen"><h1>${t('recoveryTitle')}</h1><p>${t('recoveryText')}</p><pre>${esc(error.message)}</pre>${button('download-raw',t('downloadRaw'),'download','','primary')}<p>Use <code>npm start</code> and open <code>http://localhost:4173</code>. Do not open index.html directly.</p></div>`;
 }
}
boot();
