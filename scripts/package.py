"""Build offline preview, source ZIP and upload ZIP without changing any served copy."""
from pathlib import Path
from html.parser import HTMLParser
import base64, hashlib, http.server, functools, json, mimetypes, re, threading, urllib.request, zipfile
ROOT = Path(__file__).resolve().parent.parent
(ROOT/'verification').mkdir(exist_ok=True)
PUBLIC = ['index.html','styles.css','app.js','assets/logo.svg','assets/mark.svg','assets/favicon.svg','assets/onest.ttf','assets/app-today.webp','assets/app-workout.webp','assets/app-nutrition.webp','assets/social-preview.png']
class Links(HTMLParser):
    def __init__(self): super().__init__(); self.refs=set(); self.ids=set(); self.aria=[]
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if 'id' in a: assert a['id'] not in self.ids; self.ids.add(a['id'])
        for k in ('src','href'):
            if a.get(k): self.refs.add(a[k])
        if tag=='meta' and a.get('property',a.get('name','')) in ('og:image','twitter:image'): self.refs.add(a['content'])
        for k in ('aria-controls','aria-labelledby'):
            self.aria.extend(a.get(k,'').split())
p=Links(); p.feed((ROOT/'index.html').read_text())
for ref in p.refs:
    if ref.startswith('#'): assert ref[1:] in p.ids, ref
    else: assert ref in PUBLIC, ref
assert all(a in p.ids for a in p.aria)
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*args): pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
report=[]
try:
    for name in PUBLIC:
        with urllib.request.urlopen('http://127.0.0.1:'+str(server.server_port)+'/'+name) as r:
            assert r.status==200 and r.read()==(ROOT/name).read_bytes()
            assert not r.headers.get('Set-Cookie')
            report.append({'path':name,'status':200,'set_cookie':False})
finally: server.shutdown();server.server_close()
(ROOT/'verification/http-audit.json').write_text(json.dumps(report,indent=2)+'\n')
def data(file): return 'data:'+(mimetypes.guess_type(file)[0] or 'application/octet-stream')+';base64,'+base64.b64encode((ROOT/file).read_bytes()).decode()
html=(ROOT/'index.html').read_text()
css=re.sub(r"url\('([^']+)'\)",lambda m:'url("'+data(m[1])+'")',(ROOT/'styles.css').read_text())
html=re.sub(r'<link[^>]+>','',html).replace('<script src="app.js" defer></script>','').replace('</head>','<style>'+css+'</style></head>')
html=html.replace('</head>','<link rel="icon" href="'+data('assets/favicon.svg')+'" type="image/svg+xml"></head>')
html=re.sub(r'(src|href|content)="(assets/[^"]+)"',lambda m:m[1]+'="'+data(m[2])+'"',html)
js=(ROOT/'app.js').read_text()
images={'assets/app-'+v+'.webp':data('assets/app-'+v+'.webp') for v in ('today','workout','nutrition')}
js=js.replace("image.src = 'assets/app-' + view + '.webp';","image.src = "+json.dumps(images)+"['assets/app-' + view + '.webp'];")
html=html.replace('</body>','<script>'+js+'</script></body>')
(ROOT/'liftspire-preview.html').write_text(html)
SOURCE=PUBLIC+['liftspire-preview.html','README.md','RELEASE-NOTES.md','scripts/package.py','scripts/verify.cjs','scripts/verify-standalone.cjs','scripts/release-check','scripts/render-concepts.cjs','scripts/render-social.cjs']+['assets/concept-'+v+'.'+ext for v in ('today','workout','nutrition') for ext in ('svg','png')]
outputs={}
for filename,files,prefix in [('liftspire-deployment.zip',PUBLIC,''),('liftspire-site.zip',SOURCE,'liftspire-site/')]:
    with zipfile.ZipFile(ROOT/filename,'w',zipfile.ZIP_DEFLATED) as z:
        for f in files: z.write(ROOT/f,prefix+f)
    with zipfile.ZipFile(ROOT/filename) as z:
        assert z.testzip() is None
        assert set(z.namelist())=={prefix+f for f in files}
        assert prefix+'index.html' in z.namelist()
        outputs[filename]={'files':z.namelist(),'bytes':(ROOT/filename).stat().st_size,'sha256':hashlib.sha256((ROOT/filename).read_bytes()).hexdigest()}
(ROOT/'verification/package-manifest.json').write_text(json.dumps(outputs,indent=2)+'\n')
print(json.dumps(outputs,indent=2))
