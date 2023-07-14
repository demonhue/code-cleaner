const recast = require("recast");
const prettier = require("prettier");
const traverse = require('@babel/traverse').default;

exports.parser = function parser(input) {
  let ast = recast.parse(input, {
    parser: {
      parse(input) {
        return require('recast/parsers/babel-ts').parse(input, {
          plugins: [
            // enable jsx and flow syntax
            'jsx',
            'flow',
            '@babel/plugin-transform-react-jsx',
          ],
        });
      },
    },
  });
  return ast;
};
exports.generator = (ast,filepath) => {
  const output = recast.print(ast);
  output.code = prettier.format(output.code, {
      singleQuote: true,
      trailingComma: "es5",
      printWidth: 120,
      arrowParens: "avoid",
      filepath: filepath
  });
  return output;
};

exports.traverse = traverse;