const { asyncExec } = require("./shellFunc");

module.exports.getNeuInstalled = async function() {
    try {
        // check if neu is installed globally
        const newData = (await asyncExec("npm list -g @neutralinojs/neu --depth 0")).stdout;

        // check neu version privately
        const versionPrivate = newData.match(/@[\d]+\.[\d]+\.[\d]+/)[0].substr(1);
        const versionPublic = (await asyncExec("npm v @neutralinojs/neu version")).stdout;

        if (versionPrivate.trim() != versionPublic.trim()) throw "need new version";

        console.log("Have Neu, here");
        return versionPrivate;
    } catch (e) {
        // install neu globally
        console.log("Need new version");
        try {
            await asyncExec("npm install -g @neutralinojs/neu");
            console.log("Got new version");
        } catch (e) {
            console.log("Error installing neu globally: ");
        }
        return null;
    }
};

(async () => {
    console.log("In install");

    getNeuInstalled = async function () {
        try {
            // check if neu is installed globally
            const newData = (await asyncExec("npm list -g @neutralinojs/neu --depth 0")).stdout;

            // check neu version privately
            const versionPrivate = newData.match(/@[\d]+\.[\d]+\.[\d]+/)[0].substr(1);
            const versionPublic = (await asyncExec("npm v @neutralinojs/neu version")).stdout;

            if (versionPrivate.trim() != versionPublic.trim()) throw "need new version";

            console.log("Have Neu, there");
        } catch (e) {
            // install neu globally
            console.log("Need new version");
            try {
                await asyncExec("npm install -g @neutralinojs/neu");
                console.log("Got new version");
            } catch (e) {
                console.log("Error installing neu globally: ");
            }
        }
    }

    await getNeuInstalled();


    console.log("Out install");
});