const fs = require('fs');
const { exec } = require("child_process");

module.exports.asyncExec = function (command, options = {}) {
    return new Promise((resolve, reject) => {
        exec(command, options, (error, stdout, stderr) => {
            if (error) {
                return reject({ error, stdout, stderr });
            }
            resolve({ stderr, stdout });
        });
    });
}

module.exports.asyncWriteFile = function (path, data = "") {
    return new Promise((resolve, reject) => {
        fs.writeFile(path, data, (err) => {
            if (err) return reject(err);
            resolve("Data written to file");
        });
    });
}

module.exports.asyncReadFile = function (path, data = "") {
    return new Promise((resolve, reject) => {
        fs.readFile(path, (err, data) => {
            if (err) return reject(err);
            resolve(data);
        });
    });
}