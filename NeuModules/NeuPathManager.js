const path = require("path");
const fs = require('fs');
const crypto = require("crypto");
const { asyncExec } = require("../shellFunc");

const getExistingNeuPaths = dir =>
    fs.readdirSync(dir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

let hasNeu = false;
const publishDirName = path.resolve(__dirname, "publishDir");
const minNeuPaths = 5;
const maxNeuPaths = 10;
let neuPaths;
const neuActivePaths = [];

const initNeuPaths = async function (neuExists) {
    hasNeu = neuExists;
    try {
        // check if folder exists
        if (!fs.existsSync(publishDirName)) {
            fs.mkdirSync(publishDirName);
        }

        neuPaths = getExistingNeuPaths(publishDirName);

        for (let i = neuPaths.length; i < minNeuPaths; i++)
            await createNeuPath();
    } catch (e) {
        console.error("Init paths error:", e);
    }
}
const createNeuPath = async function () {
    if (!hasNeu) throw "Does not have neu";
    const pathName = "temp-" + crypto.randomBytes(4).toString("hex");
    const appDir = path.resolve(publishDirName, pathName);

    await asyncExec(`neu create ${pathName}`, { cwd: publishDirName });
    neuPaths.push(pathName);

    return { appDir, pathName };
}

const removeNeuPath = function (pathName) {
    neuPaths.splice(neuPaths.indexOf(pathName), 1);
    const appDir = path.resolve(publishDirName, pathName);

    fs.rmdir(appDir, { recursive: true });
}

const addActivePath = function (pathName) {
    neuActivePaths.push(pathName);
}

const removeActivePath = function (pathName) {
    const distDir = path.resolve(publishDirName, pathName, "dist");
    fs.rmdir(distDir, { recursive: true }, () => {
        neuActivePaths.splice(neuActivePaths.indexOf(pathName), 1);
    });

    if (neuPaths.length >= maxNeuPaths)
        removeNeuPath(pathName);
}

const getNeuPath = async function () {
    // look for inactive path
    for (const pathName of neuPaths) {
        if (!neuActivePaths.includes(pathName)) {
            addActivePath(pathName);

            const appDir = path.resolve(publishDirName, pathName);
            return { appDir, pathName };
        }
    }

    // all paths are active, create new path
    const { appDir, pathName } = await createNeuPath();
    addActivePath(pathName);

    return { appDir, pathName };
}

module.exports = {
    initNeuPaths, getNeuPath, removeActivePath
}