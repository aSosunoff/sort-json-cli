import { Required_v2 } from "../types/helper.js";
import { cli } from "./cli.js";

export const prefix = "✨ sort-json-cli: ";

type INDENTATION_COUNT_OPTION = {
  tabs?: boolean;
  indentationCount?: number;
};

export const getIndentationCount = (option?: INDENTATION_COUNT_OPTION) => {
  const defaultOption = { tabs: false, indentationCount: 0 };

  let {
    indentationCount: k_indentationCount,
    tabs: k_tabs,
  }: Required_v2<INDENTATION_COUNT_OPTION, keyof typeof defaultOption> = {
    ...defaultOption,
    ...option,
  };

  let indentationCount = 2;

  if (k_tabs) {
    indentationCount = 1;
  }

  if (k_indentationCount) {
    indentationCount = +k_indentationCount;
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
