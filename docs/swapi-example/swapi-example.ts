import { createTypeLevelClient, initUntypeable } from "../../src/index";
import { Person, Paginated, Planet, Film, Vehicle } from "./types";

const u = initUntypeable();

/**
 * Create the router
 */
const router = u.router({
  "/people/:id": u.input<{ id: string }>().output<Person>(),
  "/people": u.output<Paginated<Person>>(),
  "/planets/:id": u.input<{ id: string }>().output<Planet>(),
  "/planets": u.output<Paginated<Planet>>(),
  "/films/:id": u.input<{ id: string }>().output<Film>(),
  "/films": u.output<Paginated<Film>>(),
  "/vehicles/:id": u.input<{ id: string }>().output<Vehicle>(),
  "/vehicles": u.output<Paginated<Vehicle>>(),
});

/**
 * Create the client, using the zero-bundle method
 */
export const fetchFromSwapi = createTypeLevelClient<typeof router>(
  (path, input = {}) => {
    // Replace dynamic path params in url
    const pathWithParams = path.replace(
      /:([a-zA-Z0-9_]+)/g,
      (_, key) => input[key],
    );

    return fetch(`https://swapi.dev/api${pathWithParams}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());
  },
);
