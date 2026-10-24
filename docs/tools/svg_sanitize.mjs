// tt hand-load SVG pipeline (local only): svgo style->attrs, DOMPurify SVG profile, then svg_second_pass.py.
// A second-pass reject exits non-zero. Nothing is loaded from a CDN.
import {optimize} from 'svgo'; import {JSDOM} from 'jsdom'; import createDOMPurify from 'dompurify';
import fs from 'fs'; import os from 'os'; import path from 'path'; import {spawnSync} from 'child_process';
import {fileURLToPath} from 'url';
const DP=createDOMPurify(new JSDOM('').window);
DP.addHook('uponSanitizeAttribute',(n,d)=>{if(/^(xlink:)?href$/i.test(d.attrName)&&!/^#[\w-]+$/.test(d.attrValue.trim()))d.keepAttr=false;});
const [inp,out]=process.argv.slice(2);
if(!inp||!out){process.stderr.write('usage: svg_sanitize.mjs input.svg output.svg\n');process.exit(1);}
let s=fs.readFileSync(inp,'utf8');
s=optimize(s,{multipass:true,plugins:[
 {name:'inlineStyles',params:{onlyMatchedOnce:false,removeMatchedSelectors:true}},
 {name:'convertStyleToAttrs',params:{keepImportant:false}},
 'removeStyleElement','removeScripts']}).data;
s=DP.sanitize(s,{USE_PROFILES:{svg:true,svgFilters:true},
 FORBID_TAGS:['script','style','foreignObject','use','a','image','animate','animateMotion','animateTransform','set','iframe','object','embed'],
 FORBID_ATTR:['style']});
const tmp=path.join(os.tmpdir(),'tt-sanitize-'+process.pid+'.svg');
fs.writeFileSync(tmp,s);
const second=path.join(path.dirname(fileURLToPath(import.meta.url)),'svg_second_pass.py');
const pass=spawnSync('python3',[second,tmp],{encoding:'utf8'});
fs.unlinkSync(tmp);
if(pass.status!==0){
  process.stderr.write(pass.stdout||pass.stderr||'REJECT\n');
  process.exit(pass.status||1);
}
fs.writeFileSync(out,s);
