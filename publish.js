const ghpages = require('gh-pages')
const pkg = require('./package.json')

const branchName = ver => `release/${ver}`
const tag = ver => `v${ver}`
const message = (ver, brnch) => `Release branch ${brnch} to latest version ${ver}`
const branch = branchName(pkg.version)

const options = {
    branch,
    dest: 'build',
    tag: tag(pkg.version),
    message: message(pkg.version, branch),
}

ghpages.publish('dist', options, function() {
    console.log(options)
    console.log('Done!!!')
})
