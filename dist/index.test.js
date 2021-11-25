import path from "path";
import util from "util";
import childProcess from "child_process";
import fs from "fs";
import fsx from "fs-extra";
const exec = util.promisify(childProcess.exec);
describe("Check CLI sortjsoncli", () => {
    const testFileName = "source.json";
    const testFileTargetName = "source.target.json";
    it("should by contain output line", async () => {
        await fs.promises.writeFile(path.resolve(__dirname, testFileName), JSON.stringify({
            1: 1,
            10: 1,
            2: 1,
        }, null, 2));
        const { stdout } = await exec(`node --loader ts-node/esm ./src/index.ts ./src/${testFileName} -d`);
        expect(stdout).toBe(`✨ sort-json-cli: We'd try to sort the following files:\n./src/${testFileName}\n`);
        await fs.promises.rm(path.resolve(__dirname, testFileName));
    });
    it("should by sort file", async () => {
        await fs.promises.writeFile(path.resolve(__dirname, testFileName), JSON.stringify({
            1: 1,
            10: 1,
            2: 1,
        }, null, 2));
        await exec(`node --loader ts-node/esm ./src/index.ts ./src/${testFileName} -r`);
        const filesContentTarget = await fsx.readFile(path.resolve(__dirname, testFileTargetName), "utf8");
        expect(filesContentTarget).toBe('{\n  "1": 1,\n  "10": 1,\n  "2": 1\n}');
        await fs.promises.rm(path.resolve(__dirname, testFileName));
        await fs.promises.rm(path.resolve(__dirname, testFileTargetName));
    });
});
