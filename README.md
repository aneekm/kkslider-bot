# K.K. Slider - Now on Discord
A self-hosted Discord Bot for Music

## Setup

Clone the Git repo, set up Node (this was written with v17.1.0), 
create a `config.json` file in the `src/` directory like so:

```json
{
    "clientId": "",
    "guildId": "",
    "token": ""
}
```
and fill it in using values from your test Discord server and bot.

### Scripts

1. `npm run build` to compile to JS
2. `npm run deploy` to directly deploy bot commands to the guild specified in `config.json`
3. `npm run start` to start the bot