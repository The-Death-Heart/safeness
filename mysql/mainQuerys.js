const data = require("../data/data");
const db = require("../database/db");
db.query("CREATE TABLE IF NOT EXISTS langs (id TEXT NOT NULL, lang VARCHAR(2) NOT NULL DEFAULT 'es')");
db.query("CREATE TABLE IF NOT EXISTS prefixes (guildId TEXT NOT NULL, prefix VARCHAR(4) NOT NULL DEFAULT ?)", [data.defaultPrefix]);
db.query("CREATE TABLE IF NOT EXISTS warnings (id INT(200) NOT NULL AUTO_INCREMENT, userId TEXT NOT NULL, guildId TEXT NOT NULL, reason TEXT NOT NULL, modId TEXT NOT NULL, PRIMARY KEY (id))");
db.query("CREATE TABLE IF NOT EXISTS blacklist (userId TEXT NOT NULL)");
db.query("CREATE TABLE IF NOT EXISTS staffs (id TEXT NOT NULL, rank INT NOT NULL DEFAULT 1)");