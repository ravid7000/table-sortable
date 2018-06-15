const compressor = require('node-minify')

compressor.minify({
     compressor: 'no-compress',
     input: 'src/index.js',
     output: 'dist/table-sortable.js',
     callback: function(err) {
          if (err)
               console.error(err.message)

          compressor.minify({
               compressor: 'uglifyjs',
               input: 'src/index.js',
               output: 'dist/table-sortable.min.js',
               callback: function(err) {
                    if (err)
                         console.error(err.message)
                    console.log('Compiled successfully!')
               }
          })
     }
})

compressor.minify({
     compressor: 'no-compress',
     input: 'src/style.css',
     output: 'dist/table-sortable.css',
     callback: function(err) {
          if (err)
               console.error(err.message)

          compressor.minify({
               compressor: 'clean-css',
               input: 'src/style.css',
               output: 'dist/table-sortable.min.css',
               callback: function(err) {
                    if (err)
                         console.error(err.message)
                    console.log('Compiled successfully!')
               }
          })
     }
})
