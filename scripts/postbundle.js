const fs = require('fs')
const path = require('path')
const pkgFile = require('../package.json')

const bundleName = 'table-sortable'
const bundlePath = path.join(process.cwd(), `./dist/${bundleName}.js`)
const today = new Date()

const getTodayDate = () => `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`

const comment = `/*
 * ${bundleName}
 * version: ${pkgFile.version}
 * release date: ${getTodayDate()}
 * (c) Ravi Dhiman <ravi.dhiman@ravid.dev> https://ravid.dev
 * For the full copyright and license information, please view the LICENSE
*/
`

const main = () => {
    const mainFile = fs.readFileSync(bundlePath, 'utf8')
    const wrtFile = comment + mainFile
    fs.writeFile(bundlePath, wrtFile, function() {
        console.log('Comments added!!')
    })
}

main()
