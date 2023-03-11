import {
  ConfigFromRouter,
  LevelsFromRouter,
  LooseUntypeableHandler,
  UntypeableHandler,
  UntypeableRouter,
} from "./types";

export const createClient = <
  TRouter extends UntypeableRouter<any, any>,
  TLevels extends readonly string[] = LevelsFromRouter<TRouter>,
  TConfig extends Record<string, any> = ConfigFromRouter<TRouter>,
>(
  handler: LooseUntypeableHandler<TLevels>,
): UntypeableHandler<TLevels, TConfig> => {
  return handler as any;
};
