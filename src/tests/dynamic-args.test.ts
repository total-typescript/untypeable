import { it, vitest } from "vitest";
import { createTypeLevelClient } from "../client";
import { initUntypeable } from "../untypeable";

it("Should let you specify 2 args", async () => {
  const u = initUntypeable().args<"GET" | "POST", "SOMETHING" | "ELSE">();

  const router = u.router({
    GET: {
      ELSE: u.output<string>(),
    },
  });

  const client = createTypeLevelClient<typeof router>(vitest.fn());

  await client("GET", "ELSE");

  // @ts-expect-error
  await client("GET", "SOMETHING");

  // @ts-expect-error
  await client("POST", "ELSE");
});

it("Should default to only requiring one arg", async () => {
  const u = initUntypeable();

  const router = u.router({
    GET: u.output<string>(),
  });

  const client = createTypeLevelClient<typeof router>(vitest.fn());

  await client("GET");

  // @ts-expect-error
  await client("POST");
});
