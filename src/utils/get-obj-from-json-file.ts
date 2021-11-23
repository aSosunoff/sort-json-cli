import fsx from "fs-extra";

export const getObjFromJsonFile = async (oneOfPaths: string) => {
  const filesContent = await fsx.readFile(oneOfPaths, "utf8");

  return JSON.parse(filesContent);
};
