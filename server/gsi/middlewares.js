import * as helpers from "./helpers";
import Match from "../../shared/match";
import Round from "../../shared/round";

const util = require("util");

// Checks whether request contains are needed fields
export function checkComponents(data) {
	if (!data.provider || !data.map || !data.player || !data.auth) {
		return new Error("Invalid data (no components)");
	}
}

// Checks if the game-mode is competitive
export function checkCompetitive(data) {
	if (data.map.mode != 'competitive') {
		return new Error("Match not competitive");
	}
}

// Monitors match variables
export function followMatch(player, data) {
	if (!player.match) {
		if(data.map.phase != "gameover") {
			player.match = new Match(player._id, data.map.name, data.map.mode, data.provider.timestamp, data.provider.version);
		} else {
			return new Error("Match over");
		}
	}

	if (data.map.phase == "gameover" && player.match.isOver()) {
		return new Error("Match already over");
	}

	if (!player._oldData || data.map.phase != player._oldData.map.phase) {
		player.match.phases.push({
			time: data.provider.timestamp,
			value: data.map.phase
		});
	}
}

const progressive = require("./round-props.json");
// Follows rounds
export function followRound(player, data) {
	if (!player.match.rounds[data.map.round]) {
		player.match.rounds[data.map.round] = new Round();
	}

	if ((data.map && data.map.phase !== 'live') || !player._oldData) {
		return;
	}

	let round = helpers.getRound(player, data);

	for (let key of progressive) {
		// Ensure that player is not a bot...
		if (!key.general && !helpers.isRightPlayer(player, data, round)) {
			continue;
		}
		// Current value
		let value = helpers.deepValue(data, key.key);
		// Previous value
		let oldValue = player._oldData ? helpers.deepValue(player._oldData, key.key) : null;

		// If the value changed or it decreased
		if (value == oldValue || (key.increase && value < oldValue)) {
			continue;
		}

		if (!value && key.non_null) {
			continue;
		}

		let sub = key.key.split(".");
		let newKey = sub[sub.length - 1];
		let temp = round[(key.general ? "general" : "player")];

		if (!temp[newKey]) {
			temp[newKey] = [];
		}

		if (key.flatten) {
			// calculate delta and insert time as many times
			for (let diff = value - oldValue; diff > 0; diff--) {
				temp[newKey].push(data.provider.timestamp);
			}
		} else {
			temp[newKey].push({
				time: data.provider.timestamp,
				value: value
			});
		}
	}

	if (helpers.isRightPlayer(player, data, round)) {
		if (data.player.state.helmet) {
			round.player.helmet = true;
		} else if (!round.player.helmet) {
			round.player.helmet = false;
		}

		//followWeapons(round, data, oldData);
	}

	// Death
	if (player._oldData.player && !round.player.death && data.player.match_stats.deaths > player._oldData.player.match_stats.deaths) {
		round.player.death = data.provider.timestamp;
	}

	// Who won the round
	if (player._oldData.round && data.round && data.round.win_team && !player._oldData.round.win_team) {
		round.win_team = data.round.win_team;
	}

	if (!round.player.team && data.player.team) {
		round.player.team = data.player.team;
	}

	//console.log(util.inspect(round, false, null));
}

export function archive(player, data) {
	if (!player._oldData) {
		player._oldData = {};
	}
	player._oldData.map = data.map;
	player._oldData.provider = data.provider;
	player._oldData.round = data.round;
	player._oldData.auth = data.auth;

	if (helpers.isRightPlayer(player, data)) {
		player._oldData.player = data.player;
	}
}

// TODO: Make this
// function followWeapons(round, data, player._oldData) {
// 	if (!round.weapons) {
// 		round.weapons = {
// 			"primary": [],
// 			"secondary": [],
// 			"knife": [],
// 			"grenades": [],
// 			"special": []
// 		};
// 	}
// 	for (let weapon of data.player.weapons.values()) {
// 		let type = weapon.type;
// 		if (!type) {
// 			type = "special"; //Really volvo? Is this so hard to add type for taser?
// 		}
// 		let entry = {
// 		};
//
// 		switch (type.toLowerCase()) {
// 			case "c4":
// 				break;
// 			case "pistol":
// 				break;
// 			case "grenade":
// 				break;
// 			case "knife":
// 				break;
// 			default:
// 		}
// 	}
// }
