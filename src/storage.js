import { validateWorkspace } from './core.js';
const DB_NAME='obsessiveart-v1';
export class ConflictError extends Error { constructor(){super('Another tab has newer data. Export your unsaved work, then reload.');this.name='ConflictError';} }
export async function openStore() {
  return new Promise((resolve,reject)=>{
    const req=indexedDB.open(DB_NAME,1);
    req.onupgradeneeded=()=>req.result.createObjectStore('workspace');
    req.onerror=()=>reject(req.error);
    req.onblocked=()=>reject(new Error('Close other ObsessiveArt tabs to upgrade storage.'));
    req.onsuccess=()=>{const db=req.result;db.onversionchange=()=>db.close();resolve(db);};
  });
}
export function readWorkspace(db, key='active') {
  return new Promise((resolve,reject)=>{
    const tx=db.transaction('workspace','readonly'),req=tx.objectStore('workspace').get(key);
    let result;
    req.onsuccess=()=>result=req.result;
    tx.oncomplete=()=>resolve(result||null);
    tx.onerror=()=>reject(tx.error||req.error);
    tx.onabort=()=>reject(tx.error||new Error('Storage read aborted.'));
  });
}
/* Compare-and-swap inside the same transaction prevents silent cross-tab overwrites.
   A save is acknowledged ONLY after transaction.oncomplete. Keep the previous
   committed document as a recovery copy. No automatic reset on corruption. */
export function commitWorkspace(db, expectedRevision, workspace) {
  const value=validateWorkspace(workspace);
  return new Promise((resolve,reject)=>{
    let reason, next;
    let tx;
    try{tx=db.transaction('workspace','readwrite',{durability:'strict'});}catch{tx=db.transaction('workspace','readwrite');}
    const store=tx.objectStore('workspace'),get=store.get('active');
    get.onsuccess=()=>{
      const previous=get.result;
      if((previous?.revision||0)!==expectedRevision){reason=new ConflictError();tx.abort();return;}
      if(previous)store.put(previous,'recovery');
      next=expectedRevision+1;store.put({revision:next,savedAt:Date.now(),value},'active');
    };
    tx.oncomplete=()=>resolve(next);
    tx.onabort=()=>reject(reason||tx.error||new Error('Storage transaction aborted.'));
    tx.onerror=()=>{reason=reason||tx.error;};
  });
}
