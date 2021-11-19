import fs from "fs-extra";
import chalk from "chalk";
import path from "path";
import { getJsonStr } from "./get-json-str";

const log = console.log;
const prefix = "✨ sort-json-cli: ";

const obj: Record<string, any> = {
  /* onlyNeed: "You'll only need to do this once",
  description: "Your privacy is very important to us. \nYour data is stored securely.", */
  idConfirm: "1",
  id_number: "ID number",
  /* 1: 1,
  20: "test",
  a: [1, 20, 2, 10, 3, 5, 6, 3, 55, 10, 30, 40],
  b: ["1", "20", "2", "10", "3", "5", "6", "3", "55", "10", "30", "40"],
  111: [
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

readFile("./source.json");

/* console.log(getJsonStr(obj)); */
