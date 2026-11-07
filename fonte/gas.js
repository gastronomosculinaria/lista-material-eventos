// ---- Google Apps Script: dados na Planilha, fotos no Google Drive ----

function doGet() {
  return HtmlService.createHtmlOutput(APP_HTML)
    .setTitle('Gastrônomos: Material de Eventos')
    .setFaviconUrl('https://raw.githubusercontent.com/gastronomosculinaria/lista-material-eventos/main/marca/icone-64.png')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// Rode esta função uma vez pelo editor (botão Executar) para criar as abas.
function configurar() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(CORE.TABELAS).forEach(function (nome) { abaDe_(ss, nome); });
  pastaFotos_();
  CalendarApp.getDefaultCalendar(); // pede permissão para usar a Agenda
  return 'Pronto. Agora publique: Implantar > Nova implantação > App da Web.';
}

function api(acao, payload) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    var db = novoDb_();
    return { ok: true, data: CORE.handle(db, acao, payload) };
  } catch (e) {
    return { ok: false, erro: e && e.message ? e.message : String(e) };
  } finally {
    try { lock.releaseLock(); } catch (e) {}
  }
}

function abaDe_(ss, nome) {
  var sh = ss.getSheetByName(nome);
  var cab = CORE.TABELAS[nome];
  if (!sh) {
    sh = ss.insertSheet(nome);
    sh.getRange(1, 1, 1, cab.length).setValues([cab]).setFontWeight('bold');
    sh.setFrozenRows(1);
    sh.getRange(1, 1, sh.getMaxRows(), cab.length).setNumberFormat('@');
  } else if (sh.getLastColumn() < cab.length) {
    // versão nova com colunas a mais: atualiza o cabeçalho
    sh.getRange(1, 1, 1, cab.length).setValues([cab]).setFontWeight('bold');
    sh.getRange(1, 1, sh.getMaxRows(), cab.length).setNumberFormat('@');
  }
  return sh;
}

function pastaFotos_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('PASTA_FOTOS');
  if (id) { try { return DriveApp.getFolderById(id); } catch (e) {} }
  var pasta = DriveApp.createFolder('Inventário Buffet - Fotos');
  props.setProperty('PASTA_FOTOS', pasta.getId());
  return pasta;
}

function novoDb_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var cache = {};
  function aba(t) { return abaDe_(ss, t); }
  function ler(t) {
    if (cache[t]) return cache[t];
    var sh = aba(t), cab = CORE.TABELAS[t], n = sh.getLastRow() - 1;
    var linhas = n > 0 ? sh.getRange(2, 1, n, cab.length).getDisplayValues() : [];
    cache[t] = linhas.map(function (r, i) {
      var o = { _linha: i + 2 };
      cab.forEach(function (c, j) { o[c] = r[j]; });
      return o;
    }).filter(function (o) { return o.id; });
    return cache[t];
  }
  function linhaDe(t, o) { return CORE.TABELAS[t].map(function (c) { return o[c] == null ? '' : String(o[c]); }); }
  return {
    all: function (t) { return ler(t); },
    insert: function (t, o) {
      var sh = aba(t);
      sh.appendRow(linhaDe(t, o));
      delete cache[t];
    },
    insertMany: function (t, lista) {
      if (!lista.length) return;
      var sh = aba(t);
      sh.getRange(sh.getLastRow() + 1, 1, lista.length, CORE.TABELAS[t].length).setValues(lista.map(function (o) { return linhaDe(t, o); }));
      delete cache[t];
    },
    update: function (t, id, patch) {
      var o = ler(t).filter(function (x) { return x.id === id; })[0];
      if (!o) return;
      Object.keys(patch).forEach(function (k) { o[k] = patch[k]; });
      aba(t).getRange(o._linha, 1, 1, CORE.TABELAS[t].length).setValues([linhaDe(t, o)]);
    },
    remove: function (t, id) {
      var o = ler(t).filter(function (x) { return x.id === id; })[0];
      if (!o) return;
      aba(t).deleteRow(o._linha);
      delete cache[t];
    },
    removeWhere: function (t, fn) {
      var alvo = ler(t).filter(fn).map(function (o) { return o._linha; }).sort(function (a, b) { return b - a; });
      var sh = aba(t);
      alvo.forEach(function (n) { sh.deleteRow(n); });
      delete cache[t];
    },
    ultimos: function (t, n) {
      var sh = aba(t), cab = CORE.TABELAS[t], total = sh.getLastRow() - 1;
      if (total <= 0) return [];
      var ini = Math.max(2, sh.getLastRow() - n + 1);
      return sh.getRange(ini, 1, sh.getLastRow() - ini + 1, cab.length).getDisplayValues().map(function (r) {
        var o = {}; cab.forEach(function (c, j) { o[c] = r[j]; }); return o;
      }).reverse();
    },
    hash: function (s) {
      var b = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, 'buffet:' + s, Utilities.Charset.UTF_8);
      return b.map(function (x) { return ('0' + (x & 255).toString(16)).slice(-2); }).join('');
    },
    agenda: agenda_(function () { var r = ler('config').filter(function (o) { return o.id === 'agenda_id'; })[0]; return r ? r.valor : ''; }),
    salvarFoto: function (dataUrl, nome) {
      var m = /^data:(image\/[a-z]+);base64,(.+)$/.exec(dataUrl || '');
      if (!m) throw new Error('Foto inválida.');
      var blob = Utilities.newBlob(Utilities.base64Decode(m[2]), m[1], nome + '.jpg');
      var f = pastaFotos_().createFile(blob);
      f.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      return 'https://drive.google.com/thumbnail?id=' + f.getId() + '&sz=w800';
    }
  };
}

