import { join, basename, resolve } from 'path';

import __dirname from "./helpers/__dirname.js";
import jsCompiler from './compilers/rollup.js';
import jsMinifier from "./compilers/terser.js";
import stylusCompiler from './compilers/stylus.js';
import cssMinifier from "./compilers/clean-css.js";

const offset = join(__dirname, "../");

let config = {
  js: {
      src: offset.concat("src/js"),
      dest: offset.concat("dist/js"),
  },
  css: {
      src: offset.concat("src/css"),
      dest: offset.concat("dist/css"),
  }
};

/**
 * rollup, babel, minify.
 */
async function buildGlightboxJS() {
  const file = resolve(join(config.js.src, 'glightbox.js'));

  const outputFile = await jsCompiler({
      src:  file,
      dest: resolve(config.js.dest),
      fileName: "{name}.js",
      format: 'umd', // amd, cjs, es, iife, umd, system. esm? universal module.
      sourcemap: false,
      moduleID: 'GLightbox'
  })

  await jsMinifier({
      file: outputFile,
      path_o: resolve(config.js.dest),
      fileName: "{name}.min.js"
  })

  const trigger_o_file = await jsCompiler({
      src:  resolve(join(config.js.src, 'trigger.js')),
      dest: resolve(config.js.dest),
      fileName: "glightbox_{name}.min.js",
      format: 'iife',
      sourcemap: false,
      moduleID: 'GLightbox_trigger'
  });

  await jsMinifier({
      file: trigger_o_file,
      path_o: resolve(config.js.dest),
      fileName: "{name}.js"
  })

  console.info(`Built, Compiled and Minified ${basename(file)}`)
}


/**
* Handle Postcss files
*/
async function buildGlightboxCSS() {
  const file = resolve(join(config.css.src, 'glightbox.styl'));

  const options = {
      file,
      dest: resolve(config.css.dest),
      fileName: "{name}.css",
      minify: false,
      sourcemap: false
  };

  const file_o = await stylusCompiler(options);

  await cssMinifier({
    file: file_o,
    dest: options.dest,
    fileName: "{name}.min.css",
    sourcemap: false
  });

  console.info(`Built, Compiled and Minified ${basename(file)}`);
}

export { buildGlightboxJS, buildGlightboxCSS }