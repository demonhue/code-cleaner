const {parser,generator,traverse} = require("./utils");

function getBindings(ast) {
  let bindings = {};
  let setOfScopes = new Set();
  traverse(ast, {
    enter(path) {
      setOfScopes.add(path.scope.bindings);
    }
  });

  for (let value of setOfScopes) {
    for (let key of Object.keys(value)) bindings[value[key].identifier.start] = value[key];
  }
  return bindings;
}

function removeConstantViolations(binding) {
  if (binding?.constantViolations) {
    for (let constantViolation of binding.constantViolations) {
      constantViolation.remove();
    }
  }
}

function removeExportsFromFile(input, unusedExports, filepath) {
  const ast = parser(input);
  const bindings = getBindings(ast);

  function getStartOfVariablesReferencedMoreThanOnce() {
    let startOfVariablesReferencedMoreThanOnce = new Set();
    for (let key of Object.keys(bindings)) {
      if (bindings[key].references > 1) {
        startOfVariablesReferencedMoreThanOnce.add(parseInt(key, 10));
      }
    }
    return startOfVariablesReferencedMoreThanOnce;
  }

  const startOfVariablesReferencedMoreThanOnce = getStartOfVariablesReferencedMoreThanOnce();

  let unusedExportsSet = new Set();

  for (let unusedExport of unusedExports) {
    unusedExportsSet.add(unusedExport.exportName);
  }

  function isNotImportedAnywhere(exportName) {
    return unusedExportsSet.has(exportName);
  }

  function isUsedInTheFile(start) {
    return startOfVariablesReferencedMoreThanOnce.has(start);
  }

  function isUselessExport(exportName, start) {
    return isNotImportedAnywhere(exportName) && !isUsedInTheFile(start);
  }

  traverse(ast, {
    ExportNamedDeclaration(path) {
      const { node } = path;
      if (node.declaration) {
        if (node.declaration.type === 'TSTypeAliasDeclaration' || node.declaration.type === 'TSInterfaceDeclaration' || node.declaration.type === 'TSEnumDeclaration') {
          return;
        }
        if (node.declaration.id) {
          //Case1
          const exportName = node.declaration.id.name;
          const start = node.declaration.id.start;
          if (isUselessExport(exportName, start)) {
            console.log(`Removing export ${exportName}`);
            removeConstantViolations(bindings[start]);
            path.remove();
          }
        } else if (node.declaration.declarations) {
          node.declaration.declarations = node.declaration.declarations.filter(value => {
            if (value.id.name) {
              //Case2
              const exportName = value.id.name;
              const start = value.id.start;
              if (isUselessExport(exportName, start)) {
                console.log(`Removing export ${exportName}`);
                removeConstantViolations(bindings[start]);
                return false;
              } else {
                return true;
              }
            } else if (value.id.properties) {
              //Case6
              value.id.properties = value.id.properties.filter(x => {
                const exportName = x.value.name;
                const start = x.value.start;
                if (isUselessExport(exportName, start)) {
                  console.log(`Removing export ${exportName}`);
                  removeConstantViolations(bindings[start]);
                  return false;
                } else {
                  return true;
                }
              });
              return value.id.properties.length !== 0;
            } else if (value.id.elements) {
              //Case5
              let count = 0;
              value.id.elements = value.id.elements.map(x => {
                if (x === null) {
                  count++;
                  return null;
                }
                const exportName = x.name;
                const start = x.start;
                if (isUselessExport(exportName, start)) {
                  console.log(`Removing export ${exportName}`);
                  removeConstantViolations(bindings[start]);
                  count++;
                  return null;
                }
                return x;
              });
              return count !== value.id.elements.length;
            }
          });
          if (node.declaration.declarations.length === 0) path.remove();
        }
      } else if (node.specifiers) {
        if (node.source == null) {
          node.specifiers = node.specifiers.filter(value => {
            if (value.exported.type === 'StringLiteral') {
              //Case3
              const exportName = value.exported.value;
              const start = value.exported.start;
              if (isUselessExport(exportName, start)) {
                console.log(`Removing export ${exportName}`);
                removeConstantViolations(bindings[start]);
                return false;
              } else {
                return true;
              }
            } else if (value.exported.type === 'Identifier') {
              //Case4
              const exportName = value.exported.name;
              const start = value.exported.start;
              if (isUselessExport(exportName, start)) {
                console.log(`Removing export ${exportName}`);
                removeConstantViolations(bindings[start]);
                return false;
              } else {
                return true;
              }
            }
          });
        } else {
          node.specifiers = node.specifiers.filter(value => {
            if (value.type === 'ExportNamespaceSpecifier') {
              //Case7
              const exportName = value.exported.name;
              const start = value.exported.start;
              if (isUselessExport(exportName, start)) {
                console.log(`Removing export ${exportName}`);
                removeConstantViolations(bindings[start]);
                return false;
              } else {
                return true;
              }
            } else if (value.type === 'ExportSpecifier') {
              //Case8
              const exportName = value.exported.name;
              const start = value.exported.start;
              if (isUselessExport(exportName, start)) {
                console.log(`Removing export ${exportName}`);
                removeConstantViolations(bindings[start]);
                return false;
              } else {
                return true;
              }
            }
          });
        }
        if (node.specifiers.length === 0) path.remove();
      }
    },
    ExportDefaultDeclaration(path) {
      //only changing when its a function or class declaration
      if (path.node.declaration == undefined) {
        return;
      }
      if (path.node.declaration.type === 'FunctionDeclaration' || path.node.declaration.type === 'ClassDeclaration') {
        const exportName = 'default';
        const start = path.node.declaration.id?.start;
        if (isUselessExport(exportName, start)) {
          console.log(`Removing export ${exportName}`);
          removeConstantViolations(bindings[start]);
          path.remove();
        }
      }
    },
  });

  const output = generator(ast,filepath);

  return output;
}

exports.default = removeExportsFromFile;
