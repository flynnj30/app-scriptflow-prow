const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const PORT = Number(process.env.PORT || 3000);
const PUBLIC = path.join(__dirname);
const TARGET = new URL('https://transcript-studio-n0nv.onrender.com/');
const MIME = {'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon','.webp':'image/webp','.woff':'font/woff','.woff2':'font/woff2','.mp3':'audio/mpeg','.wav':'audio/wav','.ogg':'audio/ogg'};
function local(req,res){
  let pathname=decodeURIComponent(new URL(req.url,'http://local').pathname);
  if(pathname.startsWith('/transcript-browser/')) return proxy(req,res,pathname.slice('/transcript-browser/'.length));
  if(pathname==='/'||pathname==='/index.html') pathname='/index.html';
  const file=path.join(PUBLIC,pathname);
  if(!file.startsWith(PUBLIC) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return fs.createReadStream(path.join(PUBLIC,'index.html')).pipe(res);
  res.setHeader('Content-Type',MIME[path.extname(file).toLowerCase()]||'application/octet-stream'); fs.createReadStream(file).pipe(res);
}
function proxy(req,res,tail){
  const target=new URL('/'+tail+(new URL(req.url,'http://local').search),TARGET);
  const opts={protocol:target.protocol,hostname:target.hostname,port:443,path:target.pathname+target.search,method:req.method,headers:{...req.headers,host:target.host,origin:TARGET.origin,referer:TARGET.href}};
  delete opts.headers['content-length']; delete opts.headers['accept-encoding'];
  const upstream=https.request(opts,u=>{
    const headers={...u.headers};
    delete headers['content-security-policy']; delete headers['content-security-policy-report-only']; delete headers['x-frame-options']; delete headers['content-length'];
    headers['cache-control']='no-store'; headers['access-control-allow-origin']='*';
    res.writeHead(u.statusCode||502,headers);
    const ct=String(u.headers['content-type']||'');
    if(req.method==='HEAD'||req.method==='OPTIONS') return res.end();
    if(ct.includes('text/html')){
      let data=''; u.setEncoding('utf8'); u.on('data',c=>data+=c); u.on('end',()=>{data=rewriteHtml(data,target.href);res.end(data);});
    } else u.pipe(res);
  });
  upstream.on('error',e=>{res.writeHead(502,{'content-type':'application/json'});res.end(JSON.stringify({error:'Transcript Studio proxy failed',message:e.message}));});
  req.pipe(upstream);
}
function rewriteHtml(html,base){
  const targetOrigin=TARGET.origin;
  const localOrigin='';
  const attrs=['href','src','action','poster'];
  for(const attr of attrs){
    const re=new RegExp('('+attr+'\\s*=\\s*["\\\'])(?!data:|javascript:|#)([^"\\\']+)(["\\\'])','gi');
    html=html.replace(re,(m,a,v,q)=>{try{const u=new URL(v,base); if(u.origin===targetOrigin) return a+'/transcript-browser'+u.pathname+(u.search||'')+(u.hash||'')+q;}catch{} return m;});
  }
  html=html.split(targetOrigin).join('/transcript-browser');
  html=html.replace(/<base[^>]*>/gi,'');
  html=html.replace(/<meta[^>]+http-equiv=["']Content-Security-Policy[^>]*>/gi,'');
  return html;
}
http.createServer(local).listen(PORT,'0.0.0.0',()=>console.log(`ScriptFlow Pro listening on ${PORT}`));
