'use strict';
//import log from "./log.js";
//log("hello");
Object.defineProperty(exports, '__esModule', { value: true });
exports.sqrt = exports.divide = exports.multiply = exports.add = void 0;
function add(num1, num2) {
  return num1 + num2;
}
exports.add = add;
function multiply(num1, num2) {
  return num1 * num2;
}
exports.multiply = multiply;
function divide(num1, num2) {
  if (num2 !== 0) {
    return num1 / num2;
  } else {
    return NaN;
    console.log('Error: Division by zero is not allowed.');
  }
}
exports.divide = divide;
function sqrt(num1) {
  return Math.sqrt(num1);
}
exports.sqrt = sqrt;
console.log('hello');
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
