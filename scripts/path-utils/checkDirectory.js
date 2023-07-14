const excludedDirectories = ['node_modules', '.next'];
const mustHaveDirectories = ['sprinklr-app-client/apps', 'sprinklr-app-client/packages'];

function isUnderAnExcludedDirectory(fileLocation) {
  for (let excludedDirectory of excludedDirectories) {
    const pattern = '/' + excludedDirectory + '/';
    if (fileLocation.includes(pattern)) return true;
    if (fileLocation.slice(0, excludedDirectory.length) == excludedDirectory) return true;
  }
  return false;
}

function isUnderAnyMustHaveDirectory(fileLocation) {
  //these parts can be optimized a little
  for (let mustHaveDirectory of mustHaveDirectories) {
    if (fileLocation.includes(mustHaveDirectory)) return true;
  }
  return false;
}

function isUnderPages(fileLocation) {
  const pattern = '/pages/';
  if (fileLocation.includes(pattern)) return true;
  if (fileLocation.slice(0, 5) == 'pages') return true;
}

function checkDirectory(fileLocation) {
  return !isUnderAnExcludedDirectory(fileLocation) && isUnderAnyMustHaveDirectory(fileLocation);
}

exports.isUnderAnExcludedDirectory = isUnderAnExcludedDirectory;
exports.isUnderAnyMustHaveDirectory = isUnderAnyMustHaveDirectory;
exports.isUnderPages = isUnderPages;
exports.default = checkDirectory
