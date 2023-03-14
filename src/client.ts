import { SEPARATOR } from "./constants";
import {
  RoutesFromRouter,
  ArgsFromRouter,
  LooseUntypeableHandler,
  UntypeableHandler,
  UntypeableRouter,
  Schemas,
  AcceptedParser,
} from "./types";

export const createClient = <
  TRouter extends UntypeableRouter<any, any>,
  TArgs extends readonly string[] = ArgsFromRouter<TRouter>,
  TConfig extends Record<string, any> = RoutesFromRouter<TRouter>,
>(
  handler: LooseUntypeableHandler<TArgs>,
): UntypeableHandler<TArgs, TConfig> => {
  return handler as any;
};

export const createSafeClient = <
  TRouter extends UntypeableRouter<any, any>,
  TArgs extends ArgsFromRouter<TRouter>,
  TConfig extends RoutesFromRouter<TRouter>,
>(
  router: TRouter,
  handler: LooseUntypeableHandler<TArgs>,
): UntypeableHandler<TArgs, TConfig> => {
  return (async (...args: any[]) => {
    let schemas: Schemas;

    const argsExceptLast = args.slice(0, -1);

    const matchingSchemas = router._schemaMap.get(
      argsExceptLast.join(SEPARATOR),
    );

    const secondSchemaMatchAttempt = router._schemaMap.get(
      args.join(SEPARATOR),
    );
    let shouldCheckInput: boolean;

    if (matchingSchemas) {
      schemas = matchingSchemas;
      shouldCheckInput = true;
    } else if (secondSchemaMatchAttempt) {
      schemas = secondSchemaMatchAttempt;
      shouldCheckInput = false;
    } else {
      throw new Error(
        `No matching schema found for args: ${argsExceptLast.join(", ")}`,
      );
    }

    const inputSchema = resolveParser(schemas.input);
    const outputSchema = resolveParser(schemas.output);

    let output;

    if (shouldCheckInput) {
      const input = args[args.length - 1];
      const parsedInput = inputSchema(input);

      output = await (handler as any)(...argsExceptLast, parsedInput);
    } else {
      output = await (handler as any)(...args);
    }

    return outputSchema(output);
  }) as any;
};

const resolveParser = <T>(parser: AcceptedParser<T> | undefined) => {
  if (typeof parser === "function") {
    return parser;
  } else if (typeof parser === "undefined") {
    return (x: any) => x;
  } else {
    return parser.parse;
  }
};
