const fs = require('fs');
const jetpack = require('fs-jetpack');
const path = require('path');
const archiver = require('archiver');
const args = process.argv.slice(2);
const notify = require('./notifications');
const folder = path.join(__dirname, '/..');
const { buildGlightboxJS, buildGlightboxCSS } = require("./builder");

if(extractArg(/(--build(-only)?=)|(-b)/i))
    return Promise.all([
        buildGlightboxJS(),
        buildGlightboxCSS()
    ]).then(() => notify("\nBuild finished", "Quiting...\n") || process.exit());
else return createFolder();

/**
 * Realease new version
 * calling
 * node development/package.js version here
 * then npm publish
 */

async function createFolder() {
    jetpack.remove(path.join(folder, 'glightbox-master.zip'));

    const tmpfolder = path.join("./.temp/", 'glightbox-master');
    
    let newVersion;  
    try { 
        newVersion = extractArg(/(--version=)/i)
                        || args[0].split(/^v?((\d+\.)+\d+)/)[1]
    } finally {
        if(!newVersion
            && !args.some((arg, index) => /-v/i.test(arg) ? (newVersion = args[index + 1]) : false)
            ) {
                notify("Version name not provided", "possible choice: 3.0.6")  || process.exit(1);
        }
    }

    console.log("Version:", newVersion);

    await updateFileVersion({
        file: path.join(folder, 'package.json'),
        search: /"version":\s?"(.*)",/g,
        replace: newVersion
    });

    await updateFileVersion({
        file: path.join(folder, 'README.md'),
        search: /v([0-9-.]+)/g,
        replace: newVersion
    });

    await updateFileVersion({
        file: path.join(folder, 'src/js/glightbox.js'),
        search: /version\s?=\s?'(.*)';/g,
        replace: newVersion
    });

    jetpack.copy(folder, tmpfolder, {
        matching: [
            '!node_modules',
            '!node_modules/**/*',
            '!.git',
            '!.git/**/*',
            '!.github',
            '!.github/**/*',
            '!.vscode',
            '!.vscode/**/*',
            '!*.psd',
            '!.DS_Store',
            '!.temp',
            '!.temp/**/*',
        ]
    });
    notify('Created folder', `Created folder correctly`);

    const zip = await createZip(tmpfolder).catch(error => {
        jetpack.remove(tmpfolder);
    });

    const folderName = path.basename(folder);
    jetpack.remove(tmpfolder);
    jetpack.move(zip, path.join(folder, folderName +'-master.zip'));

    notify('Done', `Packaging process ended correctly`);
}


async function createZip(folder) {
    return new Promise((resolve, reject) => {
        const name = folder + '.zip';
        const output = fs.createWriteStream(name);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', () => {
            notify('Zipped', `Zip archive was created correctly`);
            resolve(name);
        });
        archive.on('error', (err) => {
            notify('Package Error', `The was an error creating the zip.`)
            reject(err);
        });

        archive.pipe(output);
        archive.directory(folder, false);
        archive.finalize();
    })
}


async function updateFileVersion(data) {
    return new Promise((resolve, reject) => {
        jetpack.readAsync(data.file).then((str) => {
            let regexp = new RegExp(data.search);

            while ((matches = regexp.exec(str)) !== null) {
                let foundLine = matches[0];
                let newLine = foundLine.replace(matches[1], data.replace)
                str = str.replace(foundLine, newLine);
            }

            jetpack.writeAsync(data.file, str).then(() => {
                resolve(data.file);
            });
        });
    })
}

function extractArg(matchPattern) {
    for (let i = 0; i < args.length; i++) {
        if (matchPattern.test(args[i])) {
            const split = args[i].split(matchPattern)
            return split[split.length - 1];
        }
    }
    return false;
}