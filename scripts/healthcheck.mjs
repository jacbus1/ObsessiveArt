import http from 'node:http';
const port=Number(process.env.PORT || 4173);
const origin=new URL(process.env.PUBLIC_URL || `http://127.0.0.1:${port}`);
const req=http.get({hostname:'127.0.0.1',port,path:'/healthz',headers:{Host:origin.host},timeout:2500},res=>{
  res.resume();process.exit(res.statusCode===200?0:1);
});
req.on('timeout',()=>{req.destroy();process.exit(1);});req.on('error',()=>process.exit(1));
