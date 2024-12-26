import Cat0 from './img/cat0.svg?react';
import Cat1 from './img/cat1.svg?react';
import Cat10 from './img/cat10.svg?react';
import Cat11 from './img/cat11.svg?react';
import Cat12 from './img/cat12.svg?react';
import Cat13 from './img/cat13.svg?react';
import Cat14 from './img/cat14.svg?react';
import Cat15 from './img/cat15.svg?react';
import Cat16 from './img/cat16.svg?react';
import Cat17 from './img/cat17.svg?react';
import Cat18 from './img/cat18.svg?react';
import Cat19 from './img/cat19.svg?react';
import Cat2 from './img/cat2.svg?react';
import Cat3 from './img/cat3.svg?react';
import Cat4 from './img/cat4.svg?react';
import Cat5 from './img/cat5.svg?react';
import Cat6 from './img/cat6.svg?react';
import Cat7 from './img/cat7.svg?react';
import Cat8 from './img/cat8.svg?react';
import Cat9 from './img/cat9.svg?react';
import React from 'react';

interface CatIconProps {
    slot?: number;
}

export const CatIcon: React.FC<CatIconProps> = ({ slot }) => {
    //   className={
    //                     conversionResult?.additionalFields?.blockly?.slot ===
    //                     undefined
    //                       ? "d-none"
    //                       : "mx-2"
    return (
        <>
            {slot === 0 && <Cat0 />}
            {slot === 1 && <Cat1 />}
            {slot === 2 && <Cat2 />}
            {slot === 3 && <Cat3 />}
            {slot === 4 && <Cat4 />}
            {slot === 5 && <Cat5 />}
            {slot === 6 && <Cat6 />}
            {slot === 7 && <Cat7 />}
            {slot === 8 && <Cat8 />}
            {slot === 9 && <Cat9 />}
            {slot === 10 && <Cat10 />}
            {slot === 11 && <Cat11 />}
            {slot === 12 && <Cat12 />}
            {slot === 13 && <Cat13 />}
            {slot === 14 && <Cat14 />}
            {slot === 15 && <Cat15 />}
            {slot === 16 && <Cat16 />}
            {slot === 17 && <Cat17 />}
            {slot === 18 && <Cat18 />}
            {slot === 19 && <Cat19 />}
        </>
    );
};
