const path = require("path");
const { getTsconfig } = require('get-tsconfig');
const {makeTrie, matchWord} = require("./trie.js");

exports.default = class pathResolver{
  constructor(pathToTsConfig){
    this.pathToTsConfig = pathToTsConfig;
    let tsConfig;
    try {
      tsConfig = getTsconfig(pathToTsConfig);
    } catch(e){
      console.log("error parsing tsconfig");
      throw e;
    }
    if(tsConfig == undefined){
      this.paths = {};
      this.baseUrl = ".";
      this.newObj = {};
      this.keys = [];
      this.trie = makeTrie(this.keys);
      return;
    }
    const {paths,baseUrl} = tsConfig.config.compilerOptions;
    this.baseUrl = baseUrl ?? '.';
    this.paths = paths;
    if(this.paths == undefined || this.baseUrl == undefined)return;
    this.newObj = {};

    for(const [key,value] of Object.entries(paths)){
      this.newObj[key.replace(/.$/,'')] = value[0].replace(/.$/,'');
    }

    this.keys = Object.keys(this.newObj);
    this.trie = makeTrie(this.keys);
  }
  resolve(modulePath){
    if(modulePath == undefined){
      throw `You are trying to resolve 'undefined'`;
    }
    else if(modulePath[0]==='.'){//for relative or absolute path
      throw `Cant resolve ${modulePath} since it is relative path`;
    }
    else if(modulePath[0]==='/'){
      console.log(`I HOPE ${modulePath} IS AN ABSOLUTE PATH`);
      return modulePath;
    }
    else {//for aliases
      if(this.trie==undefined){
        console.log("WARNING",`couldnt find alias for ${modulePath}`);
        return modulePath;
      }
      let {index, till} = matchWord(this.trie,modulePath);
      if(index == undefined || index === -1){//trying after adding '@/' in front of the path
        const prependedModulePath = "@/" + modulePath;
        const {index: index2,till: till2} = matchWord(this.trie,prependedModulePath);
        if(index2 == undefined || index2 === -1)return undefined;
        return path.join(this.pathToTsConfig,'..',this.baseUrl,this.newObj[this.keys[index2]],prependedModulePath.substring(till2+1,prependedModulePath.length));
      }
      return path.join(this.pathToTsConfig,'..',this.baseUrl,this.newObj[this.keys[index]],modulePath.substring(till+1,modulePath.length));
    }
  }
}
