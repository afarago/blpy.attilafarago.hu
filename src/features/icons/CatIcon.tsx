import React, { lazy } from 'react';

const Cat0 = lazy(() => import('@/assets/img/cat0.svg?react'));
const Cat1 = lazy(() => import('@/assets/img/cat1.svg?react'));
const Cat2 = lazy(() => import('@/assets/img/cat2.svg?react'));
const Cat3 = lazy(() => import('@/assets/img/cat3.svg?react'));
const Cat4 = lazy(() => import('@/assets/img/cat4.svg?react'));
const Cat5 = lazy(() => import('@/assets/img/cat5.svg?react'));
const Cat6 = lazy(() => import('@/assets/img/cat6.svg?react'));
const Cat7 = lazy(() => import('@/assets/img/cat7.svg?react'));
const Cat8 = lazy(() => import('@/assets/img/cat8.svg?react'));
const Cat9 = lazy(() => import('@/assets/img/cat9.svg?react'));
const Cat10 = lazy(() => import('@/assets/img/cat10.svg?react'));
const Cat11 = lazy(() => import('@/assets/img/cat11.svg?react'));
const Cat12 = lazy(() => import('@/assets/img/cat12.svg?react'));
const Cat13 = lazy(() => import('@/assets/img/cat13.svg?react'));
const Cat14 = lazy(() => import('@/assets/img/cat14.svg?react'));
const Cat15 = lazy(() => import('@/assets/img/cat15.svg?react'));
const Cat16 = lazy(() => import('@/assets/img/cat16.svg?react'));
const Cat17 = lazy(() => import('@/assets/img/cat17.svg?react'));
const Cat18 = lazy(() => import('@/assets/img/cat18.svg?react'));
const Cat19 = lazy(() => import('@/assets/img/cat19.svg?react'));

interface CatIconProps {
    slot?: number;
}

export const CatIcon: React.FC<CatIconProps> = ({ slot }) => {
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
