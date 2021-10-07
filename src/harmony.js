console.clear();

require('dotenv').config()
const Client  = require('./structures/Client.js');
const Command = require('./structures/Command.js');

const client = new Client();

client.on('ready', () => console.log('Harmonic convergence is upon us!'));

client.login(process.env.CLIENT_TOKEN);