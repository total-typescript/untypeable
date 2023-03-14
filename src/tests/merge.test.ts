import { expect, it, vitest } from "vitest";
import { z } from "zod";
import { createSafeClient } from "../safe-client";
import { initUntypeable } from "../untypeable";

const u = initUntypeable();

const router1 = u.router({
  inputNeeded: u.input(z.string()).output(z.object({ hello: z.string() })),
});

const router2 = u.router({
  inputNotNeeded: u.output(z.object({ hello: z.string() })),
});

const router = router2.merge(router1);

it('Should pick up schemas added by the "merge" method', async () => {
  const fn = vitest.fn();
  const client = createSafeClient(router, fn);

  fn.mockResolvedValueOnce({ hello: "world" });

  await client("inputNeeded", "hello");

  expect(fn).toHaveBeenLastCalledWith("inputNeeded", "hello");

  fn.mockResolvedValueOnce({ hello: "world" });

  await client("inputNotNeeded");
});
