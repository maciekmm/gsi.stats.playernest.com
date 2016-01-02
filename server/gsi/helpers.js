// Returns a round that information is related to.
// This is a work-around for stupidity from volvo side
export function getRound(player, data) {
	let round = player.match.rounds[data.map.round];

	if (data.round && (data.round.phase == 'over' || data.round.phase == 'freezetime')) {
		if (data.map.round === 0) {
			return round;
		}
		if (!round.phase || (round.phase && round.phase.length === 0)) {
			round = player.match.rounds[data.map.round - 1];
		}
	}

	return round;
}

// As there's no direct way of checking if player is controlling a bot checking for player's death is required
export function isRightPlayer(player, data, round) {
	if (!data.player || data.player.steamid != player._id) {
		return false;
	}

	// We need to check if the death occured in this or previous response
	if (round && round.player.death && round.player.death != data.provider.timestamp) {
		return false;
	} else if (round) {
		return true;
	}

	let newRound = getRound(player, data);

	// This shouldn't happen, but it does. VOLVO pls fix
	if (!newRound) {
		return false;
	}

	return isRightPlayer(player, data, newRound);
}

// Returns value from string path "sth.sth.sth"
export function deepValue(obj, path) {
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
