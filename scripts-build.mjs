import {rm,mkdir,copyFile} from 'node:fs/promises';
const files=['index.html','style.css','manifest.webmanifest','sw.js','assets/icon.svg','src/app.js','src/core.js','src/storage.js'];
await rm('dist',{recursive:true,force:true});
for(const file of files){await mkdir(`dist/${file.slice(0,file.lastIndexOf('/')+1)}`,{recursive:true});await copyFile(file,`dist/${file}`);}
console.log(`Built ${files.length} static files into dist/. No bundler, CDN, third-party runtime or API keys required.`);
