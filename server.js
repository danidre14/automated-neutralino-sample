const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ limit: '10mb', extended: false }));

const { getNeuInstalled } = require("./NeuModules/NeuInstaller");
const { removeActivePath } = require("./NeuModules/NeuPathManager");
const { publishNeu } = require("./NeuModules/NeuBundler");
const port = 3001;

app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, "index.html"));
});

app.post("/download/", async (req, res) => {
    try {
        const { appName, faviconString } = req.body;
        console.log("hit here", appName)

        const data = {
            appName,
            faviconString
        }

        const { outputPath, pathName } = await publishNeu(data);
        if (outputPath === null) return res.status(400).json("Publish failed");
        res.download(outputPath, `${appName}.zip`, () => {
            removeActivePath(pathName);
        });
    } catch {
        res.status(400).send("An error has occurred.");
    }
});

app.listen(port, async () => {
    console.log("Checking if nue installed");
    // do below in production
    // await getNeuInstalled();
    // -------

    // do below in development when sure neu already global
    const { initNeuPaths } = require("./NeuModules/NeuPathManager");
    await initNeuPaths(true);
    // -------

    console.log(`Example app listening at http://localhost:${port}`);
});