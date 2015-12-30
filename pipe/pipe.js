import * as middlewares from "./middlewares";
import NodeCache from "node-cache";

var util = require("util");

export class Pipe {

	constructor(db) {
		this._userCache = new NodeCache({
			stdTTL: 3 * 60,
			checkPeriod: 200,
			useClones: false
		});
		this._db = db;
		this._preAuth = [middlewares.checkComponents, middlewares.checkCompetitive];
		this._middlewares = [middlewares.followMatch, middlewares.followRound, middlewares.archive];
		this._user = {
			steamid: 76561198044246594,
			auth: "CCWJu64ZV3JHDT8hZc",
		};
	}

	process(rawData, callback) {
		let data = JSON.parse(rawData);

		for (let mw of this._preAuth) {
			let error = mw(data);
			if (error) {
				callback(error);
				return;
			}
		}

		//Load user
		let player =  this._user;

		if (player.auth != data.auth.token) {
			return null;
		}

		//Check if can be a continuation of previous match
		if (player.match) {

		}

		//Other middlewares
		for (let mw of this._middlewares) {
			mw(player, data);
		}

		//Has match ended/complete
		for (let phase of player.match.phases) {
			if (phase.value == "gameover") {
				//save match
			}
		}

		callback();
	}
}
