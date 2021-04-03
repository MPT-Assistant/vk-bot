# MPT Assistant

# Bot for VK on [**Node.JS**](https://nodejs.org/en/download/)

## The bot is intended for reporting substitutions, and displaying the schedule https://vk.com/mpt_assistant

## Installation

```bash
# Delete package-lock.json
$ rm package-lock.json

# Install dependencies
$ npm install
# Or
$ yarn add
```
## Script setup

### You must create a config.json file in the ./src/DB directory with the following parameters

```json
{
	"mongo": {
		"login": "Mongo Login",
		"password": "Mongo Password",
		"address": "Mongo Address"
	},
	"vk": {
		"group": {
			"id": 0,
			"token": "Token"
		},
		"logger": {
			"id": 0,
			"token": "Token"
		}
	}
}
```

## Project build

To assemble a project, use

```bash
$ yarn build
# Or
$ npm build
```

## Project launch

To start a project, use

```bash
$ node ./dist/main.js
```
