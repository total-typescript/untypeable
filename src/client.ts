import {
  RoutesFromRouter,
  ArgsFromRouter,
  LooseUntypeableHandler,
  UntypeableHandler,
  UntypeableRouter,
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
