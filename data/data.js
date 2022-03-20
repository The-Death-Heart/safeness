const data = {
    database: {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    },
    token: process.env.TOKEN,
    defaultPrefix: "s!",
    ranks: {
        1: {
            name: "Soporte",
            role_id: "955199686480896030"
        },
        2: {
            name: "Moderador",
            role_id: "949639525162954792"
        },
        3: {
            name: "Administrador",
            role_id: "949639159151218759"
        },
        4: {
            name: "Director",
            role_id: "950725408763047958"
        },
        5: {
            name: "Fundador",
            role_id: "949636926745509929"
        }
    }
}
module.exports = data;