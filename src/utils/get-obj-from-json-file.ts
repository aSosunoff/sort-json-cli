import fsx from "fs-extra";
import chalk from "chalk";

const log = console.log;
const prefix = "✨ sort-json-cli: ";

export const getObjFromJsonFile = async (oneOfPaths: string) => {
  const filesContent = await fsx.readFile(oneOfPaths, "utf8");

  let parsedJson: Record<string, any>;

  try {
    parsedJson = JSON.parse(filesContent);
  } catch (err) {
    log(`${chalk.grey(prefix)}${oneOfPaths} - ${chalk.red(err)}`);

    return Promise.resolve(null);
  }

  return parsedJson;
};
