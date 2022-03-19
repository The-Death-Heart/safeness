const LogManager = require("../managers/LogManager");
const logs = new LogManager(["system", "bot"]);
module.exports = logs;