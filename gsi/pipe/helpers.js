export function saveMatch(match) {

}

export function canContinue(match, data) {
	if (match.map != data.map.name) {
		return false;
	}
	if (match.rounds.length > data.map.round + 1) {
		return false;
	}
	return true;
}

export function getRound(player, data) {
	let round = player.match.rounds[data.map.round];
	if (data.round && data.round.phase == 'over') {
		if (!round.phase || (round.phase && round.phase.length === 0)) {
			round = player.match.rounds[data.map.round - 1];
		}
	}
	return round;
}

export function isRightPlayer(player, data, round) {
	if (data.player.steamid != player.steamid) {
		return false;
	}

	if (round && round.death) {
		return false;
	} else if(round) {
		return true;
	}

	return isRightPlayer(player, data, getRound(player, data));
}
