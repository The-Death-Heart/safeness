const { Message } = require("discord.js");
const db = require("../db");
module.exports = {
    name: "setlang",
    description: "",
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
        let lang = foundL[0] ? foundL[0] : "es";
        const responses = {
            alreadySet: {
                es: "Ya has establecido ese idioma",
                en: "You already set that lang"
            },
            invalidLang: {
                es: "Ese idioma es inválido",
                en: "That lang is invalid"
            },
            lenghtError: {
                es: "El idioma debe de ser de 2 dígitos",
                en: "The lang must be of 2 digits"
            },
            noLang: {
                es: "Debes introducir el idioma que deseas establecer",
                en: "You must enter the lang you wish to establish"
            },
            done: {
                es: "Idioma establecido correctamente",
                en: "Lang successfully established"
            }
        }
        const langs = ["es", "en"];
        const targetLang = args[0];
        if (!targetLang) return reply(responses.noLang[lang]);
        if (targetLang.length !== 2) return reply(responses.lenghtError[lang]);
        if (!lang.some(l => l === targetLang)) return reply(responses.invalidLang[lang]);
        if (!foundL[0]) {
            await db.query("INSERT INTO langs SET ?", [{ id: message.activity.author.id, lang: targetLang }]);
        }
        else {
            await db.query("UPDATE langs SET langs.lang = ? WHERE langs.id = ?", [targetLang, message.author.id]);
        }
        reply(responses.done[lang]);
        quecoñoesesto
    }
}