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
  // Itens excluídos por engano que o usuário pediu de volta (uma vez).
  var RESTAURAR = [{ id: 'restaurar-abacaxi-2026-11-10', nome: 'Abacaxi de cristal', grupo: 'Material' }];
  function aplicarPacotes(db) {
    var feitos = json(getConfig(db, 'pacotes'), []), mudou = false;
    if (PACOTES.concat(RESTAURAR).every(function (pc) { return feitos.indexOf(pc.id) >= 0; })) return;
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
    RESTAURAR.forEach(function (r) {
      if (feitos.indexOf(r.id) >= 0) return;
      var mesmos = db.all('itens').filter(function (i) { return String(i.nome).trim().toLowerCase() === r.nome.toLowerCase(); });
      if (!mesmos.some(function (i) { return sim(i.ativo); })) {
        var ult = mesmos[mesmos.length - 1];
        if (ult) db.update('itens', ult.id, { ativo: 'sim' });
        else db.insert('itens', { id: uid(), nome: r.nome, categoria: r.grupo, descricao: '', foto: '', grupo: r.grupo, subgrupo: '', qtd_total: '0', ativo: 'sim', criado_em: agora() });
        log(db, { nome: 'Sistema', telefone: '' }, 'Devolveu item ao inventário', r.nome + ' (pedido da coordenação)');
      }
      feitos.push(r.id); mudou = true;
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
    if (String(s.pessoa_id).indexOf('ev:') === 0) {
      var ev = porId(db.all('eventos'), s.pessoa_id.slice(3));
      if (!ev || !naLista(ev, s.nome)) return null;
      if (ev.status === 'concluido' && Date.now() - new Date(ev.concluido_em).getTime() > 3 * 86400000) return null;
      var pq = naLista(ev, s.nome), eqx = pq.id ? porId(db.all('equipe'), pq.id) : null;
      if (eqx && eqx.bloqueado === 'sim') return null;
      return { papel: 'prestador', evento_id: ev.id, nome: s.nome, telefone: s.telefone || '', coord: !!naLista(ev, s.nome).coord };
    }
    if (s.pessoa_id === 'master') return { papel: 'master', nome: 'Master', inventario: true, equipe: true, escala: true, estoque: true };
    var p = porId(db.all('pessoas'), s.pessoa_id);
    if (!p || !sim(p.ativo)) return null;
    if (sim(p.coordenador)) return { papel: 'master', nome: p.nome, id: p.id, inventario: true, equipe: true, escala: true, estoque: true };
    var est = p.estoque !== 'nao';
    // Estoquista: inventário geral, grupos, itens, separação, retorno e contagem (2026-11-10).
    // Coordenação da equipe (2026-11-10): cadastro da equipe e escala; lista de material só se o Master autorizar (separa).
    return { papel: est ? 'estoquista' : 'escala', nome: p.nome, id: p.id, inventario: est, equipe: true, escala: sim(p.escala), estoque: est, separa: est || sim(p.separa) };
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
    if (c.toLowerCase() === semCochete(quem.nome) || p.sozinho) return texto(String(quem.nome || '').replace(/\s*\[.*\]\s*$/, ''), 60) + ' (conferiu sozinho)';
    return c;
  }
  function moeda(v) { return 'R$ ' + (Math.round(v * 100) / 100).toFixed(2).replace('.', ','); }

  function pedeEquipe(s) { if (!s) falha('Entre com sua senha na Área da equipe para fazer isso.'); }
  function pedeInventario(s) { pedeEquipe(s); if (!s.inventario) falha('Sua senha não tem permissão para alterar o inventário. Peça ao Master.'); }
  function pedeEstoque(s) { pedeEquipe(s); if (!s.estoque) falha('Sua senha é só da escala. O estoque fica com os estoquistas.'); }
  function pedeEscala(s) { pedeEquipe(s); if (!s.escala) falha('Só quem monta a escala (ou o Master) pode mexer na equipe dos eventos.'); }
  // Prazo para confirmar a escala: a terça-feira que fecha a semana do evento (semana de quarta a terça).
  function prazoEscala(data) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(data || ''); if (!m) return '';
    var d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
    d.setUTCDate(d.getUTCDate() + ((2 - d.getUTCDay() + 7) % 7));
    return d.toISOString().slice(0, 10);
  }
  // Nome da semana como no Montador de Escala: quarta a terça, "dd.mm a dd.mm.aaaa".
  function semanaEscala(data) {
    var fim = prazoEscala(data); if (!fim) return '';
    var f = new Date(fim + 'T00:00:00Z'), i = new Date(f.getTime() - 6 * 86400000);
    function dm(d) { return ('0' + d.getUTCDate()).slice(-2) + '.' + ('0' + (d.getUTCMonth() + 1)).slice(-2); }
    return dm(i) + ' a ' + dm(f) + '.' + f.getUTCFullYear();
  }
  function pedeCoord(s) { pedeEquipe(s); if (s.papel !== 'master') falha('Só o Master pode fazer isso.'); }
  // Lista de material de um evento: estoque/Master ou o coordenador (maître) marcado nesse evento.
  function pedeLista(s, conv, evId) {
    if (s && (s.estoque || s.separa)) return;
    if (s) falha('Separar material só com autorização do Master.');
    if (conv && conv.coord && conv.evento_id === evId) return;
    falha('Só o estoque ou o coordenador deste evento pode mexer na lista de material.');
  }

  function quemDe(p, s) {
    var q = { nome: texto(p.who && p.who.nome, 80), telefone: texto(p.who && p.who.telefone, 30) };
    if (s) q.nome = q.nome + ' [' + (s.papel === 'master' ? 'master' + (s.id ? ' ' + s.nome : '') : (s.estoque ? 'estoquista ' : 'coordenação ') + s.nome) + ']';
    return q;
  }

  // Nome sem acento, minúsculo, sem "de/da/dos…"
  function partesNome(n) {
    return String(n || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z\s]/g, ' ')
      .split(/\s+/).filter(function (w) { return w && ['de', 'da', 'do', 'das', 'dos', 'e'].indexOf(w) < 0; });
  }
  // "Ana Souza" confere com "Ana Paula de Souza Lima": primeiro nome igual e o sobrenome digitado faz parte do nome cadastrado.
  function mesmoNome(digitado, cadastrado) {
    var t = partesNome(digitado), r = partesNome(cadastrado);
    if (!t.length || !r.length || t[0] !== r[0]) return false;
    if (r.length === 1) return true;
    return t.length > 1 && t.slice(1).every(function (w) { return r.indexOf(w) >= 0; });
  }
  function naLista(ev, nome) { return json(ev.prestadores, []).filter(function (pr) { return mesmoNome(nome, pr.nome); })[0] || null; }
  function perdasPendentes(db) {
    var evs = {}, its = {};
    db.all('eventos').forEach(function (e) { evs[e.id] = e; });
    db.all('itens').forEach(function (i) { its[i.id] = i; });
    return db.all('evento_itens').filter(function (l) { return l.perda === 'pendente'; }).map(function (l) {
      var e = evs[l.evento_id] || {}, it = its[l.item_id], f = num(l.qtd_saida) - num(l.qtd_retorno);
      return { id: l.id, evento_id: l.evento_id, evento: e.nome || '', data: e.data || '', retorno_por: e.retorno_por || '', item_id: l.item_id,
        nome: it ? nomeItem(it) : l.item_nome, falta: f, motivo: l.motivo || '', justificativa: l.justificativa || '',
        equipamento: !!(it && it.tipo === 'equipamento'), custo: it ? num(it.custo) * f : 0, estoque: it ? num(it.qtd_total) : 0 };
    });
  }
  function chaveNova() { return (uid() + uid()).replace(/[^a-z0-9]/g, '').slice(0, 14); }
  // CPF com dígitos verificadores
  function cpfOk(c) {
    c = digitos(c); if (c.length !== 11 || /^(\d)\1+$/.test(c)) return false;
    for (var t = 9; t < 11; t++) {
      var sm = 0; for (var i = 0; i < t; i++) sm += +c[i] * (t + 1 - i);
      if (((sm * 10) % 11) % 10 !== +c[t]) return false;
    }
    return true;
  }
  function fmtCpf(c) { c = digitos(c); return c.slice(0, 3) + '.' + c.slice(3, 6) + '.' + c.slice(6, 9) + '-' + c.slice(9); }
  function porCpf(db, cpf, exceto) { var d = digitos(cpf); return d ? db.all('equipe').filter(function (x) { return x.id !== exceto && digitos(x.cpf) === d; })[0] || null : null; }
  // Dados pessoais (RG, CPF, Pix) não vão no carregar: só pela ficha, para a coordenação.
  function resumoEquipe(x) {
    return { id: x.id, nome: x.nome, telefone: x.telefone || '', funcao: x.funcao || '', bloqueado: x.bloqueado === 'sim', motivo: x.bloqueado === 'sim' ? x.motivo_bloqueio || '' : '',
      novo: x.origem === 'link' && x.revisado !== 'sim', completo: !!(x.rg && x.cpf && x.pix), escala: nomeEscala(x) };
  }
  // Nome como é chamado no Montador de Escala ("Ana Souza"); sem cadastro, primeiro + último nome.
  function curto(n) { var w = String(n || '').trim().split(/\s+/); return w.length > 2 ? w[0] + ' ' + w[w.length - 1] : w.join(' '); }
  function nomeEscala(x) { return x.nome_escala || curto(x.nome); }
  // Liga os nomes usados no Montador ao cadastro: primeiro nome igual e todas as palavras contidas no nome completo.
  // Só preenche quando há uma única pessoa possível e ela ainda não tem nome na escala.
  function aplicarApelidos(db, lista) {
    var eq = db.all('equipe'), feitos = 0, usados = {}, ambiguos = [];
    eq.forEach(function (x) { if (x.nome_escala) usados[x.id] = 1; });
    lista.forEach(function (ap) {
      ap = texto(ap, 80); var t = partesNome(ap); if (!t.length) return;
      var c = eq.filter(function (x) { var r = partesNome(x.nome); return r[0] === t[0] && t.every(function (w) { return r.indexOf(w) >= 0; }); });
      if (c.length !== 1) { if (c.length > 1) ambiguos.push(ap); return; }
      if (usados[c[0].id]) return;
      usados[c[0].id] = 1; c[0].nome_escala = ap; db.update('equipe', c[0].id, { nome_escala: ap }); feitos++;
    });
    return { ligados: feitos, ambiguos: ambiguos };
  }
  // Importação única dos cadastros antigos (planilhas de pagamento e liberação de acesso): só preenche o que está vazio.
  // Registro: [nome completo, [outros nomes], rg, cpf, pix, funcao, motivo do bloqueio]
  function importarCadastro(db, regs) {
    var eq = db.all('equipe'), r = { completados: 0, novos: 0, nomes: 0 }, novos = [];
    function chave(n) { return partesNome(n).join(' '); }
    function achar(nomes) {
      var ks = nomes.map(chave), x = eq.filter(function (e) { return ks.indexOf(chave(e.nome)) >= 0; });
      if (x.length === 1) return x[0];
      var t = partesNome(nomes[0]);
      x = eq.filter(function (e) { var p = partesNome(e.nome); if (!p.length || p[0] !== t[0] || p.length < 2) return false;
        var a = p.length <= t.length ? p : t, b = a === p ? t : p; return a.every(function (w) { return b.indexOf(w) >= 0; }); });
      return x.length === 1 ? x[0] : null;
    }
    (regs || []).forEach(function (g) {
      var nome = texto(g[0], 120), alt = (g[1] || []).map(function (n) { return texto(n, 120); });
      if (partesNome(nome).length < 2) return;
      var cpf = cpfOk(g[3]) ? fmtCpf(g[3]) : '', d = {};
      var x = achar([nome].concat(alt));
      if (cpf && porCpf(db, cpf, x && x.id)) cpf = '';
      if (x) {
        if (!x.rg && g[2]) d.rg = texto(g[2], 30);
        if (!x.cpf && cpf) d.cpf = cpf;
        if (!x.pix && g[4]) d.pix = texto(g[4], 120);
        if (!x.funcao && g[5]) d.funcao = texto(g[5], 40);
        if (g[6] && x.bloqueado !== 'sim') { d.bloqueado = 'sim'; d.motivo_bloqueio = texto(g[6], 500); d.bloqueado_por = 'cadastro antigo'; }
        var pa = partesNome(x.nome), pn = partesNome(nome);
        if (pn.length > pa.length && pa.every(function (w) { return pn.indexOf(w) >= 0; })) { d.nome = nome; r.nomes++; }
        if (Object.keys(d).length) { d.atualizado_em = agora(); db.update('equipe', x.id, d); Object.keys(d).forEach(function (k) { x[k] = d[k]; }); r.completados++; }
      } else {
        x = { id: uid(), nome: nome, telefone: '', funcao: texto(g[5], 40), ativo: 'sim', criado_em: agora(), rg: texto(g[2], 30), cpf: cpf, pix: texto(g[4], 120),
          bloqueado: g[6] ? 'sim' : '', motivo_bloqueio: texto(g[6], 500), bloqueado_por: g[6] ? 'cadastro antigo' : '', origem: 'importado', revisado: 'sim', atualizado_em: agora() };
        novos.push(x); eq.push(x); r.novos++;
      }
    });
    if (novos.length) { if (db.insertMany) db.insertMany('equipe', novos); else novos.forEach(function (n) { db.insert('equipe', n); }); }
    return r;
  }
  function equipeAtiva(db) { return db.all('equipe').filter(function (x) { return x.ativo !== 'nao'; }); }
  function acharNaEquipe(db, nome) {
    var alvo = partesNome(nome).join(' ');
    return db.all('equipe').filter(function (x) { return partesNome(x.nome).join(' ') === alvo; })[0] || null;
  }
  function incluirNaEquipe(db, nome, telefone, funcao, quem) {
    var x = acharNaEquipe(db, nome);
    if (x) { if (telefone && !x.telefone) db.update('equipe', x.id, { telefone: telefone }); return x; }
    x = { id: uid(), nome: nome, telefone: telefone || '', funcao: funcao || '', ativo: 'sim', criado_em: agora() };
    db.insert('equipe', x);
    return x;
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

    carregar: function (db, p, s, quem, conv) {
      if (!s && !conv) return { itens: [], eventos: [], sessao: null, grupos: [], subgrupos: {}, consumo: CONSUMO, motivos: MOTIVOS };
      aplicarPacotes(db);
      // Importação única colocada na aba config (cadastro antigo + nomes do Montador). Depois de aplicada, é apagada.
      var imp = getConfig(db, 'importar_cadastro');
      if (imp) {
        if (db.travar) { db.travar(); if (db.esquecer) db.esquecer('config'); imp = getConfig(db, 'importar_cadastro'); }
        var dj = json(imp, null);
        function fnv(t) { var h = 2166136261; for (var i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h; }
        if (dj && dj.p && dj.p.length === dj.n && fnv(JSON.stringify([dj.p, dj.e || []])) === dj.h) {
          var ri = importarCadastro(db, dj.p), ra = aplicarApelidos(db, dj.e || []);
          setConfig(db, 'importar_cadastro', '');
          log(db, { nome: 'Sistema', telefone: '' }, 'Importou cadastro antigo da equipe', ri.completados + ' completados, ' + ri.novos + ' novos, ' + ri.nomes + ' nomes completos; ' + ra.ligados + ' nomes do Montador');
        } else if (imp) {
          setConfig(db, 'importar_cadastro', '');
          log(db, { nome: 'Sistema', telefone: '' }, 'Importação do cadastro antigo recusada', 'os dados chegaram diferentes do conferido; nada foi alterado');
        }
      }
      var fora = foraDoDeposito(db);
      var itens = db.all('itens').filter(function (i) { return sim(i.ativo); }).map(function (i) {
        var total = num(i.qtd_total);
        return { id: i.id, nome: i.nome, categoria: i.categoria, descricao: i.descricao, foto: i.foto, grupo: grupoDe(i), subgrupo: i.subgrupo || '',
          tipo: i.tipo || '', numero: i.numero || '', custo: num(i.custo),
          qtd_total: total, fora: fora[i.id] || 0, disponivel: total - (fora[i.id] || 0) };
      });
      var linhas = db.all('evento_itens');
      var outros = [];
      if (conv) {
        var usados = {}, todasL = linhas;
        linhas = linhas.filter(function (l) { return l.evento_id === conv.evento_id; });
        linhas.forEach(function (l) { usados[l.item_id] = 1; });
        if (!conv.coord) itens = itens.filter(function (i) { return usados[i.id]; });
        else db.all('eventos').forEach(function (e) {
          if (e.id === conv.evento_id || e.status === 'concluido') return;
          outros.push({ id: e.id, nome: e.nome, data: e.data, status: e.status, outro: true, prestadores: [],
            linhas: todasL.filter(function (l) { return l.evento_id === e.id; }).map(function (l) { return { item_id: l.item_id, qtd_saida: num(l.qtd_saida) }; }) });
        });
      }
      var eventos = db.all('eventos').filter(function (e) { return !conv || e.id === conv.evento_id; }).map(function (e) {
        return { id: e.id, nome: e.nome, data: e.data, local: e.local, status: e.status, obs: e.obs,
          hora_inicio: e.hora_inicio || '', hora_fim: e.hora_fim || '', na_agenda: !!e.agenda_id,
          prestadores: json(e.prestadores, []).map(function (x) { return s ? x : { nome: x.nome, coord: !!x.coord, apelido: x.apelido || curto(x.nome) }; }), chave: s ? e.chave || '' : undefined, criado_por: e.criado_por, concluido_em: e.concluido_em,
          retorno_por: e.retorno_por, escala_status: e.escala_status || '', escala_por: e.escala_por || '', escala_em: e.escala_em || '', prazo_escala: prazoEscala(e.data), separado_por: e.separado_por || '', conferido_saida: e.conferido_saida || '', conferido_retorno: e.conferido_retorno || '',
          linhas: linhas.filter(function (l) { return l.evento_id === e.id; }).map(function (l) {
            return { item_id: l.item_id, nome: l.item_nome, qtd_saida: num(l.qtd_saida),
              qtd_retorno: l.qtd_retorno === '' || l.qtd_retorno == null ? null : num(l.qtd_retorno),
              justificativa: l.justificativa, motivo: l.motivo || '', perda: l.perda || '' };
          }) };
      }).concat(outros);
      var out = { itens: itens, eventos: eventos, sessao: s, convite: conv, categorias: CATEGORIAS, agenda: !!db.agenda, grupos: listaGrupos(db, itens), subgrupos: mapaSubgrupos(db, itens), consumo: CONSUMO, motivos: MOTIVOS,
        ultimaContagem: json(getConfig(db, 'ultima_contagem'), null) };
      if (s && !s.estoque && !s.separa) { out.itens = []; out.grupos = []; }
      if (s && s.estoque) out.perdas = perdasPendentes(db);
      if (s && s.escala) out.equipe = equipeAtiva(db).map(resumoEquipe);
      if (s && s.papel === 'master') {
        out.pessoas = db.all('pessoas').map(function (x) {
          return { id: x.id, nome: x.nome, telefone: x.telefone, ativo: sim(x.ativo), pode_inventario: sim(x.pode_inventario), coordenador: sim(x.coordenador), escala: sim(x.escala), estoque: x.estoque !== 'nao', separa: sim(x.separa) };
        });
        out.masterPadrao = !getConfig(db, 'master_hash');
      }
      return out;
    },

    entrarEvento: function (db, p, s, quem) {
      var m = /^([a-z0-9]+)\.([a-z0-9]+)$/.exec(texto(p.e, 80));
      var ev = m && porId(db.all('eventos'), m[1]);
      if (!ev || !ev.chave || ev.chave !== m[2]) falha('Link do evento inválido ou antigo. Peça o link certo no grupo do evento.');
      var nome = texto(p.who && p.who.nome, 80), tel = texto(p.who && p.who.telefone, 30);
      if (partesNome(nome).length < 2) falha('Digite seu nome e sobrenome.');
      if (digitos(tel).length < 8) falha('Informe seu telefone com DDD.');
      var pr = naLista(ev, nome);
      if (!pr) {
        log(db, { nome: nome, telefone: tel }, 'Tentou abrir evento sem estar na lista', ev.nome);
        falha('Seu nome não está na lista deste evento. Confira nome e sobrenome ou fale com o Master.');
      }
      var bx = pr.id ? porId(db.all('equipe'), pr.id) : acharNaEquipe(db, pr.nome);
      if (bx && bx.bloqueado === 'sim') {
        log(db, { nome: nome, telefone: tel }, 'Tentou abrir evento estando bloqueado', ev.nome);
        falha('Seu acesso está bloqueado. Fale com a coordenação.');
      }
      var lista = json(ev.prestadores, []);
      lista.forEach(function (x) { if (x === pr || (x.nome === pr.nome)) x.telefone = tel; });
      db.update('eventos', ev.id, { prestadores: JSON.stringify(lista) });
      var x = pr.id ? porId(db.all('equipe'), pr.id) : acharNaEquipe(db, pr.nome);
      if (x && digitos(x.telefone) !== digitos(tel)) db.update('equipe', x.id, { telefone: tel });
      var token = uid() + uid();
      db.insert('sessoes', { id: token, pessoa_id: 'ev:' + ev.id, criado_em: agora(), nome: pr.nome, telefone: tel });
      log(db, { nome: pr.nome, telefone: tel }, 'Abriu o evento pelo link', ev.nome + (partesNome(nome).join(' ') !== partesNome(pr.nome).join(' ') ? ' (digitou ' + nome + ')' : ''));
      return { token: token, evento_id: ev.id, nome: pr.nome, coord: !!pr.coord };
    },

    linkEvento: function (db, p, s, quem) {
      pedeEquipe(s);
      var ev = porId(db.all('eventos'), p.id);
      if (!ev) falha('Evento não encontrado.');
      if (!ev.chave) { ev.chave = chaveNova(); db.update('eventos', ev.id, { chave: ev.chave }); }
      return { e: ev.id + '.' + ev.chave };
    },

    // Cadastro da equipe: coordenação (escala) ou Master. Pessoa nova precisa de nome completo, RG, CPF e Pix.
    salvarEquipe: function (db, p, s, quem) {
      pedeEscala(s);
      var x = p.pessoa || {}, nome = texto(x.nome, 120);
      if (partesNome(nome).length < 2) falha('Informe o nome completo.');
      var dados = { nome: nome, telefone: texto(x.telefone, 30), funcao: texto(x.funcao, 40), ativo: x.ativo === false ? 'nao' : 'sim', atualizado_em: agora() };
      if (x.nome_escala !== undefined) dados.nome_escala = texto(x.nome_escala, 60);
      if (x.rg !== undefined) dados.rg = texto(x.rg, 30);
      if (x.cpf !== undefined) dados.cpf = texto(x.cpf, 20);
      if (x.pix !== undefined) dados.pix = texto(x.pix, 120);
      if (dados.cpf) { if (!cpfOk(dados.cpf)) falha('CPF inválido. Confira os números.'); dados.cpf = fmtCpf(dados.cpf); }
      if (dados.cpf) { var dup = porCpf(db, dados.cpf, x.id); if (dup) falha('Esse CPF já está no cadastro de ' + dup.nome + '.'); }
      if (x.revisado) dados.revisado = 'sim';
      if (x.id) {
        if (!porId(db.all('equipe'), x.id)) falha('Pessoa não encontrada.');
        db.update('equipe', x.id, dados);
        log(db, quem, 'Alterou cadastro da equipe de eventos', nome + (dados.ativo === 'nao' ? ' (tirado do cadastro)' : ''));
        return { id: x.id };
      }
      if (!dados.rg || !dados.cpf || !dados.pix) falha('Para cadastrar pessoa nova informe nome completo, RG, CPF e chave Pix. Ou mande o link de cadastro para ela preencher.');
      var ja = acharNaEquipe(db, nome);
      if (ja && !ja.cpf) { db.update('equipe', ja.id, dados); log(db, quem, 'Completou cadastro da equipe de eventos', nome); return { id: ja.id }; }
      dados.id = uid(); dados.criado_em = agora(); dados.origem = 'manual'; dados.revisado = 'sim';
      db.insert('equipe', dados);
      log(db, quem, 'Cadastrou na equipe de eventos', nome);
      return { id: dados.id };
    },

    // Cola a lista de nomes do Montador de Escala (um por linha) para ligar ao cadastro.
    importarApelidos: function (db, p, s, quem) {
      pedeEscala(s);
      var r = aplicarApelidos(db, String(p.texto || '').split(/\r?\n/));
      log(db, quem, 'Ligou nomes do Montador de Escala ao cadastro', r.ligados + ' pessoas');
      return r;
    },

    fichaEquipe: function (db, p, s, quem) {
      pedeEscala(s);
      var x = porId(db.all('equipe'), p.id);
      if (!x) falha('Pessoa não encontrada.');
      log(db, quem, 'Consultou cadastro completo', x.nome);
      return { id: x.id, nome: x.nome, nome_escala: x.nome_escala || '', escala: nomeEscala(x), telefone: x.telefone || '', funcao: x.funcao || '', rg: x.rg || '', cpf: x.cpf || '', pix: x.pix || '',
        bloqueado: x.bloqueado === 'sim', motivo: x.motivo_bloqueio || '', bloqueado_por: x.bloqueado_por || '', origem: x.origem || '', novo: x.origem === 'link' && x.revisado !== 'sim',
        criado_em: x.criado_em || '', atualizado_em: x.atualizado_em || '' };
    },

    bloquearEquipe: function (db, p, s, quem) {
      pedeEscala(s);
      var x = porId(db.all('equipe'), p.id);
      if (!x) falha('Pessoa não encontrada.');
      if (p.bloquear) {
        var mot = texto(p.motivo, 500);
        if (mot.length < 3) falha('Escreva a justificativa do bloqueio.');
        db.update('equipe', x.id, { bloqueado: 'sim', motivo_bloqueio: mot, bloqueado_por: texto(p.who && p.who.nome, 80) + ' em ' + agora().slice(0, 10) });
        log(db, quem, 'Bloqueou pessoa da equipe', x.nome + ' — ' + mot);
      } else {
        db.update('equipe', x.id, { bloqueado: '', motivo_bloqueio: '', bloqueado_por: '' });
        log(db, quem, 'Desbloqueou pessoa da equipe', x.nome);
      }
      return true;
    },

    // Link de cadastro para pessoas novas preencherem os próprios dados. "nova" troca a chave e o link antigo para de funcionar.
    linkCadastro: function (db, p, s, quem) {
      pedeEscala(s);
      var k = getConfig(db, 'cadastro_chave');
      if (!k || p.nova) { k = chaveNova(); setConfig(db, 'cadastro_chave', k); if (p.nova) log(db, quem, 'Gerou novo link de cadastro', 'o link anterior deixou de funcionar'); }
      return { chave: k };
    },

    cadastroNovo: function (db, p, s, quem) {
      var k = getConfig(db, 'cadastro_chave');
      if (!k || texto(p.chave, 40) !== k) falha('Link de cadastro inválido ou antigo. Peça o link novo à coordenação.');
      var x = p.pessoa || {}, nome = texto(x.nome, 120).replace(/\s+/g, ' ');
      var d = { nome: nome, rg: texto(x.rg, 30), cpf: texto(x.cpf, 20), telefone: texto(x.telefone, 30), funcao: texto(x.funcao, 40), pix: texto(x.pix, 120) };
      if (partesNome(nome).length < 2) falha('Digite seu nome completo.');
      if (d.rg.replace(/[^0-9a-z]/gi, '').length < 5) falha('Digite seu RG.');
      if (!cpfOk(d.cpf)) falha('CPF inválido. Confira os números.');
      if (digitos(d.telefone).length < 10) falha('Digite o telefone com DDD.');
      if (!d.funcao) falha('Informe sua função.');
      if (d.pix.length < 5) falha('Digite sua chave Pix.');
      d.cpf = fmtCpf(d.cpf);
      var quemC = { nome: nome + ' [cadastro pelo link]', telefone: d.telefone };
      var ja = porCpf(db, d.cpf);
      if (ja && ja.bloqueado === 'sim') { log(db, quemC, 'Cadastro pelo link recusado (pessoa bloqueada)', nome); falha('Não foi possível concluir o cadastro. Fale com a coordenação.'); }
      if (ja) falha('Esse CPF já tem cadastro. Para alterar seus dados, fale com a coordenação.');
      var mesmo = acharNaEquipe(db, nome);
      if (mesmo && mesmo.bloqueado === 'sim') { log(db, quemC, 'Cadastro pelo link recusado (pessoa bloqueada)', nome); falha('Não foi possível concluir o cadastro. Fale com a coordenação.'); }
      d.ativo = 'sim'; d.origem = 'link'; d.revisado = ''; d.atualizado_em = agora();
      if (mesmo && !mesmo.cpf) { db.update('equipe', mesmo.id, d); log(db, quemC, 'Completou o próprio cadastro pelo link', nome); return true; }
      d.id = uid(); d.criado_em = agora();
      db.insert('equipe', d);
      log(db, quemC, 'Fez o próprio cadastro pelo link', nome);
      return true;
    },

    importarEquipe: function (db, p, s, quem) {
      pedeCoord(s);
      var novos = [], vistos = {}, atual = 0;
      db.all('equipe').forEach(function (x) { vistos[partesNome(x.nome).join(' ')] = 1; });
      String(p.texto || '').split(/\r?\n/).forEach(function (linha) {
        var c = linha.split(/[;\t]/).map(function (v) { return texto(v, 80); });
        var nome = c[0].replace(/^[-•*\d.)\s]+/, '');
        var k = partesNome(nome).join(' ');
        if (!k || vistos[k]) return;
        vistos[k] = 1;
        novos.push({ id: uid(), nome: nome, telefone: c[1] || '', funcao: c[2] || '', ativo: 'sim', criado_em: agora() });
      });
      if (db.insertMany) db.insertMany('equipe', novos); else novos.forEach(function (n) { db.insert('equipe', n); });
      log(db, quem, 'Importou equipe de eventos', novos.length + ' pessoas');
      return { incluidos: novos.length };
    },

    login: function (db, p, s, quem) {
      var senha = texto(p.senha, 100);
      if (!senha) falha('Digite a senha.');
      var h = db.hash(senha);
      var master = getConfig(db, 'master_hash') || db.hash(SENHA_MASTER_INICIAL);
      var pessoaId = null, nome = '';
      if (h === master) { pessoaId = 'master'; nome = 'Master'; }
      else {
        var p2 = db.all('pessoas').filter(function (x) { return sim(x.ativo) && x.senha_hash === h; })[0];
        if (p2) { pessoaId = p2.id; nome = (sim(p2.coordenador) ? 'Master ' : p2.estoque !== 'nao' ? 'estoquista ' : 'coordenação ') + p2.nome; }
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
      var e = p.evento || {}, antigo = e.id ? porId(db.all('eventos'), e.id) : null;
      if (e.id && !antigo) falha('Evento não encontrado.');
      if (!antigo && s.papel !== 'master' && !((s.estoque || s.escala) && texto(e.agenda_id, 300))) falha('Só o Master cria eventos. Os outros abrem pelos eventos da agenda.');
      if (antigo && s.papel !== 'master') ['nome', 'data', 'local', 'obs', 'hora_inicio', 'hora_fim'].forEach(function (k) { e[k] = antigo[k] || ''; });
      var nome = texto(e.nome, 120);
      if (!nome) falha('Dê um nome ao evento.');
      var podeEquipe = s.escala && (!antigo || antigo.escala_status !== 'enviada' || s.papel === 'master');
      var prest = (e.prestadores || []).map(function (x) {
        var o = { id: texto(x.id, 40), nome: texto(x.nome, 120), telefone: texto(x.telefone, 30), secao: texto(x.secao, 30), funcao: texto(x.funcao, 60) };
        if (x.coord) o.coord = true; return o;
      }).filter(function (x) { return x.nome; });
      if (!podeEquipe) prest = antigo ? json(antigo.prestadores, []) : [];
      if (podeEquipe) prest.forEach(function (x) {
        if (partesNome(x.nome).length < 2) falha('Informe nome e sobrenome de ' + x.nome + '.');
        var c = x.id ? porId(db.all('equipe'), x.id) : null;
        if (!c) { c = incluirNaEquipe(db, x.nome, x.telefone, '', quem); x.id = c.id; }
        if (c.bloqueado === 'sim' && !(antigo && json(antigo.prestadores, []).some(function (o) { return o.id === c.id; })))
          falha(c.nome + ' está bloqueado(a): ' + (c.motivo_bloqueio || 'sem justificativa') + '.');
        if (!x.telefone) x.telefone = c.telefone || '';
        x.apelido = nomeEscala(c);
      });
      var dados = { nome: nome, data: texto(e.data, 20), local: texto(e.local, 200), obs: texto(e.obs, 500),
        prestadores: JSON.stringify(prest), hora_inicio: texto(e.hora_inicio, 5), hora_fim: texto(e.hora_fim, 5) };
      if (e.id) {
        if (!porId(db.all('eventos'), e.id)) falha('Evento não encontrado.');
        db.update('eventos', e.id, dados);
        log(db, quem, 'Editou evento', nome + ' — prestadores: ' + prest.map(function (x) { return x.nome + ' ' + x.telefone; }).join(', '));
        sincAgenda(db, e.id, quem);
        return { id: e.id };
      }
      dados.id = uid(); dados.chave = chaveNova(); dados.status = 'montando'; dados.criado_por = quem.nome; dados.criado_em = agora();
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
      pedeCoord(s);
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

    salvarListaEvento: function (db, p, s, quem, conv) {
      pedeLista(s, conv, p.evento_id);
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

    confirmarSaida: function (db, p, s, quem, conv) {
      pedeLista(s, conv, p.id);
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

    reabrirMontagem: function (db, p, s, quem, conv) {
      if (!(s && s.escala)) pedeLista(s, conv, p.id);
      var ev = porId(db.all('eventos'), p.id);
      if (!ev || ev.status !== 'em_evento') falha('Só dá para reabrir um evento que saiu e ainda não voltou.');
      db.update('eventos', ev.id, { status: 'montando' });
      log(db, quem, 'Reabriu a lista de material', ev.nome);
      sincAgenda(db, ev.id, quem);
      return true;
    },

    registrarRetorno: function (db, p, s, quem, conv) {
      var ev = porId(db.all('eventos'), p.evento_id);
      if (!ev) falha('Evento não encontrado.');
      if (ev.status !== 'em_evento') falha('Este evento não está aguardando retorno.');
      if (!s && !(conv && conv.evento_id === ev.id))
        falha('Só quem está na lista deste evento pode registrar o retorno. Abra pelo link enviado no grupo do evento.');
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
        db.update('evento_itens', l.id, { qtd_retorno: String(q), justificativa: just, motivo: mot, perda: q < saiu ? 'pendente' : '', perda_por: '' });
        resumo.push(q + '/' + saiu + ' ' + l.item_nome);
        if (q < saiu) {
          var custo = itl ? num(itl.custo) * (saiu - q) : 0; custoTotal += custo;
          faltas.push({ l: l, falta: saiu - q, just: mot + (just ? ' — ' + just : ''), custo: custo });
        }
      });
      db.update('eventos', ev.id, { status: 'concluido', concluido_em: agora(), retorno_por: quem.nome + ' ' + quem.telefone, conferido_retorno: confRet });
      log(db, quem, 'Registrou retorno do material', ev.nome + ': ' + resumo.join(', ') +
        (faltas.length ? ' | Faltas (aguardando confirmação do Master/estoque): ' + faltas.map(function (f) { return f.falta + ' × ' + f.l.item_nome + ' (' + f.just + ')'; }).join('; ') : '') +
        (custoTotal ? ' | Custo das perdas: ' + moeda(custoTotal) : '') + ' | Conferido por ' + confRet);
      sincAgenda(db, ev.id, quem);
      return true;
    },

    enviarEscala: function (db, p, s, quem) {
      pedeEscala(s);
      var ev = porId(db.all('eventos'), p.id);
      if (!ev) falha('Evento não encontrado.');
      var prest = json(ev.prestadores, []);
      if (!prest.length) falha('A equipe deste evento está vazia.');
      if (p.reabrir) {
        pedeCoord(s);
        db.update('eventos', ev.id, { escala_status: '' });
        db.removeWhere('escalas', function (r) { return r.evento_id === ev.id; });
        log(db, quem, 'Reabriu a escala', ev.nome);
        return true;
      }
      if (ev.escala_status === 'enviada') falha('A escala deste evento já foi enviada.');
      var em = agora(), por = texto(p.who && p.who.nome, 80), sem = semanaEscala(ev.data);
      db.update('eventos', ev.id, { escala_status: 'enviada', escala_por: por, escala_em: em });
      // Aba "escalas" da planilha: uma linha por pessoa; o Montador de Escala lê daqui.
      var linhas = prest.map(function (x, i) {
        return { id: ev.id + '-' + i, evento_id: ev.id, semana: sem, data: ev.data, evento: ev.nome, nome: x.apelido || x.nome, secao: x.secao || 'Salão',
          funcao: x.funcao || (x.coord ? 'Maitre' : ''), coordenador: x.coord ? 'sim' : '', enviado_em: em, enviado_por: por };
      });
      db.removeWhere('escalas', function (r) { return r.evento_id === ev.id; });
      if (db.insertMany) db.insertMany('escalas', linhas); else linhas.forEach(function (r) { db.insert('escalas', r); });
      log(db, quem, 'Confirmou e enviou a escala', ev.nome + ' (' + ev.data + '): ' + prest.map(function (x) { return x.nome + (x.secao ? ' / ' + x.secao : '') + (x.funcao ? ' / ' + x.funcao : ''); }).join(', '));
      return true;
    },

    confirmarPerda: function (db, p, s, quem) {
      pedeEstoque(s);
      var l = porId(db.all('evento_itens'), p.id);
      if (!l || l.perda !== 'pendente') falha('Esta perda já foi resolvida.');
      var ev = porId(db.all('eventos'), l.evento_id) || { nome: '' }, it = porId(db.all('itens'), l.item_id);
      var f = num(l.qtd_saida) - num(l.qtd_retorno), nome = it ? nomeItem(it) : l.item_nome;
      var motivo = [l.motivo, l.justificativa].filter(Boolean).join(' — ');
      if (!p.confirmar) {
        db.update('evento_itens', l.id, { perda: 'recusada', perda_por: quem.nome });
        log(db, quem, 'Perda não confirmada (material encontrado)', ev.nome + ': ' + f + ' × ' + nome);
        return true;
      }
      var custo = it ? num(it.custo) * f : 0;
      if (it) {
        if (it.tipo === 'equipamento') db.update('itens', it.id, { ativo: 'nao' });
        else db.update('itens', it.id, { qtd_total: String(Math.max(0, num(it.qtd_total) - f)) });
      }
      db.insert('baixas', { id: uid(), item_id: l.item_id, item_nome: nome, qtd: String(f), motivo: 'Evento ' + ev.nome + ': ' + motivo,
        evento_id: l.evento_id, por: quem.nome + ' ' + quem.telefone, em: agora(), custo: custo ? String(custo) : '' });
      db.update('evento_itens', l.id, { perda: 'confirmada', perda_por: quem.nome });
      log(db, quem, 'Confirmou perda e excluiu do inventário geral', ev.nome + ': ' + f + ' × ' + nome + ' (' + motivo + ')' + (custo ? ' | ' + moeda(custo) : ''));
      return true;
    },

    salvarPessoa: function (db, p, s, quem) {
      pedeCoord(s);
      var x = p.pessoa || {};
      var nome = texto(x.nome, 80);
      if (!nome) falha('Informe o nome do estoquista.');
      var dados = { nome: nome, telefone: texto(x.telefone, 30), pode_inventario: sim(x.pode_inventario) ? 'sim' : 'nao', coordenador: sim(x.coordenador) ? 'sim' : 'nao',
        escala: sim(x.escala) ? 'sim' : 'nao', estoque: x.estoque === false ? 'nao' : 'sim', separa: sim(x.separa) ? 'sim' : 'nao', ativo: x.ativo === false ? 'nao' : 'sim' };
      if (dados.estoque === 'nao' && dados.escala === 'nao' && dados.coordenador === 'nao') falha('Marque pelo menos uma função: estoque, escala ou Master.');
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
        log(db, quem, 'Alterou acesso da equipe', nome + ' — master: ' + dados.coordenador + ', inventário: ' + dados.pode_inventario + ', ativo: ' + dados.ativo + (senha ? ', senha trocada' : ''));
        return true;
      }
      if (!senha) falha('Defina uma senha pessoal para o estoquista.');
      dados.id = uid(); dados.criado_em = agora();
      db.insert('pessoas', dados);
      log(db, quem, 'Cadastrou pessoa da equipe', nome + ' ' + dados.telefone + ' — master: ' + dados.coordenador + ', inventário: ' + dados.pode_inventario);
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
      if (!s.estoque && !s.escala) pedeEstoque(s);
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
      pedeEstoque(s);
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
    var s = sessao(db, p.token), conv = null;
    if (s && s.papel === 'prestador') { conv = s; s = null; }
    var quem = quemDe(p, s);
    if (conv) quem = { nome: conv.nome + (conv.coord ? ' [coordenador do evento]' : ' [prestador]'), telefone: conv.telefone || quem.telefone };
    return acoes[acao](db, p, s, quem, conv);
  }

  var TABELAS = {
    itens: ['id', 'nome', 'categoria', 'descricao', 'foto', 'qtd_total', 'ativo', 'criado_em', 'grupo', 'subgrupo', 'tipo', 'numero', 'custo'],
    eventos: ['id', 'nome', 'data', 'local', 'obs', 'prestadores', 'status', 'criado_por', 'criado_em', 'concluido_em', 'retorno_por',
      'hora_inicio', 'hora_fim', 'agenda_id', 'agenda_criado', 'separado_por', 'conferido_saida', 'conferido_retorno', 'chave',
      'escala_status', 'escala_por', 'escala_em'],
    evento_itens: ['id', 'evento_id', 'item_id', 'item_nome', 'qtd_saida', 'qtd_retorno', 'justificativa', 'motivo', 'perda', 'perda_por'],
    baixas: ['id', 'item_id', 'item_nome', 'qtd', 'motivo', 'evento_id', 'por', 'em', 'custo'],
    contagens: ['id', 'em', 'por', 'item_id', 'item_nome', 'sistema', 'contado', 'diferenca', 'ajustado'],
    pessoas: ['id', 'nome', 'telefone', 'senha_hash', 'pode_inventario', 'ativo', 'criado_em', 'coordenador', 'escala', 'estoque', 'separa'],
    sessoes: ['id', 'pessoa_id', 'criado_em', 'nome', 'telefone'],
    equipe: ['id', 'nome', 'telefone', 'funcao', 'ativo', 'criado_em', 'rg', 'cpf', 'pix', 'bloqueado', 'motivo_bloqueio', 'bloqueado_por', 'origem', 'revisado', 'atualizado_em', 'nome_escala'],
    escalas: ['id', 'evento_id', 'semana', 'data', 'evento', 'nome', 'secao', 'funcao', 'coordenador', 'enviado_em', 'enviado_por'],
    config: ['id', 'valor'],
    log: ['id', 'em', 'nome', 'telefone', 'acao', 'detalhe']
  };

  return { handle: handle, TABELAS: TABELAS, SENHA_MASTER_INICIAL: SENHA_MASTER_INICIAL };
})();
