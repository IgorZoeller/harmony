console.clear();
require('dotenv').config()
const Discord = require('discord.js');

const intents = new Discord.Intents(32767);

const client = new Discord.Client({intents});

client.on('ready', () => console.log('Harmonic convergence is upon us!'));

client.login(process.env.CLIENT_TOKEN);