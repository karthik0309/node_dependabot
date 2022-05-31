const gh = require('github-url-to-object');
const { Octokit, App } = require("octokit")

const gitPullRequest=async(gitRepo,package,version)=>{
    let repository = gh(gitRepo)

    if(!repository){
        throw new Error("Invalid repo name")
    }

    let {user,repo} = repository


    const octokit = new Octokit({
        auth: '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'
      })
      
    const res=await octokit.request(`POST /repos/${user}/${repo}/pulls`, {
        owner: user,
        repo: repo,
        title: `updated ${package}`,
        body: `updated ${package} package version to ${version}`,
        head: 'karthik0309:main',
        base: 'main'
      })
     
    // console.log(res)

    return res.data.html_url
}

module.exports = gitPullRequest