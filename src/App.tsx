import './scss/App.scss';

import React, { useState } from 'react';

import AppContent from './AppContent';
import Footer from './Footer';
import Header from './Header';
import { MyProvider } from './contexts/MyContext';
import Toast from 'react-bootstrap/Toast';

const App: React.FC = () => {
    const [toastMessage, setToastMessage] = useState<string>();

    return (
        <MyProvider>
            <div className="App ">
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
