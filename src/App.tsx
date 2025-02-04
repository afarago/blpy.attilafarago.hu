import './App.scss';

import AppContent from './AppContent';
import React from 'react';
import ReactGA from 'react-ga4';

const GA_TRACKING_ID = 'G-WRDV9368S9';
ReactGA.initialize(GA_TRACKING_ID);
// ReactGA.initialize(GA_TRACKING_ID, { gaOptions: { debug_mode: true, debug: true } });

const App: React.FC = () => {
    return (
        <div className="App">
            <AppContent />
        </div>
    );
};

export default App;
