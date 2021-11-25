import chalk from "chalk";
import path from "path";
import sortPackageJson from "sort-package-json";
import fsx from "fs-extra";
import fs from "fs";
import util from "util";
import { getIndentationCount, prefix } from "./constant.js";
/* import { saveFile } from "./save-file.js"; */
import { sortObject } from "./sort-object.js";
const log = console.log;
export class SortJson {
    pack = false;
    tabs = false;
    indentationCount = 0;
    target = false;
    silent = false;
    constructor(option) {
        if (option && option.pack)
            this.pack = option.pack;
        if (option && option.tabs)
            this.tabs = option.tabs;
        if (option && option.indentationCount)
            this.indentationCount = option.indentationCount;
        if (option && option.target)
            this.target = option.target;
    }
    async #getObjFromJsonFile(oneOfPaths) {
        const filesContent = await fsx.readFile(oneOfPaths, "utf8");
        return {
            obj: JSON.parse(filesContent),
            content: filesContent,
        };
    }
    #getTargenPathFileName(oneOfPaths) {
        const confirFile = path.basename(oneOfPaths).split(".");
        confirFile.splice(-1, 0, "target");
        const dirname = path.dirname(oneOfPaths);
        return `${dirname}/${confirFile.join(".")}`;
    }
    async #sortingObject(oneOfPaths) {
        let { obj, content: unsortContent } = await this.#getObjFromJsonFile(oneOfPaths);
        if (!obj)
            throw new Error("Can't get content");
        if (!this.pack && path.basename(oneOfPaths) === "package.json") {
            obj = this.#formatPackageJson(obj);
        }
        const sortContent = sortObject(obj, {
            tabs: this.tabs,
            indentationCount: getIndentationCount({
                indentationCount: this.indentationCount,
                tabs: this.tabs,
            }),
        });
        return {
            unsortContent,
            sortContent,
        };
    }
    #formatPackageJson(obj) {
        if (typeof obj !== "object")
            return obj;
        const sortOrder = sortPackageJson.sortOrder.filter((field) => !["lect", "tap"].includes(field));
        const idxOfResolutions = sortOrder.indexOf("resolutions");
        sortOrder.splice(idxOfResolutions, 0, "tap", "lect");
        return sortPackageJson(obj, {
            sortOrder,
        });
    }
    readSortAndWriteFile = async (oneOfPaths) => {
        try {
            let { sortContent: content } = await this.#sortingObject(oneOfPaths);
            let pathToFile;
            if (this.target) {
                pathToFile = this.#getTargenPathFileName(oneOfPaths);
            }
            else {
                pathToFile = oneOfPaths;
            }
            await util.promisify(fs.writeFile)(pathToFile, content);
            return true;
        }
        catch (err) {
            if (!this.silent) {
                log(`${chalk.grey(prefix)}${oneOfPaths} - ${chalk.red(err)}`);
            }
            return false;
        }
    };
    isDifference = async (oneOfPaths) => {
        try {
            let { sortContent, unsortContent } = await this.#sortingObject(oneOfPaths);
            return sortContent.trimEnd() !== unsortContent.trimEnd();
        }
        catch (err) {
            if (!this.silent) {
                log(`${chalk.grey(prefix)}${oneOfPaths} - ${chalk.red(err)}`);
            }
            return false;
        }
    };
}
