/** Shared domain model. Content belongs to a note, never to its board placement. */
export const LIMITS = Object.freeze({ bytes: 2_000_000, notes: 1000, boards: 100, placements: 1000 });
export const COLORS = ['lavender', 'sage', 'peach', 'sky', 'sand'];
export class InputError extends Error { constructor(message) { super(message); this.status = 422; } }
const fail = (message) => { throw new InputError(message); };
const text = (v, max, field, empty = true) => {
  if (typeof v !== 'string' || v.length > max || (!empty && !v.trim())) fail(`Invalid ${field}`);
  return v;
};
const list = (v, max, field) => { if (!Array.isArray(v) || v.length > max) fail(`Invalid ${field}`); return v; };
const id = (v) => { if (typeof v !== 'string' || !/^[a-zA-Z0-9_-]{1,80}$/.test(v)) fail('Invalid identifier'); return v; };
const num = (v, min, max) => { if (!Number.isFinite(v) || v < min || v > max) fail('Invalid coordinate'); return v; };
const date = (v) => { if (typeof v !== 'string' || v.length > 30 || !Number.isFinite(Date.parse(v))) fail('Invalid date'); return v; };
const unique = (items) => { const set = new Set(items.map(x => x.id)); if (set.size !== items.length) fail('Duplicate identifier'); return set; };
export function safeUrl(value) {
  if (typeof value !== 'string' || /[\u0000-\u0020\u007f]/.test(value)) return null;
  try { const u = new URL(value); return ['https:', 'http:'].includes(u.protocol) && !u.username && !u.password ? u.href : null; } catch { return null; }
}
export function validateWorkspace(value) {
  if (!value || value.schemaVersion !== 1) fail('Unsupported workspace schema');
  const notes = list(value.notes, LIMITS.notes, 'notes').map(n => {
    if (!n || !COLORS.includes(n.color)) fail('Invalid note');
    const source = text(n.source, 2000, 'source');
    if (source && !safeUrl(source)) fail('Source must be an absolute HTTP(S) URL without credentials');
    return { id: id(n.id), title: text(n.title, 200, 'title', false), body: text(n.body, 100000, 'body'),
      tags: [...new Set(list(n.tags, 20, 'tags').map(t => text(t, 50, 'tag', false)))], color: n.color, source,
      createdAt: date(n.createdAt), updatedAt: date(n.updatedAt), deletedAt: n.deletedAt === null ? null : date(n.deletedAt) };
  });
  const noteIds = unique(notes);
  const boards = list(value.boards, LIMITS.boards, 'boards').map(b => {
    if (!b) fail('Invalid board');
    const placements = list(b.placements, LIMITS.placements, 'placements').map(p => {
      if (!p || !noteIds.has(p.noteId)) fail('Dangling note placement');
      return { id: id(p.id), noteId: id(p.noteId), x: num(p.x, -100000, 100000), y: num(p.y, -100000, 100000), width: num(p.width, 200, 800), height: num(p.height, 140, 1000) };
    });
    const placementIds = unique(placements);
    const edges = list(b.edges, 3000, 'edges').map(e => {
      if (!e || !placementIds.has(e.from) || !placementIds.has(e.to) || e.from === e.to) fail('Dangling or self connector');
      return { id: id(e.id), from: id(e.from), to: id(e.to), label: text(e.label, 200, 'connector label') };
    });
    unique(edges);
    return { id: id(b.id), title: text(b.title, 200, 'board title', false), placements, edges };
  });
  unique(boards);
  const result = { schemaVersion: 1, id: id(value.id), title: text(value.title, 200, 'workspace title', false), notes, boards };
  if (new TextEncoder().encode(JSON.stringify(result)).length > LIMITS.bytes) fail('Workspace exceeds the 2 MB beta limit');
  return result;
}
export function createNote(title = 'Untitled note') {
  const at = new Date().toISOString();
  return { id: crypto.randomUUID(), title, body: '', tags: [], color: 'lavender', source: '', createdAt: at, updatedAt: at, deletedAt: null };
}
export function placeNote(board, noteId, x = 80, y = 80) {
  const placement = { id: crypto.randomUUID(), noteId, x, y, width: 270, height: 230 };
  board.placements.push(placement); return placement;
}
export function removePlacement(board, placementId) {
  board.placements = board.placements.filter(p => p.id !== placementId);
  board.edges = board.edges.filter(e => e.from !== placementId && e.to !== placementId);
}
export function restoreNote(workspace, noteId) {
  const n = workspace.notes.find(n => n.id === noteId); if (n) n.deletedAt = null;
}
/** Stable [[id|label]] links are preferred; title links resolve only when unambiguous. */
export function resolveLink(workspace, target) {
  const active = workspace.notes.filter(n => !n.deletedAt);
  const match = active.find(n => n.id === target);
  if (match) return match;
  const titled = active.filter(n => n.title.toLocaleLowerCase() === target.toLocaleLowerCase());
  return titled.length === 1 ? titled[0] : null;
}
export function relations(workspace) {
  const result = []; const seen = new Set();
  for (const n of workspace.notes.filter(n => !n.deletedAt)) {
    // Inline and fenced code is literal text, not a semantic link.
    const prose = n.body.replace(/```[\s\S]*?(?:```|$)/g, '').replace(/`[^`\n]*`/g, '');
    for (const m of prose.matchAll(/\[\[([^\]|\n]+)(?:\|([^\]\n]+))?\]\]/g)) {
      const target = resolveLink(workspace, m[1]);
      const key = `${n.id}:${target?.id}`;
      if (target && target.id !== n.id && !seen.has(key)) { result.push({ from: n.id, to: target.id }); seen.add(key); }
    }
  }
  return result;
}
export function searchNotes(workspace, query = '', deleted = false) {
  const words = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  return workspace.notes.filter(n => Boolean(n.deletedAt) === deleted && words.every(w => `${n.title} ${n.body} ${n.tags.join(' ')}`.toLocaleLowerCase().includes(w)));
}
export function starterWorkspace() {
  const a = createNote('Start with a question'); a.tags = ['Getting started'];
  const b = createNote('Collect useful ideas'); b.color = 'sage'; b.tags = ['Research'];
  const c = createNote('Make the connection'); c.color = 'peach'; c.tags = ['Thinking'];
  const d = createNote('Build your own map'); d.color = 'sky'; d.tags = ['Practice'];
  a.body = `# What are you curious about?\n\nA good question gives your research a direction. Start small, then follow the connections.\n\n- Capture one question\n- Add what you already know\n- Leave room for a better answer\n\nNext: [[${b.id}|collect useful ideas]].`;
  b.body = `# Keep the idea, keep the source\n\nWrite in your own words. Add a source URL in the editor so you can return to the original.\n\n**One note, many contexts.** Add this same note to another board; edits appear everywhere.\n\nThen [[${c.id}|make the connection]].`;
  c.body = `# Think between the notes\n\nUse the Link note button to create stable connections. They appear in the graph and backlinks.\n\nBoard arrows are visual: they do not create knowledge links.\n\nTry [[${d.id}|building your own map]].`;
  d.body = `# A little structure. Room to think.\n\nDrag cards by their header. Use the corner to resize. Scroll to zoom, drag the empty canvas to pan.\n\nRemoving a card from a board does **not** delete the note.\n\nReturn to [[${a.id}|your question]] whenever you need a fresh perspective.`;
  const board = { id: crypto.randomUUID(), title: 'A place to think', placements: [], edges: [] };
  const positions = [[80, 85], [425, 40], [770, 100], [425, 360]];
  [a,b,c,d].forEach((n,i) => placeNote(board,n.id,...positions[i]));
  [[0,1],[1,2],[1,3]].forEach(([x,y]) => board.edges.push({ id: crypto.randomUUID(), from: board.placements[x].id, to: board.placements[y].id, label: '' }));
  return { schemaVersion: 1, id: crypto.randomUUID(), title: 'My workspace', notes: [a,b,c,d], boards: [board] };
}
