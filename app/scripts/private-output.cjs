'use strict';
const fs = require('node:fs');
const path = require('node:path');
function assertPrivateOutput(destination, repository) {
  const out = path.resolve(destination), repo = fs.realpathSync(repository);
  let ancestor = out;
  while (!fs.existsSync(ancestor)) {
    // existsSync follows links, so explicitly reject a dangling output link.
    try { if (fs.lstatSync(ancestor).isSymbolicLink()) throw Error('Unsafe output symlink: ' + ancestor); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    const parent = path.dirname(ancestor); if (parent === ancestor) throw Error('Invalid output destination.'); ancestor = parent;
  }
  const real = path.resolve(fs.realpathSync(ancestor), path.relative(ancestor, out));
  if (real === repo || real.startsWith(repo + path.sep)) throw Error('PRODUCTION artifacts must stay private and outside the repository.');
  function inspect(file) {
    const info = fs.lstatSync(file);
    if (info.isSymbolicLink()) throw Error('Unsafe output symlink: ' + file);
    if (info.isFile() && info.nlink !== 1) throw Error('Unsafe output hard link: ' + file);
    if (info.isDirectory()) for (const name of fs.readdirSync(file)) inspect(path.join(file, name));
  }
  try { inspect(out); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  return out;
}
module.exports = { assertPrivateOutput };
