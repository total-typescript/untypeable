import { initUntypeable, createTypeLevelClient } from "untypeable";

// Initialize untypeable
const u = initUntypeable();

type User = {
  id: string;
  name: string;
};

// Create a router
// - Add typed inputs and outputs
const router = u.router({
  "/user": u.input<{ id: string }>().output<User>(),
});

// Create your client
// - Pass any fetch implementation here
const client = createTypeLevelClient<typeof router>((path, input) => {
  return fetch(path + `?${new URLSearchParams(input)}`).then((res) =>
    res.json(),
  );
});

// Type-safe data access!
// - user is typed as User
// - { id: string } must be passed as the input
const user = client("/user", {
  id: "1",
});
