import { expect, it, vitest } from "vitest";
import { z } from "zod";
import { createSafeClient } from "../client";
import { initUntypeable } from "../untypeable";

it("Should let you define inputs and outputs as schemas", async () => {
  const u = initUntypeable();
  const router = u.router({
    inputNeeded: u.input(z.string()).output(z.object({ hello: z.string() })),
  });

  const fn = vitest.fn();

  const client = createSafeClient(router, fn);

  fn.mockResolvedValueOnce({ hello: "world" });

  await client("inputNeeded", "hello");
});

it("Should error if you do not provide the correct input", async () => {
  const u = initUntypeable();
  const router = u.router({
    inputNeeded: u.input(z.string()).output(z.object({ hello: z.string() })),
  });

  const fn = vitest.fn();

  const client = createSafeClient(router, fn);

  fn.mockResolvedValueOnce({ hello: "world" });

  await client("inputNeeded", "hello");
});

it("Should error if the fetcher does not provide the correct output WITHOUT an input", async () => {
  const u = initUntypeable();
  const router = u.router({
    inputNotNeeded: u.output(z.object({ hello: z.string() })),
  });

  const fn = vitest.fn();

  const client = createSafeClient(router, fn);

  fn.mockResolvedValueOnce({ hello: 124 });

  await expect(() => client("inputNotNeeded")).rejects.toThrowError();
});

it("Should error if the fetcher does not provide the correct output WITH an input", async () => {
  const u = initUntypeable();
  const router = u.router({
    inputNeeded: u.input(z.string()).output(z.object({ hello: z.string() })),
  });

  const fn = vitest.fn();

  const client = createSafeClient(router, fn);

  fn.mockResolvedValueOnce({ hello: 124 });

  await expect(() => client("inputNeeded", "124123123")).rejects.toThrowError();
});
