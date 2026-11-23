import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root=fileURLToPath(new URL('../',import.meta.url));
const files=new Map([
  ['/', ['index.html','text/html']],['/index.html',['index.html','text/html']],
  ['/src/main.js',['src/main.js','text/javascript']],['/src/model.js',['src/model.js','text/javascript']],
  ['/src/scenes.js',['src/scenes.js','text/javascript']],
  ['/src/style.css',['src/style.css','text/css']],
  ['/public/fonts/Barlow-SemiBold.ttf',['public/fonts/Barlow-SemiBold.ttf','font/ttf']],
  ['/public/fonts/BarlowCondensed-ExtraBold.ttf',['public/fonts/BarlowCondensed-ExtraBold.ttf','font/ttf']],
]);
const port=Number(process.env.LAST_FRAME_PORT || 4173);
if(!Number.isInteger(port)||port<1024||port>65535) throw new Error('LAST_FRAME_PORT must be an integer from 1024 to 65535.');
const server=createServer(async(req,res)=>{
  const pathname=new URL(req.url,'http://127.0.0.1').pathname;
  const file=files.get(pathname);
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{'Allow':'GET, HEAD'});res.end();return;}
  if(!file){res.writeHead(404,{'Content-Type':'text/plain'});res.end('Not found');return;}
  try {
    const body=await readFile(resolve(root,file[0]));
    res.writeHead(200,{'Content-Type':`${file[1]}; charset=utf-8`,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'none'; base-uri 'none'; frame-ancestors 'none'"});
    res.end(req.method==='HEAD'?undefined:body);
  } catch(error) {console.error('Unable to serve game file:',error.message);res.writeHead(500);res.end('Unable to load game file');}
});
server.on('error',error=>{console.error(error.message);process.exitCode=1;});
server.listen(port,'127.0.0.1',()=>console.log(`Last Frame: http://127.0.0.1:${port} (local only)`));
