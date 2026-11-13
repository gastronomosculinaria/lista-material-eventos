// Minifica o <script> e o <style> de um HTML (usado pelo build.py para caber no cache do Apps Script).
// Uso: node tools/minificar.js entrada.html saida.html
const fs = require('fs'), path = require('path');
const { minify } = require(path.join(__dirname, 'node_modules', 'terser'));
(async () => {
  const [ent, sai] = process.argv.slice(2);
  let h = fs.readFileSync(ent, 'utf8');
  const partes = [];
  const re = /<script>([\s\S]*?)<\/script>/g; let m;
  while ((m = re.exec(h))) partes.push(m);
  for (const p of partes.reverse()) {
    const r = await minify(p[1], { compress: { passes: 3, unsafe: true, unsafe_arrows: false, booleans_as_integers: false }, mangle: true, format: { comments: false, ascii_only: false } });
    h = h.slice(0, p.index) + '<script>' + r.code + '</script>' + h.slice(p.index + p[0].length);
  }
  h = h.replace(/<style>([\s\S]*?)<\/style>/, (_, css) => '<style>' + css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s*\n\s*/g, '\n').replace(/[ \t]+/g, ' ').replace(/\s*([{};,>])\s*/g, '$1').replace(/:\s+/g, ':').replace(/;}/g, '}') + '</style>');
  fs.writeFileSync(sai, h);
})().catch(e => { console.error(e); process.exit(1); });
