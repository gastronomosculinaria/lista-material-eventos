// Regras do app de inventário. O mesmo código roda no Google Apps Script
// (versão real, dados na Planilha) e no navegador (versão de demonstração).
var CORE = (function () {
  var CATEGORIAS = ['Copos', 'Taças de vidro', 'Taças de cristal', 'Bandejas', 'Pratos', 'Talheres',
    'Equipamentos', 'Gás', 'Utensílios', 'Outros'];
  var SENHA_MASTER_INICIAL = 'trocar123';
  var GRUPOS = ['Material', 'Caixa de secos', 'Caixa de talher', 'Caixa de limpeza', 'Bebidas'];
  // Grupos de consumo: se voltar menos, a justificativa é opcional (o que faltou foi consumido).
  var CONSUMO = ['Caixa de limpeza', 'Bebidas', 'Caixa de secos'];
  // Motivos padronizados quando volta menos do que saiu (ou na baixa avulsa).
  var MOTIVOS = ['Quebrou', 'Sumiu / extraviado', 'Danificado (precisa de conserto)', 'Ficou com o cliente', 'Consumido', 'Outro'];
  var SUBGRUPOS = { Bebidas: ['Água', 'Refrigerantes', 'Cerveja', 'Sucos', 'Matte', 'Matte Zero', 'Matte Limão', 'Café', 'Chá', 'Leite'] };
  // Itens incluídos automaticamente uma única vez (pedidos pelo usuário).
  var PACOTES = [
    { id: 'bebidas-agua-2026-11-07', grupo: 'Bebidas', subgrupo: 'Água', itens: ['Galão de água 20 l', 'Água mineral sem gás (lata)',
      'Água mineral com gás (lata)', 'Água mineral sem gás (1,5 l)', 'Água mineral com gás (1,5 l)', 'Água mineral sem gás (500 ml)',
      'Água mineral com gás (500 ml)', 'Água mineral sem gás (em caixa)'] },
    { id: 'bebidas-cerveja-2026-11-07', grupo: 'Bebidas', subgrupo: 'Cerveja', itens: ['Cerveja Heineken', 'Cerveja Antarctica',
      'Cerveja Brahma', 'Cerveja Original', 'Cerveja Spaten', 'Cerveja Amstel', 'Cerveja Zero (sem álcool)'] },
    { id: 'bebidas-sucos-2026-11-07', grupo: 'Bebidas', subgrupo: 'Sucos', itens: ['Suco de uva', 'Suco de morango', 'Suco de laranja',
      'Suco de abacaxi com hortelã'] },
    // Listas das planilhas da equipe (Material para evento, Material de Cozinha, Lista Jessica)
    { id: "planilha-material-2026-11-07", grupo: "Material", subgrupo: "", itens: ["Abacaxi de cristal", "Altura de bandeja cobre", "Altura de bandeja madeira", "Altura de bandeja prata", "Avental", "Bandeja de prata retangular com alça", "Bandeja de prata renda bordada", "Bandeja de prata renda caracol", "Bandeja de ardosia", "Bandeja de bambu", "Bandeja de barro", "Bandeja de cobre", "Bandeja de cristal com pé", "Bandeja de cristal sem pé", "Bandeja de espelho", "Bandeja de garçom preta", "Bandeja de inox", "Bandeja de louça branca", "Bandeja de louça verde", "Bandeja de madeira", "Bandeja de madeira com vidro", "Bandeja de madeira preta", "Bandeja de melamina", "Bandeja de palha", "Bandeja de pedra sabão G", "Bandeja de pedra sabão M", "Bandeja de pedra sabão P", "Bandeja de porcelana", "Bandeja de prata", "Bandeja de prata com alça de latão", "Bandeja de prata concha oval", "Bandeja de prata oval com alça", "Bandeja de prata quiche", "Bandeja de prata rebda", "Bandeja de prata terrine com madeira", "Bandeja de prato com espelho", "Bandeja de vidro colorida", "Bandeja de vidro P", "Bandeja de vidro preta", "Bandeja de vidro redonda", "Bandeja de vime", "Bandeja infantil", "Bool de barro", "Bool de cristal G", "Garfinho de mini comidinha", "Garfo de mesa", "Garfo de peixe", "Garfo de serviço", "Garfo de sobremesa", "Garfo prata", "Garfos de petisco prata", "Garrafa de café", "Gravatas", "Jarra de cristal", "Lenço", "Malheira triangular prata", "Mini garfo", "Mini jarra de cristal", "Mini pratos", "Molheira de cobre com pé", "Paejeira com pé de cobre", "Panela bordada prata", "Panela de barro G", "Panela de barro M", "Panela de barro P", "Panela de cobre com pé", "Panela de pedra sabão G", "Panela de pedra sabão M", "Panela de pedra sabão P", "Panelinha de cobre canapé", "Panelinha sem tampa prata", "Pegador de massa prata", "Pegador de salada prata", "Pegadores G", "Pegadores M", "Pegadores P", "Pranchão", "Prato de brunch", "Prato de massa", "Prato de mesa", "Prato de pão", "Prato de pedra sabão", "Prato de sobremesa", "Prato folha", "Prato quadrado", "Ramequinho azul", "Ramequinho canelado", "Ramequinho canoa", "Ramequinho concha", "Bool de cristal M", "Bool de cristal P", "Bool de louça", "Bool de pedra sabão G", "Bool de pedra sabão M", "Bool de pedra sabão P", "Bool de sobremesa vidro", "Bool para café", "Bool para molho", "Castiçal", "Castiçal duplo", "Cesta de palha", "Cestinha richaud prata", "Colher concha prata", "Colher de arroz", "Colher de café", "Colher de chá", "Colher de mesa", "Colher de prata arroz", "Colher de serviço", "Colher de sobremesa", "Colher de sopa", "Concha G prata", "Concha M prata", "Concha P prata", "Copinho de bolinha", "Copinho de cachaça", "Copinho de caldo", "Copo de whisky", "Copo tubo", "Copos de bar", "Copos tubinho", "Dolma", "Espatula de bolo", "Espatula de bolo prata", "Espatula M", "Espatula P", "Estante de madeira", "Faca de mesa", "Faca de peixe", "Faca de serviço", "Faca de sobremesa", "Frigideira de cobre canapé", "Garfinho 3 dentes", "Ramequinho de massa", "Ramequinho panelinha quadrada", "Ramequinho preto canapé", "Ramequinho quadrado canapé", "Ramequinho redondo canapé", "Ramequinho redondo comidinha", "Ramequinho tigela", "Richard barro", "Richard inox", "Richard pedra sabão", "Richard pirex", "Richard prata", "Richaud chapa com alça bordada", "Richaud chapa liza 2 fogareiro", "Richaud panela prata com madeira", "Saladeira prata", "Saladeira prata com alcça de madeira", "Salva com alçca prata", "Salva M prata", "Salva oitavada prata", "Salva P prata", "Samovar", "Suqueira G", "Suqueira P", "Taça de água", "Taça de cerveja", "Taça de espumante", "Taça de margarita", "Taça de martini", "Taça de martini P", "Taça de vinho branco", "Taça de vinho tinto", "Tacinha de licor", "Talher de peixe prata( par)", "Travessa de barro G", "Travessa de barro M", "Travessa de barro P", "Travessa de pedra sabão M", "Travessa de pedra sabão P", "Tronco com pé", "Tronco de madeira", "Xicara de café", "Xicara de chá"] },
    { id: "planilha-cozinha-2026-11-07", grupo: "Material", subgrupo: "Cozinha", itens: ["Butijão de gás", "Caixa branca", "Caixa preta G", "Caixa preta M", "Caixa preta P", "Caixa térmica azul", "Carrinho", "Chapa", "Cooler", "Estufa", "Fogareiro", "Forno", "Fritadeira", "Galão de água", "Grade vasada", "Isopor", "Lixeira", "Microondas", "Mini caixa preta", "Pá", "Paletes", "Rodo", "Tina", "Vassoura", "Bandeja de apoio", "Caixa de limpeza", "Caixa de secos", "Caixa de talher", "Cesto de fritura", "Galão de suco", "Jarras de apoio", "Panela de cozinha", "Pano de limpeza", "Peneira", "Tabua de carne", "Tabuleiros", "Toalha de apoio"] },
    { id: "planilha-talher-2026-11-07", grupo: "Caixa de talher", subgrupo: "", itens: ["Colheres grandes", "Espátulas", "Saco de confeiteiro", "Bico de confeiteiro", "Ralador", "Peneira", "Garfos pequenos", "Facas pequenas", "Colheres pequenas", "Pegadores"] },
    { id: "planilha-cafe-2026-11-07", grupo: "Caixa de secos", subgrupo: "Café", itens: ["Açúcar", "Adoçante liquido", "Adoçante sachê", "Grão de café decoração", "Chá - quando tiver mesa de chá e café"] },
    { id: "planilha-limpeza-2026-11-07", grupo: "Caixa de limpeza", subgrupo: "", itens: ["Plástico filme", "Perfex", "Pano de limpeza", "Papel toalha", "Saco de lixo", "Alcool", "Detergente", "Guardanapo", "Jarras de apoio", "Sabão em pasta", "Esponja", "Bombril", "Touca + Luva", "Palitos quando for stick", "Bombonas azuis"] }
  ];
  function aplicarPacotes(db) {
    var feitos = json(getConfig(db, 'pacotes'), []), mudou = false;
    if (PACOTES.every(function (pc) { return feitos.indexOf(pc.id) >= 0; })) return;
    if (db.travar) { db.travar(); if (db.esquecer) db.esquecer('config'); feitos = json(getConfig(db, 'pacotes'), []); }
    PACOTES.forEach(function (pc) {
      if (feitos.indexOf(pc.id) >= 0) return;
      var existentes = {};
      db.all('itens').forEach(function (i) { if (sim(i.ativo)) existentes[String(i.nome).trim().toLowerCase()] = true; });
      var novos = pc.itens.filter(function (n) { return !existentes[n.toLowerCase()]; }).map(function (n) {
        return { id: uid(), nome: n, categoria: pc.subgrupo || pc.grupo, descricao: '', foto: '', grupo: pc.grupo, subgrupo: pc.subgrupo, qtd_total: '0', ativo: 'sim', criado_em: agora() };
      });
      if (novos.length) {
        if (db.insertMany) db.insertMany('itens', novos); else novos.forEach(function (n) { db.insert('itens', n); });
        log(db, { nome: 'Sistema', telefone: '' }, 'Incluiu itens sugeridos', pc.grupo + (pc.subgrupo ? ' / ' + pc.subgrupo : '') + ': ' + novos.map(function (n) { return n.nome; }).join(', '));
      }
      feitos.push(pc.id); mudou = true;
    });
    if (mudou) setConfig(db, 'pacotes', JSON.stringify(feitos));
  }
  function mapaSubgrupos(db, itens) {
    var m = {}, extra = json(getConfig(db, 'subgrupos'), {});
    Object.keys(SUBGRUPOS).forEach(function (g) { m[g] = SUBGRUPOS[g].slice(); });
    Object.keys(extra).forEach(function (g) { m[g] = m[g] || []; extra[g].forEach(function (x) { if (m[g].indexOf(x) < 0) m[g].push(x); }); });
    itens.forEach(function (i) { var g = grupoDe(i); if (i.subgrupo) { m[g] = m[g] || []; if (m[g].indexOf(i.subgrupo) < 0) m[g].push(i.subgrupo); } });
    return m;
  }
  function grupoDe(i) { return i.grupo || 'Material'; }
  function listaGrupos(db, itens) {
    var g = GRUPOS.slice();
    json(getConfig(db, 'grupos'), []).forEach(function (x) { if (g.indexOf(x) < 0) g.push(x); });
    itens.forEach(function (i) { var x = grupoDe(i); if (g.indexOf(x) < 0) g.push(x); });
    return g;
  }

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

  // Quanto de cada item está comprometido em eventos ainda não concluídos (qualquer data).
  function reservas(db, exceto) {
    var ativos = {};
    db.all('eventos').forEach(function (e) { if (e.status !== 'concluido' && e.id !== exceto) ativos[e.id] = true; });
    var r = {};
    db.all('evento_itens').forEach(function (l) { if (ativos[l.evento_id]) r[l.item_id] = (r[l.item_id] || 0) + num(l.qtd_saida); });
    return r;
  }
  // O que conflita com um evento: material que já saiu (em outro evento) ou que está separado
  // para outro evento na MESMA data. Devolve { item_id: { qtd, eventos: [nomes] } }.
  function comprometido(db, ev) {
    var conf = {};
    db.all('eventos').forEach(function (y) {
      if (y.status === 'concluido' || (ev && y.id === ev.id)) return;
      if (y.status === 'em_evento' || (ev && ev.data && y.data === ev.data)) conf[y.id] = y;
    });
    var r = {};
    db.all('evento_itens').forEach(function (l) {
      var y = conf[l.evento_id]; if (!y) return;
      var x = r[l.item_id] || (r[l.item_id] = { qtd: 0, eventos: [] });
      x.qtd += num(l.qtd_saida); if (x.eventos.indexOf(y.nome) < 0) x.eventos.push(y.nome);
    });
    return r;
  }
  // Material fora do depósito agora (eventos com saída confirmada).
  function foraDoDeposito(db) {
    var fora = {}, r = {};
    db.all('eventos').forEach(function (e) { if (e.status === 'em_evento') fora[e.id] = true; });
    db.all('evento_itens').forEach(function (l) { if (fora[l.evento_id]) r[l.item_id] = (r[l.item_id] || 0) + num(l.qtd_saida); });
    return r;
  }
  function nomeItem(it) { return it ? it.nome + (it.numero ? ' nº ' + it.numero : '') : ''; }
  function confere(db, ev, linhas, itens) {
    var comp = comprometido(db, ev);
    linhas.forEach(function (l) {
      var it = porId(itens, l.item_id); if (!it) return;
      var total = num(it.qtd_total); if (total <= 0) return; // estoque não contado: sem limite
      var c = comp[it.id] || { qtd: 0, eventos: [] }, disp = Math.max(0, total - c.qtd), q = num(l.qtd != null ? l.qtd : l.qtd_saida);
      if (q > disp) falha(disp ? 'Só há ' + disp + ' livres de "' + nomeItem(it) + '" para esta data. O resto está em: ' + c.eventos.join(', ') + '.'
        : '"' + nomeItem(it) + '" já está reservado para ' + c.eventos.join(', ') + (it.tipo === 'equipamento' ? '' : ' (todas as ' + total + ' unidades)') + '.');
    });
  }
  function semCochete(nome) { return texto(String(nome || '').replace(/\s*\[.*\]\s*$/, ''), 80).toLowerCase(); }
  function conferente(p, quem) {
    var c = texto(p.conferido, 80);
    if (!c) falha('Informe quem conferiu o material junto com você.');
    if (c.toLowerCase() === semCochete(quem.nome)) falha('A conferência precisa ser feita por outra pessoa, não por quem separou.');
    return c;
  }
  function moeda(v) { return 'R$ ' + (Math.round(v * 100) / 100).toFixed(2).replace('.', ','); }

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
      aplicarPacotes(db);
      var fora = foraDoDeposito(db);
      var itens = db.all('itens').filter(function (i) { return sim(i.ativo); }).map(function (i) {
        var total = num(i.qtd_total);
        return { id: i.id, nome: i.nome, categoria: i.categoria, descricao: i.descricao, foto: i.foto, grupo: grupoDe(i), subgrupo: i.subgrupo || '',
          tipo: i.tipo || '', numero: i.numero || '', custo: num(i.custo),
          qtd_total: total, fora: fora[i.id] || 0, disponivel: total - (fora[i.id] || 0) };
      });
      var linhas = db.all('evento_itens');
      var eventos = db.all('eventos').map(function (e) {
        return { id: e.id, nome: e.nome, data: e.data, local: e.local, status: e.status, obs: e.obs,
          hora_inicio: e.hora_inicio || '', hora_fim: e.hora_fim || '', na_agenda: !!e.agenda_id,
          prestadores: json(e.prestadores, []), criado_por: e.criado_por, concluido_em: e.concluido_em,
          retorno_por: e.retorno_por, separado_por: e.separado_por || '', conferido_saida: e.conferido_saida || '', conferido_retorno: e.conferido_retorno || '',
          linhas: linhas.filter(function (l) { return l.evento_id === e.id; }).map(function (l) {
            return { item_id: l.item_id, nome: l.item_nome, qtd_saida: num(l.qtd_saida),
              qtd_retorno: l.qtd_retorno === '' || l.qtd_retorno == null ? null : num(l.qtd_retorno),
              justificativa: l.justificativa, motivo: l.motivo || '' };
          }) };
      });
      var out = { itens: itens, eventos: eventos, sessao: s, categorias: CATEGORIAS, agenda: !!db.agenda, grupos: listaGrupos(db, itens), subgrupos: mapaSubgrupos(db, itens), consumo: CONSUMO, motivos: MOTIVOS,
        ultimaContagem: json(getConfig(db, 'ultima_contagem'), null) };
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
      var equip = it.tipo === 'equipamento';
      var dados = { nome: nome, categoria: texto(it.categoria, 60) || 'Outros', descricao: texto(it.descricao, 500), grupo: texto(it.grupo, 60) || 'Material', subgrupo: texto(it.subgrupo, 60),
        tipo: equip ? 'equipamento' : '', numero: equip ? texto(it.numero, 20) : '', custo: it.custo === '' || it.custo == null ? '' : String(Math.max(0, num(it.custo))),
        qtd_total: equip ? '1' : String(Math.max(0, Math.round(num(it.qtd_total)))) };
      if (it.fotoNova) dados.foto = db.salvarFoto(it.fotoNova, nome);
      var todos = db.all('itens').filter(function (x) { return sim(x.ativo); });
      function numeroUsado(n, exceto) {
        return todos.some(function (x) { return x.id !== exceto && x.tipo === 'equipamento' && x.nome.toLowerCase() === nome.toLowerCase() && String(x.numero) === String(n); });
      }
      if (it.id) {
        var antes = porId(db.all('itens'), it.id);
        if (!antes) falha('Item não encontrado.');
        if (equip && dados.numero && numeroUsado(dados.numero, it.id)) falha('Já existe "' + nome + '" com o número ' + dados.numero + '.');
        db.update('itens', it.id, dados);
        var mud = [];
        ['nome', 'numero', 'grupo', 'subgrupo', 'categoria', 'descricao', 'qtd_total', 'custo'].forEach(function (k) {
          if (String(antes[k] || '') !== String(dados[k] || '')) mud.push(k + ': "' + (antes[k] || '') + '" → "' + dados[k] + '"');
        });
        if (dados.foto) mud.push('nova foto');
        log(db, quem, 'Editou item do inventário', nomeItem(dados) + (mud.length ? ' (' + mud.join('; ') + ')' : ''));
        return { id: it.id };
      }
      dados.ativo = 'sim'; dados.criado_em = agora(); dados.foto = dados.foto || '';
      if (!equip) {
        dados.id = uid(); db.insert('itens', dados);
        log(db, quem, 'Incluiu item no inventário', nome + ' (' + dados.qtd_total + ' un., ' + dados.categoria + ')');
        return { id: dados.id };
      }
      // equipamento: uma linha por unidade, cada uma com seu número
      var n = Math.min(50, Math.max(1, Math.round(num(it.unidades) || 1)));
      var maior = 0;
      todos.forEach(function (x) { if (x.tipo === 'equipamento' && x.nome.toLowerCase() === nome.toLowerCase()) maior = Math.max(maior, Math.round(num(x.numero))); });
      var ini = dados.numero ? Math.round(num(dados.numero)) : maior + 1;
      var novos = [], k = ini;
      while (novos.length < n) {
        var rotulo = dados.numero && n === 1 ? dados.numero : (k < 10 ? '0' + k : String(k));
        if (!numeroUsado(rotulo)) novos.push(Object.assign({}, dados, { id: uid(), numero: rotulo }));
        else if (n === 1 && dados.numero) falha('Já existe "' + nome + '" com o número ' + rotulo + '.');
        k++;
      }
      if (db.insertMany) db.insertMany('itens', novos); else novos.forEach(function (x) { db.insert('itens', x); });
      log(db, quem, 'Incluiu equipamento no inventário', nome + ' nº ' + novos.map(function (x) { return x.numero; }).join(', '));
      return { id: novos[0].id, criados: novos.length };
    },

    salvarVarios: function (db, p, s, quem) {
      pedeInventario(s);
      var grupo = texto(p.grupo, 60) || 'Material', cat = texto(p.categoria, 60) || 'Outros', sub = texto(p.subgrupo, 60);
      var existentes = {};
      db.all('itens').forEach(function (i) { if (sim(i.ativo)) existentes[String(i.nome).trim().toLowerCase()] = true; });
      var novos = [], repetidos = 0;
      String(p.texto || '').split(/\r?\n/).forEach(function (linha) {
        var partes = linha.split(/\t|;/);
        var nome = texto(partes[0], 120).replace(/\s+/g, ' ');
        if (!nome) return;
        var k = nome.toLowerCase();
        if (existentes[k]) { repetidos++; return; }
        existentes[k] = true;
        var q = Math.max(0, Math.round(num(partes[1] || 0)));
        novos.push({ id: uid(), nome: nome.charAt(0).toUpperCase() + nome.slice(1), categoria: cat, descricao: '', foto: '', grupo: grupo, subgrupo: sub,
          qtd_total: String(q), ativo: 'sim', criado_em: agora() });
      });
      if (!novos.length) falha(repetidos ? 'Todos esses itens já estão cadastrados.' : 'Cole pelo menos um nome de item.');
      if (novos.length > 300) falha('Cole no máximo 300 itens por vez.');
      if (db.insertMany) db.insertMany('itens', novos); else novos.forEach(function (n) { db.insert('itens', n); });
      log(db, quem, 'Incluiu vários itens no inventário', novos.length + ' itens no grupo ' + grupo + ': ' + novos.map(function (n) { return n.nome; }).join(', '));
      return { incluidos: novos.length, repetidos: repetidos };
    },

    moverItens: function (db, p, s, quem) {
      pedeInventario(s);
      var grupo = texto(p.grupo, 60), sub = texto(p.subgrupo, 60);
      if (!grupo) falha('Escolha o grupo.');
      var itens = db.all('itens'), nomes = [];
      (p.ids || []).forEach(function (id) {
        var it = porId(itens, id);
        if (it && (grupoDe(it) !== grupo || (it.subgrupo || '') !== sub)) { db.update('itens', id, { grupo: grupo, subgrupo: sub }); nomes.push(it.nome); }
      });
      if (nomes.length) log(db, quem, 'Mudou itens de grupo', nomes.join(', ') + ' → ' + grupo + (sub ? ' / ' + sub : ''));
      return true;
    },

    criarGrupo: function (db, p, s, quem) {
      pedeInventario(s);
      var g = texto(p.grupo, 60), sub = texto(p.subgrupo, 60);
      if (!g) falha('Dê um nome ao grupo.');
      if (sub) {
        var mapa = json(getConfig(db, 'subgrupos'), {});
        mapa[g] = mapa[g] || [];
        if (mapa[g].indexOf(sub) < 0 && (SUBGRUPOS[g] || []).indexOf(sub) < 0) { mapa[g].push(sub); setConfig(db, 'subgrupos', JSON.stringify(mapa)); log(db, quem, 'Criou subtítulo', g + ' / ' + sub); }
      }
      var lista = json(getConfig(db, 'grupos'), []);
      if (lista.indexOf(g) < 0 && GRUPOS.indexOf(g) < 0) { lista.push(g); setConfig(db, 'grupos', JSON.stringify(lista)); log(db, quem, 'Criou grupo', g); }
      return true;
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
      var tipoM = MOTIVOS.indexOf(p.tipo_motivo) >= 0 ? p.tipo_motivo : '', det = texto(p.motivo, 300);
      if (q <= 0) falha('Informe a quantidade a dar baixa.');
      if (!tipoM && !det) falha('Escolha o motivo da baixa.');
      if (tipoM === 'Outro' && !det) falha('Explique o motivo em poucas palavras.');
      var motivo = tipoM ? tipoM + (det ? ' — ' + det : '') : det;
      if (q > num(it.qtd_total)) falha('A baixa é maior que o total cadastrado (' + it.qtd_total + ').');
      db.update('itens', it.id, { qtd_total: String(num(it.qtd_total) - q) });
      db.insert('baixas', { id: uid(), item_id: it.id, item_nome: nomeItem(it), qtd: String(q), motivo: motivo,
        evento_id: '', por: quem.nome + ' ' + quem.telefone, em: agora(), custo: num(it.custo) ? String(q * num(it.custo)) : '' });
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
      var itens = db.all('itens');
      var novas = [];
      (p.linhas || []).forEach(function (l) {
        var q = Math.round(num(l.qtd));
        if (q <= 0) return;
        var it = porId(itens, l.item_id);
        if (!it) return;
        if (it.tipo === 'equipamento') q = 1;
        novas.push({ id: uid(), evento_id: ev.id, item_id: it.id, item_nome: nomeItem(it), qtd_saida: String(q),
          qtd_retorno: '', justificativa: '', motivo: '' });
      });
      confere(db, ev, novas, itens);
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
      var minhas = db.all('evento_itens').filter(function (l) { return l.evento_id === ev.id; });
      if (!minhas.length) falha('A lista de material está vazia.');
      var conf = conferente(p, quem);
      confere(db, ev, minhas, db.all('itens'));
      db.update('eventos', ev.id, { status: 'em_evento', separado_por: texto(p.who && p.who.nome, 80), conferido_saida: conf });
      log(db, quem, 'Fechou a lista e liberou a saída', ev.nome + ' — separado por ' + texto(p.who && p.who.nome, 80) + ', conferido por ' + conf);
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
      var resumo = [], faltas = [], todosItens = db.all('itens'), confRet = conferente(p, quem), custoTotal = 0;
      linhas.forEach(function (l) {
        var itl = porId(todosItens, l.item_id), consumo = itl && CONSUMO.indexOf(grupoDe(itl)) >= 0;
        var e = envio[l.item_id];
        if (!e || e.qtd === '' || e.qtd == null) falha('Informe quantos voltaram de "' + l.item_nome + '".');
        var q = Math.max(0, Math.round(num(e.qtd)));
        var saiu = num(l.qtd_saida);
        if (q > saiu) falha('"' + l.item_nome + '": voltaram mais (' + q + ') do que saíram (' + saiu + ').');
        var just = texto(e.justificativa, 500), mot = MOTIVOS.indexOf(e.motivo) >= 0 ? e.motivo : '';
        if (q < saiu) {
          if (!mot && consumo) mot = 'Consumido';
          if (!mot && just) mot = 'Outro';
          if (!mot) falha('Escolha o motivo da falta de "' + l.item_nome + '".');
          if (mot === 'Outro' && !just) falha('Explique em poucas palavras o que aconteceu com "' + l.item_nome + '".');
        } else { mot = ''; just = ''; }
        db.update('evento_itens', l.id, { qtd_retorno: String(q), justificativa: just, motivo: mot });
        resumo.push(q + '/' + saiu + ' ' + l.item_nome);
        if (q < saiu) {
          var custo = itl ? num(itl.custo) * (saiu - q) : 0; custoTotal += custo;
          faltas.push({ l: l, falta: saiu - q, just: mot + (just ? ' — ' + just : ''), custo: custo });
        }
      });
      var itens = db.all('itens');
      faltas.forEach(function (f) {
        var it = porId(itens, f.l.item_id);
        if (it) db.update('itens', it.id, { qtd_total: String(Math.max(0, num(it.qtd_total) - f.falta)) });
        db.insert('baixas', { id: uid(), item_id: f.l.item_id, item_nome: f.l.item_nome, qtd: String(f.falta),
          motivo: 'Evento ' + ev.nome + ': ' + f.just, evento_id: ev.id, por: quem.nome + ' ' + quem.telefone, em: agora(), custo: f.custo ? String(f.custo) : '' });
      });
      db.update('eventos', ev.id, { status: 'concluido', concluido_em: agora(), retorno_por: quem.nome + ' ' + quem.telefone, conferido_retorno: confRet });
      log(db, quem, 'Registrou retorno do material', ev.nome + ': ' + resumo.join(', ') +
        (faltas.length ? ' | Faltas: ' + faltas.map(function (f) { return f.falta + ' × ' + f.l.item_nome + ' (' + f.just + ')'; }).join('; ') : '') +
        (custoTotal ? ' | Custo das perdas: ' + moeda(custoTotal) : '') + ' | Conferido por ' + confRet);
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

    salvarContagem: function (db, p, s, quem) {
      pedeEquipe(s);
      var ajustar = !!p.ajustar;
      if (ajustar) pedeInventario(s);
      var itens = db.all('itens'), fora = foraDoDeposito(db), em = agora(), regs = [], difs = [], porNome = quem.nome + ' ' + quem.telefone;
      (p.linhas || []).forEach(function (l) {
        var it = porId(itens, l.item_id);
        if (!it || !sim(it.ativo) || l.contado === '' || l.contado == null) return;
        var contado = Math.max(0, Math.round(num(l.contado)));
        var esperado = Math.max(0, num(it.qtd_total) - (fora[it.id] || 0)), dif = contado - esperado;
        regs.push({ id: uid(), em: em, por: porNome, item_id: it.id, item_nome: nomeItem(it), sistema: String(esperado), contado: String(contado),
          diferenca: String(dif), ajustado: ajustar && dif ? 'sim' : 'nao' });
        if (dif) difs.push({ it: it, dif: dif, esperado: esperado, contado: contado });
      });
      if (!regs.length) falha('Digite a quantidade contada de pelo menos um item.');
      if (db.insertMany) db.insertMany('contagens', regs); else regs.forEach(function (r) { db.insert('contagens', r); });
      if (ajustar) difs.forEach(function (d) {
        db.update('itens', d.it.id, { qtd_total: String(Math.max(0, num(d.it.qtd_total) + d.dif)) });
        if (d.dif < 0) db.insert('baixas', { id: uid(), item_id: d.it.id, item_nome: nomeItem(d.it), qtd: String(-d.dif), motivo: 'Contagem física: faltaram ' + (-d.dif),
          evento_id: '', por: porNome, em: em, custo: num(d.it.custo) ? String(-d.dif * num(d.it.custo)) : '' });
      });
      setConfig(db, 'ultima_contagem', JSON.stringify({ em: em, por: texto(p.who && p.who.nome, 80), itens: regs.length, diferencas: difs.length }));
      log(db, quem, ajustar ? 'Fez contagem física e corrigiu o estoque' : 'Fez contagem física', regs.length + ' itens contados, ' + difs.length + ' com diferença' +
        (difs.length ? ': ' + difs.slice(0, 40).map(function (d) { return nomeItem(d.it) + ' (sistema ' + d.esperado + ', contado ' + d.contado + ')'; }).join('; ') : ''));
      return { contados: regs.length, diferencas: difs.map(function (d) { return { nome: nomeItem(d.it), esperado: d.esperado, contado: d.contado, dif: d.dif }; }) };
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
    itens: ['id', 'nome', 'categoria', 'descricao', 'foto', 'qtd_total', 'ativo', 'criado_em', 'grupo', 'subgrupo', 'tipo', 'numero', 'custo'],
    eventos: ['id', 'nome', 'data', 'local', 'obs', 'prestadores', 'status', 'criado_por', 'criado_em', 'concluido_em', 'retorno_por',
      'hora_inicio', 'hora_fim', 'agenda_id', 'agenda_criado', 'separado_por', 'conferido_saida', 'conferido_retorno'],
    evento_itens: ['id', 'evento_id', 'item_id', 'item_nome', 'qtd_saida', 'qtd_retorno', 'justificativa', 'motivo'],
    baixas: ['id', 'item_id', 'item_nome', 'qtd', 'motivo', 'evento_id', 'por', 'em', 'custo'],
    contagens: ['id', 'em', 'por', 'item_id', 'item_nome', 'sistema', 'contado', 'diferenca', 'ajustado'],
    pessoas: ['id', 'nome', 'telefone', 'senha_hash', 'pode_inventario', 'ativo', 'criado_em', 'coordenador'],
    sessoes: ['id', 'pessoa_id', 'criado_em'],
    config: ['id', 'valor'],
    log: ['id', 'em', 'nome', 'telefone', 'acao', 'detalhe']
  };

  return { handle: handle, TABELAS: TABELAS, SENHA_MASTER_INICIAL: SENHA_MASTER_INICIAL };
})();

