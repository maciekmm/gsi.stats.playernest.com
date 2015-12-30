import * as helpers from "./helpers";

var util = require("util");

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
		player.match = {
			rounds: []
		};
		player.match.map = data.map.name;
		player.match.mode = data.map.mode;
		player.match.start = data.provider.timestamp;
		player.match.version = data.provider.version;
	}

	if (!player.match.phases) {
		player.match.phases = [];
	}

	if (!player.oldData || data.map.phase != player.oldData.map.phase) {
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
		player.match.rounds[data.map.round] = {
			general: {},
			player: {}
		};
	}

	if ((data.map && data.map.phase !== 'live') || !player.oldData) {
		return;
	}

	let round = helpers.getRound(player, data);

	for (let key of progressive) {
		// Ensure that player is not a bot...
		if (!key.general && !helpers.isRightPlayer(player, data, round)) {
			continue;
		}
		// Current value
		let value = deepValue(data, key.key);
		// Previous value
		let oldValue = player.oldData ? deepValue(player.oldData, key.key) : null;

		// If the value changed or it decreased
		if (value == oldValue || (key.increase && value < oldValue)) {
			continue;
		}

		if (!value&&key.non_null) {
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
	if (player.oldData.player && !round.death && data.player.match_stats.deaths > player.oldData.player.match_stats.deaths) {
		round.death = data.provider.timestamp;
	}

	// Who won the round
	if (player.oldData.round && data.round && data.round.win_team && !player.oldData.round.win_team) {
		round.win_team = data.round.win_team;
	}

	if (!round.team && data.player.team) {
		round.team = data.player.team;
	}

	console.log(util.inspect(round, false, null));
}

export function archive(player, data) {
	if (!player.oldData) {
		player.oldData = {};
	}
	player.oldData.map = data.map;
	player.oldData.provider = data.provider;
	player.oldData.round = data.round;
	player.oldData.auth = data.auth;

	if (helpers.isRightPlayer(player, data)) {
		player.oldData.player = data.player;
	}
}

// TODO: Make this
// function followWeapons(round, data, player.oldData) {
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

// Returns value from string path "sth.sth.sth"
function deepValue(obj, path) {
	path = path.split('.');
	for (let i = 0, len = path.length; i < len; i++) {
		if (obj[path[i]]) {
			obj = obj[path[i]];
		} else {
			return null;
		}
	}
	return obj;
}
