import { cli } from "./cli.js";

export const prefix = "✨ sort-json-cli: ";

export const getIndentationCount = () => {
  let indentationCount = 2;

  if (cli.flags.tabs) {
    indentationCount = 1;
  }

  if (cli.flags.indentationCount) {
    indentationCount = +cli.flags.indentationCount;
  }

  return indentationCount;
};

export const nonJsonFormats = ["yml", "toml", "yaml"]; // to save time

export const badFiles = [
  ".DS_Store",
  "npm-debug.log",
  ".svn",
  "CVS",
  "config.gypi",
  ".lock-wscript",
  "package-lock.json",
  "npm-shrinkwrap.json",
];
