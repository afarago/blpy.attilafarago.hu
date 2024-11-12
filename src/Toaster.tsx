import React from 'react';

const Toaster: React.FC = () => {
    return (
        <div
            className="toast position-fixed top-0 end-0 m-2 p-2"
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
            id="toast1"
        >
            <div className="toast-header">
                <strong className="me-auto toast-title"></strong>
                <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="toast"
                    aria-label="Close"
                ></button>
            </div>
            <div className="toast-body"></div>
        </div>
    );
};

export default Toaster;
