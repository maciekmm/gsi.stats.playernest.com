// Whether data can be a continuation of match
export function canContinue(match, data) {
	if (match.map != data.map.name) {
		return false;
	}

	if (match.rounds.length > data.map.round + 1) {
		return false;
	}

	//TODO: Check if score counts
	return true;
}

// Whether match data is trash
// TODO: It's very temporary
export function isTrash(match) {
	if(match.rounds.length < 5) {
		return true;
	}
}

// Returns a round that information is related to.
// This is a work-around for stupidity from volvo side
export function getRound(player, data) {
	let round = player.match.rounds[data.map.round];

	if (data.round && data.round.phase == 'over') {
		if (!round.phase || (round.phase && round.phase.length === 0)) {
			round = player.match.rounds[data.map.round - 1];
		}
	}

	return round;
}

// As there's no direct way of checking if player is controlling a bot checking for player's death is required
export function isRightPlayer(player, data, round) {
	if (!data.player || data.player.steamid != player.steamid) {
		return false;
	}

	// We need to check if the death occured in this or previous response
	if (round && round.death && round.death != data.provider.timestamp) {
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
