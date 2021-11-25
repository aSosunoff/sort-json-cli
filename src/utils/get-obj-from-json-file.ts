import fsx from "fs-extra";

export const getObjFromJsonFile = async (oneOfPaths: string) => {
  const filesContent = await fsx.readFile(oneOfPaths, "utf8");

  return {
    obj: JSON.parse(filesContent) as Record<string, any>,
    content: filesContent,
  };
};
