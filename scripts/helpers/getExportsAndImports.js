const joinPath = require("path").join;
const {parser,traverse} = require("./utils");
const extensionResolver = require("../path-utils/extensionResolver").default;

exports.default = async function (code, fileLocation, pr, shouldBeNodeModule) {
  const exportsAndImports = {
    importedVariables: [],
    exportedVariables: [],
  };

  function getAbsoluteAddressOfSource(addressOfSource){
    const absoluteAddressOfSource =
      addressOfSource[0] === '.' ? joinPath(fileLocation, '..', addressOfSource) : (!!pr?(pr.resolve(addressOfSource)):addressOfSource);
    const absoluteAddressOfSourceWithExtension = extensionResolver(absoluteAddressOfSource);
    
    if (absoluteAddressOfSourceWithExtension == undefined) {
      console.log(
        `WARNING: couldn't find import source '${addressOfSource}' in file '${fileLocation}'.\nI HOPE '${addressOfSource}' IS A NODE MODULE.`
      );
      console.log(absoluteAddressOfSource);
      shouldBeNodeModule.add(addressOfSource);
    }
    return absoluteAddressOfSourceWithExtension;
  }

  const ast = parser(code);

  traverse(ast, {
    ExportNamedDeclaration(path) {
      const { node } = path;
      if (node.declaration) {
        if (node.declaration.id) {
          //Case1
          exportsAndImports.exportedVariables.push({
            localName: node.declaration.id.name,
            exportedName: node.declaration.id.name,
            from: fileLocation,
          });
        } else if (node.declaration.declarations) {
          node.declaration.declarations.forEach(value => {
            if (value.id.name) {
              //Case2
              exportsAndImports.exportedVariables.push({
                localName: value.id.name,
                exportedName: value.id.name,
                from: fileLocation,
              });
            } else if (value.id.tsconfigoperties) {
              //Case6
              value.id.tsconfigoperties.forEach(x => {
                exportsAndImports.exportedVariables.push({
                  localName: value.init.name,
                  exportedName: x.key.name,
                  from: fileLocation,
                });
              });
            } else if (value.id.elements) {
              //Case5
              value.id.elements.forEach(x => {
                if (x !== null)
                  exportsAndImports.exportedVariables.push({
                    localName: value.init.name,
                    exportedName: x.name,
                    from: fileLocation,
                  });
              });
            }
          });
        }
      } else if (node.specifiers) {
        if (node.source == null) {
          node.specifiers.forEach(value => {
            if (value.exported.type === 'StringLiteral') {
              //Case3
              exportsAndImports.exportedVariables.push({
                localName: value.local.name,
                exportedName: value.exported.value,
                from: fileLocation,
              });
            } else if (value.exported.type === 'Identifier') {
              //Case4
              exportsAndImports.exportedVariables.push({
                localName: value.local.name,
                exportedName: value.exported.name,
                from: fileLocation,
              });
            }
          });
        } else {
          const addressOfSource = path.node.source.value;
          if (addressOfSource == undefined) return;
          node.specifiers.forEach(value => {
            if (value.type === 'ExportNamespaceSpecifier') {
              //Case7
              exportsAndImports.importedVariables.push({
                localName: undefined,
                importedName: undefined,
                from: addressOfSource, //use the source
              });
              exportsAndImports.exportedVariables.push({
                localName: undefined,
                exportedName: value.exported.name,
                from: fileLocation, //use the file's location
                relativeAddressOfSource: path.node.source.value,
              });
            } else if (value.type === 'ExportSpecifier') {
              //Case8
              exportsAndImports.importedVariables.push({
                localName: value.local.name,
                importedName: value.local.name,
                from: addressOfSource, //use the source
              });
              exportsAndImports.exportedVariables.push({
                localName: value.local.name,
                exportedName: value.exported.name,
                from: fileLocation, //use the file's location
                relativeAddressOfSource: path.node.source.value,
              });
            }
          });
        }
      }
    },
    ExportDefaultDeclaration(path) {
      exportsAndImports.exportedVariables.push({
        localName: undefined,
        exportedName: 'default',
        from: fileLocation,
      });
    },
    ExportAllDeclaration(path) {
      const addressOfSource = path.node.source.value;
      if (addressOfSource == undefined) return;
      exportsAndImports.importedVariables.push({
        localName: undefined,
        importedName: undefined, //meaning everything is imported
        from: addressOfSource, //use the source
      });
      exportsAndImports.exportedVariables.push({
        localName: undefined,
        exportedName: undefined,
        from: fileLocation, //this file's location
      });
    },
    ImportDeclaration(path) {
      const addressOfSource = path.node.source.value;
      if (addressOfSource == undefined) return;
      if (path.node.specifiers != null && path.node.specifiers.length) {
        path.node.specifiers.forEach(value => {
          if (value.type === 'ImportNamespaceSpecifier') {
            exportsAndImports.importedVariables.push({
              importedName: undefined, //meaning everything is imported
              localName: value.local.name,
              from: addressOfSource,
            });
          } else {
            exportsAndImports.importedVariables.push({
              importedName:
                value.type == 'ImportDefaultSpecifier' ? 'default' : value.imported?.name ?? value.imported?.value,
              localName: value.local.name,
              from: addressOfSource,
            });
          }
        });
      }
    },
    CallExpression(path) {
      if (
        path.node.callee?.type === 'Import' ||
        (path.node.callee?.name === 'require' && path.node.callee?.type === 'Identifier')
      ) {
        const addressOfSource = path.node.arguments[0].value;
        exportsAndImports.importedVariables.push({
          importedName: undefined, //considering that everything is imported for safety
          localName: undefined, //can be specified but not necessary
          from: addressOfSource,
        });
      }
    },
  });

  //converting all paths to absolute paths
  for await(const imp of exportsAndImports.importedVariables){
    imp.from = await getAbsoluteAddressOfSource(imp.from);
  }
  return exportsAndImports;
}
