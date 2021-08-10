const sharp = require('sharp');
const fs = require('fs');

module.exports = function resizePng(inPath, outPath) {
    return new Promise((resolve, reject) => {
        // input stream
        const inStream = fs.createReadStream(inPath);

        // output stream
        const outStream = fs.createWriteStream(outPath, { flags: "w" });

        // on error of output file being saved
        outStream.on('error', function (e) {
            console.log("Error");
            reject(e)
        });

        // on success of output file being saved
        outStream.on('close', function () {
            console.log("Successfully saved file");
            resolve();
        });

        // input stream transformer
        // "info" event will be emitted on resize
        const transform = sharp()
            .resize({ width: 256, height: 256 })
            .on('info', function (fileInfo) {
                console.log("Resizing done, file not saved");
            });

        inStream.pipe(transform).pipe(outStream);
    });
}