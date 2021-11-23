import fs from "fs";
import util from "util";

const fsWriteFileAsync = util.promisify(fs.writeFile);

export const saveFile = async (
  file: Parameters<typeof fs.writeFile>[0],
  content: Parameters<typeof fs.writeFile>[1]
) => {
  await fsWriteFileAsync(file, content);
};
