import { SEPARATOR } from "./constants";
import {
  UntypeableBase,
  UntypeableInput,
  UntypeableOutput,
  UntypeableRouter,
  AcceptedParser,
  SchemaMap,
} from "./types";

const isOutput = (value: {
  __type?: string;
}): value is UntypeableOutput<any, any> => {
  return value.__type === "output";
};

const isInput = (value: {
  __type?: string;
}): value is UntypeableOutput<any, any> => {
  return value.__type === "input";
};

const initRouter = <TRoutes extends Record<string, any> = {}>(
  routes: TRoutes,
): UntypeableRouter => {
  const schemaMap: SchemaMap = new Map();

  const collectRoutes = (
    routes: Record<string, UntypeableOutput<any, any> | Record<string, any>>,
    path: string[] = [],
  ) => {
    for (const [key, value] of Object.entries(routes)) {
      if (isOutput(value)) {
        schemaMap.set([...path, key].join(SEPARATOR), {
          input: value.inputSchema,
          output: value.outputSchema,
        });
      } else if (isInput(value)) {
        throw new Error("An input cannot be passed directly to a router.");
      } else {
        collectRoutes(value, [...path, key]);
      }
    }
  };

  collectRoutes(routes);

  return {
    add: (routes) => initRouter(routes),
    merge: () => initRouter(),
    _schemaMap: schemaMap,
  };
};

const initInput = (
  inputSchema: AcceptedParser<any> | undefined,
): UntypeableInput<any> => {
  return {
    output: (outputSchema) => initOutput(inputSchema, outputSchema),
    inputSchema,
    __type: "input",
  };
};

const initOutput = (
  inputSchema: AcceptedParser<any> | undefined,
  outputSchema: AcceptedParser<any> | undefined,
): UntypeableOutput<any, any> => {
  return {
    __type: "output",
    inputSchema,
    outputSchema,
  };
};

export const initUntypeable = (): UntypeableBase => {
  return {
    pushArg: () => initUntypeable() as any,
    unshiftArg: () => initUntypeable() as any,
    args: () => initUntypeable() as any,
    input: initInput,
    output: (outputSchema) => initOutput(undefined, outputSchema),
    router: (routes) => initRouter(routes),
  };
};
