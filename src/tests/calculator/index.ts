import { add, divide, multiply, sqrt } from './calculator';
function square(a: number): number {
  return multiply(a, a);
}
function rootMeanSquare(arr: number[]): number {
  let sumOfSquares: number = 0;
  arr.reduce((sumOfSquares: number, value: number): number => {
    return add(sumOfSquares, square(value));
  });
  return sqrt(divide(sumOfSquares, arr.length));
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
