import './scss/styles.scss';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App';
// import { registerSW } from 'virtual:pwa-register';
import store from './app/store';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <React.StrictMode>
        <Provider store={store}>
            <App />
        </Provider>
    </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// const updateSW = registerSW({
//     // immediate: true, // Automatic reload
//     onRegistered(r) {
//         r &&
//             setInterval(async () => {
//                 console.log('Checking for updates2', r);
//                 if (r.hasUpdate) {
//                     if (confirm('New content is available, click OK to refresh.')) {
//                         r.update();
//                         window.location.reload();
//                     }
//                 }
//             }, 5 * 1000);
//     },
//     // onNeedRefresh() {
//     //     if (confirm('New content is available, click OK to refresh.')) {
//     //         window.location.reload();
//     //     }
//     // },
//     // onOfflineReady() {
//     //     console.log('App is ready to work offline');
//     // },
// });

// setInterval(() => {
//     updateSW();
//     console.log('Checking for updates');
// }, 10 * 1000); // Check for updates every hour
