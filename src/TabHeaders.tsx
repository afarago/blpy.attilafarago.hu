import {
    BookHalf,
    CodeSlash,
    Diagram2,
    FileEarmarkImage,
    FiletypePy,
} from 'react-bootstrap-icons';

import { CatIcon } from './CatIcon';
import { DevTypeIcon } from './DevTypeIcon';
import { Nav } from 'react-bootstrap';
import React from 'react';
import { TabKey } from './TabMain';

interface TabHeadersProps {
    conversionResult: any;
}

const TabHeaders: React.FC<TabHeadersProps> = ({ conversionResult }) => {
    const TAB_LIST_HEADERS = [
        {
            key: TabKey.PYCODE,
            title: 'pycode (ctrl+1)',
            icon: FiletypePy,
            name: 'Python',
            condition: true,
        },
        {
            key: TabKey.PLAINCODE,
            title: 'pseudocode (ctrl+2)',
            icon: CodeSlash,
            name: 'Pseudocode',
            condition: conversionResult?.plaincode !== undefined,
        },
        {
            key: TabKey.EV3BDECOMPILED,
            title: 'decompiled',
            icon: BookHalf,
            name: 'Decompiled RBF',
            condition: !!conversionResult?.extra?.['ev3b.decompiled'],
        },
        {
            key: TabKey.CALLGRAPH,
            title: 'call graph (ctrl+3)',
            icon: Diagram2,
            name: 'Call Graph',
            condition: !!conversionResult?.dependencygraph,
        },
        {
            key: TabKey.PREVIEW,
            title: 'preview (ctrl+4)',
            icon: FileEarmarkImage,
            name: 'Preview',
            condition: !!conversionResult?.extra?.['blockly.svg'],
        },
    ];

    return (
        <Nav variant="tabs" className="flex-rows px-0">
            {TAB_LIST_HEADERS.map(
                (elem) =>
                    elem.condition && (
                        <Nav.Item key={elem.key}>
                            <Nav.Link
                                eventKey={elem.key}
                                title={`${elem.title}`}
                                className="icon-link icon-link-hover"
                            >
                                <elem.icon className="d-none d-md-inline" />
                                {elem.name}
                            </Nav.Link>
                        </Nav.Item>
                    ),
            )}
            <Nav.Item className="py-2 pe-2 ms-auto tabheader d-none d-md-block">
                {conversionResult?.extra?.['blockly.slot'] !== undefined && (
                    <CatIcon slot={conversionResult?.extra?.['blockly.slot']} />
                )}
                {conversionResult?.devicetype && (
                    <DevTypeIcon devtype={conversionResult?.devicetype} />
                )}
            </Nav.Item>
        </Nav>
    );
};

export default TabHeaders;
