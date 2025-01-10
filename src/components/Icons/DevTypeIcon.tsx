import DevtypeEV3B from '../../assets/img/devtype_ev3b.png';
import DevtypeEV3C from '../../assets/img/devtype_ev3classroom.png';
import DevtypeEV3G from '../../assets/img/devtype_ev3g.png';
import DevtypePybricks from '../../assets/img/devtype_pybricks.png';
import DevtypePython from '../../assets/img/devtype_python.png';
import DevtypeRobotInventor from '../../assets/img/devtype_robotinventor.png';
import DevtypeSpike from '../../assets/img/devtype_spike.png';
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
            case 'python':
                prop = { src: DevtypePython, alt: 'LEGO Python' };
                break;
        }
        return (
            <img src={prop.src} alt={prop.alt} title={prop.alt} className={className} />
        );
    };

    return renderIcon();
};
