import LogoFull from '@/assets/img/logo_full.svg?react';
import React from 'react';

const BrandLogo: React.FC = () => {
    return (
        <>
            <LogoFull height="1.5em" width="4em" />
            &nbsp;
            <b>BlocklyPy</b>
            <span className="d-none d-sm-inline">&nbsp;· LegoAppTools</span>
        </>
    );
};

export default BrandLogo;
