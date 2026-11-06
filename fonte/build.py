import os
d=os.path.dirname(os.path.abspath(__file__)); src=lambda f: open(os.path.join(d,'src',f),encoding='utf-8').read()
ui=src('ui.html')
# demo (artifact): núcleo + banco local embutidos
demo=ui.replace('/*__BACKEND__*/', src('core.js')+'\n'+src('demo.js'))
open(os.path.join(d,'dist','demo.html'),'w',encoding='utf-8').write(demo)
# Google Apps Script
gas_ui=ui.replace('/*__BACKEND__*/','')
idx='<!DOCTYPE html>\n<html lang="pt-BR"><head><base target="_top"><meta charset="utf-8"></head><body>\n'+gas_ui+'\n</body></html>\n'
open(os.path.join(d,'dist','index.html'),'w',encoding='utf-8').write(idx)
import json
open(os.path.join(d,'dist','Code.gs'),'w',encoding='utf-8').write(src('core.js')+'\n'+src('gas.js')+'\n// Tela do app (não precisa de arquivo HTML separado)\nvar APP_HTML = '+json.dumps(idx, ensure_ascii=False)+';\n')
print('ok')
# página de instalação: atualiza o código embutido
ip=os.path.join(d,'dist','instalar.html')
if os.path.exists(ip):
    import re
    pg=open(ip,encoding='utf-8').read()
    code=open(os.path.join(d,'dist','Code.gs'),encoding='utf-8').read()
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
