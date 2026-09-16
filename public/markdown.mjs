import { resolveLink, safeUrl } from './model.mjs';
export const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function inline(value, workspace) {
  const pattern = /`([^`]+)`|\[\[([^\]|\n]+)(?:\|([^\]\n]+))?\]\]|\[([^\]\n]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let html = ''; let end = 0;
  for (const m of value.matchAll(pattern)) {
    html += escapeHtml(value.slice(end,m.index));
    if (m[1] !== undefined) html += `<code>${escapeHtml(m[1])}</code>`;
    else if (m[2] !== undefined) {
      const n = resolveLink(workspace,m[2]);
      html += n ? `<button class="wikilink" data-note="${escapeHtml(n.id)}">${escapeHtml(m[3] || n.title)}</button>` : `<span class="unresolved" title="Unresolved or ambiguous link">${escapeHtml(m[3] || m[2])}</span>`;
    } else if (m[4] !== undefined) {
      const url = safeUrl(m[5]);
      html += url ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(m[4])}</a>` : escapeHtml(m[4]);
    } else if (m[6] !== undefined) html += `<strong>${escapeHtml(m[6])}</strong>`;
    else html += `<em>${escapeHtml(m[7])}</em>`;
    end = m.index + m[0].length;
  }
  return html + escapeHtml(value.slice(end));
}
/** Intentionally limited Markdown, with HTML, embeds, external images and scripts disabled. */
export function markdown(body, workspace) {
  let fenced = false; let code = []; const out = []; let paragraph = [];
  const flush = () => { if (paragraph.length) { out.push(`<p>${inline(paragraph.join('\n'),workspace).replaceAll('\n','<br>')}</p>`); paragraph = []; } };
  for (const line of body.split(/\r?\n/)) {
    if (/^```/.test(line)) { flush(); if (fenced) { out.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`); code = []; } fenced = !fenced; continue; }
    if (fenced) { code.push(line); continue; }
    if (!line.trim()) { flush(); continue; }
    const heading = line.match(/^(#{1,4})\s+(.+)/); const item = line.match(/^\s*[-*]\s+(.+)/);
    if (heading) { flush(); const h = heading[1].length; out.push(`<h${h}>${inline(heading[2],workspace)}</h${h}>`); }
    else if (item) { flush(); out.push(`<div class="md-item"><span aria-hidden="true">•</span>${inline(item[1],workspace)}</div>`); }
    else if (line.startsWith('> ')) { flush(); out.push(`<blockquote>${inline(line.slice(2),workspace)}</blockquote>`); }
    else paragraph.push(line);
  }
  flush(); if (code.length) out.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`);
  return out.join('');
}
