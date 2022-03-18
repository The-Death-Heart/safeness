const db = require("../db");
db.query("CREATE TABLE IF NOT EXISTS langs (id TEXT NOT NULL, lang VARCHAR(2) NOT NULL DEFAULT 'es')");