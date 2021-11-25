import path from "path";
import { fileURLToPath } from "url";
export const getDirname = (impoertMeta) => {
    const __filename = fileURLToPath(impoertMeta.url);
    const __dirname = path.dirname(__filename);
    return __dirname;
};
/* https://ru.hexlet.io/blog/posts/chto-takoe-__dirname-v-javascript */
