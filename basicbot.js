const tmi = require('tmi.js');
const env = require('dotenv').config();
const fetch = require('node-fetch');
var sqlite3 = require('sqlite3').verbose();
var db1 = new sqlite3.Database('./quotes.db');
var db2 = new sqlite3.Database('./clips.db');
var db3 = new sqlite3.Database("./commands.db");
const regexpCommand = new RegExp(/^!([a-zA-Z0-9]+)(?:\W+)?(.*)?/);
const re = /[^\"]([a-z0-9_,\-#. ]*)[\"$]|([a-z0-9_\-]*)[,$]|\d{4}$/gi;
const re2 = /([0-9]*)[ $]|([a-z]*)[,$]\s|[^\"]([a-z0-9_,\-#. ]*)[\"$]/gi;
const re3 = /^[0-9]+$/;
const re4 = /\d+|[a-z]{3}|[a-z]{3}/gi;

// TODO 
// list all quotes !allquotes provide a link to website where you can view all of them as there are too many to print in chat
// Create a site where all commands and quotes are listed and can be accessed with !commands link
// List all commands !allcommands
// !nowthatsabargain command that automatically writes the results into a file
// !nowthatsabargain command that takes into consideration IF channelpoint reward "Mountain chip multipliers" and adds 2x to every bargain
// Add more commands with !addcommand esim. !addcommand [commands name] [what to say] [if empty default to everyone can use this command]
// Add quote id to !quote commands output
// Add command to edit commands which were created with !addcommand 
// Add command to delete commands which were created with !addcommand

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

const hCommands = ["randomclip","quote","addquote","editquote","delquote","help","convert"];

client.connect().catch(console.error);

function onMessageHandler (target, context, msg, self) {
  if (self) { return; }
	
	const commandName = msg.trim();

	if (commandName === "!randomclip" ) {
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
	
	if (commandName.charAt(0) === "!") {
		const [raw, command, argument] = msg.match(regexpCommand);
		if(hCommands.includes(command)) {

		} else {
			commandDbQuery(msg).catch(err => { console.log("Not found in database"); }).then((value) => {
				commandDbSearch(value).catch(err => { console.log("Not found in database 2"); }).then((res) => {
					if (res === undefined) {
						console.log(`Following command not found: ${commandName}`)
					} else {
						client.say(target, `${res}`);
						console.log(`* Executed ${commandName} command`);
					}
				})
			})
		}
	}
	
	if (msg.includes("!convert", 0)) {
		const [raw, command, argument] = msg.match(regexpCommand);
		let valited = argument.match(re4);
		// !convert 2500 usd jpy, converts $2500 to japanese yens
		// You must use correct currency codes otherwise converted amount will be NaN
		if (valited == null) {
			client.say(target, `Error: use currency codes`);
		} else {
			fetchCur().then(data => {
				var userInput = valited[0];
				var convertFrom = valited[1].toUpperCase();
				var convertTo = valited[2].toUpperCase();
				let formatter = new Intl.NumberFormat('en-US', {
					style: 'currency',
					currency: `${convertTo}`
				});
				if (convertFrom != 'USD' || convertTo != 'USD') {
					let fromRate = data.rates[convertFrom];
					let toRate = data.rates[convertTo];
					let reversed = 1 / toRate;
					let vastaus = (userInput / fromRate) / reversed;
					var new1 = formatter.format(vastaus);
				} else {
					if (convertFrom == 'USD' || convertTo == 'USD') {
						let currencyTo = data.rates[convertTo];
						let convertedUsd = userInput * currencyTo;
					} else {
						let currencyFrom = data.rates[convertFrom];
						let toRate1 = data.rates[convertTo];
						let reverse1 = 1 / toRate1;
						let convertedUsd = userInput * reverse1;
					}
					var new1 = formatter.format(convertedUsd);
				}
				client.say(target, `${userInput} ${convertFrom} is ${new1} ${convertTo}`);
				console.log(`* Executed ${commandName} command`);
			})
		}
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

async function commandDbQuery(name) {
	return new Promise(function(resolve, reject) {
		try {
			db3.get("SELECT * FROM command WHERE command LIKE (?)", name, function(err, row) {
				if (err) { return reject(err); }
				const data = row.id;
				console.log(data);
				resolve(data);
			});
		} catch (err) {
			throw new Error(err.message);
		}
	});
}

async function fetchCur() {
	const appId = process.env.APP_ID;
	var fetchLatest = `https://openexchangerates.org/api/latest.json?app_id=${appId}`;
	const response = await fetch(fetchLatest, {
		method: 'GET'
	}).then(checkResponseStatus)
	.catch(err => console.log(err));
	const data = await response.json();
	return data;
}

async function commandDbSearch(value) {
	return new Promise(function(resolve, reject) {
		try {
			db3.get("SELECT * FROM answer WHERE id = (?)", value, function(err, row) {
				if (err) { return reject(err); }
				const data1 = row.answer;
				resolve(data1);
			});
		} catch (err) {
			throw new Error(err.message);
		}
	});
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
		case 'convert':
			var helpMsgCVT = "Converts provided amount from provided base currency to another currency. You WILL need to use correct currency codes. Usage: '!convert [amount] [base_currency_code] [convert_to_currency_code]'. Example: '!convert 3500 usd jpy'";
			return helpMsgCVT;
			break;
		default:
			var helpMsgH = "Currently available commands are: [randomclip, quote, addquote, editquote, delquote, convert]. Write '!help commandName' for more info.";
			return helpMsgH;
			break;
	}
}
