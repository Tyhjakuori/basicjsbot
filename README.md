## Table of contents
* [Initial setup](#initial-setup)
* [Usage](#usage)
* [Sources](#sources)
      
## Initial setup
   
You will need the following to use this properly:
* tmi.js
* dotenv
* sqlite3 and the bindings for node
* node-fetch
* Twitch account that you will use as the bot (preferably registered as an app)
* Local databases for clips and commands(plus quotes, but this will be created when first run (none are provided))
   
You can register your bot account as an app [here](https://dev.twitch.tv/)   
Twitch provides this handy guide [getting started with chat & chatbots](https://dev.twitch.tv/docs/irc)   
Twitch [api reference](https://dev.twitch.tv/docs/api/reference)  
   
After getting bot related OAuth, access token, client ID (username and channel id) fill those in to dotenv file and rename it to ".env"   
Change the channel:   
```
channels: [ 'myChannel' ]
```
To which channel(s) you want it to join after running the program.   
   
Layout of clips and commands databases:   
clips: CREATE TABLE IF NOT EXISTS "clips" ("id" INTEGER, "clips" TEXT);   
   
commands: CREATE TABLE IF NOT EXISTS "command" ("id" INTEGER, "command" TEXT);   
CREATE TABLE IF NOT EXISTS "answer" ("id" INTEGER, "answer" TEXT);   
   
If you want to utilize convert command, you will need to (possibly) sign up to one currency exchange rate site.   
I'm using [open exchange rates](https://openexchangerates.org/) for this.   
If you are using another service, api querys and responses might be different so you will need to figure out how to deal with that
yourself or you can file an issue and ask for my help(no guarantees though).   
   
## Usage
   
Run npm start to get the bot online, after the bot has connected to the chat commands can be used.
   
## Sources
   
tmi.js https://github.com/tmijs/tmi.js   
dotenv https://github.com/motdotla/dotenv   
sqlite3 bindings for node https://github.com/mapbox/node-sqlite3   
node-fetch https://github.com/node-fetch/node-fetch   
Twitch dev site https://dev.twitch.tv/   
Twitch bot guide https://dev.twitch.tv/docs/irc   
Twitch api reference https://dev.twitch.tv/docs/api/reference   
Open Exchange Rates https://openexchangerates.org/ https://github.com/openexchangerates   
Open Exchange Rates api docs https://docs.openexchangerates.org/docs   
