import chalk from "chalk";
import path from "path";

import { cli } from "./cli.js";
import { getIndentationCount, prefix } from "./constant.js";
import { getObjFromJsonFile } from "./get-obj-from-json-file.js";
import { saveFile } from "./save-file.js";
import { sortObject } from "./sort-object.js";

const log = console.log;

export const readSortAndWriteFile = async (oneOfPaths: string) => {
  try {
    let obj: Record<string, any> = await getObjFromJsonFile(oneOfPaths);

    if (!obj) throw new Error("Can't get content");

    const content = sortObject(obj, {
      tabs: cli.flags.tabs,
      indentationCount: getIndentationCount({
        indentationCount: cli.flags.indentationCount,
        tabs: cli.flags.tabs,
      }),
    });

    let pathToFile = oneOfPaths;

    if (cli.flags.target) {
      const confirFile = path.basename(oneOfPaths).split(".");
      confirFile.splice(-1, 0, "target");
      const dirname = path.dirname(oneOfPaths);

      pathToFile = `${dirname}/${confirFile.join(".")}`;
    }

    await saveFile(pathToFile, content);

    return true;
  } catch (err) {
    log(`${chalk.grey(prefix)}${oneOfPaths} - ${chalk.red(err)}`);

    return false;
  }
};
