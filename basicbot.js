const tmi = require('tmi.js');
const en = require('dotenv').config();
var sqlite3 = require('sqlite3').verbose();
var db1 = new sqlite3.Database('./quotes.db');
var db2 = new sqlite3.Database('./clips.db');
const regexpCommand = new RegExp(/^!([a-zA-Z0-9]+)(?:\W+)?(.*)?/);
const quoteItself = new RegExp("(.*?)");

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

	if (commandName === '!addquote') {
		const [raw, command, argument1, argument2, argument3] = message.match(regexpCommand);
		if (command) {
			client.say(target, `Command "{command}" found with argument "${argument}"`);
		}
		var succ = addQuote(argument1, argument2, argument3);
		if (succ === true) {
		client.say(target, `${quot}`);
		console.log(`* Executed ${commandName} command`);
		} else {
			client.say(target, 'Something went wrong...')
			console.log(`* Failed to execute ${commandName}`)
		}
	}	
}

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

function addQuote (statement1, statement2, statement3) {
	
	db.run("CREATE TABLE IF NOT EXISTS quotes (id INTEGER PRIMARY KEY DESC, quote TEXT, person TEXT, date DATE, edited DATE, previous TEXT)");
	let newQuote = statement1.match(quoteItself).input();
	let mark = "-";
	let newPerson = mark.concat(statement2);
	if (Number.isInteger(statement3) {
		let newDate = statement3;
	}); else {
		const currentYear = new Date().getFullYear();
		let newDate = currentYear;
	}
	let statement = "INSERT INTO quotes (quote, person, date) VALUES (?, ?, ?);";
	db.run(statement, newQuote, newPerson, newDate);

}

function helpCommand (statement) {
	
	var answer = "";
	if (statement === "quote" {

	}); else if (statement === "addquote" {

	}); else if (statement === "delquote" {

	}); else if (statement === "editquote" {

	}); else if (statement === "allquotes" {

	}); else if (statement === "randomclip")

	}); else if (statement === "" {

	}); else {
		answer = "Unknown help command...";
	}
	return answer;
}


























