var File = require("fs"),
    Path = require("path");

var DOTJS     = Path.join(process.env["HOME"], ".js"),
    DAEMON    = Path.resolve(Path.join(__dirname, "..", "..", "bin", "dotjs-node")),
    EXTENSION = Path.resolve(Path.join(__dirname, "..", "..", "extension"));

module.exports = {
  installCommands   : ["createDirectory", "displayInstallationNotes"],
  uninstallCommands : ["removeDirectoryIfEmpty", "displayUninstallationNotes"],

  createDirectory: function(callback) {
    File.mkdir(DOTJS, function(error) {
      if (error && error.code !== "EEXIST") {
        return callback(error);
      }

      callback();
    });
  },

  displayInstallationNotes: function(callback) {
    console.info("Installing the agent is currently unsupported on your platform. " +
                   "Please manually install or run it from:\n" +
                   "\t" + DAEMON + "\n");
    console.info("Installing the extension must be done manually. Please install it from:\n" +
                   "\t" + EXTENSION + "\n");
    console.info("If this is your first time installing, you may need to visit and trust the certificate at:\n" +
                   "\thttps://localhost:3131\n");

    callback();
  },

  displayUninstallationNotes: function(callback) {
    console.info("Please manually uninstall the daemon, if you installed it.\n");
    console.info("Please manually uninstall the extension, if you installed it.\n");

    callback();
  },

  removeDirectoryIfEmpty: function(callback) {
    var path = DOTJS;

    File.readdir(path, function(error, files) {
      if (!error && files.length === 0) {
        File.rmdir(path, callback);
      } else {
        callback();
      }
    });
  }
};
