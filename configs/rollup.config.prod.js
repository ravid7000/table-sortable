import alias from '@rollup/plugin-alias'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import css from 'rollup-plugin-css-only'
import { terser } from 'rollup-plugin-terser'
import sveltePreprocess from 'svelte-preprocess'

import svelte from 'rollup-plugin-svelte'

const aliases = alias({
  resolve: ['.svelte', '.js', '.ts'], //optional, by default this will just look for .js files or folders
  entries: [
    { find: 'Components', replacement: './Components' },
    { find: 'Store', replacement: './Store' },
  ],
})

const input = 'src/tableSortable.ts'

const outputs = [
  {
    sourcemap: true,
    format: 'iife',
    name: 'TableSortable',
    file: 'dist/table-sortable.min.js',
  },
  {
    sourcemap: true,
    format: 'cjs',
    name: 'TableSortable',
    file: 'dist/table-sortable.cjs.js',
    exports: 'auto',
  },
]

const plugins = [
  aliases,
  svelte({
    preprocess: sveltePreprocess(),
    compilerOptions: {
      dev: false,
    },
  }),
  // we'll extract any component CSS out into
  // a separate file - better for performance
  css({ output: 'table-sortable.min.css' }),

  // If you have external dependencies installed from
  // npm, you'll most likely need these plugins. In
  // some cases you'll need additional configuration -
  // consult the documentation for details:
  // https://github.com/rollup/plugins/tree/master/packages/commonjs
  resolve({
    browser: true,
    dedupe: ['svelte'],
  }),
  commonjs(),
  typescript(),

  // If we're building for production (npm run build
  // instead of npm run dev), minify
  terser(),
]

const config = outputs.map((output) => {
  return {
    input,
    output,
    plugins,
  }
})

export default config