import fs from "fs-extra";
import chalk from "chalk";
import path from "path";

import { getDirname } from "./fix-dirname.js";
import { getJsonStr } from "./get-json-str.js";

const log = console.log;
const prefix = "✨ sort-json-cli: ";
const __dirname = getDirname(import.meta);

export const readFile = async (oneOfPaths: string) => {
  const filesContent = await fs.readFile(oneOfPaths, "utf8");

  let parsedJson: Record<string, any>;

  try {
    parsedJson = JSON.parse(filesContent);
  } catch (err) {
    log(`${chalk.grey(prefix)}${oneOfPaths} - ${chalk.red(err)}`);

    return Promise.resolve(null);
  }

  const content = getJsonStr(parsedJson);

  const pathWriteFile = path.resolve(__dirname, "./target.json");

  await fs.writeFile(pathWriteFile, content);
};
