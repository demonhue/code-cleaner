//import { add, divide, multiply, sqrt } from "@util/calculator";
import { divide, multiply, sqrt } from 'calculator';

import { useState } from 'react';

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

/*
const lalala = {
  booo: (actionParams, { setState, params }) => {
  const { onClose } = params;

  setState({ adBuysScreensList: [] });

  onClose();
}};
*/

let arr = [1, 3, 5];
console.log(rootMeanSquare(arr));
console.log('c');
/*
function noop(field: FieldIds, e: string): void {
  return undefined;
}
const formRef = useRef({ setFormError: noop });
*/

//console.log(formRef);

console.log(useState);
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
