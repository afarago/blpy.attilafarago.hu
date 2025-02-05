import './App.scss';

import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import Home from './pages/Home';
import React from 'react';
import ReactGA from 'react-ga4';

const GA_TRACKING_ID = 'G-WRDV9368S9';
ReactGA.initialize(GA_TRACKING_ID);
// ReactGA.initialize(GA_TRACKING_ID, { gaOptions: { debug_mode: true, debug: true } });

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
            </Routes>
        </Router>
    );
};

export default App;
