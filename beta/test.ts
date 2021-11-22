import fs from "fs-extra";
import isObj from "lodash.isplainobject";
import chalk from "chalk";
import path from "path";

const log = console.log;
const prefix = "✨ sort-json-cli: ";

const obj: Record<string, any> = {
  w: [
    {
      x1: 1,
      y1: 1,
    },
    {
      x2: 1,
      y2: 1,
    },
  ],
  /* onlyNeed: "You'll only need to do this once", */
  /* a1: 1,
  b1: {
    xb2: 1,
    yb2: 1,
  }, */
  /* x1: 1, */
  /* y1: {
    a2: 1,
    x2: 1,
    y2: {
      a3: 1,
      x3: 1,
      y3: 1,
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
  const getSortKeys = (obj: object) => Object.keys(obj).sort((a, b) => (a > b ? 1 : -1));

  //#region QueueContext
  interface QueueContext {
    current: number;
    keys: string[];
    obj: Record<string, any>;
  }

  interface QueueItem
    extends Iterable<{
      key: QueueContext["keys"][any];
      value: QueueContext["obj"][any];
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
              value: obj[key],
              depth,
            };
          }
        },
      });
    }
  }
  //#endregion

  //#region Handler
  type HandlerFn = (content: string) => string;

  class Handler {
    handlers: Array<HandlerFn> = [];

    addHandler(handler: HandlerFn) {
      this.handlers.push(handler);
    }

    getLastHandler() {
      return this.handlers.pop();
    }

    reset() {
      this.handlers.length = 0;
    }
  }
  //#endregion

  //#region Context
  class Context {
    content: string[] = [];
    subContent: string[] = [];
    saveSubContent: Array<string[]> = [];

    add(v: string) {
      this.content.push(v);
    }

    saveContext() {
      /* if (this.subContent.length) {
      } */
      this.saveSubContent.push([...this.subContent]);
      this.subContent.length = 0;
    }

    addToSub(v: string) {
      this.subContent.push(v);
    }

    addToSubWithSave(v: string) {
      const saveContextLast = this.saveSubContent.pop();

      if (saveContextLast) {
        this.subContent.push(...[...saveContextLast, v]);
      } else {
        this.subContent.push(v);
      }
    }

    clearSub() {
      this.subContent.length = 0;
    }
  }
  //#endregion

  /* const compose =
    (...fn: Array<(...arg: any) => any>) =>
    (x: any) =>
      fn.reduceRight((res, f) => f(res), x); */

  const work = (obj: Record<string, any>) => {
    const queue = new Queue();
    const handler = new Handler();
    const ctx = new Context();

    queue.addItemQueue(obj, 1);

    while (queue.items.length) {
      const item = queue.items[queue.items.length - 1];

      let isCommit = true;

      for (const { key, value, depth } of item) {
        const indent = sRepeat(depth * 2);

        if (isObj(value)) {
          queue.addItemQueue(value, depth + 1);

          ctx.saveContext();

          handler.addHandler((content) => `${indent}"${key}": {${eol}${content}${eol}${indent}}`);

          isCommit = false;

          break;
        }

        if (Array.isArray(value) && value.length) {
          if (value.every(isStr)) {
            const content = `[${eol}${[...value]
              .sort((a, b) => a.localeCompare(b))
              .map((item) => `${sRepeat((depth + 1) * 2)}${getValue(item)}`)
              .join(`,${eol}`)}${eol}${indent}]`;

            ctx.addToSub(`${indent}"${key}": ${content}`);
          } else if (value.every(isNumber)) {
            const content = `[${[...value].sort((a, b) => a - b).join(",")}]`;

            ctx.addToSub(`${indent}"${key}": ${content}`);
          } else if (value.every(isObj)) {
            ctx.saveContext();

            handler.addHandler((content) => {
              return `${indent}"${key}": [${eol}${content}${eol}${indent}]`;
            });

            value.forEach((v) => {
              queue.addItemQueue(v, depth + 2);

              handler.addHandler((content) => {
                /* sRepeat(depth * 2) */
                return `${indent}{${eol}${content}${eol}${indent}}`;
              });
            });

            isCommit = false;

            break;

            /* const indent = sRepeat((depth + 1) * 2);

            array = `[${eol}${[...value]
              .map(
                (item) => `${indent}{${eol}${work(item, depth + 2).join(`,${eol}`)}${eol}${indent}}`
              )
              .join(`,${eol}`)}${eol}${sRepeat(depth * 2)}]`; */
          } else {
            ctx.addToSub(`${indent}"${key}": [${value.join(",")}]`);
          }
        } else {
          ctx.addToSub(`${indent}"${key}": ${getValue(value)}`);
        }
      }

      if (isCommit) {
        const lastHandler = handler.getLastHandler();

        if (lastHandler) {
          if (ctx.saveSubContent.length) {
            const data = lastHandler(ctx.subContent.join(`,${eol}`));
            ctx.clearSub();
            ctx.addToSubWithSave(data);
          }
        } else {
          const contentResult = ctx.subContent.join(`,${eol}`);
          ctx.clearSub();

          if (contentResult) {
            ctx.add(contentResult);
          }
          queue.items.pop();
        }
      }
    }

    return `{${eol}${ctx.content.join(`,${eol}`)}${eol}}`;
  };

  return work(obj);
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

/* 

const obj: Record<string, any> = {
  a: 1,
  b: {
    a: 2,
    b: {
      a: 3,
      b: 3,
    },
  },
  c: 1,
};

*/
