import { exec } from "child_process";

describe("Check CLI sortjsoncli", () => {
  it("should by contain output line", (done) => {
    exec("node --loader ts-node/esm ./src/index.ts ./src/source.json -d", (error, stdout) => {
      if (error) {
        done(error);
      }

      expect(stdout).toBe(
        "✨ sort-json-cli: We'd try to sort the following files:\n./src/source.json\n"
      );

      done();
    });
  });
});
