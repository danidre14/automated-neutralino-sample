const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ limit: '10mb', extended: false }));

const { getNeuInstalled } = require("./installNeu");
const { publishNeu } = require("./publishNeu");
const port = 3000;

app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, "index.html"));
});

app.post("/download/:appName", async (req, res) => {
    console.log("Hi");
    const { appName } = req.params;
    const { dad } = req.body;

    const appPath = await publishNeu(appName);
    if(appPath === null) return res.status(400).json("Publish failed");
    res.download(appPath, `${appName}.zip`);
});

app.listen(port, async () => {
    console.log("Checking if nue installed");
    await getNeuInstalled();
    console.log(`Example app listening at http://localhost:${port}`);
});