import CleanCSS from "clean-css";
import { promises as fsp } from 'fs';
import { FileIO } from "./normalize-config.js";

// https://github.com/jakubpawlowicz/clean-css
/**
 * @param {Object | string} something config object or data in string
 * @param {Object} possibleConfig when a string is passed as the first param, 
 * the second parameter should take the place of config.
 */
async function cssMinifier (something, possibleConfig) {
  let css, config;

  switch(typeof something) {
    case "string":
      config = possibleConfig;
      css = something;
      break;
    case "object":
      config = something;
      css = await fsp.readFile(file.input.path, "utf8");
      break;
    default: throw new Error(config);
  }

  const file = new FileIO(config);

  const minified = new CleanCSS({
    inline: ['none'],
    level: 2,
  }).minify(css);

  const promises = [
    fsp.writeFile(file.output, minified.styles)
  ];

  if (config.map || config.sourcemap) {
    promises.push(
      fsp.writeFile(
        file.output.concat('.map'), 
        minified.map
      )
    )
  }

  return Promise.all(promises)
              .then(() => minified.stats.efficiency)
}

export default cssMinifier;