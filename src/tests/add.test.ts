import { expect, it, vitest } from "vitest";
import { z } from "zod";
import { createSafeClient } from "../client";
import { initUntypeable } from "../untypeable";

const u = initUntypeable();

const router = u
  .router({
    inputNeeded: u.input(z.string()).output(z.object({ hello: z.string() })),
  })
  .add({
    inputNotNeeded: u.output(z.object({ hello: z.string() })),
  });

it('Should pick up schemas added by the "add" method', async () => {
  const fn = vitest.fn();
  const client = createSafeClient(router, fn);

  fn.mockResolvedValueOnce({ hello: "world" });

  await client("inputNeeded", "hello");

  expect(fn).toHaveBeenLastCalledWith("inputNeeded", "hello");

  fn.mockResolvedValueOnce({ hello: "world" });

  await client("inputNotNeeded");
});
