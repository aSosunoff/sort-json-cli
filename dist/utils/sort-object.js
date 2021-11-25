import isObj from "lodash.isplainobject";
import _ from "lodash";
const ascSort = (a, b) => a - b;
const descSort = (a, b) => -a - b;
const ascSortString = (a, b) => a.localeCompare(b);
const descSortString = (a, b) => b.localeCompare(a);
export const sortObject = (obj, option) => {
    let space = "";
    let eol = "\n";
    const defaultOption = { tabs: false, indentationCount: 0, arrays: false };
    let { indentationCount: k_indentationCount, tabs: k_tabs, arrays: k_arrays, } = {
        ...defaultOption,
        ...option,
    };
    if (k_tabs) {
        space = "\t".repeat(k_indentationCount);
    }
    else {
        space = " ".repeat(k_indentationCount);
    }
    const formatString = (v) => v.replace(/\n/g, "\\n").replace(/"/g, '\\"');
    const sRepeat = (depth) => space.repeat(depth);
    const isStr = (something) => typeof something === "string";
    const isNumber = (something) => typeof something === "number";
    const getValue = (v) => (isStr(v) ? `"${formatString(v)}"` : v);
    const getSortKeys = (obj) => Object.keys(obj).sort((a, b) => (a > b ? 1 : -1));
    const content = (function work(obj, depth) {
        const keys = getSortKeys(obj);
        const content = [];
        for (const key of keys) {
            const indent = sRepeat(depth);
            if (isObj(obj[key])) {
                content.push(`${indent}"${key}": {${eol}${work(obj[key], depth + 1).join(`,${eol}`)}${eol}${indent}}`);
            }
            else if (Array.isArray(obj[key]) && obj[key].length) {
                let array = "";
                if (obj[key].every(isStr)) {
                    let arr = _.cloneDeep(obj[key]);
                    if (k_arrays)
                        arr.sort(ascSortString);
                    array = `[${eol}${arr
                        .map((item) => `${sRepeat(depth + 1)}${getValue(item)}`)
                        .join(`,${eol}`)}${eol}${indent}]`;
                }
                else if (obj[key].every(isNumber)) {
                    let arr = _.cloneDeep(obj[key]);
                    arr.sort(ascSort);
                    array = `[${arr.join(",")}]`;
                }
                else if (obj[key].every(isObj)) {
                    const indentInner = sRepeat(depth + 1);
                    let arr = _.cloneDeep(obj[key]);
                    array = `[${eol}${arr
                        .map((item) => `${indentInner}{${eol}${work(item, depth + 2).join(`,${eol}`)}${eol}${indentInner}}`)
                        .join(`,${eol}`)}${eol}${indent}]`;
                }
                else {
                    array = `[${obj[key].join(",")}]`;
                }
                content.push(`${indent}"${key}": ${array}`);
            }
            else {
                content.push(`${indent}"${key}": ${getValue(obj[key])}`);
            }
        }
        return content;
    })(obj, 1);
    return `{${eol}${content.join(`,${eol}`)}${eol}}`;
};
