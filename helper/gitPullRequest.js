require('dotenv').config()
const gh = require('github-url-to-object');
const { Octokit } = require("octokit")

const gitPullRequest=async(gitRepo,package,version)=>{
    let repository = gh(gitRepo)

    if(!repository){
        throw new Error("Invalid repo name")
    }

    let {user,repo} = repository


    const octokit = new Octokit({
        auth: process.env.GH_TOKEN
      })
      
    const res=await octokit.request(`POST /repos/${user}/${repo}/pulls`, {
        owner: user,
        repo: repo,
        title: `updated ${package}`,
        body: `updated ${package} package version to ${version}`,
        head: `${process.env.GH_USER}:main`,
        base: 'main'
      })
     
    return res.data.html_url
}

module.exports = gitPullRequest