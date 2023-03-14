import { it } from "vitest";
import { initUntypeable } from "../untypeable";

it("REPL", () => {
  const u = initUntypeable().pushArg<"GET" | "POST">();

  const router = u.router({
    something: {
      GET: u.output<string>(),
      POST: u.input<string>().output<string>(),
    },
  });
});
