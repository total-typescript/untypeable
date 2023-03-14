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
 *
 * @example
 *
 * const client = createTypeLevelClient<MyRouterType>((path) => {
 *   return fetch(path).then(res => res.json());
 * });
 */
export const createTypeLevelClient = <
  TRouter extends UntypeableRouter<any, any>,
  TArgs extends readonly string[] = ArgsFromRouter<TRouter>,
  TRoutes extends Record<string, any> = RoutesFromRouter<TRouter>,
>(
  handler: LooseUntypeableHandler<TArgs>,
): UntypeableHandler<TArgs, TRoutes> => {
  return handler as any;
};
