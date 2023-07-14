const path = require('path');
const fs = require('fs');
const PathResolver = require("../path-utils/pathResolver.js").default;
const getExportsAndImports = require("./getExportsAndImports").default;
const checkDirectory = require("../path-utils/checkDirectory.js").default;

async function traverseDir(dir, pr, allExports, importVariable, shouldBeNodeModule, importAllFromFiles) {
  const directories =fs.readdirSync(dir);
  for await(let file of directories){
    let fullPath = path.join(dir, file);
    if (!checkDirectory(fullPath)) {
      continue;
    }
    if (fs.lstatSync(fullPath).isDirectory()) {
      const directories = fs.readdirSync(fullPath);
      const index = directories.findIndex(file => file === 'tsconfig.json');
      if (index != -1) {
        const pathToTsConfig = path.join(fullPath, directories[index]);
        const newpr = new PathResolver(pathToTsConfig);
        await traverseDir(fullPath, newpr, allExports, importVariable, shouldBeNodeModule, importAllFromFiles);
      } else {
        await traverseDir(fullPath, pr, allExports, importVariable, shouldBeNodeModule, importAllFromFiles);
      }
    } else {
      function getExtension(filename) {
        return filename.split('.').pop();
      }

      function isJSFile(filename) {
        const ext = getExtension(filename);
        return ext === 'js' || ext === 'jsx' || ext === 'ts' || ext === 'tsx';
      }

      if (!isJSFile(fullPath)) {
        continue;
      }
      console.log('\nGetting imports and exports from file: ', fullPath, '\n');
      
      try {
        const { exportedVariables, importedVariables } =await getExportsAndImports(
          fs.readFileSync(fullPath).toString(),
          fullPath,
          pr,
          shouldBeNodeModule
        );

        for (const exportedVariable of exportedVariables) {
          allExports.push(exportedVariable);
        }
        for (const importedVariable of importedVariables) {
          if (importedVariable.importedName == undefined) {
            importAllFromFiles.add(importedVariable.from);
          }
          importVariable.add(combine(importedVariable.from, importedVariable.importedName));
        }
      } catch (e) {
        console.log('error on file: ', fullPath);
        console.log('error: ', e);
      }
    }
  };
}

function combine(a, b) {
  return a + '+' + b;
}

exports.default =async function getUnusedExports(inputFolderLocation, shouldBeNodeModule) {
  let allExports = [];
  let importVariable = new Set();
  let importAllFromFiles = new Set();

  const pathToTsConfigUnderRoot = path.join(inputFolderLocation, 'tsconfig.json');
  const pr = new PathResolver((fs.existsSync(pathToTsConfigUnderRoot)?pathToTsConfigUnderRoot:undefined));
  await traverseDir(inputFolderLocation, pr, allExports, importVariable, shouldBeNodeModule, importAllFromFiles);
  
  const unusedExports = allExports.filter(value => !importVariable.has(combine(value.from, value.exportedName)));

  let unusedExportsByFile = {};

  for (let unusedExport of unusedExports) {
    if (importAllFromFiles.has(unusedExport.from)) {
      //those file from which everything is imported, no export should be removed
      continue;
    }
    if (unusedExportsByFile[unusedExport.from] === undefined) {
      unusedExportsByFile[unusedExport.from] = [{ exportName: unusedExport.exportedName }];
    } else {
      unusedExportsByFile[unusedExport.from].push({ exportName: unusedExport.exportedName });
    }
  }

  console.log("allExports: ",allExports);
  console.log("ImportVariables: ",importVariable);

  return unusedExportsByFile;
}
