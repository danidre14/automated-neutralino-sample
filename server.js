const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ limit: '10mb', extended: false }));

const { getNeuInstalled } = require("./NeuModules/NeuInstaller");
const { removeActivePath } = require("./NeuModules/NeuPathManager");
const { publishNeu } = require("./NeuModules/NeuBundler");
const port = 3000;

app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, "index.html"));
});

app.post("/download/:appName", async (req, res) => {
    const { appName } = req.params;

    const {outputPath, pathName} = await publishNeu(appName);
    if (outputPath === null) return res.status(400).json("Publish failed");
    res.download(outputPath, `${appName}.zip`, ()=> {
        removeActivePath(pathName);
    });
});

app.listen(port, async () => {
    console.log("Checking if nue installed");
    await getNeuInstalled();
    // const { initNeuPaths } = require("./NeuModules/NeuPathManager");
    // await initNeuPaths(true);
    console.log(`Example app listening at http://localhost:${port}`);
});