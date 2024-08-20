import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescriptPlugin from 'rollup-plugin-typescript2';

import pkg from './package.json';

const TRUE_ROOT = 'index';
const roots = [TRUE_ROOT, 'api/utils'];
const formats = ['cjs', 'esm', 'es'];
const plugins = [typescriptPlugin(), nodeResolve(), commonjs()];

// e.g. dirFromPath("foo/bar/baz") -> "foo/bar"
function dirFromPath(path) {
  const index = path.lastIndexOf('/');
  return index === -1 ? '' : path.slice(0, index);
}

// e.g. lastPartOfPath("foo/bar/baz") -> "baz"
function lastPartOfPath(path) {
  const index = path.lastIndexOf('/');
  return path.slice(index + 1);
}

// Returns true for any dependency listed in package.json and for any member of
// roots other than index.js, where roots is the array defined above.
const isExternalModule = (() => {
  const deps = new Set(Object.keys(pkg.dependencies ?? {}));
  const subrootEndings = new Set(
    roots.filter(root => root !== TRUE_ROOT).map(lastPartOfPath)
  );
  return id =>
    deps.has(id) ||
    (id.startsWith('.') && subrootEndings.has(lastPartOfPath(id)));
})();

function makeConfig(root) {
  return {
    input: `src/${root}.ts`,
    output: formats.map(format => ({
      dir: `dist/${format}/${dirFromPath(root)}`,
      format,
      sourcemap: true
    })),
    external: isExternalModule,
    plugins
  };
}

export default roots.map(makeConfig);
