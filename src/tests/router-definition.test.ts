import { describe, expect, it } from "vitest";
import { initUntypeable } from "../untypeable";

it("Should not let you pass an input directly to a route", () => {
  const u = initUntypeable();

  expect(() =>
    u.router({
      // @ts-expect-error
      inputNeeded: u.input<string>(),
    }),
  ).toThrowError();
});

it("Should let you pass an output without an input", () => {
  const u = initUntypeable();

  u.router({
    noInputNeeded: u.output<string>(),
  });
});
