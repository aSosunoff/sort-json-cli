import path from "path";
import util from "util";
import childProcess, { ExecException } from "child_process";
import fs from "fs";
import fsx from "fs-extra";

const exec = util.promisify(childProcess.exec);

describe("Check CLI sortjsoncli", () => {
  const testFileName = "source.json";
  const testFileTargetName = "source.target.json";

  it("should by contain output line", async () => {
    await fs.promises.writeFile(
      path.resolve(__dirname, testFileName),
      JSON.stringify(
        {
          1: 1,
          10: 1,
          2: 1,
        },
        null,
        2
      )
    );

    const { stdout } = await exec(
      `node --loader ts-node/esm ./src/index.ts ./src/${testFileName} -d`
    );

    expect(stdout).toBe(
      `✨ sort-json-cli: We'd try to sort the following files:\n./src/${testFileName}\n`
    );

    await fs.promises.rm(path.resolve(__dirname, testFileName));
  });

  it("should by sort file", async () => {
    await fs.promises.writeFile(
      path.resolve(__dirname, testFileName),
      JSON.stringify(
        {
          1: 1,
          10: 1,
          2: 1,
        },
        null,
        2
      )
    );

    await exec(
      `node --loader ts-node/esm ./src/index.ts ./src/${testFileName} -r`
    );

    const filesContentTarget = await fsx.readFile(
      path.resolve(__dirname, testFileTargetName),
      "utf8"
    );

    expect(filesContentTarget).toBe('{\n  "1": 1,\n  "10": 1,\n  "2": 1\n}');

    await fs.promises.rm(path.resolve(__dirname, testFileName));
    await fs.promises.rm(path.resolve(__dirname, testFileTargetName));
  });

  it("check -t key", async () => {
    try {
      await fs.promises.writeFile(
        path.resolve(__dirname, testFileName),
        JSON.stringify(
          {
            1: 1,
            10: 1,
            2: 1,
          },
          null,
          "\t"
        )
      );

      await exec(
        `node --loader ts-node/esm ./src/index.ts ./src/${testFileName} -r -t`
      );

      const filesContentTarget = await fsx.readFile(
        path.resolve(__dirname, testFileTargetName),
        "utf8"
      );

      expect(filesContentTarget).toBe('{\n\t"1": 1,\n\t"10": 1,\n\t"2": 1\n}');
    } finally {
      await fs.promises.rm(path.resolve(__dirname, testFileName));
      await fs.promises.rm(path.resolve(__dirname, testFileTargetName));
    }
  });

  it("check -t -i key", async () => {
    try {
      await fs.promises.writeFile(
        path.resolve(__dirname, testFileName),
        JSON.stringify(
          {
            1: 1,
            10: 1,
            2: 1,
          },
          null,
          "\t"
        )
      );

      await exec(
        `node --loader ts-node/esm ./src/index.ts ./src/${testFileName} -r -t -i=2`
      );

      const filesContentTarget = await fsx.readFile(
        path.resolve(__dirname, testFileTargetName),
        "utf8"
      );

      expect(filesContentTarget).toBe(
        '{\n\t\t"1": 1,\n\t\t"10": 1,\n\t\t"2": 1\n}'
      );
    } finally {
      await fs.promises.rm(path.resolve(__dirname, testFileName));
      await fs.promises.rm(path.resolve(__dirname, testFileTargetName));
    }
  });

  it("check -c key sorted file", async () => {
    const file_1 = '{\n  "1": 1,\n  "10": 1,\n  "2": 1\n}';
    const file_2 = '{\n  "1": 1,\n  "10": 1,\n  "2": 1,\n  "20": 1\n}';

    const files = [
      { name: "file1.json", content: file_1 },
      { name: "file2.json", content: file_2 },
    ];

    try {
      for await (const file of files) {
        await fs.promises.writeFile(
          path.resolve(__dirname, file.name),
          file.content
        );
      }

      const command = files.map(({ name }) => path.resolve(__dirname, name));

      const { stdout } = await exec(
        `node --loader ts-node/esm ./src/index.ts ${command.join(" ")} -c`
      );

      expect(stdout).toBe(
        `✨ sort-json-cli: All files were already sorted:\n${command.join(
          "\n"
        )}\n`
      );
    } finally {
      for await (const file of files) {
        await fs.promises.rm(path.resolve(__dirname, file.name));
      }
    }
  });

  it("check -c key unsorted file", async () => {
    const files = [
      {
        name: "file1.json",
        content: '{\n  "1": 1,\n  "10": 1,\n  "2": 1\n}',
        path: "",
      },
      {
        name: "file2.json",
        content: '{\n  "1": 1,\n  "2": 1,\n  "10": 1,\n  "20": 1\n}',
        path: "",
      },
    ].map((file) => ({
      ...file,
      path: path.resolve(__dirname, file.name),
    }));

    try {
      for await (const file of files) {
        await fs.promises.writeFile(
          path.resolve(__dirname, file.name),
          file.content
        );
      }

      const command = files.map(({ path }) => path);

      await exec(
        `node --loader ts-node/esm ./src/index.ts ${command.join(" ")} -c`
      );
    } catch (err) {
      expect((err as ExecException).code).toBe(9);
      expect((err as any).stdout).toBe(
        `✨ sort-json-cli: Unsorted files:\n${files[1].path}\n`
      );
    } finally {
      for await (const file of files) {
        await fs.promises.rm(path.resolve(__dirname, file.name));
      }
    }
  });
});
