import { writeFile, readFile } from 'fs';
import { minify } from 'terser';

/**
 * @param { Object } options path: input file path, path_output: output file path
 */
async function jsMinifier (options) {
  const {
      path,
      path_output
  } = options;

  return new Promise((resolve, reject) => {
      readFile(path, async (err, data) => {
          if(err)
              return reject(err);
          
          writeFile(path_output, (await minify(data.toString())).code, err => 
              err ? reject(err) : resolve(err) 
          );
      })
  })
}

export default jsMinifier;