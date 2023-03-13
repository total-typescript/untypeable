# Untypeable

Type untypeable API's with ease, with a zero-bundle size option.

## The Problem

Most TypeScript projects will have to, at some point, use the network.

- In full-stack projects, you'll have **the backend in the same repository as the frontend**. In those cases, you should probably be using [tRPC](https://trpc.io/).

- Sometimes, you'll be **calling a [GraphQL](https://graphql.org/) or [OpenAPI](https://www.openapis.org/) server**. In those cases, you can [generate](https://www.youtube.com/watch?v=5weFyMoBGN4) the types with a number of different CLI's.

- Other times, you'll be using a **strongly-typed SDK** to access that data, like [Google's](https://github.com/googleapis/google-api-nodejs-client).

But what about EVERY OTHER situation? What if your API doesn't use GraphQL or OpenAPI?

What if your API is... _untypeable_?

## Solution

Enter `untypeable` - a first-class library for typing API's you don't control.

- 🚀 Get **autocomplete on your entire API**, without needing to set up a single generic function.
- 💪 **Simple to configure**, and extremely **flexible**.
- 🤯 Choose between two modes:
  - **Zero bundle-size**: use `import type` to ensure `untypeable` adds nothing to your bundle.
  - **Strong types**: integrates with libraries like [Zod](https://zod.dev/) to add runtime safety to the types.
- ✨ **Keep things organized** with helpers for merging and combining your config.
- ❤️ You bring the fetcher, we bring the types. There's **no hidden magic**.

## Quickstart

`npm i untypeable`

```ts
import { initUntypeable, createClient } from "untypeable";

// Initialize untypeable
const u = initUntypeable();

type User = {
  id: string;
  name: string;
};

// Create a router
// - Add typed inputs and outputs
const router = u.router().add({
  "/user": u.input<{ id: string }>().output<User>(),
});

// Create your client
// - Pass any fetch implementation here
const client = createClient(router, (path, input) => {
  return fetch(path + `?${new URLSearchParams(input)}`).then((res) =>
    res.json(),
  );
});

// Type-safe data access!
// - user is typed as User
// - { id: string } must be passed as the input
const user = await client("/user", {
  id: "1",
});
```

## Zero-bundle mode

You can set up `untypeable` to run in zero-bundle mode. This is great for situations where you trust the API you're calling, but it just doesn't have types.

If you don't trust the API you're calling, use 'runtime-safe mode'.

To set up zero-bundle mode, you'll need to:

1. Define your router in a file called `router.ts`.
2. Export the type of your router: `export type MyRouter = typeof router;`

```ts
// router.ts

import { initUntypeable } from "untypeable";

const u = initUntypeable();

type User = {
  id: string;
  name: string;
};

const router = u.router().add({
  "/user": u.input<{ id: string }>().output<User>(),
});

export type MyRouter = typeof router;
```

3. In a file called `client.ts`, import `createTypeLevelClient` from `untypeable/type-level-client`.

```ts
// client.ts

import { createTypeLevelClient } from "untypeable/type-level-client";
import type { MyRouter } from "./router";

export const client = createTypeLevelClient<MyRouter>(() => {
  // your implementation...
});
```

### How does this work?

This works because `createTypeLevelClient` is just an identity function, which directly returns the function you pass it. Most modern bundlers are smart enough to [collapse identity functions](https://github.com/evanw/esbuild/pull/1898) and erase type imports, so you end up with:

```ts
// client.ts

export const client = () => {
  // your implementation...
};
```

## Runtime-safe mode

Sometimes, you just don't trust the API you're calling. In those situations, you'll often like to _validate_ the data you get back.

`untypeable` offers first-class integration with [Zod](https://zod.dev). You can pass a Zod schema to `u.input` and `u.output` to ensure that these values are validated with Zod.

```ts
import { initUntypeable } from "untypeable";
import { z } from "zod";

const u = initUntypeable();

const router = u.router().add({
  "/user": u
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .output(
      z.object({
        id: z.string(),
        name: z.string(),
      }),
    ),
});

export const client = createClient(router, () => {
  // Implementation...
});
```

## Examples

### Using methods

Using the `.pushArg` method when we `initUntypeable` lets us add new arguments that must be passed to our client.

```ts
import { initUntypeable, createClient } from "untypeable";

// use .pushArg to add a new argument to
// the router definition
const u = initUntypeable().pushArg<"GET" | "POST" | "PUT" | "DELETE">();

type User = {
  id: string;
  name: string;
};

// You can now optionally specify the
// method on each route's definition
const router = u.router().add({
  "/user": {
    GET: u.input<{ id: string }>().output<User>(),
    POST: u.input<{ name: string }>().output<User>(),
    DELETE: u.input<{ id: string }>().output<void>(),
  },
});

// The client now takes a new argument - method, which
// is typed as 'GET' | 'POST' | 'PUT' | 'DELETE'
const client = createClient<typeof router>((path, method, input) => {
  let resolvedPath = path;
  let resolvedInit: RequestInit = {};

  switch (method) {
    case "GET":
      resolvedPath += `?${new URLSearchParams(input as any)}`;
      break;
    case "DELETE":
    case "POST":
    case "PUT":
      resolvedInit = {
        method,
        body: JSON.stringify(input),
      };
  }

  return fetch(resolvedPath, resolvedInit).then((res) => res.json());
});

// This now needs to be passed to client, and
// is still beautifully type-safe!
const result = await client("/user", "POST", {
  name: "Matt",
});
```
