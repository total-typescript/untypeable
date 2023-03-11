// Features we want:
// Merging
// Creating generic functions from configs
// Creating configs with multiple nesting

import { createClient } from "./client";
import { initUntypeable } from "./untypeable";

const u = initUntypeable()
  .addLevel<"twitter" | "youtube">()
  .addLevel<"GET" | "POST" | "PUT">();

type User = {
  id: string;
  name: string;
};

// Create a tRPC-style router definition
const userRouter = u.router().add("/user/:id", {
  twitter: {
    GET: u.input().output<User>(),
    PUT: u.input().output<User>(),
  },
});

// Create a client from the TYPE of the router,
// meaning that the router never gets bundled
const fetchFromRouter = createClient<typeof userRouter>(
  async (path, method, input) => {
    // Fetch from server in here
  },
);

// Type-safe data access!
fetchFromRouter("/user/:id", "GET", {
  name: "John Doe",
});
