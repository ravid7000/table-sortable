const path = require('path')
const rollup = require('rollup')
const loadConfigFile = require('rollup/dist/loadConfigFile')

loadConfigFile(path.resolve(__dirname, '../configs/rollup.config.dev.js'), {
  format: 'es',
}).then(async ({ options, warnings }) => {
  // "warnings" wraps the default `onwarn` handler passed by the CLI.
  // This prints all warnings up to this point:
  console.log(`We currently have ${warnings.count} warnings`)

  // This prints all deferred warnings
  warnings.flush()

  // You can also pass this directly to "rollup.watch"
  rollup.watch(options)
})
