import fs from "fs-extra";
import chalk from "chalk";
import path from "path";

import { getJsonStr } from "./get-json-str";
import { cli } from "./cli";

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

/* console.log(
  getJsonStr({
    onlyNeed: "You'll only need to do this once",
    a: [1, 20, 2, 10, 3, 5, 6, 3, 55, 10, 30, 40],
    b: ["1", "20", "2", "10", "3", "5", "6", "3", "55", "10", "30", "40"],
    d2: {
      n: "1",
      1: 1,
      20: "test",
      2: true,
      10: null,
      x: "2",
    },
  })
); */
