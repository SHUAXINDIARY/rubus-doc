Array.prototype.remove = function (val) {
  var index = this.indexOf(val);
  if (index > -1) {
    this.splice(index, 1);
  }
};
const fs = require("fs-extra");
const readline = require("readline");
const path = require("path");
const filePath = path.resolve(__dirname, "../node_modules/@rubus/rubus/src/packages");
const nodeModulesPath = path.resolve(__dirname, "../node_modules");

const styleConfigFileName = "/style.config.json";
const rootFolderName = "styles/@spectrum-css";

let fileCount = 0;
let tableOfContents = [];
const omitFolderList = ["utils", "Layout", "Popover"];

const files = fs.readdirSync(filePath);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let indexStyleFile = "";

let staticFolderName = "";
rl.question("Please enter your static resource folder name: ", function (answer) {
  staticFolderName = answer;
  rl.close();
  initCss();
});

files.forEach((item) => {
  let stat = fs.lstatSync(filePath + "/" + item);
  if (stat.isDirectory() === true) {
    tableOfContents.push(item);
  }
});

omitFolderList.forEach((item) => {
  tableOfContents.remove(item);
});

function getConfigInfo(stylesPath) {
  let styleConfig;

  return new Promise((resolve) => {
    fs.readFile(filePath + "/" + stylesPath + styleConfigFileName, function (error, data) {
      if (error) {
        console.error("File read failed: " + error);
        return false;
      } else {
        styleConfig = JSON.parse(data.toString());
        resolve(styleConfig);
      }
    });
  });
}

function getStyleFileContent(stylePath) {
  let styleText;
  return new Promise((resolve) => {
    fs.readFile(nodeModulesPath + "/" + stylePath, function (error, data) {
      if (error) {
        console.error("File read failed: " + error);
        return styleText;
      } else {
        styleText = data.toString();
        resolve(styleText);
      }
    });
  });
}
function createStyleFile(fileName, str) {
  return new Promise((resolve) => {
    fs.writeFile(fileName, str, function (err) {
      if (err) {
        console.error("Create style file fail: " + fileName);
      } else {
        fileCount++;
        console.log("\033[;32m DONE \033[0m" + fileName + ".css build success");
        console.log("\033[;32m Total file: \033[0m" + fileCount);
      }
    });
  });
}

function getStyleFolderName(url) {
  return path.resolve(__dirname, "../" + staticFolderName + "/" + rootFolderName + "/" + url);
}
function getStyleFileName(url) {
  let arr = url && url.split("/");
  return arr[arr.length - 1];
}

// console.log(`Initializing style files to "${staticFolderName}" folder`);
function initCss() {
  staticFolderName &&
    tableOfContents.forEach(async (cf) => {
      let _styleConfig = await getConfigInfo(cf)
        .then((e) => {
          return e;
        })
        .catch((err) => {
          console.error(err);
        });
      _styleConfig &&
        _styleConfig.forEach(async (path) => {
          _styleText = await getStyleFileContent(path)
            .then((e) => {
              return e;
            })
            .catch((err) => {
              console.error(err);
            });

          let staticStylePath = getStyleFolderName(cf);
          staticStylePath &&
            fs.ensureDir(staticStylePath, function (err) {
              err && console.log(err);
            });
          let _fileName = getStyleFileName(path);
          indexStyleFile =
            indexStyleFile +
            `
@import "./${cf + "/" + _fileName}";`;
          _styleText && createStyleFile(staticStylePath + "/" + _fileName, _styleText);
          createStyleFile("../" + staticFolderName + "/" + rootFolderName + "/index.css", indexStyleFile);
        });
    });
}
