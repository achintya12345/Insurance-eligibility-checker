var fs = require("fs");

function writeScreenshot(data, filename) {
  try {
    const filePath = __dirname + "/screenshots/" + filename + ".png";
    fs.writeFileSync(filePath, data, "base64");
  } catch {
    console.log("err");
  }
}

module.exports = { writeScreenshot };
