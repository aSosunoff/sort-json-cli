import path from "path";

import { cli } from "./utils/cli.js";
import { getObjFromJsonFile } from "./utils/get-obj-from-json-file.js";
import { getDirname } from "./utils/fix-dirname.js";
import { sortObject } from "./utils/sort-object.js";
import { saveFile } from "./utils/save-file.js";

const __dirname = getDirname(import.meta);

const log = console.log;

if (cli.flags.version) {
  log(cli.pkg.version);
  process.exit(0);
} else if (cli.flags.help) {
  log(cli.help);
  process.exit(0);
}

console.log(cli.input);

(async () => {
  const obj = await getObjFromJsonFile(path.resolve(__dirname, "./source.json"));

  if (!obj) {
    // TODO: info to console
    return;
  }

  const content = sortObject(obj);

  await saveFile(path.resolve(__dirname, "./target.json"), content);
})();
