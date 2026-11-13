import json,os,shutil,glob
R=os.path.dirname(os.path.abspath(__file__)); rd=lambda f:open(os.path.join(R,f),encoding='utf-8').read()
dark=rd('dark.css')
css=rd('app.css').replace('/*DARK*/','@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){\n'+dark+'}}\n:root[data-theme="dark"]{\n'+dark+'}')
js='\n'.join(rd(f) for f in ['part-standalone.js']+sorted(os.path.basename(f) for f in glob.glob(os.path.join(R,'part-data-*.js')))+['part-core.js','part-bets.js','part-sports.js','part-billy.js','part-ui.js','part-blocks.js','part-nav.js'])
sp=os.path.join(R,'icons','splash','index.json'); splash=''
if os.path.exists(sp):
    for s in json.load(open(sp)):
        splash+=f'<link rel="apple-touch-startup-image" href="{s["f"]}" media="(device-width:{s["w"]}px) and (device-height:{s["h"]}px) and (-webkit-device-pixel-ratio:{s["r"]}) and (orientation:portrait) and (prefers-color-scheme:{s["mode"]})">\n'
html=f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Propline</title>
<meta name="description" content="Player projections for the next games, sport by sport">
<meta name="color-scheme" content="light dark">
<meta name="theme-color" content="#F2F2F7" media="(prefers-color-scheme:light)">
<meta name="theme-color" content="#000000" media="(prefers-color-scheme:dark)">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Propline">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/png" href="icon-192.png">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
{splash}<style>
{css}
</style>
</head>
<body>
<div id="nav"></div>
<main id="view" class="view"></main>
<nav id="tabbar" aria-label="Sections"></nav>
<div id="sheet-root"></div>
<div id="toast" role="status" aria-live="polite"></div>
<script>
{js}
</script>
</body>
</html>
'''
site=os.path.join(R,'site'); shutil.rmtree(site,ignore_errors=True); os.makedirs(os.path.join(site,'splash'))
open(os.path.join(site,'index.html'),'w',encoding='utf-8').write(html)
for f in ['sw.js','manifest.webmanifest','netlify.toml']: shutil.copy(os.path.join(R,f),site)
ic=os.path.join(R,'icons')
for f in os.listdir(ic):
    if f.endswith('.png'): shutil.copy(os.path.join(ic,f),site)
if os.path.isdir(os.path.join(ic,'splash')):
    for f in os.listdir(os.path.join(ic,'splash')):
        if f.endswith('.png'): shutil.copy(os.path.join(ic,'splash',f),os.path.join(site,'splash'))
print('built',len(html),'bytes')
