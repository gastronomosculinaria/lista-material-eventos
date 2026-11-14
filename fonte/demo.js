// ---- Versão de demonstração: dados guardados só neste aparelho ----
var DEMO_DB = (function () {
  var CHAVE = 'inv-buffet-demo-v2';
  var mem = null;
  function carregar() {
    if (mem) return mem;
    try { mem = JSON.parse(localStorage.getItem(CHAVE) || 'null'); } catch (e) { mem = null; }
    if (!mem) { mem = {}; semear(mem); }
    return mem;
  }
  function gravar() { try { localStorage.setItem(CHAVE, JSON.stringify(mem)); } catch (e) {} }
  function tab(t) { var m = carregar(); return m[t] || (m[t] = []); }
  function semear(m) {
    var ex = [
      ['Copo long drink', 'Copos', 240], ['Copo de whisky', 'Copos', 120], ['Taça de vinho tinto', 'Taças de vidro', 180],
      ['Taça de água', 'Taças de vidro', 150], ['Taça de champanhe cristal', 'Taças de cristal', 96],
      ['Bandeja inox redonda 40 cm', 'Bandejas', 30], ['Bandeja espelhada retangular', 'Bandejas', 12],
      ['Bandeja de madeira rústica', 'Bandejas', 16], ['Forno elétrico industrial', 'Equipamentos', 2],
      ['Cooktop 2 bocas', 'Equipamentos', 3], ['Pia portátil', 'Equipamentos', 2], ['Fogareiro 1 boca', 'Equipamentos', 8],
      ['Gás de fogareiro (lata)', 'Gás', 40],
      ['Colheres grandes', 'Talheres', 12, 'Caixa de talher'], ['Espátulas', 'Talheres', 6, 'Caixa de talher'], ['Pegadores', 'Talheres', 10, 'Caixa de talher'],
      ['Saco de confeiteiro', 'Utensílios', 20, 'Caixa de talher'], ['Açúcar sachê (caixa)', 'Secos', 5, 'Caixa de secos'], ['Adoçante líquido', 'Secos', 4, 'Caixa de secos'],
      ['Pó de café 500 g', 'Secos', 6, 'Caixa de secos']
    ];
    m.equipe = ['Ana Paula de Souza Lima', 'Bruno Carvalho', 'Carla Mendes Rocha', 'Diego Ferreira', 'Elisa Martins Costa'].map(function (n, i) {
      return { id: 'eq' + i, nome: n, telefone: '', funcao: i % 2 ? 'Cozinha' : 'Salão', ativo: 'sim', criado_em: new Date().toISOString() };
    });
    m.itens = ex.map(function (e, i) {
      return { id: 'ex' + i, nome: e[0], categoria: e[1], descricao: 'Exemplo — apague ou edite', foto: '', grupo: e[3] || 'Material',
        qtd_total: String(e[2]), ativo: 'sim', criado_em: new Date().toISOString() };
    });
  }
  var db = {
    all: function (t) { return tab(t); },
    insert: function (t, o) { tab(t).push(JSON.parse(JSON.stringify(o))); gravar(); },
    update: function (t, id, patch) {
      var o = tab(t).filter(function (x) { return x.id === id; })[0];
      if (o) { Object.keys(patch).forEach(function (k) { o[k] = patch[k]; }); gravar(); }
    },
    remove: function (t, id) { var m = carregar(); m[t] = tab(t).filter(function (x) { return x.id !== id; }); gravar(); },
    removeWhere: function (t, fn) { var m = carregar(); m[t] = tab(t).filter(function (x) { return !fn(x); }); gravar(); },
    ultimos: function (t, n) { return tab(t).slice(-n).reverse(); },
    hash: function (s) {
      var h = 2166136261; s = 'buffet:' + s;
      for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
      return (h >>> 0).toString(16);
    },
    salvarFoto: function (dataUrl) { return dataUrl; },
    // Na demonstração não há leitura de foto de verdade; os testes põem um texto em window.__FOLHA.
    lerTexto: function () { return (typeof window !== 'undefined' && window.__FOLHA) || ''; },
    agenda: {
      salvar: function (ev) { return { id: ev.agenda_id || 'demo-' + ev.id, criado: !ev.agenda_id || ev.agenda_criado === 'sim' }; },
      remover: function () {},
      info: function () { return { conta: 'demonstracao@exemplo.com', atual: '', agendas: [{ id: 'demo', nome: 'Agenda de exemplo' }] }; },
      listar: function () {
        function d(n) { var x = new Date(Date.now() + n * 86400000); return x.toISOString().slice(0, 10); }
        return [
          { id: 'cal1', titulo: 'Aniversário 15 anos Júlia (exemplo)', data: d(5), hora_inicio: '19:00', hora_fim: '23:30', local: 'Salão Jardim' },
          { id: 'cal2', titulo: 'Coquetel empresa ABC (exemplo)', data: d(9), hora_inicio: '18:00', hora_fim: '21:00', local: 'Av. Paulista, 1000' },
          { id: 'cal3', titulo: 'Batizado Miguel (exemplo)', data: d(16), hora_inicio: '', hora_fim: '', local: '' }
        ];
      }
    }
  };
  return { db: db, zerar: function () { mem = null; try { localStorage.removeItem(CHAVE); } catch (e) {} } };
})();
