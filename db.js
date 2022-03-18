const { createConnection } = require("mysql");
const data = require("./data");
const db = createConnection(data.database);
db.connect();
db.query = require("util").promisify(db.query);

module.exports = db;