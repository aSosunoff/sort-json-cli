/** @type {import('ts-jest').InitialOptionsTsJest} */
const config = {
  preset: "ts-jest/presets/js-with-ts-esm",
  roots: ["<rootDir>/src"],
  testMatch: ["<rootDir>/src/**/*.test.{js,ts}"],
  transformIgnorePatterns: [
    "[/\\\\]node_modules[/\\\\].+\\.(js|jsx|ts|tsx)$",
    "^.+\\.module\\.(css|sass|scss)$",
  ],
  /* transform: {
    ...tsjPreset.transform,
  }, */
  /* transform: {
    "^.+\\.jsx?$": "babel-jest",
    "^.+\\.tsx?$": "ts-jest",
  }, */
  globals: {
    "ts-jest": {
      useESM: true,
    },
  },
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
};

export default config;
