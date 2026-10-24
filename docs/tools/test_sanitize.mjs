/* Hand-load SVG pipeline test. svgo and DOMPurify are local pinned packages.
   Nothing is loaded from a CDN. svg_second_pass.py runs after the sanitizer. */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "tt-svg-"));
const failures = [];

function run(cmd, args) {
  return spawnSync(cmd, args, { cwd: root, encoding: "utf8" });
}

function sanitize(input, output) {
  const result = run("node", ["docs/tools/svg_sanitize.mjs", input, output]);
  if (result.status !== 0) failures.push("sanitize failed " + input + " " + (result.stderr || result.stdout));
  return result;
}

function second(file) {
  return run("python3", ["docs/tools/svg_second_pass.py", file]);
}

const inkOut = path.join(tmp, "ink.svg");
sanitize(path.join(root, "docs/tools/test_inkscape_style.svg"), inkOut);
const ink = fs.readFileSync(inkOut, "utf8");
if (/<style/i.test(ink) || /style=/i.test(ink)) failures.push("inkscape styles survived: " + ink);
if (!/fill=/i.test(ink)) failures.push("presentation attributes missing: " + ink);
const inkPass = second(inkOut);
if (inkPass.status !== 0) failures.push("inkscape second pass: " + inkPass.stdout);

const cases = {
  script: '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script><rect width="1" height="1"/></svg>',
  on: '<svg xmlns="http://www.w3.org/2000/svg"><rect width="1" height="1" onload="alert(1)"/></svg>',
  style: '<svg xmlns="http://www.w3.org/2000/svg"><style>@import "https://evil.example/x.css";</style><rect width="1" height="1"/></svg>',
  smil: '<svg xmlns="http://www.w3.org/2000/svg"><rect width="1" height="1"><set attributeName="x" to="1"/><animate attributeName="x" to="2"/></rect></svg>',
  javascript: '<svg xmlns="http://www.w3.org/2000/svg"><a href="javascript:alert(1)"><rect width="1" height="1"/></a></svg>',
  data: '<svg xmlns="http://www.w3.org/2000/svg"><image href="data:image/svg+xml;base64,PHN2Zy8+"/></svg>',
  use: '<svg xmlns="http://www.w3.org/2000/svg"><use href="#x"/></svg>',
  anchor: '<svg xmlns="http://www.w3.org/2000/svg"><a href="https://evil.example/"><rect width="1" height="1"/></a></svg>',
  foreign: '<svg xmlns="http://www.w3.org/2000/svg"><foreignObject width="1" height="1"></foreignObject></svg>',
  external: '<svg xmlns="http://www.w3.org/2000/svg"><image href="https://evil.example/a.png"/></svg>',
};

for (const [name, body] of Object.entries(cases)) {
  const raw = path.join(tmp, name + "-raw.svg");
  const out = path.join(tmp, name + ".svg");
  fs.writeFileSync(raw, body);
  const rawPass = second(raw);
  if (rawPass.status === 0) failures.push(name + " raw input was not rejected");
  sanitize(raw, out);
  const cleaned = fs.readFileSync(out, "utf8");
  const after = second(out);
  if (after.status !== 0) failures.push(name + " sanitized output rejected: " + after.stdout + " :: " + cleaned);
}

const externalSvg = path.join(root, "docs/tools/test_external_url.svg");
const externalOut = path.join(tmp, "external-url.svg");
const externalRun = run("npm", ["run", "sanitize-svg", "--", externalSvg, externalOut]);
if (externalRun.status === 0) failures.push("url(https) test SVG was not rejected\n" + externalRun.stdout + externalRun.stderr);
else console.log("external url(https) sanitize exit", externalRun.status);

if (failures.length) {
  console.error("SVG SANITIZE: FAIL");
  for (const item of failures) console.error(" -", item);
  process.exit(1);
}
console.log("SVG SANITIZE: PASS");
console.log("sanitizer: local pinned svgo + DOMPurify, then svg_second_pass.py; no CDN");
