import chalk from "chalk";
import path from "path";
import sortPackageJson from "sort-package-json";

import { cli } from "./cli.js";
import { getIndentationCount, prefix } from "./constant.js";
import { getObjFromJsonFile } from "./get-obj-from-json-file.js";
import { saveFile } from "./save-file.js";
import { sortObject } from "./sort-object.js";

const log = console.log;

const sortingObject = async (oneOfPaths: string) => {
  let { obj, content: unsortContent } = await getObjFromJsonFile(oneOfPaths);

  if (!obj) throw new Error("Can't get content");

  if (!cli.flags.pack && path.basename(oneOfPaths) === "package.json") {
    obj = formatPackageJson(obj);
  }

  const sortContent = sortObject(obj, {
    tabs: cli.flags.tabs,
    indentationCount: getIndentationCount({
      indentationCount: cli.flags.indentationCount,
      tabs: cli.flags.tabs,
    }),
  });

  return {
    unsortContent,
    sortContent,
  };
};

function formatPackageJson(obj: any) {
  /* istanbul ignore next */
  if (typeof obj !== "object") {
    return obj;
  }
  const sortOrder = sortPackageJson.sortOrder
    // 1. delete tap and lect fields
    .filter((field) => !["lect", "tap"].includes(field));

  // 2. then, insert both after resolutions, first tap then lect

  const idxOfResolutions = sortOrder.indexOf("resolutions");

  sortOrder.splice(idxOfResolutions, 0, "tap", "lect");

  // use custom array for sorting order:
  return sortPackageJson(obj, {
    sortOrder,
  });
}

export const readSortAndWriteFile = async (oneOfPaths: string) => {
  try {
    let { sortContent: content } = await sortingObject(oneOfPaths);

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

export const isDifference = async (oneOfPaths: string) => {
  try {
    let { sortContent, unsortContent } = await sortingObject(oneOfPaths);

    return sortContent.trimEnd() !== unsortContent.trimEnd();
  } catch (err) {
    log(`${chalk.grey(prefix)}${oneOfPaths} - ${chalk.red(err)}`);

    return false;
  }
};
