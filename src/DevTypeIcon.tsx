import DevtypeEV3B from './img/devtype_ev3b.png';
import DevtypeEV3C from './img/devtype_ev3classroom.png';
import DevtypeEV3G from './img/devtype_ev3g.png';
import DevtypePybricks from './img/devtype_pybricks.png';
import DevtypeRobotInventor from './img/devtype_robotinventor.png';
import DevtypeSpike from './img/devtype_spike.png';
import React from 'react';

interface DevTypeIconProps {
    devtype?: string;
    className?: string;
}

export const DevTypeIcon: React.FC<DevTypeIconProps> = ({ devtype, className }) => {
    const renderIcon = () => {
        let prop: { src?: string; alt?: string } = {};
        switch (devtype) {
            case 'ev3b':
                prop = { src: DevtypeEV3B, alt: 'LEGO EV3 Lab Binary' };
                break;
            case 'ev3classroom':
                prop = { src: DevtypeEV3C, alt: 'LEGO EV3 Classroom' };
                break;
            case 'ev3g':
                prop = { src: DevtypeEV3G, alt: 'LEGO EV3 Lab' };
                break;
            case 'pybricks':
                prop = { src: DevtypePybricks, alt: 'Pybricks' };
                break;
            case 'robotinventor':
                prop = { src: DevtypeRobotInventor, alt: 'LEGO Robot Inventor' };
                break;
            case 'spike':
                prop = { src: DevtypeSpike, alt: 'LEGO SPIKE' };
                break;
        }
        return <img src={prop.src} alt={prop.alt} className={className} />;
    };

    return renderIcon();
};