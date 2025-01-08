import './scss/index.scss';
import './scss/App.scss';

import React, { useState } from 'react';

import AppContent from './AppContent';
import { MyProvider } from './contexts/MyContext';

const App: React.FC = () => {
    return (
        <MyProvider>
            <AppContent />
        </MyProvider>
    );
};

export default App;