// ---- Agenda Google (agenda principal da conta que publicou o app) ----
var AGENDA_PADRAO = 'atendimento@gastronomosculinaria.com.br';
function contaDoApp_() { try { return Session.getEffectiveUser().getEmail() || 'a conta que publicou o app'; } catch (e) { return 'a conta que publicou o app'; } }
function agenda_(agendaLida) {
  function agendaEscolhida() { var v = agendaLida(); return v === 'principal' ? '' : (v || AGENDA_PADRAO); }
  var MARCA = '— Material do buffet (atualizado pelo app de inventário) —';
  var tz = Session.getScriptTimeZone();
  function cal() {
    var id = agendaEscolhida();
    if (!id) return CalendarApp.getDefaultCalendar();
    var c = CalendarApp.getCalendarById(id);
    if (!c) throw new Error('A conta que publicou o app (' + contaDoApp_() + ') não tem acesso à agenda ' + id +
      '. Compartilhe essa agenda com essa conta, com permissão para fazer alterações nos eventos.');
    return c;
  }
  function dia(s) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ''); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; }
  function hora(d, h) { var m = /^(\d{1,2}):(\d{2})/.exec(h || ''); if (!m) return null; var x = new Date(d.getTime()); x.setHours(+m[1], +m[2], 0, 0); return x; }
  function mesclar(desc, texto) {
    desc = desc || '';
    var i = desc.indexOf(MARCA);
    if (i >= 0) desc = desc.slice(0, i).replace(/\s+$/, '');
    return (desc ? desc + '\n\n' : '') + MARCA + '\n' + texto;
  }
  return {
    salvar: function (ev, texto) {
      var c = ev.agenda_id ? cal().getEventById(ev.agenda_id) : null;
      var d = dia(ev.data);
      var meu = !c || ev.agenda_criado === 'sim';
      if (!c) {
        if (!d) return { id: '', criado: false };
        var ini = hora(d, ev.hora_inicio);
        if (ini) {
          var fim = hora(d, ev.hora_fim);
          if (!fim || fim <= ini) fim = new Date(ini.getTime() + 4 * 3600 * 1000);
          c = cal().createEvent(ev.nome, ini, fim);
        } else c = cal().createAllDayEvent(ev.nome, d);
        meu = true;
      } else if (meu && d) {
        c.setTitle(ev.nome);
        var i2 = hora(d, ev.hora_inicio);
        if (i2) { var f2 = hora(d, ev.hora_fim); if (!f2 || f2 <= i2) f2 = new Date(i2.getTime() + 4 * 3600 * 1000); c.setTime(i2, f2); }
        else c.setAllDayDate(d);
      }
      if (meu && ev.local) c.setLocation(ev.local);
      c.setDescription(mesclar(c.getDescription(), texto));
      return { id: c.getId(), criado: meu };
    },
    info: function () {
      var atual = agendaEscolhida();
      var lista = [], erro = '';
      try { lista = CalendarApp.getAllCalendars().map(function (c) { return { id: c.getId(), nome: c.getName() }; }); }
      catch (e) { erro = e && e.message ? e.message : String(e); }
      var acesso = '';
      try { if (atual && !CalendarApp.getCalendarById(atual)) acesso = 'sem acesso'; } catch (e) { acesso = e.message; }
      return { conta: contaDoApp_(), atual: atual, agendas: lista, erro: erro, acesso: acesso };
    },
    remover: function (id) { var c = cal().getEventById(id); if (c) c.deleteEvent(); },
    listar: function (dias) {
      var agora = new Date(), ate = new Date(agora.getTime() + dias * 86400000);
      return cal().getEvents(agora, ate).map(function (e) {
        var dia = e.isAllDayEvent();
        return { id: e.getId(), titulo: e.getTitle(), data: Utilities.formatDate(e.getStartTime(), tz, 'yyyy-MM-dd'),
          hora_inicio: dia ? '' : Utilities.formatDate(e.getStartTime(), tz, 'HH:mm'),
          hora_fim: dia ? '' : Utilities.formatDate(e.getEndTime(), tz, 'HH:mm'), local: e.getLocation() };
      });
    }
  };
}
