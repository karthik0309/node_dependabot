const got = require('got')
const gh = require('github-url-to-object');
const urlFromComponents = require('./urlFromComponents')


const PROTOCOL= 'https:'
const HOST_NAME= 'api.github.com'

const getPackageJson=(gitRepo)=>{
    let repository = gh(gitRepo)

    if(!repository){
        throw new Error("Invalid repo name")
    }

    let {user, repo} = repository

    const PATH_NAME= `/repos/${user}/${repo}/contents/package.json`

    let url = urlFromComponents({
        PROTOCOL,
        HOST_NAME,
        PATH_NAME
    })

    return got.get(url)
    .then(response => {
      response=JSON.parse(response.body)
      let pkg = JSON.parse(Buffer.from(response.content, response.encoding).toString())
      return pkg
    })
    .catch(err=>{
        throw new Error(err)
    })
}

module.exports = getPackageJson