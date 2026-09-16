/** Browser drafts are recovery aids, not the canonical database or an independent backup. */
let database;
async function db() {
  if (!database) database = new Promise((resolve,reject) => {
    const request = indexedDB.open('obsessart-recovery',1);
    request.onupgradeneeded = () => request.result.createObjectStore('drafts');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Recovery storage is blocked by another tab'));
  });
  return database;
}
async function transaction(mode, perform) {
  const database = await db();
  return new Promise((resolve,reject) => {
    const tx = database.transaction('drafts',mode); const request = perform(tx.objectStore('drafts'));
    tx.oncomplete = () => resolve(request.result);
    tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error || new Error('Storage transaction aborted'));
  });
}
// A draft belongs to one tab. Two tabs must never erase or overwrite each other's recovery copy.
const tabId = sessionStorage.getItem('obsessart-tab') || crypto.randomUUID();
sessionStorage.setItem('obsessart-tab',tabId);
export const readDraft = () => transaction('readonly',store => store.get(tabId));
export const writeDraft = draft => transaction('readwrite',store => store.put(draft,tabId));
export const clearDraft = () => transaction('readwrite',store => store.delete(tabId));
export async function request(path, method = 'GET', value) {
  const response = await fetch(path,{method,credentials:'same-origin',headers:method === 'GET' ? {} : {'Content-Type':'application/json','X-ObsessArt-Request':'1'},body:value === undefined ? undefined : JSON.stringify(value)});
  const data = await response.json();
  if (!response.ok) { const error = new Error(data.error || 'Request failed'); error.status = response.status; throw error; }
  return data;
}
export function download(name, value, type = 'application/json') {
  const url = URL.createObjectURL(new Blob([value],{type})); const a = document.createElement('a');
  a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url),30000);
}
