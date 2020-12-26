import GLightbox from "./glightbox.js";

const config = {
  onOpen: () => {
      if(document.querySelector('.gotop')) //NOTE
          document.querySelector('.gotop').style.right = "calc(5% + " + scrollBar + "px)";  
  }
}

Array.from(document.getElementsByClassName('article-entry')).forEach(article => {
  Array.from(article.getElementsByTagName('img')).forEach(img => {
    if (img.parentNode.classList.contains('glightbox')) return;

    let glightboxCaption = '';
    if(img.getAttribute('gallery-item-caption'))
      glightboxCaption = `title: ${img.getAttribute('gallery-item-caption')}; `;
    else if (img.alt)
      glightboxCaption = `title: ${img.alt}; `;
    
    if(img.src) {
      const glightboxSource = removeWebpSuffix(img.src);
      img.outerHTML = [
        `<a href="${glightboxSource}" title="${img.alt}"`,
        `class="glightbox" data-glightbox="${glightboxCaption}"`,
        `rel="view hi-res version">${img.outerHTML}</a>`
      ].join(" ");
    } else console.warn(img + ':no Source Attribute');
  });
});

const pattern = {
  search: /\.[^\.]{3,4}(\.webp)$/,
  replace: /(\.webp)$/
}

function removeWebpSuffix (url) {
  return pattern.search.test(url) ? url.replace(pattern.replace, '') : url;
}

void GLightbox(config);