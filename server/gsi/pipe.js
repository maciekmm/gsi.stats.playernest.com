import * as middlewares from "./middlewares";
import Player from "../../shared/player";

const util = require("util");

//Damn get rid of this
var self;

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
		//console.log(data);
		for (let mw of self._preAuth) {
			let error = mw(data);
			if (error) {
				//We send 200 because
				res.status(200).send(error.message);
				return;
			}
		}

		let player = yield self.players.find(data.provider.steamid);

		//Load user
		console.log(util.inspect(player.match, false, null));

		if (!player || player.auth != data.auth.token) {
			res.status(200).send('Auth token doesn\'t match');
			return;
		}

		//Check if can be a continuation of previous match
		if (player.match && !player.match.isContinuation(data)) {
			if (!player.match.isTrash()) {
				yield self.matches.push(player.match);
			}
			player.match = null;
		}

		//Other middlewares
		for (let mw of self._middlewares) {
			let error = mw(player, data);
			if (error) {
				console.log(error);
				res.status(200).send(error.message);
				return;
			}
		}

		if (player.match.isOver()) {
			player.matches.unshift(player.match);
			yield self.matches.push(player.match);
		}

		res.send('OK');
		return;
	}
}
