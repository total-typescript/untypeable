import { createClient } from "./client";
import { initUntypeable } from "./untypeable";

const u = initUntypeable().args<
  "twitter" | "youtube",
  string,
  "GET" | "PUT" | "POST" | "DELETE"
>();

type User = {
  id: string;
  name: string;
};

// Create a tRPC-style router definition
const userRouter = u
  .router()
  .add({
    twitter: {
      "/user/:id": {
        GET: u
          .input<{
            id: string;
          }>()
          .output<User>(),
      },
    },
  })
  .add({
    youtube: {
      "/user/:id": {},
    },
  });

// Create a client from the TYPE of the router,
// meaning that the router never gets bundled
const fetchFromRouter = createClient<typeof userRouter>(
  async (api, path, method, input) => {
    // Fetch from server in here
  },
);

// Type-safe data access!
const user = fetchFromRouter("twitter", "/user/:id", "GET", {
  id: "123",
});
