const tmi = require('tmi.js');
const env = require('dotenv').config();
const fetch = require('node-fetch');
var sqlite3 = require('sqlite3').verbose();
var db1 = new sqlite3.Database('./quotes.db');
var db2 = new sqlite3.Database('./clips.db');
const regexpCommand = new RegExp(/^!([a-zA-Z0-9]+)(?:\W+)?(.*)?/);
const re = /[^\"]([a-z0-9_,\-#. ]*)[\"$]|([a-z0-9_\-]*)[,$]|\d{4}$/gi;

// TODO 
// delete quote by id mods only
// printtaa quote annetulla id:llä esim. !quote 4
// JOS quote on annettu ilman argumenttejä printtaa random quote
// Edit quote id:n perusteella mods only
// listaa kaikki quotet !allquotes
// Luo sivusto jolla kaikki quotet sekä komennot ovat
// listaa kaikki komennot !allcommands
// lisää !help komento kaikille komennoille esim. !help quote
// Lisää quote komentoon quote, kuka sen sanoi ja milloin sanoi muotoon "Never peace out -LordSexyTrellster, Demon's Souls, 2021"
// Lisää quote komentoon ominaisuus joka hakee nykyisen pelin mitä striimaaja pelaa, joten sen voi lisätä db inserttiin ilman manuaalista inputtia


const client = new tmi.Client({
	options: { debug: true, messagesLogLevel: "info" },
	connection: {
		reconnect: true,
		secure: true
	},
	identity: {
		username: process.env.BOT_USERNAME,
		password: process.env.OAUTH_TOKEN
	},
	channels: [ 'channel' ]
});

client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

client.connect();

function onMessageHandler (target, context, msg, self) {
  if (self) { return; }
	
	const commandName = msg.trim();

	if (commandName === '!randomclip' ) {
		db2.get("SELECT clips FROM clips ORDER BY RANDOM() LIMIT 1", (err, row) => {
		if (err) {
			console.log(row)
		}
		let urlClip = 'https://clips.twitch.tv/';
		let dbValue = row.clips;
		let wholeUrl = urlClip.concat(dbValue);
		client.say(target, `${wholeUrl}`);
		console.log(`* Executed ${commandName} command`);
	}); 
	}
	
	if (commandName === '!quote') {
		db1.get("SELECT quote FROM quotes ORDER BY RANDOM() LIMIT 1", (err, row) => {
		if (err) {
			console.log(row)
		}
		let quot = row.quote;
		client.say(target, `${quot}`);
		console.log(`* Executed ${commandName} command`);
	});
	}

	if (msg.includes("!addquote", 0)) {
		const [raw, command, argument] = msg.match(regexpCommand);
		var muokattu = argument.match(re);
		client.say(target, `Found the following arguments "${argument}"`);
		//var succ = addQuote(muokattu);
		//if (succ === true) {
		//client.say(target, `${quot}`);
		console.log(`* Executed ${commandName} command`);
		console.log(muokattu);
		//} else {
		//	client.say(target, 'Something went wrong...')
		//	console.log(`* Failed to execute ${commandName}`)
		}
}	
//}

//ei toimi kait
function isUserMod () {
	client.on("chat", (channel, user, message, self) => {
		if(user.mod) {
			// User is a mod.
			return true;
		} else {
			return false;
		}
	})
};

function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}

function checkResponseStatus(res) {
    if(res.ok){
        return res
    } else {
        throw new Error(`The HTTP status of the reponse: ${res.status} (${res.statusText})`);
    }
}

function addQuote (muokattu) {

	let argsplit = muokattu[1].slice(0, -1);
	let argPerson = muokattu[3];
	let argYear = muokattu[5];
	db.run("CREATE TABLE IF NOT EXISTS quotes (id INTEGER PRIMARY KEY DESC, quote TEXT, person TEXT, game TEXT, date DATE, edited DATE, previous TEXT)");
	let newQuote = statement1.match(quoteItself).input();
	let mark = "-";
	let newPerson = mark.concat(argPerson);
	if (Number.isInteger(argYear)) {
		let newDate = statement3;
	} else {
		const currentYear = new Date().getFullYear();
		let newDate = currentYear;
	}
	const url = "https://api.twitch.tv/helix/channels?broadcaster_id=";
	let channelId = process.env.CHANNEL_ID;
	let wholeUrl = url.concat(channelId);
	fetch(wholeUrl, {
	method: 'GET',
	headers: { 'Authorization': process.env.ACCESS_TOKEN, 'Client-Id': process.env.CLIENT_ID }
	}).then(checkResponseStatus)
		.then(res => res.json())
		.then(json => console.log(json))
		.catch(err => console.log(err));
	statement = "INSERT INTO quotes (quote, person, game, date) VALUES (?, ?, ?, ?);";
	db.run(statement, newQuote, newPerson, newDate);

}
