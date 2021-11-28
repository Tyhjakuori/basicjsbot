const tmi = require('tmi.js');
const env = require('dotenv').config();
const fetch = require('node-fetch');
var sqlite3 = require('sqlite3').verbose();
var db1 = new sqlite3.Database('./quotes.db');
var db2 = new sqlite3.Database('./clips.db');
const regexpCommand = new RegExp(/^!([a-zA-Z0-9]+)(?:\W+)?(.*)?/);
const re = /[^\"]([a-z0-9_,\-#. ]*)[\"$]|([a-z0-9_\-]*)[,$]|\d{4}$/gi;
const re2 = /([0-9]*)[ $]|([a-z]*)[,$]\s|[^\"]([a-z0-9_,\-#. ]*)[\"$]/gi;
const re3 = /^[0-9]+$/;

// TODO 
// listaa kaikki quotet !allquotes
// Luo sivusto jolla kaikki quotet sekä komennot ovat
// listaa kaikki komennot !allcommands


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

db1.run("CREATE TABLE IF NOT EXISTS quotes (id INTEGER PRIMARY KEY, quote TEXT, person TEXT, game TEXT, date DATE, edited DATE, previous TEXT)");
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
	
	if (msg.includes("!quote", 0)) {
		const [raw, command, argument] = msg.match(regexpCommand);
		var placeh = argument;
		if (placeh === undefined) {
			db1.get("SELECT quote, person, game, date FROM quotes ORDER BY RANDOM() LIMIT 1", (err, row) => {
				if (err) {
					console.log(row);
				}
				client.say(target, `${row.quote} ${row.person} ${row.game}, ${row.date}`);
			})
		} else {
			var statement1 = "SELECT quote, person, game, date FROM quotes WHERE id = (?)"
			db1.get(statement1, placeh, (err, row) => {
				if (err) {
					console.log(row);
				}
				client.say(target, `${row.quote} ${row.person} ${row.game}, ${row.date}`);
			})
		}
		console.log(`* Executed ${commandName} command`);
	}

	if (msg.includes("!addquote", 0)) {
		if (context.mod == true || context.badges.broadcaster == '1') {
			const [raw, command, argument] = msg.match(regexpCommand);
			var muokattu = argument.match(re);
			// quote format needs to be: "Quote" Who said it, Year
			// Quote itself needs to be wrapped in quotation marks
			// It needs to have "," after who said it because of the regex
			// Year can be left out, but "," needs to be after the person still
			client.say(target, `Found the following arguments "${muokattu}"`);
			var succ = addQuote(muokattu);
			console.log(`* Executed ${commandName} command`);
		} else {
			client.say(target, `You need to be moderator to execute this command`);
		}
	}
	
	if (msg.includes("!editquote", 0)) {
		if (context.mod == true || context.badges.broadcaster == '1') {
			const [raw, command, argument] = msg.match(regexpCommand);
			var editVals = argument.match(re2);
			// Format needs to be: '!editquote Id ColumnName, "What to edit old value into"'
			// Example: '!editquote 1 quote, "Edited text"'
			// id: id of the entry in the database
			// Column needs to have "," and space after it
			var execEdit = editQuote(editVals);
			console.log(`* Executed ${commandName} command`);
		} else {
			client.say(target, `You need to be modetator to execute this command`);
		}
	}
	
	if (msg.includes("!delquote", 0)) {
		if (context.mod == true || context.badges.broadcaster == '1') {
			const [raw, command, argument] = msg.match(regexpCommand);
			// Only provide the id of the entry you want to delete, like: '!delquote 20'
			var numbersOnly = argument.match(re3);
			if (numbersOnly == null) {
				client.say(target, `Use only numbers as an argument`);
			} else {
				var sqlDelState = "DELETE FROM quotes WHERE id = (?)";
				db1.run(sqlDelState, numbersOnly, (err, row) => {
					if (err) {
						console.log(row);
						client.say(target, `Command failed to execute`);
					} else {
						client.say(target, `Successfully deleted entry, id: ${numbersOnly}`);
					}
				})
				console.log(`* Executed ${commandName} command`);
			}
		}
	}

	if (msg.includes("!help", 0)) {
		const [raw, command, argument] = msg.match(regexpCommand);
		var givenArg = argument;
		var returArg = helpCommand(givenArg);
		client.say(target, `${returArg}`);
		console.log(`* Executed ${commandName} command`)
	}
}


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

async function getCurGame() {
	
	var url = "https://api.twitch.tv/helix/channels?broadcaster_id=";
	var channelId = process.env.CHANNEL_ID;
	var wholeUrl = url.concat(channelId);
	const response = await fetch(wholeUrl, {
		method: 'GET',
		headers: { 'Authorization': process.env.ACCESS_TOKEN, 'Client-Id': process.env.CLIENT_ID }
		}).then(checkResponseStatus)
			.catch(err => console.log(err));
	const data = await response.json();
	return data;
}

function addQuote (muokattu) {

	let newQuote = muokattu[0].slice(0, -1);
	let newPerson = muokattu[1];
	let newDate = muokattu[2];
	if (newPerson.includes("-")) {

	} else {
		let mark = "-";
		newPerson = mark.concat(newPerson);
	}
	if (Number.isInteger(newDate)) {
	
	} else {
		const currentYear = new Date().getFullYear();
		newDate = currentYear;
	}
	getCurGame().then(data => {
		var curGame = data.data[0].game_name;
		statement = "INSERT INTO quotes (id, quote, person, game, date) VALUES (NULL, ?, ?, ?, ?);";
		db1.run(statement, newQuote, newPerson, curGame, newDate);
	})
}

function editQuote(editVals) {

	let editId = editVals[0];
	let editType = editVals[1].slice(0, -2);
	let editValue = editVals[2].slice(0, -1);
	if (editType == "quote") {
		var sqlstatement = "UPDATE quotes SET quote = (?) WHERE id = (?)";
		db1.run(sqlstatement, editValue, editId);
	} else if (editType == "person") {
		var sqlstatement = "UPDATE quotes SET person = (?) WHERE id = (?)";
		db1.run(sqlstatement, editValue, editId);
	} else if (editType == "game") {
		var sqlstatement = "UPDATE quotes SET game = (?) WHERE id = (?)";
		db1.run(sqlstatement, editValue, editId);
	} else if (editType == "date") {
		var sqlstatement = "UPDATE quotes SET date = (?) WHERE id = (?)";
		db1.run(sqlstatement, editValue, editId);
	} else {
		console.log("Unknown option provided");
	}
}

function helpCommand(givenArg) {
	
	switch (givenArg) {
		case 'randomclip':
			var helpMsgRC = "Prints random clip from the db. Usage: '!randomquote'";
			return helpMsgRC;
			break;
		case 'quote':
			var helpMsgQ = "Can be used with or without arguments. Argument is quotes id in the db. Usage: '!quote 20' / '!quote'";
			return helpMsgQ;
			break;
		case 'addquote':
			var helpMsgAQ = "Adds quote to the db. Format needs to be: '!addquote \"Quote\" Who said it, Year'. (Moderators only)";
			return helpMsgAQ;
			break;
		case 'editquote':
			var helpMsgEQ = "Edits existing db entry. Format needs to be: '!editquote Id ColumnName, \"What to edit old value into\"'. (Moderators only)";
			return helpMsgEQ;
			break;
		case 'delquote':
			var helpMsgDQ = "Deletes existing db entry. Usage: '!delquote id'. (Moderators only)";
			return helpMsgDQ;
			break;
		default:
			var helpMsgH = "Currently available commands are: [randomclip, quote, addquote, editquote, delquote]. Write '!help commandName' for more info.";
			return helpMsgH;
			break;
	}
}
