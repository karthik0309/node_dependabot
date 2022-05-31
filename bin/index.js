#!/usr/bin/env node

const csv=require('csvtojson')
const yargs = require("yargs");
const getRepoPackageJSON = require('../helper/getPackageJson')

const options = yargs
 .usage("Usage: -i <filepath>")
 .option("i", { alias: "filepath", describe: "file and package@version", type: "string", demandOption: true })
 .option("update", { alias: "update", describe: "update packages", type: "string"}) 

 .argv;

let inputRepos = []
let repoDependencies=[]
let lowerVersions=[]

const simplefiedInput = options.filepath.split(" ")

const simplifiedPackage = simplefiedInput[1].split("@")

const filepath = simplefiedInput[0]
const package = simplifiedPackage[0]
const version = simplifiedPackage[1]


const convertCsvToJSON=async(csvFilePath,package,version)=>{
    const jsonArray=await csv().fromFile(csvFilePath);
    inputRepos=[...jsonArray]

    repoDependencies = await Promise.all(jsonArray.map(async(item)=>{
        const res = await getRepoPackageJSON(item.repo)
        const currVersion = res.dependencies[package].replace("^","")
        const versionDiff = currVersion.localeCompare(version, undefined, { numeric: true, sensitivity: 'base' })
        const versionSatisfied = versionDiff>=0 ? true : false
       
        return {repo: item.repo, package:package,version:currVersion,version_satisfied:versionSatisfied}
    }))
    
    console.log("\n")
    console.table(repoDependencies)
    console.log("\n")

}

const checkPackageVersion=(csvFilePath,package,version)=>{
    convertCsvToJSON(csvFilePath,package,version)
}

const updatePackages=(csvFilePath,package,version)=>{
    convertCsvToJSON(csvFilePath,package,version)
    lowerVersions = repoDependencies.filter((item)=>item.versionSatisfied===false)
}

if(options.update &&  options.filepath){
    updatePackages(filepath,package,version)
}else if(options.filepath){
    checkPackageVersion(filepath,package,version)
}

