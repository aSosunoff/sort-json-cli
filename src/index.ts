import path from "path";

import { cli } from "./utils/cli.js";
import { readFile } from "./utils/read-file.js";
import { getDirname } from "./utils/fix-dirname.js";

const __dirname = getDirname(import.meta);

const log = console.log;

if (cli.flags.version) {
  log(cli.pkg.version);
  process.exit(0);
} else if (cli.flags.help) {
  log(cli.help);
  process.exit(0);
}

readFile(path.resolve(__dirname, "./source.json"));
