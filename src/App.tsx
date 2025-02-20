import React, { lazy } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import Home from './pages/Home';
import ReactGA from 'react-ga4';

const AuthCallbackPage = lazy(() => import('./pages/AuthCallback'));

const GA_TRACKING_ID = 'G-WRDV9368S9';
ReactGA.initialize(GA_TRACKING_ID);
// ReactGA.initialize(GA_TRACKING_ID, { gaOptions: { debug_mode: true, debug: true } });

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/auth-callback" element={<AuthCallbackPage />} />
            </Routes>
        </Router>
    );
};

export default App;
