import os, json
d=os.path.dirname(os.path.abspath(__file__)); src=lambda f: open(os.path.join(d,'src',f),encoding='utf-8').read()
ui=src('ui.html')
import base64
MARCA_URL='https://raw.githubusercontent.com/gastronomosculinaria/lista-material-eventos/main/marca/'
def marca_dados(t):
    import re
    def f(m):
        n=m.group(1); b=open(os.path.join(d,'src','marca',n),'rb').read()
        return 'data:image/'+('png' if n.endswith('.png') else 'jpeg')+';base64,'+base64.b64encode(b).decode()
    return re.sub(r'__MARCA__/([\w.-]+)', f, t)
# demo (artifact): núcleo + banco local embutidos
demo=marca_dados(ui).replace('/*__BACKEND__*/', src('core.js')+'\n'+src('demo.js'))
open(os.path.join(d,'dist','demo.html'),'w',encoding='utf-8').write(demo)
# Google Apps Script
gas_ui=ui.replace('__MARCA__/',MARCA_URL).replace('/*__BACKEND__*/','')
idx='<!DOCTYPE html>\n<html lang="pt-BR"><head><base target="_top"><meta charset="utf-8"></head><body>\n'+gas_ui+'\n</body></html>\n'
# minifica (o Apps Script guarda a tela no cache, que aceita no máximo 100 KB por valor)
import subprocess, tempfile
def mini(h):
    with tempfile.TemporaryDirectory() as t:
        e=os.path.join(t,'e.html'); o=os.path.join(t,'o.html'); open(e,'w',encoding='utf-8').write(h)
        subprocess.run(['node',os.path.join(d,'tools','minificar.js'),e,o],check=True)
        return open(o,encoding='utf-8').read()
# O link do Apps Script (/exec) só encaminha para a página do GitHub Pages, que é o app completo.
# Assim a tela não depende do limite de 100 KB do cache do Apps Script.
PAGES='https://gastronomosculinaria.github.io/lista-material-eventos/'
idx=('<!DOCTYPE html>\n<html lang="pt-BR"><head><base target="_top"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>'
  '<body style="font-family:sans-serif;background:#fbf7ee;color:#2b2523;text-align:center;padding:40px 20px">'
  '<img src="'+MARCA_URL+'icone-180.png" alt="" width="90" height="90" style="border-radius:20px">'
  '<h1 style="font-size:22px">Gastrônomos: Material de Eventos</h1><p>O app agora abre pelo link da equipe.</p>'
  '<p><a id="ir" href="'+PAGES+'" target="_top" style="display:inline-block;background:#c0615e;color:#fff;padding:14px 24px;border-radius:12px;text-decoration:none;font-weight:600">Abrir o app</a></p>'
  '<p style="font-size:13px;color:#6b6460">'+PAGES+'</p>'
  '<script>try{window.top.location.href='+json.dumps(PAGES)+'}catch(e){}</script></body></html>\n')
tam=len(idx.encode('utf-8'))
print('index.html', tam, 'bytes')
assert tam < 95000, 'index.html grande demais para o cache do Apps Script'
open(os.path.join(d,'dist','index.html'),'w',encoding='utf-8').write(idx)
import json
open(os.path.join(d,'dist','Code.gs'),'w',encoding='utf-8').write(src('core.js')+'\n'+src('gas.js')+'\n// Tela do app (não precisa de arquivo HTML separado)\nvar APP_HTML = '+json.dumps(idx, ensure_ascii=False)+';\n')
print('ok')
# página de instalação: atualiza o código embutido
ip=os.path.join(d,'dist','instalar.html')
if os.path.exists(ip):
    import re
    pg=open(ip,encoding='utf-8').read()
    code=src('carregador.gs')
    i=pg.index('var C1='); k=pg.index(';\ndocument.getElementById(\'t1\')')
    pg=pg[:i]+'var C1='+json.dumps(code).replace('</','<\\/')+pg[k:]
    open(ip,'w',encoding='utf-8').write(pg)
    print('instalar ok')
# pacote para o GitHub (atualização automática) + carregador
gh=os.path.join(d,'dist','github'); os.makedirs(gh, exist_ok=True)
g=src('gas.js').replace('function doGet(','function doGetApp_(').replace('function api(','function apiApp_(').replace('function configurar(','function configurarApp_(')
assert 'doGetApp_' in g and 'apiApp_' in g and 'configurarApp_' in g
open(os.path.join(gh,'app.js'),'w',encoding='utf-8').write(src('core.js')+'\n'+g)
open(os.path.join(gh,'index.html'),'w',encoding='utf-8').write(idx)
open(os.path.join(gh,'carregador.gs'),'w',encoding='utf-8').write(src('carregador.gs'))
open(os.path.join(gh,'README.md'),'w',encoding='utf-8').write('# Lista de Material de Eventos\n\nCódigo do app de inventário do buffet (Google Apps Script). O `carregador.gs` fica no Código.gs da planilha e busca `app.js` e `index.html` deste repositório.\n')
print('github ok')
import shutil
shutil.copytree(os.path.join(d,'src','marca'), os.path.join(gh,'marca'), dirs_exist_ok=True)
print('marca ok')
# página de entrada (GitHub Pages, pasta docs): mesma tela, falando com o Apps Script por GET anônimo
APP_URL='https://script.google.com/macros/s/AKfycbwZW3gjh0DDKsw284u6aDeBwsSodsLRLK2kJm__UhfPVogYgzGnpVj93IBfTCcBgh4C5w/exec'
dc=os.path.join(gh,'docs'); os.makedirs(dc, exist_ok=True)
head=('<!DOCTYPE html>\n<html lang="pt-BR"><head><meta charset="utf-8">'
  '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'
  '<meta name="theme-color" content="#c0615e"><meta name="apple-mobile-web-app-title" content="Material de Eventos">'
  '<meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes">'
  '<link rel="icon" href="'+MARCA_URL+'icone-64.png"><link rel="apple-touch-icon" href="'+MARCA_URL+'icone-180.png">'
  '<link rel="manifest" href="manifest.json"></head><body>\n')
pg=ui.replace('__MARCA__/',MARCA_URL).replace('/*__BACKEND__*/','var APP_URL = '+json.dumps(APP_URL)+';')
open(os.path.join(dc,'index.html'),'w',encoding='utf-8').write(mini(head+pg+'\n</body></html>\n'))
open(os.path.join(dc,'manifest.json'),'w',encoding='utf-8').write(json.dumps({'name':'Gastrônomos: Material de Eventos','short_name':'Material de Eventos','start_url':'.','display':'standalone','background_color':'#fbf7ee','theme_color':'#c0615e','icons':[{'src':MARCA_URL+'icone-180.png','sizes':'180x180','type':'image/png'},{'src':MARCA_URL+'icone-512.png','sizes':'512x512','type':'image/png'}]},ensure_ascii=False,indent=1))
open(os.path.join(dc,'.nojekyll'),'w').write('')
print('docs ok')
# bibliotecas de QR (cópia própria no GitHub Pages, caso o CDN falhe)
lib=os.path.join(dc,'lib'); os.makedirs(lib, exist_ok=True)
for n in ('jsQR.js','qrcode.js'):
    f=os.path.join(d,'tools','lib',n)
    if os.path.exists(f): shutil.copy(f, os.path.join(lib,n))
print('lib ok')
