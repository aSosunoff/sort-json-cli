import meow from "meow";

export const cli = meow(
  `
    Usage
      $ jsonsort YOURFILE.json
      $ sortjson YOURFILE.json
      $ sortjson templatesfolder1 templatesfolder2 package.json
    or, just type "jsonsort" and it will let you pick a file.
  
    Options
      -t, --tabs             Use tabs for JSON file indentation
      -i, --indentationCount How many spaces or tabs to use (default = 2 spaces or 1 tab)
      -h, --help             Shows this help
      -v, --version          Shows the current version
      -c, --ci               Only exits with non-zero code if files COULD BE sorted
  
    Example
      Call anywhere using glob patterns. If you put them as string, this library
      will parse globs. If you put as system globs without quotes, your shell will expand them.
  `,
  {
    importMeta: import.meta,
    flags: {
      /* nodemodules: {
          type: "boolean",
          alias: "n",
          default: false,
        }, */
      tabs: {
        type: "boolean",
        alias: "t",
        default: false,
      },
      /* silent: {
        type: "boolean",
        alias: "s",
        default: false,
      },
      arrays: {
        type: "boolean",
        alias: "a",
        default: false,
      },
      pack: {
        type: "boolean",
        alias: "p",
        default: false,
      },
      dry: {
        type: "boolean",
        alias: "d",
        default: false,
      },
      ci: {
        type: "boolean",
        alias: "c",
        default: false,
      },*/
      help: {
        type: "boolean",
        alias: "h",
        default: false,
      },
      version: {
        type: "boolean",
        alias: "v",
        default: false,
      },
      indentationCount: {
        type: "number",
        alias: "i",
      },
    },
  }
);
