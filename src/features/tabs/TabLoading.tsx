import React from 'react';
import Spinner from 'react-bootstrap/Spinner';

interface Props {}

const TabLoading: React.FC = () => {
    return (
        <div className="spinner-container">
            <Spinner animation="grow" variant="primary" className="mx-auto my-3" />
            <div>
                Hold on while we are reading files
                <br />
                and putting studs of LEGO pieces together.
            </div>
        </div>
    );
};

export default TabLoading;
