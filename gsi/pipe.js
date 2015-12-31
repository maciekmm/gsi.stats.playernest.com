import * as middlewares from "./middlewares";
import {
	Player
}
from "../models/player";

const util = require("util");

var self;

export class Pipe {

	constructor(coord) {
		self = this;
		this.coord = coord;
		this._preAuth = [middlewares.checkComponents, middlewares.checkCompetitive];
		this._middlewares = [middlewares.followMatch, middlewares.followRound, middlewares.archive];
	}

	* process(req, res) {
		let data = req.body;

		for (let mw of self._preAuth) {
			let error = mw(data);
			if (error) {
				//We send 200 because
				res.status(200).send(error.message);
				return;
			}
		}

		let player = yield self.coord.find(data.provider.steamid);

		//Load user
		console.log(util.inspect(player.match, false, null));

		if (!player || player.auth != data.auth.token) {
			res.status(200).send('Auth token doesn\'t match');
			return;
		}

		//Check if can be a continuation of previous match
		if (player.match && !player.match.isContinuation(data)) {
			if (!player.match.isTrash()) {
				yield self.coord.save(player);
			}
			player.match = null;
		}

		//Other middlewares
		for (let mw of self._middlewares) {
			let error = mw(player, data);
			if (error) {
				console.log(error.stack);
				res.status(200).send(error.message);
				return;
			}
		}

		yield self.coord.save(player);
		if (player.match.isOver()) {
			player.matches.push(player.match);
			player.match = null;
			yield self.coord.save(player);
		}
		res.send('OK');
		return;
	}
}
