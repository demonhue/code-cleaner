const fs = require("fs");
const path = require("path");
const removeExportsFromFile = require("./helpers/removeExportsFromFile").default;
const fileFinder = require("./helpers/fileFinder").default;
const getOptimizedCode = require("./helpers/optimizer").default;
const getUnusedExports = require("./helpers/getUnusedExports").default;
const checkDirectory = require("./path-utils/checkDirectory").default;
const {isUnderPages} = require("./path-utils/checkDirectory");

//Path to Folder
const relativePathOfFolder = process.env.FOLDER_PATH; //TODO

const showRunningFile = true;
const showSmallIterations = true;

if (fs.existsSync(path.resolve(relativePathOfFolder)) === false) {
  throw 'FolderNotFound';
}

const inputFolderLocation = path.resolve(relativePathOfFolder);
const inputFileLocations = fileFinder(inputFolderLocation);

let lastUnusedExportsStringified;

const timeTakenToOptimizeFiles = [];
const timeTakenToFindUnusedExports = [];
const timeTakenToRemoveUnusedExports = [];

let totalNumberOfFilesChanged = 0;
let totalNumberOfFilesDeleted = 0;
const numberOfFilesChanged = [];
const setOfFilesChanged = new Set();

console.time('Execution Time');

const maxBigIteration = 3,
  maxSmallIteration = 10;
let totalBigIteration = 0;
process.stdout._handle.setBlocking(true);
const shouldBeNodeModule = new Set();

let inputFileLocationsSet = new Set(inputFileLocations);

function msToTime(ss) {
  let s = Math.round(ss);
  function pad(n, z) {
    z = z || 2;
    return ('00' + n).slice(-z);
  }

  var ms = s % 1000;
  s = (s - ms) / 1000;
  var secs = s % 60;
  s = (s - secs) / 60;
  var mins = s % 60;
  var hrs = (s - mins) / 60;

  return pad(hrs) + ':' + pad(mins) + ':' + pad(secs) + '.' + pad(ms, 3);
}

async function cleanCode(){
  while (totalBigIteration <= maxBigIteration) {
    const startTime = performance.now();
    let newInputFileLocationsSet = new Set();
    totalBigIteration++;
    for await (const file of inputFileLocationsSet) {
      try {
        const input = fs.readFileSync(file).toString();
        if (showRunningFile) console.log(`Running on file ${file}`);
        const { output, totalSmallIterations } = await getOptimizedCode(input, maxSmallIteration, file);
        if (showSmallIterations) console.log(`Iterations: ${totalSmallIterations}\n`);
        fs.writeFileSync(file, output.code, 'utf8');
        if(totalSmallIterations>1){
          setOfFilesChanged.add(file);
        }
      } catch (e) {
        console.log('wrapper.js', { error: e, file: file });
      }
    }
    const timeAfterOptimization = performance.now();
    console.log('\n\n_________________________________________________________________________________\n\n');

    let unusedExportsByFile =await getUnusedExports(inputFolderLocation, shouldBeNodeModule);
    console.log('\n\nList of unusedExports: ', unusedExportsByFile, '\n');

    const timeAfterFindingUnusedExports = performance.now();

    //Processing unusedExportsByFile (ignoring pages folder and if exportName is undefined or empty)
    for (let key of Object.keys(unusedExportsByFile)) {
      if (!checkDirectory(key) || isUnderPages(key)) {
        delete unusedExportsByFile[key];
        continue;
      }
      unusedExportsByFile[key] = unusedExportsByFile[key].filter(
        value => !(value.exportName == undefined || value.exportName.length === 0)
      );
      if (unusedExportsByFile[key].length === 0) delete unusedExportsByFile[key];
    }

    for (let [fileLocation, unusedExports] of Object.entries(unusedExportsByFile)) {
      const input = fs.readFileSync(fileLocation).toString();
      let output;
      try {
        if (showRunningFile) console.log(`\nRemoving Exports from file ${fileLocation}\n`);
        output = removeExportsFromFile(input, unusedExports,fileLocation);
      } catch (e) {
        console.log('error while removing exports', {
          error: e,
          failSafe: 'returned original input instead',
          file: fileLocation,
        });
        output = { code: input };
      }
      if (input != output.code) {
        fs.writeFileSync(fileLocation, output.code, 'utf8');
        newInputFileLocationsSet.add(fileLocation);
        setOfFilesChanged.add(fileLocation);
      }
    }

    const timeAfterRemovingUnusedExports = performance.now();

    timeTakenToOptimizeFiles.push(timeAfterOptimization - startTime);
    timeTakenToFindUnusedExports.push(timeAfterFindingUnusedExports - timeAfterOptimization);
    timeTakenToRemoveUnusedExports.push(timeAfterRemovingUnusedExports - timeAfterFindingUnusedExports);

    numberOfFilesChanged.push(setOfFilesChanged.size - totalNumberOfFilesChanged);
    totalNumberOfFilesChanged = setOfFilesChanged.size;

    console.log(
      `\n\n########################################################################################\nEnd of Big Iteration ${totalBigIteration}\n`
    );

    if (Object.keys(unusedExportsByFile).length == 0) break;

    const unusedExportsStringified = JSON.stringify(unusedExportsByFile);
    if (lastUnusedExportsStringified !== undefined && unusedExportsStringified === lastUnusedExportsStringified) {
      console.log('ENDING BIG ITERATION BECAUSE UNABLE TO REMOVE THESE EXPORTS: ', unusedExportsByFile);
      break;
    } else {
      lastUnusedExportsStringified = unusedExportsStringified;
    }
    inputFileLocationsSet = newInputFileLocationsSet;
  }

  inputFileLocations.forEach(file => {
    const input = fs.readFileSync(file).toString();
    if (!input.replace(/\s/g, '').length) {
      //checking if the file is empty
      console.log(`Removing empty file: ${file}`);
      try {
        fs.unlinkSync(file);
        console.log('Removed!');
        totalNumberOfFilesDeleted++;
      } catch (e) {
        console.log(e);
      }
    }
  });

  console.log('Should be node module: ', shouldBeNodeModule);
  console.log('totalBigIteration: ', totalBigIteration);
  console.timeEnd('Execution Time');

  console.log("timeTakenToOptimizeFiles",timeTakenToOptimizeFiles.map(x => msToTime(x)),msToTime(timeTakenToOptimizeFiles.reduce((partialSum, a) => partialSum + a, 0)));
  console.log("timeTakenToFindUnusedExports",timeTakenToFindUnusedExports.map(x => msToTime(x)),msToTime(timeTakenToFindUnusedExports.reduce((partialSum, a) => partialSum + a, 0)));
  console.log("timeTakenToRemoveUnusedExports",timeTakenToRemoveUnusedExports.map(x => msToTime(x)),msToTime(timeTakenToRemoveUnusedExports.reduce((partialSum, a) => partialSum + a, 0)));

  console.log("numberOfFilesChanged",numberOfFilesChanged,totalNumberOfFilesChanged);
  console.log("numberOfFilesDeleted",totalNumberOfFilesDeleted);
}

cleanCode();
