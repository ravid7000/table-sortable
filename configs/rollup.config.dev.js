import alias from '@rollup/plugin-alias'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import css from 'rollup-plugin-css-only'
import livereload from 'rollup-plugin-livereload'
import sveltePreprocess from 'svelte-preprocess'

import svelte from 'rollup-plugin-svelte'

const aliases = alias({
  resolve: ['.svelte', '.js', '.ts'], //optional, by default this will just look for .js files or folders
  entries: [
    { find: 'Components', replacement: './Components' },
    { find: 'Store', replacement: './Store' },
  ],
})

function serve() {
  let server

  function toExit() {
    if (server) server.kill(0)
  }

  return {
    writeBundle() {
      if (server) return
      server = require('child_process').spawn(
        'npm',
        ['run', 'start', '--', '--dev'],
        {
          stdio: ['ignore', 'inherit', 'inherit'],
          shell: true,
        }
      )

      process.on('SIGTERM', toExit)
      process.on('exit', toExit)
    },
  }
}

export default {
  input: 'src/main.ts',
  output: {
    sourcemap: true,
    format: 'iife',
    name: 'TableSortable',
    file: 'public/build/bundle.js',
  },
  plugins: [
    aliases,
    svelte({
      preprocess: sveltePreprocess({ sourceMap: true }),
      compilerOptions: {
        // enable run-time checks when not in production
        dev: true,
      },
    }),
    // we'll extract any component CSS out into
    // a separate file - better for performance
    css({ output: 'bundle.css' }),

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
    typescript({
      sourceMap: true,
      inlineSources: true,
    }),

    // In dev mode, call `npm run start` once
    // the bundle has been generated
    serve(),

    // Watch the `public` directory and refresh the
    // browser on changes when not in production
    livereload('public'),
  ],
  watch: {
    clearScreen: false,
  },
}