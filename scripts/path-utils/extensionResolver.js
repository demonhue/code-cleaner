const fs = require("fs");
const path = require("path");

const extensions = ['ts', 'tsx', 'js', 'jsx', 'cjs', 'mjs'];

//tries to find the file corresponding to the path resolved
//returns undefined if it can't find a relevant file
exports.default = function resolveExtension(filePath) {
  if (filePath == undefined) return undefined;
  if(fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()){
    //if the file exists
    return filePath;
  }
  else {
    //if the file doesn't exist
    //checking by applying different extensions
    for (const extension of extensions) {
      const newFilePath = filePath + '.' + extension;
      if (fs.existsSync(newFilePath)) {
        return newFilePath;
      }
    }
    //Handling case where package.json's main field is used to get the file
    const packageJsonPath = path.join(filePath,"package.json");
    if(fs.existsSync(packageJsonPath)){
      const packageJsonData = fs.readFileSync(packageJsonPath, 'utf8');
      const packageJson = JSON.parse(packageJsonData);
      if(packageJson && packageJson.main){
        const mainFilePath = path.join(filePath,packageJson.main);
        
        for (const extension of extensions) {
          const newMainFilePath = mainFilePath + '.' + extension;
          if (fs.existsSync(newMainFilePath)) {
            return newMainFilePath;
          }
        }
      }
    }

    //then we check if there is a file with path filePath/index
    const indexFilePath = path.join(filePath, 'index');

    for (const extension of extensions) {
      const newIndexFilePath = indexFilePath + '.' + extension;
      if (fs.existsSync(newIndexFilePath)) {
        return newIndexFilePath;
      }
    }

    //if not matched with anything, we return undefined
    return undefined;
  }
}
