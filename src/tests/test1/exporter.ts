const hello = 'hello';
export type StringOrNumber = typeof hello;
export type abc = { [key in StringOrNumber]: string };
type Props = {
  onSubmit: (valuesToSave: abc) => void;
  onGoBack: () => void;
  initialEmail?: string;
};
console.log(Props);
/*
const hello = "hello";

export type StringOrNumber = typeof hello;
export type abc = {
  [key in StringOrNumber]: string;
}

type Props = {
  onSubmit: (valuesToSave: abc) => void ;
  onGoBack: () => void;
  initialEmail?:string;
};

console.log(Props);
*/

// function createSquare(config: abc): { color: string; area: number } {
//   let newSquare = { color: "white", area: 100 };
//   if (config.color) {
//     newSquare.color = config.color;
//   }
//   if (config.width) {
//     newSquare.area = config.width * config.width;
//   }
//   return newSquare;
// }

// createSquare();
