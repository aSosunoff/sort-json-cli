import isObj from "lodash.isplainobject";
import { Required_v2 } from "../types/helper";

type OPTION = {
  space?: string;
  eol?: string;
};

export const getJsonStr = (obj: Record<string, any>, option?: Partial<OPTION>) => {
  const defaultOption = { space: " ", eol: "\n" };

  const { eol, space }: Required_v2<OPTION, keyof typeof defaultOption> = {
    ...defaultOption,
    ...option,
  };

  const formatString = (v: string) => v.replace(/\n/g, "\\n").replace(/"/g, '\\"');
  const sRepeat = (depth: number) => space.repeat(depth);
  const isStr = (something: any): something is string => typeof something === "string";
  const isNumber = (something: any) => typeof something === "number";
  const getValue = <T>(v: T) => (isStr(v) ? `"${formatString(v)}"` : v);
  const getSortKeys = (obj: object) => Object.keys(obj).sort((a, b) => (a > b ? 1 : -1));

  const content = (function work(obj: Record<string, any>, depth: number) {
    const keys = getSortKeys(obj);

    const content: string[] = [];

    for (const key of keys) {
      const indent = sRepeat(depth * 2);

      if (isObj(obj[key])) {
        content.push(
          `${indent}"${key}": {${eol}${work(obj[key], depth + 1).join(`,${eol}`)}${eol}${indent}}`
        );
      } else if (Array.isArray(obj[key]) && obj[key].length) {
        let array = "";

        if (obj[key].every(isStr)) {
          array = `[${eol}${[...obj[key]]
            // .sort((a, b) => a.localeCompare(b))
            .map((item) => `${sRepeat((depth + 1) * 2)}${getValue(item)}`)
            .join(`,${eol}`)}${eol}${indent}]`;
        } else if (obj[key].every(isNumber)) {
          array = `[${[...obj[key]].sort((a, b) => a - b).join(",")}]`;
        } else if (obj[key].every(isObj)) {
          const indentInner = sRepeat((depth + 1) * 2);

          array = `[${eol}${[...obj[key]]
            .map(
              (item) =>
                `${indentInner}{${eol}${work(item, depth + 2).join(`,${eol}`)}${eol}${indentInner}}`
            )
            .join(`,${eol}`)}${eol}${indent}]`;
        } else {
          array = `[${obj[key].join(",")}]`;
        }

        content.push(`${indent}"${key}": ${array}`);
      } else {
        content.push(`${indent}"${key}": ${getValue(obj[key])}`);
      }
    }

    return content;
  })(obj, 1);

  return `{${eol}${content.join(`,${eol}`)}${eol}}`;
};
