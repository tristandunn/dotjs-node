var File         = require("fs"),
    Path         = require("path"),
    ChildProcess = require("child_process");

var AGENT     = Path.join(process.env["HOME"], "Library", "LaunchAgents", "com.tristandunn.dotjs-node.plist"),
    DOTJS     = Path.join(process.env["HOME"], ".js"),
    DAEMON    = Path.resolve(Path.join(__dirname, "..", "bin", "dotjs-node")),
    EXTENSION = Path.resolve(Path.join(__dirname, "..", "builds", "extension.crx"));

var Installer = {
  install: function() {
    var tasks = ["createDirectory"];

    if (process.platform == "darwin") {
      tasks.push("createAgentDirectory", "createAgentFile", "loadAgent");
    } else {
      console.info("Installing the agent is currently unsupported on your platform. " +
                     "Please manually install or run it from:\n" +
                     "\t" + DAEMON + "\n");
    }

    if (process.platform == "darwin") {
      tasks.push("installExtension");
    } else {
      console.info("Installing the extension is currently unsupported on your platform. " +
                     "Please manually install it from:\n" +
                     "\t" + EXTENSION + "\n");
    }

    Installer.run(tasks);
  },

  uninstall: function() {
    var tasks = ["removeDirectoryIfEmpty"];

    if (process.platform == "darwin") {
      tasks.push("unloadAgent", "removeAgentFile");
    } else {
      console.info("Please manually uninstall the daemon, if you installed it.\n");
    }

    console.info("Please manually uninstall the extension, if you installed it.\n");

    Installer.run(tasks);
  },

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

  installExtension: function(callback) {
    var extension = EXTENSION;

    File.readdir("/Applications", function(error, files) {
      if (error) {
        return callback(error);
      }

      var target = files.filter(function(file) { return file.match(/^Google Chrome/); }).shift();

      if (!target) {
        console.info("Installing the extension failed. Please manually install it from:\n" +
                       "\t" + EXTENSION + "\n");

        return callback();
      }

      var command = "open -a '" + target + "' " + extension + " &";

      ChildProcess.exec(command, callback);
    });
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

  run: function(tasks) {
    (function run(task) {
      Installer[task](function(error) {
        if (error) {
          throw error;
        } else if (tasks.length) {
          run(tasks.shift());
        }
      });
    })(tasks.shift());
  },

  unloadAgent: function(callback) {
    var agent = AGENT;

    Path.exists(agent, function(exists) {
      if (exists) {
        ChildProcess.exec("launchctl unload " + agent, callback);
      }
    });
  }
};

module.exports = {
  install   : Installer.install,
  uninstall : Installer.uninstall
};
