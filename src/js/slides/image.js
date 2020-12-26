
/**
 * Set slide inline content
 * we'll extend this to make http
 * requests using the fetch api
 * but for now we keep it simple
 *
 * @param {node} slide
 * @param {object} data
 * @param {function} callback
 */


import { isFunction } from '../utils/helpers.js';;

export default function slideImage(slide, data, callback) {
    const slideMedia = slide.querySelector('.gslide-media');
    const slideTitle = slide.querySelector('.gslide-title');

    let img = new Image();
    let titleID = 'gSlideTitle_' + data.index;
    let textID = 'gSlideDesc_' + data.index;

    img.addEventListener('load', () => {
        if (isFunction(callback)) {
            callback()
        }
    }, false);
    img.src = data.href;
    img.alt = ''; // https://davidwalsh.name/accessibility-tip-empty-alt-attributes

    img.addEventListener('error', function () {
        if(!img.errored){
          img.errored = true;
          if(/(\.webp)$/.test(img.src)){
            img.src = img.src.substring(0, img.src.length - 5);
          } else {
            img.src = img.src.concat('.webp');
          }
        } else { // retried
          img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABIAQMAAABvIyEEAAAABlBMVEUAAABTU1OoaSf/AAAAAXRSTlMAQObYZgAAAENJREFUeF7tzbEJACEQRNGBLeAasBCza2lLEGx0CxFGG9hBMDDxRy/72O9FMnIFapGylsu1fgoBdkXfUHLrQgdfrlJN1BdYBjQQm3UAAAAASUVORK5CYII=';
          img.alt = '404 Not Found';
          img.classList.add('error');
          slideTitle.innerHTML = '<div style="min-width: 52px;text-align: center;">ERROR</div>';
        }
    }, false);

    if (data.title !== '') {
        img.setAttribute('aria-labelledby', titleID);
    }
    if (data.description !== '') { // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques/Using_the_aria-describedby_attribute#Example_2_A_Close_Button
        img.setAttribute('aria-describedby', textID);
    }

    slideMedia.insertBefore(img, slideMedia.firstChild);
    return;
}