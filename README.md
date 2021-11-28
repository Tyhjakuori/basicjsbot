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
* Local databases for clips (and quotes, but this will be created when first run (neither are provided)) 
   
You can register your bot account as an app [here](https://dev.twitch.tv/)   
Twitch provides this handy guide [getting started with chat & chatbots](https://dev.twitch.tv/docs/irc)   
Twitch [api reference](https://dev.twitch.tv/docs/api/reference)  
   
After getting bot related OAuth, access token, client ID (username and channel id) fill those in to dotenv file and rename it to ".env"
   
## Usage
   
Run npm start to get the bot online, after that the commands can be used.
   
## Sources
   
tmi.js https://github.com/tmijs/tmi.js   
dotenv https://github.com/motdotla/dotenv   
sqlite3 bindings for node https://github.com/mapbox/node-sqlite3   
node-fetch https://github.com/node-fetch/node-fetch   
Twitch dev site https://dev.twitch.tv/   
Twitch bot guide https://dev.twitch.tv/docs/irc   
Twitch api reference https://dev.twitch.tv/docs/api/reference   