// ---- Google Apps Script: dados na Planilha, fotos no Google Drive ----

function doGetApp_(e) {
  if (e && e.parameter && e.parameter.acao) return apiRemoto_(e.parameter);
  var out = HtmlService.createHtmlOutput(APP_HTML)
    .setTitle('Gastrônomos: Material de Eventos')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  try { out.setFaviconUrl('https://raw.githubusercontent.com/gastronomosculinaria/lista-material-eventos/main/marca/icone-64.png'); } catch (e) {}
  return out;
}

// Rode esta função uma vez pelo editor (botão Executar) para criar as abas.
function configurarApp_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(CORE.TABELAS).forEach(function (nome) { abaDe_(ss, nome); });
  pastaFotos_();
  CalendarApp.getDefaultCalendar(); // pede permissão para usar a Agenda
  return 'Pronto. Agora publique: Implantar > Nova implantação > App da Web.';
}

// Leituras não esperam na fila; ações que gravam usam a trava e já devolvem os dados atualizados
// (estado), poupando uma segunda ida ao servidor.
var LEITURAS_ = { carregar: 1, listarAgenda: 1, infoAgenda: 1, historico: 1 };
var SEM_ESTADO_ = { entrar: 1, login: 1, sair: 1 };
function apiApp_(acao, payload) {
  var lock = LockService.getScriptLock(), travado = false;
  function travar() { if (!travado) { lock.waitLock(20000); travado = true; } }
  try {
    var leitura = !!LEITURAS_[acao];
    if (!leitura) travar();
    // Sinal ruim: o celular pode reenviar o mesmo pedido. O código do pedido (rid) evita gravar duas vezes.
    var rid = !leitura && payload && payload.rid ? 'rid_' + String(payload.rid).slice(0, 40) : '', cache = CacheService.getScriptCache();
    if (rid) { var ja = cache.get(rid); if (ja) return JSON.parse(ja); }
    var db = novoDb_(); db.travar = travar;
    var r = { ok: true, data: CORE.handle(db, acao, payload) };
    if (rid) try { cache.put(rid, JSON.stringify({ ok: true, data: r.data }), 1800); } catch (e) {}
    if (!leitura && !SEM_ESTADO_[acao]) {
      try { var db2 = novoDb_(); db2.travar = travar; r.estado = CORE.handle(db2, 'carregar', payload); } catch (e) {}
    }
    return r;
  } catch (e) {
    return { ok: false, erro: e && e.message ? e.message : String(e) };
  } finally {
    if (travado) try { lock.releaseLock(); } catch (e) {}
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
    esquecer: function (t) { delete cache[t]; },
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

// ---- Acesso pela página de entrada (GitHub Pages): mesmas ações, via GET anônimo ----
// Assim o app abre mesmo em celulares com várias contas Google conectadas.
// Pedidos grandes (fotos, listas longas) chegam em partes guardadas no cache por 10 minutos.
function apiRemoto_(q) {
  var r;
  try {
    var cache = CacheService.getScriptCache();
    if (q.acao === '_parte') {
      if (!/^[\w-]{8,40}$/.test(q.id || '') || !/^\d{1,3}$/.test(q.i || '')) throw new Error('Parte inválida.');
      cache.put('up_' + q.id + '_' + q.i, String(q.d || ''), 600);
      r = { ok: true, data: null };
    } else {
      var txt = q.p || '{}', m = /^up:([\w-]{8,40}):(\d{1,3})$/.exec(txt);
      if (m) {
        var chaves = [];
        for (var i = 0; i < +m[2]; i++) chaves.push('up_' + m[1] + '_' + i);
        var got = cache.getAll(chaves); txt = '';
        for (var j = 0; j < chaves.length; j++) {
          if (got[chaves[j]] == null) throw new Error('A conexão falhou no meio do envio. Tente de novo.');
          txt += got[chaves[j]];
        }
        cache.removeAll(chaves);
      }
      var fn = typeof apiApp_ === 'function' ? apiApp_ : api;
      r = fn(q.acao, JSON.parse(txt));
    }
  } catch (e) {
    r = { ok: false, erro: e && e.message ? e.message : String(e) };
  }
  return ContentService.createTextOutput(JSON.stringify(r)).setMimeType(ContentService.MimeType.JSON);
}
