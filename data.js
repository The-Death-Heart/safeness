const data = {
    database: {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    },
    /**
     * @type {number}
     */
    port: process.env.PORT
}
module.exports = data;