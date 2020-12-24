import fs, { promises as fsp } from 'fs';
import path from 'path';
import archiver from 'archiver';
import notify from './notifications.js';
import { buildGlightboxJS, buildGlightboxCSS } from "./builder.js";
import __dirname from "./__dirname.js";

const args = process.argv.slice(2);
const root_directory = path.join(__dirname, '/..');

(async () => {
    if(extractArg(/(--build(-only)?=)|(-b)/i))
    return Promise.all([
        buildGlightboxJS(),
        buildGlightboxCSS()
    ]).then(() => console.info("\nDone.\n") || process.exit());
    else return createFolder();
})

/**
 * Realease new version
 * calling
 * node development/package.js version here
 * then npm publish
 */

async function createFolder() {
    await fsp.rm(path.join(root_directory, 'glightbox-master.zip'));

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
        file: path.join(root_directory, 'package.json'),
        search: /"version":\s?"(.*)",/g,
        replace: newVersion
    });

    await updateFileVersion({
        file: path.join(root_directory, 'README.md'),
        search: /v([0-9-.]+)/g,
        replace: newVersion
    });

    await updateFileVersion({
        file: path.join(root_directory, 'src/js/glightbox.js'),
        search: /version\s?=\s?'(.*)';/g,
        replace: newVersion
    });

    jetpack.copy(root_directory, tmpfolder, {
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
    console.info('Folder created correctly');

    const zip = await createZip(tmpfolder).catch(error => {
        jetpack.remove(tmpfolder);
    });

    const folderName = path.basename(root_directory);
    jetpack.remove(tmpfolder);
    jetpack.move(zip, path.join(root_directory, folderName.concat('-master.zip')));

    console.info("Packaging process done.");
}


async function createZip(root_directory) {
    return new Promise((resolve, reject) => {
        const name = root_directory + '.zip';
        const output = fs.createWriteStream(name);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', () => {
            console.info(`Zip archive was created correctly`);
            return resolve(name);
        });
        archive.on('error', (err) => {
            notify('Package Error', `The was an error creating the zip.`)
            return reject(err);
        });

        archive.pipe(output);
        archive.directory(root_directory, false);
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