// Prevents us from using variables before declaring them.
"use strict";

var packageConfig = require(__dirname + "/package.config.json");
var fileName = packageConfig.defaultConfigFile;
var args = require("optimist").argv;
var fs = require("fs");
var path = require("path");

if(args[packageConfig.commandLineSwitchName]) {
    fileName = args[packageConfig.commandLineSwitchName];
}
var rootDir = process.cwd();

var configData = "";
var filePath = path.normalize(rootDir) + "/" + fileName;

try {
    configData = fs.readFileSync(filePath, "utf-8");
    module.exports = JSON.parse(configData);
}
catch(e) {
    var msg = 'Unable to read or parse file "' + filePath + '". Exception caught: ' + e;
    if(packageConfig.throwOnError) {
        throw new Error(msg);
    }
    console.error(msg);
    module.exports = null;
}