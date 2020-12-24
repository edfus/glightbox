const chokidar = require('chokidar');
const notify = require('./notifications');
const { buildGlightboxJS, buildGlightboxCSS } = require("./builder");

/**
 * Watcher for js and css files
 */
function filesWatcher() {
    const watcher = chokidar.watch(['src'], {
        ignored: ['.DS_Store', 'src/js/.jshintrc', 'src/js/.babelrc'],
        persistent: true,
        depth: 3,
        awaitWriteFinish: {
            stabilityThreshold: 500,
            pollInterval: 500
        },
    });

    watcher.on('change', async file => {
        if (file.endsWith('glightbox.js')) {
           return buildGlightboxJS();
        }
        if (file.endsWith('glightbox.css')) {
            return buildGlightboxCSS();
        }
    })
    watcher.on('ready', () => console.info('Now watching files, up for changes.'))
}

filesWatcher();
