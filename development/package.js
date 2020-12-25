import fs, { promises as fsp } from 'fs';
import path from 'path';

import notify from './helpers/notify.js';
import __dirname from "./helpers/__dirname.js";
import rw_stream from "./helpers/rw_stream.js";
import copy from "./helpers/copy.js";

const args = process.argv.slice(2);
const root_directory = path.join(__dirname, '/..');

(async () => {
    if(extractArg(/--build-only/i)) {
        return build();
    } else {
        const tmpfolder = path.join("./.temp/", 'glightbox-master');
        const zipPath = path.join(root_directory, 'glightbox-master.zip');

        await adoptVersion();

        if(extractArg(/--build(?!-only)|-b/i)) {
            await build();
        }

        if(extractArg(/(--zip=)|(-z)/i)) {
            fs.existsSync(zipPath) && await (fsp.rm || fsp.unlink)(zipPath);
            await gemIntoSafe(tmpfolder)
                .then(async safeFolder => {
                    return fsp.rename ( // move
                            await createZip(safeFolder),
                            zipPath
                        )
                })
                .then(() => console.info("Packaging process done."))
                .finally(() => fs.rmdirSync(tmpfolder, { recursive: true }));
        }
        console.info("Exits.");
        return process.exit(0);
    }
})();


async function build () {
    const { buildGlightboxJS, buildGlightboxCSS } = await import("./builder.js");
    return (
        Promise.all(
            [
                buildGlightboxJS(),
                buildGlightboxCSS()
            ]
        )
        .then(() => console.info("\nDone.\n") || process.exit(0))
    );
}


async function adoptVersion () {
    let newVersion;

    try { 
        newVersion = extractArg(/(--version=)/i)
                        || args[0].split(/^v?((\d+\.)+\d+)/)[1]
    } finally {
        if(!newVersion
            && !args.some((arg, index) => /-v/i.test(arg) ? (newVersion = args[index + 1]) : false)
            ) {
                notify("Version name not provided", "possible choice: 3.0.6"); 
                return Promise.reject("adoptVersion failed");
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

    console.info('Version adopted smoothly');

    return newVersion;
}


async function gemIntoSafe(safeFolder) {
    !fs.existsSync(safeFolder) && await fsp.mkdir(safeFolder);
    await copy(root_directory, safeFolder, {
        ignoreFolders: [
            'node_modules',
            /^\./, // .git, .github, .vscode, .temp
        ],
        ignoreFiles: [
            '.DS_Store',
            /(\.psd)$/
        ]
    });

    return safeFolder;
}


async function createZip(root_directory) {
    const archiver = (await import('archiver')).default;

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
    // set the global flag to ensure search pattern is "stateful"
    const pattern = new RegExp(data.search, 'g'); 
    let matches = null;

    return rw_stream(data.file, /\r?\n/, (line, EOF) => {
        while ((matches = pattern.exec(line)) !== null) {
            let foundLine = matches[0];
            let newLine = foundLine.replace(matches[1], data.replace)
            line = line.replace(foundLine, newLine);
        }

        return EOF ? line : line.concat("\n"); // LF
    });
}

function extractArg(matchPattern) {
    for (let i = 0; i < args.length; i++) {
        if (matchPattern.test(args[i])) {
            const split = args[i].split(matchPattern)
            return split[split.length - 1] || true;
        }
    }
    return false;
}