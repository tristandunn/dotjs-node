var File         = require("fs"),
    Path         = require("path"),
    platformName = process.platform;

if (!File.existsSync(Path.join(__dirname, "installer", platformName + ".js"))) {
  platformName = "unknown";
}

module.exports = (function() {
  var platform = require("./installer/" + platformName),
      runTasks = function(tasks) {
        (function run(task) {
          platform[task](function(error) {
            if (error) {
              throw error;
            } else if (tasks.length) {
              run(tasks.shift());
            }
          });
        })(tasks.shift());
      };

  return {
    install: function() {
      runTasks(platform.installCommands);
    },

    uninstall: function() {
      runTasks(platform.uninstallCommands);
    }
  };
})();
