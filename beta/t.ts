import fs from "fs-extra";
import isObj from "lodash.isplainobject";
import chalk from "chalk";
import path from "path";
import _ from "lodash";

const log = console.log;
const prefix = "✨ sort-json-cli: ";

const obj: Record<string, any> = {
  a: "1",
  b: [
    {
      a: 1,
    },
    {
      b: 1,
    },
  ],
  /* a2: {
    b: ["1", "2", "3", "4"],
  }, */
  /* b: {
    a: 2,
    b: {
      a: 3,
      b: 3,
    },
  }, */
  c: 1,
  /* b2: {
    a: 2,
    b: {
      a: 3,
      b: 3,
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

    saveSubContext() {
      /* if (this.subContent.length) {
      } */
      this.saveSubContent.push([...this.subContent]);
      this.subContent.length = 0;
    }

    addToSub(v: string) {
      this.subContent.push(v);
    }

    restoreSubContext(v: string) {
      const saveContextLast = this.saveSubContent.pop();

      this.clearSub();

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

  //#region Queue
  interface Item {
    key: string;
    value: any;
    depth: number;
    typeParent?: "object" | "array";
  }

  type ItemType = Item & {
    type:
      | "string"
      | "number"
      | "object"
      | "arrayNumber"
      | "arrayString"
      | "arrayObject"
      | "default";
  };

  interface QueueItem extends Iterable<Item> {}

  class Queue {
    queueItems: Array<QueueItem> = [];

    /* handler: Handler = new Handler(); */

    /* context: Context = new Context(); */

    addItemQueue(obj: Record<string, any>, depth: number, typeParent?: Item["typeParent"]) {
      let current = 0;
      const keys = getSortKeys(obj);

      this.queueItems.push({
        *[Symbol.iterator]() {
          while (current < keys.length) {
            const key = keys[current];

            current++;

            yield {
              key,
              value: obj[key],
              depth,
              typeParent,
            };
          }
        },
      });
    }

    forEach(cb: ({ item }: { item: ItemType }) => void) {
      const handlers: Array<() => ItemType> = [];

      while (this.queueItems.length) {
        const queueItem = this.queueItems[this.queueItems.length - 1];

        let isCommit = true;

        for (const item of queueItem) {
          let type: ItemType["type"] = "default";

          if (Array.isArray(item.value) && item.value.length) {
            if (item.value.every(isNumber)) type = "arrayNumber";
            if (item.value.every(isStr)) type = "arrayString";
            if (item.value.every(isObj)) {
              this.addItemQueue(item.value, item.depth + 1, "array");

              handlers.push(() => ({ ...item, type: "arrayObject" }));

              isCommit = false;

              break;
            }
          }

          if (typeof item.value === "string") type = "string";
          if (typeof item.value === "number") type = "number";

          if (isObj(item.value)) {
            this.addItemQueue(item.value, item.depth + 1, "object");

            handlers.push(() => ({ ...item, type: "object" }));

            isCommit = false;

            break;
          }

          cb({ item: { ...item, type } });
        }

        if (isCommit) {
          const handler = handlers.pop();

          if (handler) {
            cb({ item: handler() });
          } else {
          }

          queue.queueItems.pop();
        }
      }

      return;
    }
  }
  //#endregion

  /* const compose =
    (...fn: Array<(...arg: any) => any>) =>
    (x: any) =>
      fn.reduceRight((res, f) => f(res), x); */

  const queue = new Queue();

  queue.addItemQueue(obj, 1);

  const items: ItemType[] = [];
  const saveItems: Array<ItemType[]> = [];

  const transform = (item: ItemType) => {
    if (item.type === "string") {
      return `${sRepeat(item.depth * 2)}"${item.key}": "${item.value}"`;
    }

    if (item.type === "number") {
      return `${sRepeat(item.depth * 2)}"${item.key}": ${item.value}`;
    }

    if (item.type === "arrayNumber") {
      return `${sRepeat(item.depth * 2)}"${item.key}": [${_.cloneDeep<number[]>(item.value)
        .sort((a, b) => a - b)
        .join(",")}]`;
    }

    if (item.type === "arrayString") {
      return `${sRepeat(item.depth * 2)}"${item.key}": [${eol}${_.cloneDeep<string[]>(item.value)
        .sort((a, b) => a.localeCompare(b))
        .map((v) => `${sRepeat((item.depth + 1) * 2)}"${v}"`)
        .join(`,${eol}`)}${eol}${sRepeat(item.depth * 2)}]`;
    }

    /* if (item.type === "arrayObject") {
      return `${sRepeat(item.depth * 2)}"${item.key}": [${eol}${_.cloneDeep<string[]>(item.value)
        .sort((a, b) => a.localeCompare(b))
        .map((v) => `${sRepeat((item.depth + 1) * 2)}"${v}"`)
        .join(`,${eol}`)}${eol}${sRepeat(item.depth * 2)}]`;
    } */

    if (item.type === "default") {
      return `${sRepeat(item.depth * 2)}"${item.key}": ${item.value}`;
    }
  };

  queue.forEach(({ item }) => {
    if (items.length === 0 || item.depth === items[items.length - 1].depth) {
      items.push(item);
    } else if (item.depth > items[items.length - 1].depth) {
      saveItems.push(_.cloneDeep(items));
      items.length = 0;
      items.push(item);
    } else {
      const saveItem = saveItems.pop();

      if (saveItem) {
        const tail: ItemType = {
          ...item,
          type: "default",
          value: `{${eol}${items.map(transform).join(`,${eol}`)}${eol}${sRepeat(item.depth * 2)}}`,
        };

        const _items: ItemType[] = [...saveItem, tail];

        items.length = 0;
        items.push(..._.cloneDeep(_items));
      }
    }

    console.log(items);
  });

  return `{${eol}${items.map(transform).join(`,${eol}`)}${eol}}`;
};

/* getJsonStr(obj); */
console.log(getJsonStr(obj));
