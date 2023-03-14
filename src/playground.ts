import { createClient } from "./client";
import { initUntypeable } from "./untypeable";

const u = initUntypeable().pushArg<"GET" | "POST" | "PUT" | "DELETE">();

type User = {
  id: string;
  name: string;
};

const router = u.router({
  "/user": {
    GET: u.input<{ id: string }>().output<User>(),
    POST: u.input<{ name: string }>().output<User>(),
    DELETE: u.input<{ id: string }>().output<void>(),
  },
});

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

const result = client("/user", "POST", {
  name: "Matt",
});
