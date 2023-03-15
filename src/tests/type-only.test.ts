import { describe, expect, it, vitest } from "vitest";
import { createTypeLevelClient } from "../client";
import { initUntypeable } from "../untypeable";
import { Equal, Expect } from "./utils";

const u = initUntypeable();

const router = u.router({
  inputNeeded: u.input<string>().output<number>(),
  noInputNeeded: u.output<boolean>(),
  partialInputOnly: u.input<{ a?: string }>().output<{ a: string }>(),
});

describe("input types", () => {
  it("Should require an input of the correct type if one has been specified", async () => {
    const fn = vitest.fn();

    const client = createTypeLevelClient<typeof router>(fn);

    // @ts-expect-error
    await client("inputNeeded");
    expect(fn).toHaveBeenLastCalledWith("inputNeeded");

    await client("inputNeeded", "hello");
    expect(fn).toHaveBeenLastCalledWith("inputNeeded", "hello");

    // @ts-expect-error
    await client("inputNeeded", 0);
    expect(fn).toHaveBeenLastCalledWith("inputNeeded", 0);
  });

  it("Should not require an input if one has not been specified", async () => {
    const fn = vitest.fn();

    const client = createTypeLevelClient<typeof router>(fn);

    await client("noInputNeeded");
    expect(fn).toHaveBeenLastCalledWith("noInputNeeded");

    // @ts-expect-error
    await client("noInputNeeded", "hello");

    expect(fn).toHaveBeenLastCalledWith("noInputNeeded", "hello");
  });

  it("Should not require an input if all properties of the input are optional", async () => {
    const fn = vitest.fn();

    const client = createTypeLevelClient<typeof router>(fn);

    await client("partialInputOnly");
    expect(fn).toHaveBeenLastCalledWith("partialInputOnly");

    await client("partialInputOnly", {});
    expect(fn).toHaveBeenLastCalledWith("partialInputOnly", {});
  });
});

describe("Output types", () => {
  it("Should return an output of the correct type", async () => {
    const fn = vitest.fn();

    const client = createTypeLevelClient<typeof router>(fn);

    const numResult = await client("inputNeeded", "adwawd");
    const boolResult = await client("noInputNeeded");

    type tests = [
      Expect<Equal<typeof numResult, number>>,
      Expect<Equal<typeof boolResult, boolean>>,
    ];
  });
});
