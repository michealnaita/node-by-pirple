const readline = require("readline");
const actions = require("./actions.json");
const _data = require("../data");
const _logger = require("../logger");

const cli = {};

cli._parseInput = (input) => {
  input = typeof string ? input : false;
  if (!input) throw new Error("cli input should be string");

  const parsedInput = {};

  // users [options] [other]
  const values = input.split(" ");
  parsedInput.action = values[0];

  // test for options supplied
  parsedInput.options = values.filter(
    (str) => /^(-(-)?\w+)/.test(str) && !/=+/.test(str)
  );

  //test for key value pairs supplied
  parsedInput.pairs = {};
  values.forEach((str) => {
    if (/--\w+=\w+/.test(str)) {
      const [key, value] = str.split("=");
      parsedInput.pairs[key] = value;
    }
  });
  // an arg is a value that is not -this or --that and index is greater than 0
  parsedInput.arg = values.filter(
    (str, i) => !/^(-(-)?\w+)/.test(str) && i > 0
  )[0];
  return parsedInput;
};
cli._formater = {};
cli._formater.drawLine = () => {
  //
};
cli._formater.center = () => {
  //
};
cli._formater.color = (color) => {
  //
};
cli._processInput = (input) => {
  //
  /**
   * get users
   * get checks
   * help / man
   * get logs
   * shut down
   * stats
   */

  input = cli._parseInput(input);
  //   input = typeof string && Object.keys(actions).includes(input) ? input : false;
  //   if (!input) return;
  /* Assert that user's input is a supported actions */
  if (Object.keys(actions).includes(input.action)) {
    switch (input.action) {
      case "users": {
        let id;
        let isVerbose = false;
        if (input.options.includes("-v") || input.options.includes("--verbose"))
          isVerbose = true;
        if (input.arg) id = input.arg;
        if (input.pairs && input.pairs["--id"]) id = input.pairs["--id"];
        if (id) {
          _data.read("users", id, (err, userData) => {
            if (!err && userData) {
              renderUser(userData);
            } else {
              console.log(err);
            }
          });
        } else {
          _data.readAll("users", (err, usersData) => {
            if (!err && usersData) {
              usersData.forEach((userData) => {
                renderUser(userData);
              });
            } else {
              console.log(err);
            }
          });
        }
        function renderUser(userData) {
          delete userData.hashedPassword;
          if (isVerbose) {
            console.log(userData);
          } else {
            if (userData.checks) delete userData.checks;
            delete userData.tosAgreement;
            console.log(userData);
          }
        }
        break;
      }
      case "logs": {
        let id;
        let isVerbose = false;
        let category;
        if (input.options.includes("-v") || input.options.includes("--verbose"))
          isVerbose = true;
        if (input.options.includes("--checks")) category = "checks";
        if (input.options.includes("--errors")) category = "errors";
        if (input.arg) id = input.arg;
        if (input.pairs && input.pairs["--id"]) id = input.pairs["--id"];
        if (category) {
          if (id) {
            _logger.read(category, id, (err, logData) => {
              if (!err && logData) {
                renderLog(logData);
              } else {
                console.log(err);
              }
            });
          } else {
            _logger.list(category, (err, logsData) => {
              if (!err && logsData) {
                logsData.forEach((logData) => {
                  renderLog(logData);
                });
              } else {
                console.log(err);
              }
            });
          }
        } else {
          console.log("you need to specify logs catehory with --[category]");
        }

        function renderLog(logData) {
          if (category == "todo") {
            logData = JSON.parse(logData);
            if (isVerbose) {
              console.log(logData);
            } else {
              delete logData.processed;
              delete logData.processedAt;
              console.log(logData);
            }
          } else {
            console.log(logData);
          }
        }
        break;
      }
      case "exit":
        process.exit(0);
        break;
    }
  }
};
cli.init = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "",
  });
  rl.prompt();
  rl.on("line", cli._processInput);
  rl.on("close", () => process.exit(0));
};

module.exports = cli;
