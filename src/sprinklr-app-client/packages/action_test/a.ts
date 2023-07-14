type Action<TPayload> = {
  type: string;
  payload: TPayload;
};

interface IActionCreator<P> {
  type: string;
  (payload: P): Action<P>;
}

function actionCreator<P>(type: string): IActionCreator<P> {
  return Object.assign((payload: P) => ({ type, payload }), { type });
}

function isType<P>(action: Action<any>, actionCreator: IActionCreator<P>): action is Action<P> {
  return action.type === actionCreator.type;
}

console.log(isType);
