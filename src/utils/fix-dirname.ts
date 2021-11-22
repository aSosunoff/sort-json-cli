import path from "path";
import { fileURLToPath } from "url";

export const getDirname = (impoertMeta: ImportMeta) => {
  /* const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename); */

  const __filename = fileURLToPath(impoertMeta.url);
  const __dirname = path.dirname(__filename);

  return __dirname;
};

/* https://ru.hexlet.io/blog/posts/chto-takoe-__dirname-v-javascript */
