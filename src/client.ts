import {
  ArgsFromRouter,
  LooseUntypeableHandler,
  RoutesFromRouter,
  UntypeableHandler,
  UntypeableRouter,
} from "./types";

/**
 * Creates an API client that does not check the input or output
 * at runtime. For runtime checking, use createSafeClient.
 *
 * If you're using createTypeLevelClient, we recommend importing
 * it from 'untypeable/client' to minimize bundle size.
 */
export const createTypeLevelClient = <
  TRouter extends UntypeableRouter<any, any>,
  TArgs extends readonly string[] = ArgsFromRouter<TRouter>,
  TConfig extends Record<string, any> = RoutesFromRouter<TRouter>,
>(
  handler: LooseUntypeableHandler<TArgs>,
): UntypeableHandler<TArgs, TConfig> => {
  return handler as any;
};
