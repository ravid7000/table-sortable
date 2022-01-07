const path = require('path')
const rollup = require('rollup')
const loadConfigFile = require('rollup/dist/loadConfigFile')

loadConfigFile(path.resolve(__dirname, '../configs/rollup.config.prod.js'), {
  format: 'es',
})
  .then(async ({ options, warnings }) => {
    // "warnings" wraps the default `onwarn` handler passed by the CLI.
    // This prints all warnings up to this point:
    console.log(`We currently have ${warnings.count} warnings`)

    // This prints all deferred warnings
    warnings.flush()

    // options is an array of "inputOptions" objects with an additional "output"
    // property that contains an array of "outputOptions".
    // The following will generate all outputs for all inputs, and write them to disk the same
    // way the CLI does it:
    for (const optionsObj of options) {
      const bundle = await rollup.rollup(optionsObj)
      await Promise.all(optionsObj.output.map(bundle.write))
    }

    process.exit(0)
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
