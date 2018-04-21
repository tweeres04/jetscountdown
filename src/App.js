import React, { Component } from 'react';
import axios from 'axios';
import dateFormat from 'date-fns/format';
import addMonths from 'date-fns/add_months';
import countdown from 'countdown';

import Logo from './JetsLogo';

const strings = {
	noGame: 'No game scheduled',
	live: 'Jets are live!',
	countdown: gameDate =>
		`${countdown(this.gameDate).toString()} till the Jets play next`,
	dateFormat: 'YYYY-MM-DD'
};

class App extends Component {
	state = { countdownString: null };
	async componentDidMount() {
		// I might be able to clean this up a bit
		const today = dateFormat(new Date(), strings.dateFormat);
		const sixMonthsFromNow = dateFormat(
			addMonths(new Date(), 6),
			strings.dateFormat
		);
		const { data: { dates } } = await axios(
			`https://statsapi.web.nhl.com/api/v1/schedule?startDate=${today}&endDate=${sixMonthsFromNow}&teamId=52`
		);
		if (dates.length == 0) {
			this.setState({ countdownString: strings.noGame });
		} else {
			let [{ games: [game] }] = dates;
			const { status: { abstractGameState } } = game;

			if (abstractGameState == 'Live') {
				this.setState({ countdownString: strings.live });
			} else {
				if (abstractGameState == 'Final') {
					game = dates[1] && dates[1].games[0];
				}
				if (!game) {
					this.setState({ countdownString: strings.noGame });
				} else {
					const { gameDate } = game;

					this.gameDate = new Date(gameDate);
					this.intervalHandle = setInterval(this.updateString, 1000);
					this.updateString();
				}
			}
		}
	}
	render() {
		const { countdownString } = this.state;
		return (
			<div className="App">
				<div className="logo">
					<Logo />
				</div>
				{countdownString}
			</div>
		);
	}
	updateString = () => {
		this.setState({
			countdownString: strings.countdown(this.gameDate)
		});
	};
	componentWillUnmount() {
		clearInterval(this.intervalHandle);
	}
}

export default App;
