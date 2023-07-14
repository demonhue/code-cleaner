const { ESLint } = require('eslint');
const { parser, traverse } = require('./utils.js');

exports.default = async function main(input) {
  const eslint = new ESLint({
    fix: true,
    useEslintrc: false,
    overrideConfig: {
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
      rules: {
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': ['error'],
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  });
       
  const results = await eslint.lintText(input);

  function combineLineAndColumn(line, column) {
    return line.toString() + '+' + column;
  }
  
  const setOfUnusedVarLoc = new Set(
    results[0].messages.filter(x => x.messageId === 'unusedVar').map(x => combineLineAndColumn(x.line, x.column - 1))
  );

  const ast = parser(input);

  function deleteVariableDeclarator(path) {
    if (path?.parent?.type !== 'VariableDeclaration') return;
    path.remove();
    if (path?.parent?.declarations?.length === 0) {
      path.parentPath.remove();
    }
  }

  function deleteImportSpecifier(path) {
    if (path?.parent?.type !== 'ImportDeclaration') return;
    path.remove();
    if (path?.parent?.specifiers?.length === 0) {
      path.parentPath.remove();
    }
  }

  traverse(ast, {
    Identifier(path) {
      if(path?.node?.loc?.start == undefined)return;
      const loc = path.node.loc.start;
      const combinedLineAndColumn = combineLineAndColumn(loc.line, loc.column);
      if (setOfUnusedVarLoc.has(combinedLineAndColumn)) {
        // console.log(loc);
        if (path.parent == undefined) return;
        if (path.parent.type === 'FunctionDeclaration') {
          if(combinedLineAndColumn === combineLineAndColumn(path.parent?.id?.loc?.start?.line,path.parent?.id?.loc?.start?.column))
          path.parentPath.remove();
        } else if (path.parent.type === 'ClassDeclaration') {
          if(combinedLineAndColumn === combineLineAndColumn(path.parent?.id?.loc?.start?.line,path.parent?.id?.loc?.start?.column))
          path.parentPath.remove();
        } else if (path.parent.type === 'AssignmentExpression') {
          if(combinedLineAndColumn === combineLineAndColumn(path.parent?.id?.loc?.start?.line,path.parent?.id?.loc?.start?.column))
          path.parentPath.remove();
        } else if (path.parent.type === 'ImportSpecifier') {
          deleteImportSpecifier(path.parentPath);
        } else if (path.parent.type === 'ImportDefaultSpecifier') {
          deleteImportSpecifier(path.parentPath);
        } else if (path.parent.type === 'TSTypeAliasDeclaration') {
          path.parentPath.remove();
        } else if (path.parent.type === 'TSInterfaceDeclaration') {
          path.parentPath.remove();
        } else if (path.parent.type === 'VariableDeclarator') {
          deleteVariableDeclarator(path.parentPath);
        } else if (path.parent.type === 'ArrayPattern') {
          let countNull = 0;
          path.parent.elements = path.parent.elements.map(x => {
            if (
              x == null ||
              combineLineAndColumn(x.loc.start.line, x.loc.start.column) === combineLineAndColumn(loc.line, loc.column)
            ) {
              countNull++;
              return null;
            } else return x;
          });
          if (countNull === path.parent?.elements?.length) {
            //if all elements in the array pattern are null
            if (path.parentPath.parent.type === 'VariableDeclarator') {
              deleteVariableDeclarator(path.parentPath?.parentPath);
            }
          }
        } else if (path.parent.type === 'ImportNamespaceSpecifier') {
          deleteImportSpecifier(path.parentPath);
        } else if (path.parent.type === 'ObjectProperty') {
          if(path.parentPath?.parentPath?.parent?.type !== "VariableDeclarator")return;
          path.parentPath.remove();
          if (path?.parentPath?.parent?.type === 'ObjectPattern' && path?.parentPath?.parent?.properties?.length === 0) {
            if (path.parentPath.parentPath.parent.type === 'VariableDeclarator') {
              deleteVariableDeclarator(path.parentPath?.parentPath?.parentPath);
            }
            path.parentPath.parentPath.remove();
          }
        } else {
          console.log(path.node.type, path.parent?.type);
        }
      }
    },
  });
  return ast;
}
