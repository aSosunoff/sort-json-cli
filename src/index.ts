import fs from "fs-extra";
import isObj from "lodash.isplainobject";

const obj: Record<string, any> = {
  1: 1,
  20: "test",
  /* a: [1, 20, 2, 10, 3, 5, 6, 3, 55, 10, 30, 40],
  b: ["1", "20", "2", "10", "3", "5", "6", "3", "55", "10", "30", "40"],
  2: true,
  month: ["month", "months"],
  numerals: {
    "0": "0",
    "1": "1",
    "10": "10",
    "11": "11",
    "12": "12",
    "13": "13",
    "14": "14",
    "15": "15",
    "16": "16",
    "17": "17",
    "18": "18",
    "19": "19",
    "2": "2",
    "20": "20",
    "21": "21",
    "22": "22",
    "23": "23",
    "24": "24",
    "25": "25",
    "26": "26",
    "27": "27",
    "28": "28",
    "29": "29",
    "3": "3",
    "30": "30",
    "31": "31",
    "4": "4",
    "5": "5",
    "6": "6",
    "7": "7",
    "8": "8",
    "9": "9",
  },
  10: {
    list: [
      {
        desc: "First time using tabby simply link your card.",
        title: "Set up your account",
      },
      {
        desc: "Buy any number of times and spend up to {{limit}} {{currency}} during the month.",
        title: "Check out with tabby",
      },
      {
        desc: "Pay for all your purchases at the end of the month using any card.",
        title: "Pay at the end of the month",
      },
    ],
  },
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
  }, */
};

/* 
fs
    .readFile(oneOfPaths, "utf8")
*/

const getJsonStr = (obj: Record<string, any>) => {
  const EOL = "\n";
  const SPACE = " ";
  const sRepeat = (depth: number) => SPACE.repeat(depth);
  const isStr = (something: any) => typeof something === "string";
  const isNumber = (something: any) => typeof something === "number";
  const getValue = (v: any) => (isStr(v) ? `"${v}"` : v);
  const getSortKeys = (obj: object) => Object.keys(obj).sort((a, b) => a.localeCompare(b));

  const work = (obj: Record<string, any>, depth: number) => {
    const keys = getSortKeys(obj);

    let content = "";

    for (const key of keys) {
      if (isObj(obj[key])) {
        content += `${EOL}${sRepeat(depth * 2)}"${key}": {${work(
          obj[key],
          depth + 1
        )}${EOL}${sRepeat(depth * 2)}},`;
      } else if (Array.isArray(obj[key]) && obj[key].length) {
        let arraySort = "";

        if (obj[key].every(isStr)) {
          arraySort = `[${[...obj[key]]
            .sort((a, b) => a.localeCompare(b))
            .map((item) => `${EOL}${sRepeat((depth + 1) * 2)}"${item}"`)}${EOL}${sRepeat(
            depth * 2
          )}],`;
        } else if (obj[key].every(isNumber)) {
          arraySort = `[${[...obj[key]].sort((a, b) => a - b)}],`;
        } else if (obj[key].every(isObj)) {
          arraySort = `[${[...obj[key]].map(
            (item) =>
              `${EOL}${sRepeat((depth + 1) * 2)}{${work(item, depth + 2)}${EOL}${sRepeat(
                (depth + 1) * 2
              )}}`
          )}${EOL}${sRepeat(depth * 2)}],`;
        } else {
          arraySort = obj[key];
        }

        content += `${EOL}${sRepeat(depth * 2)}"${key}": ${arraySort}`;
      } else {
        content += `${sRepeat(depth * 2)}"${key}": ${getValue(obj[key])},`;
      }
    }

    return content;
  };

  return `{${EOL}${work(obj, 1)}${EOL}}`;
};

/* const json = (function work(obj, depth) {
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
})(obj, 1); */

console.log(getJsonStr(obj));
