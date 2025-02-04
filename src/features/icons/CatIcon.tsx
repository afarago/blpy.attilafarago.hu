import Cat0 from '@/assets/img/cat0.svg?react';
import Cat1 from '@/assets/img/cat1.svg?react';
import Cat10 from '@/assets/img/cat10.svg?react';
import Cat11 from '@/assets/img/cat11.svg?react';
import Cat12 from '@/assets/img/cat12.svg?react';
import Cat13 from '@/assets/img/cat13.svg?react';
import Cat14 from '@/assets/img/cat14.svg?react';
import Cat15 from '@/assets/img/cat15.svg?react';
import Cat16 from '@/assets/img/cat16.svg?react';
import Cat17 from '@/assets/img/cat17.svg?react';
import Cat18 from '@/assets/img/cat18.svg?react';
import Cat19 from '@/assets/img/cat19.svg?react';
import Cat2 from '@/assets/img/cat2.svg?react';
import Cat3 from '@/assets/img/cat3.svg?react';
import Cat4 from '@/assets/img/cat4.svg?react';
import Cat5 from '@/assets/img/cat5.svg?react';
import Cat6 from '@/assets/img/cat6.svg?react';
import Cat7 from '@/assets/img/cat7.svg?react';
import Cat8 from '@/assets/img/cat8.svg?react';
import Cat9 from '@/assets/img/cat9.svg?react';
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
