import DevtypeEV3B from '@/assets/img/devtype_ev3b.png';
import DevtypeEV3C from '@/assets/img/devtype_ev3classroom.png';
import DevtypeEV3G from '@/assets/img/devtype_ev3g.png';
import DevtypePybricks from '@/assets/img/devtype_pybricks.png';
import DevtypePython from '@/assets/img/devtype_python.png';
import DevtypeRobotInventor from '@/assets/img/devtype_robotinventor.png';
import DevtypeSpike from '@/assets/img/devtype_spike.png';
import DevtypeWeDo2 from '@/assets/img/devtype_wedo2.png';
import React from 'react';

interface DevTypeIconProps {
    devtype?: string;
    className?: string;
}
const devtypeMap: { [key: string]: { src: string; alt: string } } = {
    ev3b: { src: DevtypeEV3B, alt: 'LEGO EV3 Lab Binary' },
    ev3classroom: { src: DevtypeEV3C, alt: 'LEGO EV3 Classroom' },
    ev3g: { src: DevtypeEV3G, alt: 'LEGO EV3 Lab' },
    pybricks: { src: DevtypePybricks, alt: 'Pybricks' },
    robotinventor: { src: DevtypeRobotInventor, alt: 'LEGO Robot Inventor' },
    spike: { src: DevtypeSpike, alt: 'LEGO SPIKE' },
    python: { src: DevtypePython, alt: 'LEGO Python' },
    wedo2: { src: DevtypeWeDo2, alt: 'WeDo2' },
};

export const DevTypeIcon: React.FC<DevTypeIconProps> = ({ devtype, className }) => {
    const renderIcon = () => {
        if (!devtype) return <></>;

        const prop = devtypeMap[devtype];
        return (
            <img src={prop.src} alt={prop.alt} title={prop.alt} className={className} />
        );
    };

    return renderIcon();
};
