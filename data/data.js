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
            role_id: "955199686480896030",
            id: 1
        },
        2: {
            name: "Moderador",
            role_id: "949639525162954792",
            id: 2
        },
        3: {
            name: "Administrador",
            role_id: "949639159151218759",
            id: 3
        },
        4: {
            name: "Director",
            role_id: "950725408763047958",
            id: 4
        },
        5: {
            name: "Fundador",
            role_id: "949636926745509929",
            id: 5
        }
    },
    mainGuild: "949039382856347680"
}
module.exports = data;