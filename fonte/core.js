// Regras do app de inventário. O mesmo código roda no Google Apps Script
// (versão real, dados na Planilha) e no navegador (versão de demonstração).
var CORE = (function () {
  var CATEGORIAS = ['Copos', 'Taças de vidro', 'Taças de cristal', 'Bandejas', 'Pratos', 'Talheres',
    'Equipamentos', 'Gás', 'Utensílios', 'Outros'];
  var SENHA_MASTER_INICIAL = 'trocar123';

  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function agora() { return new Date().toISOString(); }
  function num(v) { v = Number(String(v).replace(',', '.')); return isFinite(v) ? v : 0; }
  function digitos(s) { return String(s || '').replace(/\D/g, ''); }
  function sim(v) { return v === true || v === 'sim' || v === 'true'; }
  function falha(msg) { throw new Error(msg); }
  function texto(v, max) { return String(v == null ? '' : v).trim().slice(0, max || 500); }
  function porId(lista, id) { for (var i = 0; i < lista.length; i++) if (lista[i].id === id) return lista[i]; return null; }
  function json(s, padrao) { try { return s ? JSON.parse(s) : padrao; } catch (e) { return padrao; } }

  function getConfig(db, chave) { var c = porId(db.all('config'), chave); return c ? c.valor : ''; }
  function setConfig(db, chave, valor) {
    if (porId(db.all('config'), chave)) db.update('config', chave, { valor: valor });
    else db.insert('config', { id: chave, valor: valor });
  }

  function sessao(db, token) {
    if (!token) return null;
    var s = porId(db.all('sessoes'), token);
    if (!s) return null;
    if (s.pessoa_id === 'master') return { papel: 'coordenador', nome: 'Coordenação', inventario: true, equipe: true };
    var p = porId(db.all('pessoas'), s.pessoa_id);
    if (!p || !sim(p.ativo)) return null;
    if (sim(p.coordenador)) return { papel: 'coordenador', nome: p.nome, id: p.id, inventario: true, equipe: true };
    return { papel: 'estoquista', nome: p.nome, id: p.id, inventario: sim(p.pode_inventario), equipe: true };
  }

  function log(db, quem, acao, detalhe) {
    db.insert('log', {
      id: uid(), em: agora(), nome: texto(quem && quem.nome, 80), telefone: texto(quem && quem.telefone, 30),
      acao: acao, detalhe: texto(detalhe, 1000)
    });
  }

  // Quanto de cada item está comprometido em eventos ainda não concluídos.
  function reservas(db, exceto) {
    var ativos = {};
    db.all('eventos').forEach(function (e) { if (e.status !== 'concluido' && e.id !== exceto) ativos[e.id] = true; });
    var r = {};
    db.all('evento_itens').forEach(function (l) { if (ativos[l.evento_id]) r[l.item_id] = (r[l.item_id] || 0) + num(l.qtd_saida); });
    return r;
  }

  function pedeEquipe(s) { if (!s) falha('Entre com sua senha na Área da equipe para fazer isso.'); }
  function pedeInventario(s) { pedeEquipe(s); if (!s.inventario) falha('Sua senha não tem permissão para alterar o inventário. Peça à coordenação.'); }
  function pedeCoord(s) { pedeEquipe(s); if (s.papel !== 'coordenador') falha('Só a coordenação (senha master) pode fazer isso.'); }

  function quemDe(p, s) {
    var q = { nome: texto(p.who && p.who.nome, 80), telefone: texto(p.who && p.who.telefone, 30) };
    if (s) q.nome = q.nome + ' [' + (s.papel === 'coordenador' ? 'coordenação' + (s.id ? ' ' + s.nome : '') : 'estoquista ' + s.nome) + ']';
    return q;
  }

  function prestadorDoEvento(ev, who) {
    var tel = digitos(who && who.telefone);
    if (tel.length < 8) return false;
    return json(ev.prestadores, []).some(function (pr) {
      var t = digitos(pr.telefone);
      return t.length >= 8 && (t.slice(-8) === tel.slice(-8));
    });
  }

  var STATUS_TXT = { montando: 'Separando material', em_evento: 'Material no evento', concluido: 'Material retornado' };
  // Atualiza (ou cria) o evento na Agenda Google com a lista de material. Falha na agenda não impede o app.
  function sincAgenda(db, evId, quem) {
    if (!db.agenda) return;
    var ev = porId(db.all('eventos'), evId);
    if (!ev) return;
    try {
      var linhas = db.all('evento_itens').filter(function (l) { return l.evento_id === ev.id; });
      var prest = json(ev.prestadores, []);
      var t = 'Status: ' + (STATUS_TXT[ev.status] || ev.status) + '\n' +
        (prest.length ? 'Prestadores: ' + prest.map(function (x) { return x.nome + ' ' + x.telefone; }).join(', ') + '\n' : '') +
        (linhas.length ? 'Material:\n' + linhas.map(function (l) {
          return '• ' + l.qtd_saida + ' × ' + l.item_nome + (l.qtd_retorno !== '' && l.qtd_retorno != null ? ' (voltou ' + l.qtd_retorno + ')' : '');
        }).join('\n') : 'Material: lista ainda não montada');
      var r = db.agenda.salvar(ev, t);
      if (r.id && (r.id !== ev.agenda_id || (r.criado ? 'sim' : 'nao') !== ev.agenda_criado))
        db.update('eventos', ev.id, { agenda_id: r.id, agenda_criado: r.criado ? 'sim' : 'nao' });
    } catch (e) {
      log(db, quem, 'Não consegui atualizar a Agenda', ev.nome + ': ' + (e && e.message));
    }
  }

  var acoes = {
    entrar: function (db, p, s, quem) {
      if (texto(p.who && p.who.nome).length < 2 || digitos(p.who && p.who.telefone).length < 8)
        falha('Informe seu nome e um telefone com DDD.');
      log(db, quem, 'Acessou o app', '');
      return true;
    },

    carregar: function (db, p, s) {
      var res = reservas(db);
      var itens = db.all('itens').filter(function (i) { return sim(i.ativo); }).map(function (i) {
        var total = num(i.qtd_total);
        return { id: i.id, nome: i.nome, categoria: i.categoria, descricao: i.descricao, foto: i.foto,
          qtd_total: total, disponivel: total - (res[i.id] || 0) };
      });
      var linhas = db.all('evento_itens');
      var eventos = db.all('eventos').map(function (e) {
        return { id: e.id, nome: e.nome, data: e.data, local: e.local, status: e.status, obs: e.obs,
          hora_inicio: e.hora_inicio || '', hora_fim: e.hora_fim || '', na_agenda: !!e.agenda_id,
          prestadores: json(e.prestadores, []), criado_por: e.criado_por, concluido_em: e.concluido_em,
          retorno_por: e.retorno_por,
          linhas: linhas.filter(function (l) { return l.evento_id === e.id; }).map(function (l) {
            return { item_id: l.item_id, nome: l.item_nome, qtd_saida: num(l.qtd_saida),
              qtd_retorno: l.qtd_retorno === '' || l.qtd_retorno == null ? null : num(l.qtd_retorno),
              justificativa: l.justificativa };
          }) };
      });
      var out = { itens: itens, eventos: eventos, sessao: s, categorias: CATEGORIAS, agenda: !!db.agenda };
      if (s && s.papel === 'coordenador') {
        out.pessoas = db.all('pessoas').map(function (x) {
          return { id: x.id, nome: x.nome, telefone: x.telefone, ativo: sim(x.ativo), pode_inventario: sim(x.pode_inventario), coordenador: sim(x.coordenador) };
        });
        out.masterPadrao = !getConfig(db, 'master_hash');
      }
      return out;
    },

    login: function (db, p, s, quem) {
      var senha = texto(p.senha, 100);
      if (!senha) falha('Digite a senha.');
      var h = db.hash(senha);
      var master = getConfig(db, 'master_hash') || db.hash(SENHA_MASTER_INICIAL);
      var pessoaId = null, nome = '';
      if (h === master) { pessoaId = 'master'; nome = 'coordenação'; }
      else {
        var p2 = db.all('pessoas').filter(function (x) { return sim(x.ativo) && x.senha_hash === h; })[0];
        if (p2) { pessoaId = p2.id; nome = (sim(p2.coordenador) ? 'coordenação ' : 'estoquista ') + p2.nome; }
      }
      if (!pessoaId) { log(db, quem, 'Senha incorreta', ''); falha('Senha incorreta.'); }
      var token = uid() + uid();
      db.insert('sessoes', { id: token, pessoa_id: pessoaId, criado_em: agora() });
      log(db, quem, 'Entrou na área da equipe', 'como ' + nome);
      return { token: token };
    },

    sair: function (db, p, s, quem) {
      if (p.token && porId(db.all('sessoes'), p.token)) db.remove('sessoes', p.token);
      if (s) log(db, quem, 'Saiu da área da equipe', '');
      return true;
    },

    salvarItem: function (db, p, s, quem) {
      pedeInventario(s);
      var it = p.item || {};
      var nome = texto(it.nome, 120);
      if (!nome) falha('Dê um nome ao item.');
      var dados = { nome: nome, categoria: texto(it.categoria, 60) || 'Outros', descricao: texto(it.descricao, 500),
        qtd_total: String(Math.max(0, Math.round(num(it.qtd_total)))) };
      if (it.fotoNova) dados.foto = db.salvarFoto(it.fotoNova, nome);
      if (it.id) {
        var antes = porId(db.all('itens'), it.id);
        if (!antes) falha('Item não encontrado.');
        db.update('itens', it.id, dados);
        var mud = [];
        ['nome', 'categoria', 'descricao', 'qtd_total'].forEach(function (k) {
          if (String(antes[k]) !== String(dados[k])) mud.push(k + ': "' + antes[k] + '" → "' + dados[k] + '"');
        });
        if (dados.foto) mud.push('nova foto');
        log(db, quem, 'Editou item do inventário', nome + (mud.length ? ' (' + mud.join('; ') + ')' : ''));
        return { id: it.id };
      }
      dados.id = uid(); dados.ativo = 'sim'; dados.criado_em = agora();
      dados.foto = dados.foto || '';
      db.insert('itens', dados);
      log(db, quem, 'Incluiu item no inventário', nome + ' (' + dados.qtd_total + ' un., ' + dados.categoria + ')');
      return { id: dados.id };
    },

    excluirItem: function (db, p, s, quem) {
      pedeInventario(s);
      var it = porId(db.all('itens'), p.id);
      if (!it) falha('Item não encontrado.');
      if (reservas(db)[it.id]) falha('Este item está em um evento em andamento. Conclua o evento antes de excluir.');
      db.update('itens', it.id, { ativo: 'nao' });
      log(db, quem, 'Excluiu item do inventário', it.nome + ' (' + it.qtd_total + ' un.)');
      return true;
    },

    baixaItem: function (db, p, s, quem) {
      pedeInventario(s);
      var it = porId(db.all('itens'), p.id);
      if (!it) falha('Item não encontrado.');
      var q = Math.round(num(p.qtd));
      var motivo = texto(p.motivo, 300);
      if (q <= 0) falha('Informe a quantidade a dar baixa.');
      if (!motivo) falha('Explique o motivo da baixa (ex.: quebrou na lavagem).');
      if (q > num(it.qtd_total)) falha('A baixa é maior que o total cadastrado (' + it.qtd_total + ').');
      db.update('itens', it.id, { qtd_total: String(num(it.qtd_total) - q) });
      db.insert('baixas', { id: uid(), item_id: it.id, item_nome: it.nome, qtd: String(q), motivo: motivo,
        evento_id: '', por: quem.nome + ' ' + quem.telefone, em: agora() });
      log(db, quem, 'Deu baixa em item', q + ' × ' + it.nome + ' — ' + motivo);
      return true;
    },

    salvarEvento: function (db, p, s, quem) {
      pedeEquipe(s);
      var e = p.evento || {};
      var nome = texto(e.nome, 120);
      if (!nome) falha('Dê um nome ao evento.');
      var prest = (e.prestadores || []).map(function (x) { return { nome: texto(x.nome, 80), telefone: texto(x.telefone, 30) }; })
        .filter(function (x) { return x.nome || x.telefone; });
      var dados = { nome: nome, data: texto(e.data, 20), local: texto(e.local, 200), obs: texto(e.obs, 500),
        prestadores: JSON.stringify(prest), hora_inicio: texto(e.hora_inicio, 5), hora_fim: texto(e.hora_fim, 5) };
      if (e.id) {
        if (!porId(db.all('eventos'), e.id)) falha('Evento não encontrado.');
        db.update('eventos', e.id, dados);
        log(db, quem, 'Editou evento', nome + ' — prestadores: ' + prest.map(function (x) { return x.nome + ' ' + x.telefone; }).join(', '));
        sincAgenda(db, e.id, quem);
        return { id: e.id };
      }
      dados.id = uid(); dados.status = 'montando'; dados.criado_por = quem.nome; dados.criado_em = agora();
      dados.concluido_em = ''; dados.retorno_por = '';
      dados.agenda_id = texto(e.agenda_id, 300); dados.agenda_criado = dados.agenda_id ? 'nao' : '';
      if (dados.agenda_id && db.all('eventos').some(function (x) { return x.agenda_id === dados.agenda_id; }))
        falha('Esse compromisso da agenda já tem uma lista de material.');
      db.insert('eventos', dados);
      log(db, quem, dados.agenda_id ? 'Criou evento a partir da Agenda' : 'Criou evento', nome + ' (' + dados.data + ')');
      sincAgenda(db, dados.id, quem);
      return { id: dados.id };
    },

    excluirEvento: function (db, p, s, quem) {
      pedeEquipe(s);
      var ev = porId(db.all('eventos'), p.id);
      if (!ev) falha('Evento não encontrado.');
      if (ev.status !== 'montando') falha('Só dá para excluir um evento que ainda não saiu.');
      db.removeWhere('evento_itens', function (l) { return l.evento_id === ev.id; });
      db.remove('eventos', ev.id);
      if (db.agenda && ev.agenda_id) {
        try { if (ev.agenda_criado === 'sim') db.agenda.remover(ev.agenda_id); } catch (e) {}
      }
      log(db, quem, 'Excluiu evento', ev.nome);
      return true;
    },

    salvarListaEvento: function (db, p, s, quem) {
      pedeEquipe(s);
      var ev = porId(db.all('eventos'), p.evento_id);
      if (!ev) falha('Evento não encontrado.');
      if (ev.status !== 'montando') falha('A saída deste evento já foi confirmada. A lista não pode mais ser alterada.');
      var res = reservas(db, ev.id);
      var itens = db.all('itens');
      var novas = [];
      (p.linhas || []).forEach(function (l) {
        var q = Math.round(num(l.qtd));
        if (q <= 0) return;
        var it = porId(itens, l.item_id);
        if (!it) return;
        var disp = num(it.qtd_total) - (res[it.id] || 0);
        if (q > disp) falha('Só há ' + disp + ' disponíveis de "' + it.nome + '".');
        novas.push({ id: uid(), evento_id: ev.id, item_id: it.id, item_nome: it.nome, qtd_saida: String(q),
          qtd_retorno: '', justificativa: '' });
      });
      db.removeWhere('evento_itens', function (l) { return l.evento_id === ev.id; });
      novas.forEach(function (n) { db.insert('evento_itens', n); });
      log(db, quem, 'Montou lista de material', ev.nome + ': ' + novas.map(function (n) { return n.qtd_saida + ' × ' + n.item_nome; }).join(', '));
      sincAgenda(db, ev.id, quem);
      return true;
    },

    confirmarSaida: function (db, p, s, quem) {
      pedeEquipe(s);
      var ev = porId(db.all('eventos'), p.id);
      if (!ev) falha('Evento não encontrado.');
      if (ev.status !== 'montando') falha('A saída já foi confirmada.');
      if (!db.all('evento_itens').some(function (l) { return l.evento_id === ev.id; })) falha('A lista de material está vazia.');
      db.update('eventos', ev.id, { status: 'em_evento' });
      log(db, quem, 'Confirmou saída do material', ev.nome);
      sincAgenda(db, ev.id, quem);
      return true;
    },

    reabrirMontagem: function (db, p, s, quem) {
      pedeEquipe(s);
      var ev = porId(db.all('eventos'), p.id);
      if (!ev || ev.status !== 'em_evento') falha('Só dá para reabrir um evento que saiu e ainda não voltou.');
      db.update('eventos', ev.id, { status: 'montando' });
      log(db, quem, 'Reabriu a lista de material', ev.nome);
      sincAgenda(db, ev.id, quem);
      return true;
    },

    registrarRetorno: function (db, p, s, quem) {
      var ev = porId(db.all('eventos'), p.evento_id);
      if (!ev) falha('Evento não encontrado.');
      if (ev.status !== 'em_evento') falha('Este evento não está aguardando retorno.');
      if (!s && !prestadorDoEvento(ev, p.who))
        falha('Seu telefone não está na lista de prestadores deste evento. Peça ao estoquista para incluir você.');
      var envio = {};
      (p.linhas || []).forEach(function (l) { envio[l.item_id] = l; });
      var linhas = db.all('evento_itens').filter(function (l) { return l.evento_id === ev.id; });
      var resumo = [], faltas = [];
      linhas.forEach(function (l) {
        var e = envio[l.item_id];
        if (!e || e.qtd === '' || e.qtd == null) falha('Informe quantos voltaram de "' + l.item_nome + '".');
        var q = Math.max(0, Math.round(num(e.qtd)));
        var saiu = num(l.qtd_saida);
        if (q > saiu) falha('"' + l.item_nome + '": voltaram mais (' + q + ') do que saíram (' + saiu + ').');
        var just = texto(e.justificativa, 500);
        if (q < saiu && !just) falha('Explique por que voltaram menos de "' + l.item_nome + '".');
        db.update('evento_itens', l.id, { qtd_retorno: String(q), justificativa: q < saiu ? just : '' });
        resumo.push(q + '/' + saiu + ' ' + l.item_nome);
        if (q < saiu) faltas.push({ l: l, falta: saiu - q, just: just });
      });
      var itens = db.all('itens');
      faltas.forEach(function (f) {
        var it = porId(itens, f.l.item_id);
        if (it) db.update('itens', it.id, { qtd_total: String(Math.max(0, num(it.qtd_total) - f.falta)) });
        db.insert('baixas', { id: uid(), item_id: f.l.item_id, item_nome: f.l.item_nome, qtd: String(f.falta),
          motivo: 'Evento ' + ev.nome + ': ' + f.just, evento_id: ev.id, por: quem.nome + ' ' + quem.telefone, em: agora() });
      });
      db.update('eventos', ev.id, { status: 'concluido', concluido_em: agora(), retorno_por: quem.nome + ' ' + quem.telefone });
      log(db, quem, 'Registrou retorno do material', ev.nome + ': ' + resumo.join(', ') +
        (faltas.length ? ' | Faltas: ' + faltas.map(function (f) { return f.falta + ' × ' + f.l.item_nome + ' (' + f.just + ')'; }).join('; ') : ''));
      sincAgenda(db, ev.id, quem);
      return true;
    },

    salvarPessoa: function (db, p, s, quem) {
      pedeCoord(s);
      var x = p.pessoa || {};
      var nome = texto(x.nome, 80);
      if (!nome) falha('Informe o nome do estoquista.');
      var dados = { nome: nome, telefone: texto(x.telefone, 30), pode_inventario: sim(x.pode_inventario) ? 'sim' : 'nao', coordenador: sim(x.coordenador) ? 'sim' : 'nao',
        ativo: x.ativo === false ? 'nao' : 'sim' };
      var senha = texto(x.senha, 100);
      if (senha) {
        if (senha.length < 4) falha('A senha precisa ter pelo menos 4 caracteres.');
        var h = db.hash(senha);
        var master = getConfig(db, 'master_hash') || db.hash(SENHA_MASTER_INICIAL);
        var repetida = h === master || db.all('pessoas').some(function (o) { return o.id !== x.id && o.senha_hash === h; });
        if (repetida) falha('Essa senha já está em uso. Escolha outra.');
        dados.senha_hash = h;
      }
      if (x.id) {
        if (!porId(db.all('pessoas'), x.id)) falha('Pessoa não encontrada.');
        db.update('pessoas', x.id, dados);
        log(db, quem, 'Alterou acesso da equipe', nome + ' — coordenação: ' + dados.coordenador + ', inventário: ' + dados.pode_inventario + ', ativo: ' + dados.ativo + (senha ? ', senha trocada' : ''));
        return true;
      }
      if (!senha) falha('Defina uma senha pessoal para o estoquista.');
      dados.id = uid(); dados.criado_em = agora();
      db.insert('pessoas', dados);
      log(db, quem, 'Cadastrou pessoa da equipe', nome + ' ' + dados.telefone + ' — coordenação: ' + dados.coordenador + ', inventário: ' + dados.pode_inventario);
      return true;
    },

    trocarMaster: function (db, p, s, quem) {
      pedeCoord(s);
      var nova = texto(p.nova, 100);
      if (nova.length < 6) falha('A senha master precisa ter pelo menos 6 caracteres.');
      var h = db.hash(nova);
      if (db.all('pessoas').some(function (o) { return o.senha_hash === h; })) falha('Essa senha já é de um estoquista. Escolha outra.');
      setConfig(db, 'master_hash', h);
      log(db, quem, 'Trocou a senha master', '');
      return true;
    },

    listarAgenda: function (db, p, s) {
      pedeEquipe(s);
      if (!db.agenda) falha('A Agenda não está ligada.');
      var usados = {};
      db.all('eventos').forEach(function (e) { if (e.agenda_id) usados[e.agenda_id] = e.id; });
      return db.agenda.listar(90).map(function (c) { c.evento_id = usados[c.id] || ''; return c; });
    },

    infoAgenda: function (db, p, s) {
      pedeCoord(s);
      if (!db.agenda) falha('A Agenda não está ligada.');
      return db.agenda.info();
    },

    definirAgenda: function (db, p, s, quem) {
      pedeCoord(s);
      var id = texto(p.agenda_id, 300);
      setConfig(db, 'agenda_id', id || 'principal');
      log(db, quem, 'Escolheu a agenda dos eventos', id || 'agenda principal da conta');
      return true;
    },

    historico: function (db, p, s) {
      pedeCoord(s);
      return { log: db.ultimos('log', 400), baixas: db.ultimos('baixas', 200) };
    }
  };

  function handle(db, acao, p) {
    p = p || {};
    if (!acoes[acao]) falha('Ação desconhecida.');
    var s = sessao(db, p.token);
    return acoes[acao](db, p, s, quemDe(p, s));
  }

  var TABELAS = {
    itens: ['id', 'nome', 'categoria', 'descricao', 'foto', 'qtd_total', 'ativo', 'criado_em'],
    eventos: ['id', 'nome', 'data', 'local', 'obs', 'prestadores', 'status', 'criado_por', 'criado_em', 'concluido_em', 'retorno_por',
      'hora_inicio', 'hora_fim', 'agenda_id', 'agenda_criado'],
    evento_itens: ['id', 'evento_id', 'item_id', 'item_nome', 'qtd_saida', 'qtd_retorno', 'justificativa'],
    baixas: ['id', 'item_id', 'item_nome', 'qtd', 'motivo', 'evento_id', 'por', 'em'],
    pessoas: ['id', 'nome', 'telefone', 'senha_hash', 'pode_inventario', 'ativo', 'criado_em', 'coordenador'],
    sessoes: ['id', 'pessoa_id', 'criado_em'],
    config: ['id', 'valor'],
    log: ['id', 'em', 'nome', 'telefone', 'acao', 'detalhe']
  };

  return { handle: handle, TABELAS: TABELAS, SENHA_MASTER_INICIAL: SENHA_MASTER_INICIAL };
})();
