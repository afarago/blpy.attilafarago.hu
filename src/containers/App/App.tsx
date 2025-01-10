import './App.scss';

import AppContent from './AppContent';
import { MyProvider } from '../../contexts/MyContext';
import React from 'react';
import ReactGA from 'react-ga4';

const GA_TRACKING_ID = 'G-WRDV9368S9';
ReactGA.initialize(GA_TRACKING_ID);
// ReactGA.initialize(GA_TRACKING_ID, { gaOptions: { debug_mode: true, debug: true } });

const App: React.FC = () => {
    return (
        <MyProvider>
            <div className="App">
                <AppContent />
            </div>
        </MyProvider>
    );
};

export default App;
