const {generator} = require("./utils.js");
const transform = require("./transform.js").default;

/*
takes javascript code as text as input
returns ast as ouput
*/
async function getOptimizedCode(input, maxSmallIteration, file) {
  let output = { code: input },
    lastOutputCode = undefined;
  /*
    maxSmallIteration is there to put
    a limit to the number of loops so that
    we don't get infinite loop
  */

  /*
    number of loops for convergence
  */
  let totalSmallIterations = 0;
  /*
    looping until there is no optimizations possible
  */
  while (output.code !== lastOutputCode && totalSmallIterations <= maxSmallIteration) {
    ++totalSmallIterations;
    try {
      let ast = await transform(output.code);
      lastOutputCode = output.code;
      output = generator(ast,file);
    } catch (e) {
      console.log({ error: e, file: file, failSafe: 'returning original input', iteration: totalSmallIterations });
      return { output: { code: input }, totalSmallIterations: totalSmallIterations };
    }
  }
  return { output: output, totalSmallIterations: totalSmallIterations };
}

exports.default = getOptimizedCode;
