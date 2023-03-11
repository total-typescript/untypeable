import {
  UntypeableBase,
  UntypeableInput,
  UntypeableOutput,
  UntypeableRouter,
} from "./types";

const initRouter = (): UntypeableRouter => {
  return {
    add: () => initRouter(),
    merge: () => initRouter(),
    handler: (handler) => handler as any,
  };
};

const initInput = (): UntypeableInput<any> => {
  return {
    output: () => initOutput(),
    __type: "input",
  };
};

const initOutput = (): UntypeableOutput<any, any> => {
  return {
    __type: "output",
  };
};

export const initUntypeable = (): UntypeableBase => {
  return {
    pushArg: () => initUntypeable() as any,
    unshiftArg: () => initUntypeable() as any,
    args: () => initUntypeable() as any,
    input: () => initInput(),
    output: () => initOutput(),
    router: () => initRouter(),
  };
};
