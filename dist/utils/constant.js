export const prefix = "✨ sort-json-cli: ";
export const getIndentationCount = (option) => {
    const defaultOption = { tabs: false, indentationCount: 0 };
    let { indentationCount: k_indentationCount, tabs: k_tabs, } = {
        ...defaultOption,
        ...option,
    };
    let indentationCount = 2;
    if (k_tabs) {
        indentationCount = 1;
    }
    if (k_indentationCount) {
        indentationCount = +k_indentationCount;
    }
    return indentationCount;
};
export const nonJsonFormats = ["yml", "toml", "yaml"]; // to save time
export const badFiles = [
    ".DS_Store",
    "npm-debug.log",
    ".svn",
    "CVS",
    "config.gypi",
    ".lock-wscript",
    "package-lock.json",
    "npm-shrinkwrap.json",
];
