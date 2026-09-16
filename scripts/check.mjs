import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
for (const directory of ['server','public','scripts','tests']) {
  for (const file of readdirSync(directory).filter(name=>name.endsWith('.mjs'))) {
    const result=spawnSync(process.execPath,['--check',resolve(directory,file)],{stdio:'inherit'});
    if(result.status!==0)process.exit(1);
  }
}
console.log('JavaScript syntax checks passed.');
