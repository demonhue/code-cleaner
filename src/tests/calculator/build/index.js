'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const calculator_js_1 = require('./calculator.js');
function square(a) {
  return (0, calculator_js_1.multiply)(a, a);
}
function rootMeanSquare(arr) {
  let sumOfSquares = 0;
  arr.reduce((sumOfSquares, value) => {
    return (0, calculator_js_1.add)(sumOfSquares, square(value));
  });
  return (0, calculator_js_1.sqrt)((0, calculator_js_1.divide)(sumOfSquares, arr.length));
}
let arr = [1, 3, 5];
console.log(rootMeanSquare(arr));
console.log('c');
/*
import { divide, multiply, sqrt } from "./calculator.js";
function square(a: number): number {
  return multiply(a, a);
}
function rootMeanSquare(arr: number[]): number {
  let sumOfSquares: number = 0;
  arr.reduce((sumOfSquares: number, value: number): number => {
    return sumOfSquares + square(value);
  });
  return sqrt(divide(sumOfSquares, arr.length));
}
let arr = [1, 3, 5];
console.log(rootMeanSquare(arr));
*/
