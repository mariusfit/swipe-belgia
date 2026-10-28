#!/bin/bash
cd "$(dirname "$0")"
node -e '
const fs=require("fs"),r=f=>JSON.stringify(JSON.parse(fs.readFileSync("data/"+f,"utf8")));
fs.writeFileSync("src/data.js","/* date reale din pilot (copii read-only): ghid ro, profil de fapte, fișier de reguli */\nconst RAW={guide:"+r("guide.json")+",facts:"+r("facts.json")+",rules:"+r("rules.json")+",fixture:"+JSON.stringify({facts:JSON.parse(fs.readFileSync("data/rules-fixture.json","utf8")).facts})+"};\n");
'
{
echo '<!doctype html><html lang="ro"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="color-scheme" content="dark"><meta name="theme-color" content="#090b11"><title>Swipe Belgia — prototip vizual</title><style>'
cat src/style.css src/style2.css src/style3.css src/style4.css src/style5.css src/style6.css
echo '</style></head><body>'
cat src/body.html
echo '<noscript><p style="position:fixed;inset:0;padding:24px;background:#090b11;color:#fff;font:16px system-ui">Swipe Belgia are nevoie de JavaScript. Prototip vizual, fără cereri externe.</p></noscript><script>'
cat src/data.js src/app1.js src/app2.js src/app3.js
echo '</script></body></html>'
} > index.html
wc -c index.html
