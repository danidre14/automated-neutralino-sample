const path = require("path");
const archiver = require("archiver");
const fs = require("fs");
const { asyncExec, asyncWriteFile } = require("../shellFunc");
const { getNeuPath, removeActivePath } = require("./NeuPathManager");

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
            "icon": "/resources/icons/appIcon.png",
            "enableInspector": true,
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


module.exports.publishNeu = async function (appName = "myapp11") {
    try {
        const { appDir, pathName } = await getNeuPath();

        // configure a lot of things
        const appOptions = generateAppOptions(appName);
        for (const key of Object.keys(appOptions))
            await asyncWriteFile(path.resolve(appDir, key), appOptions[key]);
        // ---

        // build neu
        await asyncExec("neu build", { cwd: appDir });
        // await asyncExec("neu build --release", { cwd: appDir });

        const outputPath = path.resolve(appDir, "dist", `${appName}-release.zip`)
        await zipDirectory(path.resolve(appDir, "dist"), outputPath);
        removeActivePath(pathName);
        return outputPath;
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
            .directory(source, false)
            .on('error', err => reject(err))
            .pipe(stream);

        stream.on('close', () => resolve());
        archive.finalize();
    });
}