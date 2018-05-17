import React from 'react';
import ReactDOM from 'react-dom';
import JetsCountdown from './JetsCountdown';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<JetsCountdown />, document.getElementById('root'));
registerServiceWorker();
