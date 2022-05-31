const util = require('util');
const shell = require('./shell')
const exec = util.promisify(require('child_process').exec);
const gitPullRequest = require('./gitPullRequest')
const gh = require('github-url-to-object');


const cloneGitRepo =async(gitRepo,package,version)=>{

    let repository = gh(gitRepo)

    if(!repository){
        throw new Error("Invalid repo name")
    }

    let {repo} = repository

    const gitCloneDir = gitRepo.split("/");
    const simplifiedGitCloneDir = gitCloneDir[gitCloneDir.length-1]

    process.chdir('../../Documents')
    await exec(`gh repo fork ${gitRepo}`)
    await exec(`git clone ${gitRepo}`)
    process.chdir(`./${simplifiedGitCloneDir}/`)
    await exec(`npm uninstall ${package}`)
    await exec(`npm i ${package}@${version}`)
    await exec(`git init`)
    await exec(`git add .`)
    await exec(`git commit -m "updated package"`)
    await exec(`git remote set-url origin https://github.com/karthik0309/${repo}`)
    await exec(`git push origin main`)

    // console.log(`updated ${package} package version to ${version}`)

    gitPullRequest(gitRepo,package,version)
}

module.exports = cloneGitRepo