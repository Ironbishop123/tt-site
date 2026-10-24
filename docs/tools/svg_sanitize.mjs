// tt hand-load SVG pipeline (local only): svgo style->attrs, DOMPurify SVG profile. Then run svg_second_pass.py.
import {optimize} from 'svgo'; import {JSDOM} from 'jsdom'; import createDOMPurify from 'dompurify'; import fs from 'fs';
const DP=createDOMPurify(new JSDOM('').window);
DP.addHook('uponSanitizeAttribute',(n,d)=>{if(/^(xlink:)?href$/i.test(d.attrName)&&!/^#[\w-]+$/.test(d.attrValue.trim()))d.keepAttr=false;});
const [inp,out]=process.argv.slice(2);
let s=fs.readFileSync(inp,'utf8');
s=optimize(s,{multipass:true,plugins:[
 {name:'inlineStyles',params:{onlyMatchedOnce:false,removeMatchedSelectors:true}},
 {name:'convertStyleToAttrs',params:{keepImportant:false}},
 'removeStyleElement','removeScripts']}).data;
s=DP.sanitize(s,{USE_PROFILES:{svg:true,svgFilters:true},
 FORBID_TAGS:['script','style','foreignObject','use','a','image','animate','animateMotion','animateTransform','set','iframe','object','embed'],
 FORBID_ATTR:['style']});
fs.writeFileSync(out,s);
