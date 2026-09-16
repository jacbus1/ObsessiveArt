import { DatabaseSync, backup } from 'node:sqlite';
import { mkdirSync, existsSync, chmodSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
const source=resolve(process.env.DATA_DIR || './data','obsessart.sqlite');
const destination=resolve(process.argv[2] || `./backups/obsessart-${new Date().toISOString().replaceAll(':','-')}.sqlite`);
if(!existsSync(source))throw new Error('Source database does not exist');
if(existsSync(destination))throw new Error('Refusing to overwrite an existing backup');
mkdirSync(dirname(destination),{recursive:true,mode:0o700});
const db=new DatabaseSync(source,{readOnly:true});
try{await backup(db,destination);chmodSync(destination,0o600);console.log(`Consistent SQLite backup written: ${destination}`);}finally{db.close();}
