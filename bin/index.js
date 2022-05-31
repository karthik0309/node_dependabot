#!/usr/bin/env node

const csv=require('csvtojson')
const yargs = require("yargs");
const getRepoPackageJSON = require('../helper/getPackageJson')
const cloneGitRepo = require('../helper/cloneGitRepo')

const options = yargs
 .usage("Usage: -i <filepath>")
 .option("i", { alias: "filepath", describe: "file and package@version", type: "string", demandOption: true })
 .option("update", { alias: "update", describe: "update packages", type: "string"}) 
 .argv;


let inputRepos = []
let repoDependencies=[]
let lowerVersions=[]
let updatedDepenencies=[]

const simplefiedInput = options.filepath.split(" ")

const simplifiedPackage = simplefiedInput[1].split("@")

const filepath = simplefiedInput[0]
const package = simplifiedPackage[0]
const version = simplifiedPackage[1]
let updated = false

const convertCsvToJSON=async(csvFilePath,package,version,update=false)=>{
    const jsonArray=await csv().fromFile(csvFilePath);
    inputRepos=[...jsonArray]

    repoDependencies = await Promise.all(jsonArray.map(async(item)=>{
        const res = await getRepoPackageJSON(item.repo)
        const currVersion = res.dependencies[package].replace("^","")
        const versionDiff = currVersion.localeCompare(version, undefined, { numeric: true, sensitivity: 'base' })
        const versionSatisfied = versionDiff>=0 ? true : false
       
        let obj={repo: item.repo, package:package,version:currVersion,version_satisfied:versionSatisfied}
        let updatedObj = {...obj,updated_pr:""}
        updatedDepenencies.push(updatedObj)

        !versionSatisfied && lowerVersions.push(obj)
        return obj
    }))
    
    if(update && lowerVersions && lowerVersions.length>0){

        await Promise.all(lowerVersions.map(async(item)=>{
           const pull_url = await cloneGitRepo(item.repo,item.package,version) 

           updatedDepenencies.filter((dep)=>{
               if(dep.repo==item.repo){
                   dep.updated_pr=pull_url
               }
               update=true
           })

            printTable(updatedDepenencies)
        }))
    }

    if(!update){
        printTable(repoDependencies)
    }

}

const printTable=(obj)=>{
    console.log("\n")
    console.table(obj)
    console.log("\n")
}
const checkPackageVersion=(csvFilePath,package,version)=>{
    convertCsvToJSON(csvFilePath,package,version)
}

const updatePackages=(csvFilePath,package,version)=>{
    convertCsvToJSON(csvFilePath,package,version,true)
}

if(options.u && options.filepath){
    updatePackages(filepath,package,version)
    
}else if(options.filepath){
    checkPackageVersion(filepath,package,version)
}

