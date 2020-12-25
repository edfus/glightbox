import { basename, extname, join } from 'path';

class IsIn {
  constructor (obj) {
      return (key, ...left) => {
          return {
              orDefault (defaultValue) {
                  if(left.length) {
                      if(key in obj) return obj[key];
                      for (let i = 0; i < left.length; i++) {
                          if (left[i] in obj)
                              return obj[left[i]];
                      }
                      return defaultValue;
                  } else {
                      return obj.hasOwnProperty(key) ? obj[key] : defaultValue;
                  }
              }
          }
      }
  }
}

class FileIO {
  /**
   * @param {string} src the abosolute path of source file
   * @param {string} dst the abosolute path of the destination **folder**
   */
  constructor (src, dst) {
    this.input = new class {
      path = src
      base = basename(this.path)
      ext = extname(this.base)
      without_ext = this.base.replace(this.ext, '')
    }
    this.output = join(dst, this.input.base);
  }
}

export { IsIn, FileIO };