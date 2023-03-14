export type Person = {
  name: string;
  height: string;
  mass: string;
  hair_color: string;
  skin_color: string;
  birth_year: string;
  gender: string;
  homeworld: string;
  films: string[];
};

export type Planet = {
  climate: string;
  diameter: string;
  gravity: string;
  name: string;
  orbital_period: string;
  population: string;
  residents: string[];
};

export type Film = {
  title: string;
  episode_id: number;
  opening_crawl: string;
  director: string;
  producer: string;
  release_date: string;
  characters: string[];
  planets: string[];
  starships: string[];
  vehicles: string[];
};

export type Vehicle = {
  name: string;
  model: string;
  manufacturer: string;
  cost_in_credits: string;
  length: string;
  max_atmosphering_speed: string;
};

export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};
