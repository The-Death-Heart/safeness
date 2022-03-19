const { Message } = require("discord.js");
const db = require("../database/db");
module.exports = {
    name: "setlang",
    description: {
        es: "Cambia el idioma del bot (individual)",
        en: "Changes the bot's lang (invididual)"
    },
    category: "others",
    aliases: [],
    /**
     * 
     * @param {Message} message 
     * @param {string[]} args 
     * @param {function} reply 
     * @param {function} getInput 
     */
    execute: async function (message, args, reply, getInput) {
        let foundL = await db.query("SELECT * FROM langs WHERE langs.id = ?", [message.author.id]);
        let lang = foundL[0] ? foundL[0].lang : "es";
        const responses = {
            done: {
                es: "Idioma establecido correctamente",
                en: "Lang successfully established"
            }
        }
        /**
         * 
         * @param {number} length 
         * @returns 
         */
         function createSpaces(length) {
            let spaces = "";
            for (let i = 0; i < length; i++) {
                spaces += " ";
            }
            return spaces;
        }
        /**
         * 
         * @param {number} length 
         * @returns 
         */
        function createArrows(length) {
            let arrows = "";
            for (let i = 0; i< length; i++) {
                arrows += "^";
            }
            return arrows;
        }
        const langs = ["es", "en"];
        const targetLang = args[0];
        if (!targetLang) return reply("```\n" + `${client.prefix}setlang {lang}\n${createSpaces(`${client.prefix}setlang {`.length)}${createArrows("lang".length)}\n\nERR: Missing parameter` + "\n```");
        if (targetLang.length !== 2) return reply("```\n" + `${client.prefix}setlang ${targetLang}\n${createSpaces(`${client.prefix}setlang`.length  + 1)}${createArrows(targetLang.length)}\n\nERR: Lang must be 2 on length, received ${targetLang.length}` + "");
        if (!langs.some(l => l === targetLang)) return reply("```\n" + `${client.prefix}setlang ${targetLang}\n${createSpaces(`${client.prefix}setlang`.length + 1)}${createArrows(targetLang.length)}\n\nERR: Invalid lang` + "\n```");
        if (!foundL[0]) {
            await db.query("INSERT INTO langs SET ?", [{ id: message.author.id, lang: targetLang }]);
        }
        else {
            await db.query("UPDATE langs SET langs.lang = ? WHERE langs.id = ?", [targetLang, message.author.id]);
        }
        reply(responses.done[lang]);
    }
}