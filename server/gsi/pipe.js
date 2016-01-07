import * as middlewares from "./middlewares";
import Player from "../../shared/player";

const util = require("util");

export default class Pipe {

	constructor(players, matches) {
		self = this;
		this.players = players;
		this.matches = matches;
		this._preAuth = [middlewares.checkComponents, middlewares.checkCompetitive];
		this._middlewares = [middlewares.followMatch, middlewares.followRound, middlewares.archive];
	}

	* process(req, res) {
		let data = req.body;
		//console.log(JSON.stringify(data));
		for (let mw of this._preAuth) {
			let error = mw(data);
			if (error) {
				//We send 200 because
				res.status(200).send(error.message);
				return;
			}
		}

		let player = yield this.players.find(data.provider.steamid);
		//Load user
		//console.log(util.inspect(player.match, false, null));

		if (!player || player.auth != data.auth.token) {
			console.log("wtf");
			res.status(200).send('Auth token doesn\'t match');
			return;
		}

		//Check if can be a continuation of previous match
		if (player.match && !player.match.isContinuation(data)) {
			if (!player.match.isTrash()) {
				console.log("saving old");
				console.log(player.match);
				yield this.matches.push(player.match);
			} else {
				console.log("del old");
			}
			player.match = null;
		}

		//Other middlewares
		for (let mw of this._middlewares) {
			let error = mw(player, data);
			if (error) {
				console.log(error);
				res.status(200).send(error.message);
				return;
			}
		}

		if (player.match.isOver()) {
			yield this.matches.push(player.match);
		}

		res.send('OK');
		return;
	}
}
