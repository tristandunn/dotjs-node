var File         = require("fs"),
    Path         = require("path"),
    ChildProcess = require("child_process");

var AGENT     = Path.join(process.env["HOME"], "Library", "LaunchAgents", "com.tristandunn.dotjs-node.plist"),
    DOTJS     = Path.join(process.env["HOME"], ".js"),
    DAEMON    = Path.resolve(Path.join(__dirname, "..", "..", "bin", "dotjs-node")),
    EXTENSION = Path.resolve(Path.join(__dirname, "..", "..", "extension"));

module.exports = {
  installCommands   : ["createDirectory", "createAgentDirectory", "createAgentFile", "loadAgent", "installExtension"],
  uninstallCommands : ["removeDirectoryIfEmpty", "unloadAgent", "removeAgentFile", "displayUninstallationNotes"],

  createAgentDirectory: function(callback) {
    var directory = Path.dirname(AGENT);

    File.mkdir(directory, function(error) {
      if (error && error.code !== "EEXIST") {
        return callback(error);
      }

      callback();
    });
  },

  createAgentFile: function(callback) {
    var contents = '' +
          '<?xml version="1.0" encoding="UTF-8"?>\n' +
          '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n' +
          '<plist version="1.0">\n' +
          '<dict>\n' +
          '\t<key>KeepAlive</key>\n' +
          '\t<true/>\n' +
          '\t<key>Label</key>\n' +
          '\t<string>com.tristandunn.dotjs-node</string>\n' +
          '\t<key>ProgramArguments</key>\n' +
          '\t<array>\n' +
          '\t\t<string>' + process.env["_"] + '</string>\n' +
          '\t\t<string>' + DAEMON + '</string>\n' +
          '\t</array>\n' +
          '\t<key>RunAtLoad</key>\n' +
          '\t<true/>\n' +
          '\t<key>WorkingDirectory</key>\n' +
          '\t<string>' + DOTJS + '</string>\n' +
          '</dict>\n' +
          '</plist>\n';

    File.writeFile(AGENT, contents, callback);
  },

  createDirectory: function(callback) {
    File.mkdir(DOTJS, function(error) {
      if (error && error.code !== "EEXIST") {
        return callback(error);
      }

      callback();
    });
  },

  displayUninstallationNotes: function(callback) {
    console.info("Please manually uninstall the extension, if you installed it.\n");

    callback();
  },

  installExtension: function(callback) {
    console.info("Installing the extension must be done manually. Please install it from:\n" +
                   "\t" + EXTENSION + "\n");

    console.info("If this is your first time installing, you may need to visit and trust the certificate at:\n" +
                   "\thttps://localhost:3131\n");
    callback();
  },

  loadAgent: function(callback) {
    ChildProcess.exec("launchctl load -w " + AGENT, callback);
  },

  removeAgentFile: function(callback) {
    File.unlink(AGENT, callback);
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
  },

  unloadAgent: function(callback) {
    var agent = AGENT;

    File.exists(agent, function(exists) {
      if (exists) {
        ChildProcess.exec("launchctl unload " + agent, callback);
      }
    });
  }
};
