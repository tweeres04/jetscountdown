import React, { Component } from 'react';
import axios from 'axios';
import dateFormat from 'date-fns/format';
import addMonths from 'date-fns/add_months';
import isPast from 'date-fns/is_past';
import countdown from 'countdown';
import idbKeyval from 'idb-keyval';

import Logo from './JetsLogo';

const strings = {
	noGame: 'No game scheduled',
	live: 'Jets are live!',
	puckDrop: 'Puck is about to drop!',
	countdown: gameDate =>
		`${countdown(gameDate).toString()} till the Jets play next`,
	dateFormat: 'YYYY-MM-DD'
};

function getNextGame(dates) {
	let [
		{
			games: [game]
		}
	] = dates;
	const {
		status: { abstractGameState }
	} = game;
	game = abstractGameState == 'Final' ? dates[1] && dates[1].games[0] : game;
}

async function getGameFromNhlApi() {
	const today = dateFormat(new Date(), strings.dateFormat);
	const sixMonthsFromNow = dateFormat(
		addMonths(new Date(), 6),
		strings.dateFormat
	);
	const {
		data: { dates }
	} = await axios(
		`https://statsapi.web.nhl.com/api/v1/schedule?startDate=${today}&endDate=${sixMonthsFromNow}&teamId=52`
	);

	const game = dates.length == 0 ? null : getNextGame(dates);
	idbKeyval.set('game', game);
	return game;
}

class JetsCountdownContainer extends Component {
	state = { loading: true, game: null, now: new Date() };
	async componentDidMount() {
		let game = await idbKeyval.get('game');
		let { gameDate } = game || {};

		gameDate = new Date(gameDate);
		game = !game || isPast(gameDate) ? await getGameFromNhlApi() : game;

		this.setState({ loading: false, game });

		this.intervalHandle = setInterval(() => {
			this.setState({ now: new Date() });
		}, 1000);
	}
	render() {
		const { loading, game } = this.state;
		return loading || (game && <JetsCountdown game={game} />);
	}
	componentWillUnmount() {
		clearInterval(this.intervalHandle);
	}
}

function JetsCountdown({ game }) {
	const {
		status: { abstractGameState }
	} = game;
	let { gameDate } = game;

	gameDate = new Date(gameDate);

	const countdownString = !game
		? strings.noGame
		: abstractGameState == 'Live'
			? strings.live
			: abstractGameState == 'Preview' && isPast(gameDate)
				? strings.puckDrop
				: strings.countdown(gameDate);

	return (
		<div className="App">
			<div className="logo">
				<Logo />
			</div>
			<div className="countdown">{countdownString}</div>
			{gameDate && <div className="date">({gameDate.toLocaleString()})</div>}
		</div>
	);
}

export default JetsCountdownContainer;
