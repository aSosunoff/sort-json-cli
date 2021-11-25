import path from "path";
import { globby } from "globby";
import chalk from "chalk";
import pReduce from "p-reduce";
import isDirectory from "is-d";
import pFilter from "p-filter";
import { cli } from "./utils/cli.js";
import { nonJsonFormats, badFiles, prefix } from "./utils/constant.js";
import { SortJson } from "./utils/SortJson.js";
const log = console.log;
//#region info by library
if (cli.flags.version) {
    log(cli.pkg.version);
    process.exit(0);
}
else if (cli.flags.help) {
    log(cli.help);
    process.exit(0);
}
//#endregion
(async () => {
    try {
        const sortJson = new SortJson({
            indentationCount: cli.flags.indentationCount,
            pack: cli.flags.pack,
            target: cli.flags.target,
            tabs: cli.flags.tabs,
            silent: cli.flags.silent,
        });
        let paths = await globby(cli.input, { dot: true });
        //#region The inputs don't lead to any json files! Exiting.
        if (paths.length === 0 && !cli.flags.silent) {
            log(`${chalk.grey(prefix)}${chalk.red("The inputs don't lead to any json files! Exiting.")}`);
            process.exit(0);
        }
        //#endregion
        //#region if found directory path
        paths = await pReduce(paths, async (concattedTotal, singleDirOrFilePath) => {
            const isDir = await isDirectory(singleDirOrFilePath);
            if (isDir) {
                const pGlobby = await globby(cli.flags.nodemodules
                    ? singleDirOrFilePath
                    : [singleDirOrFilePath, "!**/node_modules/**"], {
                    expandDirectories: {
                        files: [".*", "*.json"],
                    },
                });
                return concattedTotal.concat(...pGlobby);
            }
            else {
                return concattedTotal.concat(singleDirOrFilePath);
            }
        }, []);
        //#endregion
        //#region filter files
        paths = paths
            .filter((oneOfPaths) => !oneOfPaths.includes("package-lock.json"))
            .filter((oneOfPaths) => !oneOfPaths.includes("yarn.lock"))
            .filter((oneOfPaths) => (cli.flags.nodemodules ? true : !oneOfPaths.includes("node_modules")))
            .filter((oneOfPaths) => (cli.flags.pack ? !oneOfPaths.includes("package.json") : true))
            .filter((oneOfPaths) => {
            const isJson = path.extname(oneOfPaths) === ".json";
            const isString = typeof path.basename(oneOfPaths) === "string";
            const isHideFile = path.basename(oneOfPaths).startsWith(".");
            return (isJson ||
                (isString &&
                    isHideFile &&
                    !nonJsonFormats.some(path.extname(oneOfPaths).includes) &&
                    !badFiles.some(path.basename(oneOfPaths).includes)));
        });
        //#endregion
        //#region only show files to sort
        if (cli.flags.dry && !cli.flags.silent) {
            log(`${chalk.grey(prefix)}${chalk.yellow("We'd try to sort the following files:")}\n${paths.join("\n")}`);
            return;
        }
        //#endregion
        //#region working for CI mode
        if (cli.flags.ci) {
            const pathFiltred = await pFilter(paths, sortJson.isDifference);
            if (cli.flags.silent)
                return;
            if (pathFiltred.length) {
                log(`${chalk.grey(prefix)}${chalk.red("Unsorted files:")}\n${pathFiltred.join("\n")}`);
                process.exit(9);
            }
            log(`${chalk.grey(prefix)}${chalk.white("All files were already sorted:")}\n${paths.join("\n")}`);
            process.exit(0);
        }
        //#endregion
        //#region calculate good and bad files.
        const counter = await pReduce(paths, async (counter, currentPath) => {
            try {
                const res = await sortJson.readSortAndWriteFile(currentPath);
                return res
                    ? {
                        ...counter,
                        good: counter.good.concat(currentPath),
                    }
                    : {
                        ...counter,
                        bad: counter.bad.concat(currentPath),
                    };
            }
            catch (err) {
                if (!cli.flags.silent)
                    log(`${chalk.grey(prefix)}${chalk.red("Could not write out the sorted file:")} ${err}`);
                return counter;
            }
        }, { good: [], bad: [] });
        if (!cli.flags.silent) {
            log(`\n${chalk.grey(prefix)}${chalk.green(`${counter.bad && counter.bad.length === 0 ? "All " : ""}${counter.good.length} files sorted`)}${counter.bad && counter.bad.length
                ? `\n${chalk.grey(prefix)}${chalk.red(`${counter.bad.length} file${counter.bad.length === 1 ? "" : "s"} could not be sorted`)} ${`\u001b[${90}m - ${counter.bad.join(" - ")}\u001b[${39}m`}`
                : ""}`);
        }
        //#endregion
    }
    catch (err) {
        if (!cli.flags.silent) {
            log(`${chalk.grey(prefix)}${chalk.red("Oops!")} ${err}`);
        }
    }
})();
