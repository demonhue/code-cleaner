function multiply(num1: number, num2: number): number {
  return num1 * num2;
}

function divide(num1: number, num2: number): number {
  if (num2 !== 0) {
    return num1 / num2;
  } else {
    return NaN;
    console.log('Error: Division by zero is not allowed.');
  }
}

function sqrt(num1: number): number {
  return Math.sqrt(num1);
}

export { multiply, divide, sqrt };
console.log('asdfasdf');

/*
function add(num1: number,num2: number): number {
  return num1 + num2;
}
function subtract(num1: number,num2: number): number {
  return num1 - num2;
}

function multiply(num1: number,num2: number): number {
  return num1 * num2;
}

function divide(num1: number, num2: number): number {
  if (num2 !== 0) {
      return num1/num2;
  } else {
      return NaN;
      console.log("Error: Division by zero is not allowed.");
  }
}

function sqrt(num1: number): number{
  return Math.sqrt(num1);
}

export {add, subtract,multiply, divide, sqrt};
*/
