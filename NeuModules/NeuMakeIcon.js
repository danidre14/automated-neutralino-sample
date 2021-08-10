const hacker = require("@erhhung/node-resource-hacker");
const path = require("path");
 
async function setIcon(exePath, iconPath) {
  try {
    await hacker({
      action:   'addoverwrite', // required
      open:     exePath,  // required
      save:     exePath,  // optional (default: .open)
      resource: iconPath,  // optional
      mask: {                   // optional
        type: 'ICONGROUP',
        name: '1',              // optional
        lang: '',               // optional
      },
    });
  } catch (err) {
    console.error(err);
  }
}

module.exports = setIcon;

// (async ()=> {
//     await setIcon();

//     console.log("setted it");
// })();