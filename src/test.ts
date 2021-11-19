import fs from "fs-extra";
import isObj from "lodash.isplainobject";
import chalk from "chalk";
import path from "path";
import jsStringEscape from "js-string-escape";
import jsesc from "jsesc";

const log = console.log;
const prefix = "✨ sort-json-cli: ";

const obj: Record<string, any> = {
  /* onlyNeed: "You'll only need to do this once", */
  a: {
    x: 1,
    y: 2,
    z: {
      x: 1,
      y: 2,
      z: {
        x: 1,
        y: 2,
      },
    },
  },

  /* description: "Your privacy is very important to us. \nYour data is stored securely.",
  1: 1,
  20: "test", */
  /* a: [1, 20, 2, 10, 3, 5, 6, 3, 55, 10, 30, 40], */
  /* b: ["1", "20", "2", "10", "3", "5", "6", "3", "55", "10", "30", "40"], */
  /* 111: [
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

type OPTION = {
  space?: string;
  eol?: string;
};

type Required_v2<T extends object, K extends keyof T = keyof T> = Required<Pick<T, K>> & Omit<T, K>;

const getJsonStr = (obj: Record<string, any>, option?: Partial<OPTION>) => {
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
  const getSortKeys = (obj: object) =>
    Object.keys(obj).sort((a, b) => {
      const isUpperCaseA = /^[A-Z]+$/.test(a);
      const isUpperCaseB = /^[A-Z]+$/.test(b);

      if (isUpperCaseA && isUpperCaseB) {
        return a.localeCompare(b);
      } else if (isUpperCaseA) {
        return -1;
      } else if (isUpperCaseB) {
        return 1;
      }

      return a.localeCompare(b);
    });
  const body = (content: string) => `{${eol}${content}${eol}}`;

  /*  */
  interface QueueContext {
    current: number;
    keys: string[];
    obj: Record<string, any>;
  }

  interface QueueItem
    extends Iterable<{
      key: QueueContext["keys"][any];
      data: QueueContext["obj"][any];
      depth: number;
    }> {}

  class Queue {
    items: Array<QueueItem> = [];

    addItemQueue(obj: Record<string, any>, depth: number) {
      let current = 0;
      const keys = getSortKeys(obj);

      this.items.push({
        *[Symbol.iterator]() {
          while (current < keys.length) {
            const key = keys[current];

            current++;

            yield {
              key,
              data: obj[key],
              depth,
            };
          }
        },
      });
    }
  }

  /*  */
  type HandlerFn = (content: string) => string;

  class Handler {
    handlers: Array<HandlerFn> = [];

    addHandler(handler: HandlerFn) {
      this.handlers.push(handler);
    }

    reset() {
      this.handlers.length = 0;
    }
  }

  /*  */

  const compose =
    (...fn: Array<(...arg: any) => any>) =>
    (x: any) =>
      fn.reduceRight((res, f) => f(res), x);

  const work = (obj: Record<string, any>) => {
    const queue = new Queue();
    const handler = new Handler();

    queue.addItemQueue(obj, 1);

    const content: string[] = [];
    const _content: string[] = [];

    while (queue.items.length) {
      const item = queue.items[queue.items.length - 1];

      let isRemoveQueueItems = true;

      for (const { key, data, depth } of item) {
        if (isObj(data)) {
          queue.addItemQueue(data, depth + 1);

          handler.addHandler((content) => {
            const indent = sRepeat(depth * 2);

            return `${indent}"${key}": {${eol}${content}${eol}${indent}}`;
          });

          isRemoveQueueItems = false;
          break;
        } else if (Array.isArray(data) && data.length) {
          let array = "";

          if (data.every(isStr)) {
            array = `[${eol}${[...data]
              .sort((a, b) => a.localeCompare(b))
              .map((item) => `${sRepeat((depth + 1) * 2)}${getValue(item)}`)
              .join(`,${eol}`)}${eol}${sRepeat(depth * 2)}]`;
          } else if (data.every(isNumber)) {
            array = `[${[...data].sort((a, b) => a - b).join(",")}]`;
          } else if (data.every(isObj)) {
            /* const indent = sRepeat((depth + 1) * 2);

            array = `[${eol}${[...data]
              .map(
                (item) => `${indent}{${eol}${work(item, depth + 2).join(`,${eol}`)}${eol}${indent}}`
              )
              .join(`,${eol}`)}${eol}${sRepeat(depth * 2)}]`; */
          } else {
            array = `[${data.join(",")}]`;
          }

          _content.push(`${sRepeat(depth * 2)}"${key}": ${array}`);
        } else {
          /* queue.addHandler(() => `${sRepeat(depth * 2)}"${key}": ${getValue(data)}`); */
          _content.push(`${sRepeat(depth * 2)}"${key}": ${getValue(data)}`);
        }
      }

      if (isRemoveQueueItems) {
        const contentResult = compose(
          (content) => content,
          ...handler.handlers
        )(_content.join(`,${eol}`));

        _content.length = 0;
        handler.reset();

        content.push(contentResult);

        queue.items.pop();
      }
    }

    return content;
  };

  return body(work(obj).join(`,${eol}`));
};

const readFile = async (oneOfPaths: string) => {
  const pathReadFile = path.resolve(__dirname, oneOfPaths);

  const filesContent = await fs.readFile(pathReadFile, "utf8");

  let parsedJson: Record<string, any>;

  try {
    parsedJson = JSON.parse(filesContent);
  } catch (err) {
    log(`${chalk.grey(prefix)}${oneOfPaths} - ${chalk.red(err)}`);

    return Promise.resolve(null);
  }

  const content = getJsonStr(parsedJson);

  const pathWriteFile = path.resolve(__dirname, "./target.json");

  await fs.writeFile(pathWriteFile, content);
};

/* readFile("./source.json"); */

console.log(getJsonStr(obj));
