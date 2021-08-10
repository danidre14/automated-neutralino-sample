const path = require("path");
const archiver = require("archiver");
const fs = require("fs");
const { asyncExec, asyncWriteFile } = require("../shellFunc");
const { getNeuPath } = require("./NeuPathManager");
const pngToIco = require('png-to-ico');
const { resolve } = require("path");

const generateAppOptions = (appName) => {
    return {
        "resources/index.html": `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>${appName}</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <div id="neutralinoapp">
      <h1>${appName}</h1>
      <div id="info"></div>
      <br/>
      <div>
        <a href="#" onclick="window.myApp.openDocs();">Docs</a> &middot;  
        <a href="#" onclick="window.myApp.openTutorial();">Tutorial</a>
      </div>
    </div>
    <!-- Neutralino.js client. This file is gitignored, 
        because \`neu update\` typically downloads it.
        Avoid copy-pasting it. 
        -->
    <script src="js/neutralino.js"></script>
    <!-- Your app's source files -->
    <script src="js/main.js"></script>
  </body>
</html>
`,
        "neutralino.config.json": `
{
    "applicationId": "js.neutralino.sample",
    "port": 0,
    "defaultMode": "window",
    "enableHTTPServer": true,
    "enableNativeAPI": true,
    "url": "/resources/",
    "nativeBlockList": [],
    "globalVariables": {
        "TEST": "Test Value"
    },
    "modes": {
        "window": {
            "title": "${appName}",
            "width": 800,
            "height": 500,
            "minWidth": 400,
            "minHeight": 250,
            "fullScreen": false,
            "alwaysOnTop": false,
            "icon": "/favicons/favicon.ico",
            "enableInspector": false,
            "borderless": false,
            "maximize": false
        },
        "browser": {},
        "cloud": {}
    },
    "cli": {
        "binaryName": "${appName}",
        "resourcesPath": "/resources/",
        "clientLibrary": "/resources/js/neutralino.js",
        "binaryVersion": "2.5.0",
        "clientVersion": "1.2.0"
    }
}`
    };
}

const defaults = {
    faviconString: "data:image/png;base64,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"
};

const png2Ico = function (img) {
    return new Promise(async (resolve, reject) => {
        const resizedPath = path.resolve(img.dirPath, "favicon-png-new." + img.fileType);
        await require("./NeuImageResizer")(img.filePath, resizedPath);
        pngToIco(resizedPath)
            .then(async (buf) => {
                const favName = path.resolve(img.dirPath, "favicon.ico");
                await asyncWriteFile(favName, buf);
                resolve(favName);
            })
            .catch(reject);
    });
}
const img2Disk = async function (_base64Data, endPath, def) {
    // Save base64 image to disk
    try {
        // Decoding base-64 image
        // Source: http://stackoverflow.com/questions/20267939/nodejs-write-base64-image-file
        function decodeBase64Image(dataString) {
            const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            const response = {};

            if (matches.length !== 3) {
                return new Error('Invalid input string');
            }

            response.type = matches[1];
            response.data = new Buffer.from(matches[2], 'base64');

            return response;
        }

        // Regular expression for image type:
        // This regular image extracts the "jpeg" from "image/jpeg"
        const imageTypeRegularExpression = /\/(.*?)$/;

        const imageBuffer = decodeBase64Image(_base64Data);

        const uniqueRandomImageName = "favicon-png-old";
        // This variable is actually an array which has 5 values,
        // The [1] value is the real image extension
        const imageTypeDetected = imageBuffer
            .type
            .match(imageTypeRegularExpression);
        const userUploadedImagePath = path.resolve(endPath, `${uniqueRandomImageName}.${imageTypeDetected[1]}`);

        // Save decoded binary image to disk
        try {
            await asyncWriteFile(userUploadedImagePath, imageBuffer.data);
        }
        catch (error) {
            console.log('ERROR:', error);
            if (!def)
                return img2Disk(defaults.faviconString, endPath, true);
        }
        return { dirPath: endPath, filePath: userUploadedImagePath, fileName: uniqueRandomImageName, fileType: imageTypeDetected[1] };
    }
    catch (error) {
        console.log('ERROR:', error);
        if (!def)
            return img2Disk(defaults.faviconString, endPath, true);
    }

}

module.exports.publishNeu = async function (data) {
    let { appName = "myapp11", faviconString = defaults.faviconString } = data;
    try {
        const { appDir, pathName } = await getNeuPath();

        const faviconFolder = path.resolve(appDir, "favicons");
        
        // check if folder exists
        if (!fs.existsSync(faviconFolder)) {
            fs.mkdirSync(faviconFolder);
        }

        const img = await img2Disk(faviconString, faviconFolder);
        const ico = await png2Ico(img);
        console.log("ico src", ico);


        // configure a lot of things
        const appOptions = generateAppOptions(appName);
        for (const key of Object.keys(appOptions))
            await asyncWriteFile(path.resolve(appDir, key), appOptions[key]);
        // ---

        // build neu
        await asyncExec("neu build", { cwd: appDir });

        const outputPath = path.resolve(appDir, "dist", `${appName}.zip`);

        const srcPath = path.resolve(appDir, "dist", `${appName}`);

        await require("./NeuMakeIcon")(path.resolve(srcPath, `${appName}-win_x64.exe`), ico);

        console.log("made icon");
        
        await zipDirectory(srcPath, outputPath);
        console.log("built zip");
        return { outputPath, pathName };
    } catch (e) {
        // install neu globally
        console.log("Error publishing application: ", e);
        return null;
    }
};

function zipDirectory(source, out) {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const stream = fs.createWriteStream(out);

    return new Promise((resolve, reject) => {
        archive
            .directory(source, path.basename(source))
            .on('error', err => reject(err))
            .pipe(stream);

        stream.on('close', () => resolve());
        archive.finalize();
    });
}