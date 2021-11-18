import fs from "fs-extra";
import isObj from "lodash.isplainobject";

const obj: Record<string, any> = {
  1: 1,
  a: [1, 20, 2, 10, 3, 5, 6, 3, 55, 10, 30, 40],
  b: ["1", "20", "2", "10", "3", "5", "6", "3", "55", "10", "30", "40"],
  20: "test",
  2: true,
  10: null,
  30: 2,
  40: 3,
  d: {
    n: "1",
  },
  d2: {
    n: "1",
    1: 1,
    20: "test",
    2: true,
    10: null,
    x: "2",
  },
  d3: {
    d2: {
      n: "1",
      x: "2",
      d: {
        n: "1",
      },
    },
  },
};

const EOL = "\n";
const SPACE = " ";
const isStr = (something: any) => typeof something === "string";
const getValue = (v: any) => (isStr(v) ? `"${v}"` : v);
const getSortKeys = (obj: object) => Object.keys(obj).sort((a, b) => a.localeCompare(b));

/* 
fs
    .readFile(oneOfPaths, "utf8")
*/

const json = (function work(obj, depth) {
  const keys = getSortKeys(obj);

  let content = "";

  for (const key of keys) {
    if (isObj(obj[key])) {
      content += `${EOL}${SPACE.repeat(depth * 2)}"${key}": ${work(obj[key], depth + 1)}`;
    } else if (Array.isArray(obj[key]) && obj[key].length) {
      let arraySort = [];

      if (obj[key].every(isStr)) {
        arraySort = [...obj[key]].sort((a, b) => a.localeCompare(b));
      } else {
        arraySort = [...obj[key]].sort((a, b) => a - b);
      }

      content += `${EOL}${SPACE.repeat(depth * 2)}"${key}":${SPACE.repeat(1)}[${arraySort}],`;
    } else {
      content += `${EOL}${SPACE.repeat(depth * 2)}"${key}":${SPACE.repeat(1)}${getValue(
        obj[key]
      )},`;
    }
  }

  return `{${content}${EOL}${SPACE.repeat((depth - 1) * 2)}}`;
})(obj, 1);

console.log(json);
