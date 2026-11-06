// Lista de Material de Eventos — CARREGADOR
// Cole este código no Código.gs UMA ÚNICA VEZ. Ele busca a versão mais nova do app
// no GitHub (no máximo a cada 5 minutos). Os dados continuam na sua Planilha e no seu Drive.
var FONTE = 'https://raw.githubusercontent.com/gastronomosculinaria/lista-material-eventos/main/';
var APP_HTML;

function doGet(e) { carregar_(); return doGetApp_(e); }
function api(acao, payload) { carregar_(); return apiApp_(acao, payload); }
// Rode pelo editor depois de colar este código (pede as permissões).
function configurar() { carregar_(true); return configurarApp_(); }
// Rode pelo editor se quiser puxar a versão nova na hora, sem esperar 5 minutos.
function atualizarAgora() { carregar_(true); return 'App atualizado.'; }

function carregar_(forcar) {
  if (typeof CORE !== 'undefined' && !forcar) return;
  var cache = CacheService.getScriptCache();
  var js = cache.get('app_js'), html = cache.get('app_html');
  if (forcar || !cache.get('app_ok') || !js || !html) {
    try {
      var t = '?t=' + Date.now();
      var r = UrlFetchApp.fetchAll([
        { url: FONTE + 'app.js' + t, muteHttpExceptions: true },
        { url: FONTE + 'index.html' + t, muteHttpExceptions: true }
      ]);
      if (r[0].getResponseCode() === 200 && r[1].getResponseCode() === 200) {
        js = r[0].getContentText('UTF-8'); html = r[1].getContentText('UTF-8');
        cache.putAll({ app_js: js, app_html: html }, 21600);
        cache.put('app_ok', '1', 300);
        guardarCopia_(js, html);
      }
    } catch (e) {}
  }
  if (!js || !html) { var c = lerCopia_(); js = c.js; html = c.html; }
  if (!js || !html) throw new Error('Não consegui baixar o app do GitHub. Tente de novo em alguns minutos.');
  (0, eval)(js);
  APP_HTML = html;
}

// Cópia de segurança nas propriedades do script, para o app funcionar mesmo se o GitHub cair.
function guardarCopia_(js, html) {
  var props = PropertiesService.getScriptProperties();
  var tudo = JSON.stringify({ js: js, html: html });
  var assin = String(tudo.length) + ':' + tudo.slice(-64);
  if (props.getProperty('copia_assin') === assin) return;
  var partes = {}, n = 0;
  for (var i = 0; i < tudo.length; i += 8000) partes['copia_' + (n++)] = tudo.slice(i, i + 8000);
  partes.copia_n = String(n); partes.copia_assin = assin;
  props.setProperties(partes, false);
}
function lerCopia_() {
  var props = PropertiesService.getScriptProperties(), n = +(props.getProperty('copia_n') || 0), s = '';
  for (var i = 0; i < n; i++) s += props.getProperty('copia_' + i) || '';
  try { return JSON.parse(s); } catch (e) { return {}; }
}

// Nunca é executada: só lista os serviços que o app usa, para o Google pedir as permissões certas.
function permissoes_() {
  SpreadsheetApp.getActiveSpreadsheet(); DriveApp.getRootFolder(); CalendarApp.getDefaultCalendar();
  Session.getEffectiveUser(); LockService.getScriptLock(); UrlFetchApp.fetch(FONTE); HtmlService.createHtmlOutput('');
}
