import './scss/App.scss';

import { MyContext, MyProvider } from './contexts/MyContext';
import { PyConverterOptions, PyProjectResult, convertProjectToPython } from 'blocklypy';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import AppContent from './AppContent';
import FileSelector from './FileSelector';
import Footer from './Footer';
import Header from './Header';
import MainTab from './TabMain';
import Toast from 'react-bootstrap/Toast';
import WelcomeTab from './TabWelcome';
import classNames from 'classnames';

const App: React.FC = () => {
    const [toastMessage, setToastMessage] = useState<string>();

    return (
        <MyProvider>
            <div className="App d-flex flex-column flex-fill">
                <Header />
                <Toast
                    onClose={() => setToastMessage(undefined)}
                    show={toastMessage !== undefined}
                    delay={5000}
                    autohide
                    className="position-fixed top-0 end-0"
                >
                    <Toast.Header>
                        <span className="me-auto">Conversion Error</span>
                    </Toast.Header>
                    <Toast.Body>{toastMessage}</Toast.Body>
                </Toast>
                <AppContent />
                <Footer />
            </div>
        </MyProvider>
    );
};

export default App;
