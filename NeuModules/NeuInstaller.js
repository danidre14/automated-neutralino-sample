const { asyncExec } = require("../shellFunc");
const { initNeuPaths } = require("./NeuPathManager");

module.exports.getNeuInstalled = async function () {
    try {
        // check if neu is installed globally
        const newData = (await asyncExec("npm list -g @neutralinojs/neu --depth 0")).stdout;

        // check neu version privately
        const versionPrivate = newData.match(/@[\d]+\.[\d]+\.[\d]+/)[0].substr(1);
        const versionPublic = (await asyncExec("npm v @neutralinojs/neu version")).stdout;

        if (versionPrivate.trim() != versionPublic.trim()) throw "need new version";

        console.log("Neu already installed.");
        await initNeuPaths(true);

        return versionPrivate;
    } catch (e) {
        // install neu globally
        console.log("Need new version");
        try {
            await asyncExec("npm install -g @neutralinojs/neu");

            console.log("Installed neu version");
            await initNeuPaths(true);
        } catch (e) {
            console.log("Error installing neu globally: ");
            await initNeuPaths(false);
        }
        return null;
    }
};