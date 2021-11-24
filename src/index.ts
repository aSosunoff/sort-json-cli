import path from "path";
import { globby } from "globby";
import chalk from "chalk";
import pReduce from "p-reduce";
import isDirectory from "is-d";
import pFilter from "p-filter";

import { cli } from "./utils/cli.js";
import { nonJsonFormats, badFiles, prefix } from "./utils/constant.js";
import { readSortAndWriteFile } from "./utils/read-sort-and-write-file.js";

const log = console.log;

//#region info by library
if (cli.flags.version) {
  log(cli.pkg.version);
  process.exit(0);
} else if (cli.flags.help) {
  log(cli.help);
  process.exit(0);
}
//#endregion

(async () => {
  let paths = await globby(cli.input, { dot: true });

  if (paths.length === 0 && !cli.flags.silent) {
    log(`${chalk.grey(prefix)}${chalk.red("The inputs don't lead to any json files! Exiting.")}`);

    process.exit(0);
  }

  paths = await pReduce<string, string[]>(
    paths,
    async (concattedTotal, singleDirOrFilePath) => {
      const isDir = await isDirectory(singleDirOrFilePath);

      if (isDir) {
        const pGlobby = await globby(
          cli.flags.nodemodules
            ? singleDirOrFilePath
            : [singleDirOrFilePath, "!**/node_modules/**"],
          {
            expandDirectories: {
              files: [".*", "*.json"],
            },
          }
        );

        return concattedTotal.concat(pGlobby);
      } else {
        return concattedTotal.concat([singleDirOrFilePath]);
      }
    },
    []
  );

  paths = paths
    .filter((oneOfPaths) => !oneOfPaths.includes("package-lock.json"))
    .filter((oneOfPaths) => !oneOfPaths.includes("yarn.lock"))
    .filter((oneOfPaths) => (cli.flags.nodemodules ? true : !oneOfPaths.includes("node_modules")))
    .filter((oneOfPaths) => (cli.flags.pack ? !oneOfPaths.includes("package.json") : true))
    .filter((oneOfPaths) => {
      const isJson = path.extname(oneOfPaths) === ".json";
      const isString = typeof path.basename(oneOfPaths) === "string";
      const isHideFile = path.basename(oneOfPaths).startsWith(".");

      return (
        isJson ||
        (isString &&
          isHideFile &&
          !nonJsonFormats.some((badExtension) => path.extname(oneOfPaths).includes(badExtension)) &&
          !badFiles.some((badFile) => path.basename(oneOfPaths).includes(badFile)))
      );
    });

  if (cli.flags.dry && !cli.flags.silent) {
    log(
      `${chalk.grey(prefix)}${chalk.yellow("We'd try to sort the following files:")}\n${paths.join(
        "\n"
      )}`
    );
  } else {
    /* 7 */
    // if (cli.flags.ci) {
    //   // CI setting
    //   const received2 = await pFilter(paths, readSortAndWriteOverFile);
    //   /* istanbul ignore else */
    //   if (received2.length && !cli.flags.silent) {
    //     log(`${chalk.grey(prefix)}${chalk.red("Unsorted files:")}\n${received2.join("\n")}`);
    //     process.exit(9);
    //   } else if (!cli.flags.silent) {
    //     log(
    //       `${chalk.grey(prefix)}${chalk.white("All files were already sorted:")}\n${paths.join("\n")}`
    //     );
    //     process.exit(0);
    //   }
    //   return;
    // }

    const counter = await pReduce<
      string,
      {
        good: string[];
        bad: string[];
      }
    >(
      paths,
      async (counter, currentPath) => {
        try {
          const res = await readSortAndWriteFile(currentPath);

          return res
            ? {
                ...counter,
                good: counter.good.concat(currentPath),
              }
            : {
                ...counter,
                bad: counter.bad.concat(currentPath),
              };
        } catch (err) {
          /* istanbul ignore next */
          if (!cli.flags.silent) {
            log(`${chalk.grey(prefix)}${chalk.red("Could not write out the sorted file:")} ${err}`);
          }

          throw err;
        }
      },
      { good: [], bad: [] }
    );

    if (!cli.flags.silent) {
      log(
        `\n${chalk.grey(prefix)}${chalk.green(
          `${counter.bad && counter.bad.length === 0 ? "All " : ""}${
            counter.good.length
          } files sorted`
        )}${
          counter.bad && counter.bad.length
            ? `\n${chalk.grey(prefix)}${chalk.red(
                `${counter.bad.length} file${
                  counter.bad.length === 1 ? "" : "s"
                } could not be sorted`
              )} ${`\u001b[${90}m - ${counter.bad.join(" - ")}\u001b[${39}m`}`
            : ""
        }`
      );
    }
  }
})();
