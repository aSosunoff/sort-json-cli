import fs from "fs-extra";
import chalk from "chalk";
import path from "path";
import { __dirname } from "./fix-dirname.js";

import { getJsonStr } from "./get-json-str.js";
import { cli } from "./cli.js";

const log = console.log;

if (cli.flags.version) {
  log(cli.pkg.version);
  process.exit(0);
} else if (cli.flags.help) {
  log(cli.help);
  process.exit(0);
}

const prefix = "✨ sort-json-cli: ";

const readFile = async (oneOfPaths: string) => {
  const pathReadFile = path.resolve(__dirname, oneOfPaths);

  const filesContent = await fs.readFile(pathReadFile, "utf8");

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

readFile("./source.json");
