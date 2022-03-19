const data = require("../data/data");
const db = require("../database/db");
db.query("CREATE TABLE IF NOT EXISTS langs (id TEXT NOT NULL, lang VARCHAR(2) NOT NULL DEFAULT 'es')");
db.query("CREATE TABLE IF NOT EXISTS prefixes (guildId TEXT NOT NULL, prefix VARCHAR(4) NOT NULL DEFAULT ?)", [data.defaultPrefix]);