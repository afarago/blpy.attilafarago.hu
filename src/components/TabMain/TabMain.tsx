import {
    BookHalf,
    CodeSlash,
    Diagram2,
    FileEarmarkImage,
    FiletypePy,
    Icon,
} from 'react-bootstrap-icons';
import React, { useContext, useEffect, useRef, useState } from 'react';

import Col from 'react-bootstrap/Col';
import { MyContext } from '../../contexts/MyContext';
import ReactGA from 'react-ga4';
import Row from 'react-bootstrap/Row';
import Tab from 'react-bootstrap/Tab';
import TabContents from './TabContents';
import TabHeaders from './TabHeaders';
import TabTopControls from './TabTopControls';
import { useHotkeys } from 'react-hotkeys-hook';

export enum TabKey {
    PYCODE = 'pycode',
    PLAINCODE = 'plaincode',
    EV3BDECOMPILED = 'ev3b_decompiled',
    PREVIEW = 'preview',
    CALLGRAPH = 'callgraph',
}

export interface ITabElem {
    key: string;
    classOverride?: string;
    title: string;
    icon?: Icon;
    name: string;
    condition: boolean;
    code?: string;
    children?: ITabElem[];
}

const MainTab: React.FC = () => {
    const context = useContext(MyContext);
    if (!context) throw new Error('MyComponent must be used within a MyProvider');
    const { conversionResult, rbfDecompileData, svgContentData, svgDependencyGraph } =
        context;

    const [tabkey, setTabkey] = useState<string>(TabKey.PYCODE);
    const [tabElems, setTabElems] = useState<ITabElem[]>([]);
    const svgRef = useRef<HTMLDivElement>(null);
    const graphRef = useRef<HTMLDivElement>(null);

    useHotkeys('control+1', () => setTabkey(TabKey.PYCODE));
    useHotkeys('control+2', () => setTabkey(TabKey.PLAINCODE));
    useHotkeys('control+3', () => setTabkey(TabKey.CALLGRAPH));
    useHotkeys('control+4', () => setTabkey(TabKey.PREVIEW));

    useEffect(() => {
        ReactGA.send({
            hitType: 'event',
            eventCategory: 'navigation',
            eventAction: 'select_tab',
            eventLabel: tabkey,
            // eventValue: ,
        });
    }, [tabkey]);

    useEffect(() => {
        const tabElemValues: ITabElem[] = [
            {
                key: TabKey.PYCODE,
                title: 'pycode (ctrl+1)',
                icon: FiletypePy,
                name: 'Python',
                code: Array.isArray(conversionResult?.name)
                    ? undefined
                    : (conversionResult?.pycode as string),
                condition: true,
                children: Array.isArray(conversionResult?.name)
                    ? conversionResult?.name.map(
                          (elem, index) =>
                              ({
                                  name: elem,
                                  title: elem,
                                  key: TabKey.PYCODE + (index === 0 ? '' : `:${index}`),
                                  code: (conversionResult.pycode as string[])[index],
                                  condition: true,
                              } satisfies ITabElem),
                      )
                    : undefined,
            },
            {
                key: TabKey.PLAINCODE,
                title: 'pseudocode (ctrl+2)',
                icon: CodeSlash,
                name: 'Pseudocode',
                condition: conversionResult?.plaincode !== undefined,
                code: conversionResult?.plaincode,
            },
            {
                key: TabKey.EV3BDECOMPILED,
                title: 'decompiled',
                icon: BookHalf,
                name: 'Decompiled RBF',
                condition: rbfDecompileData !== undefined,
                code: rbfDecompileData,
            },
            {
                key: TabKey.CALLGRAPH,
                title: 'call graph (ctrl+3)',
                icon: Diagram2,
                name: 'Call Graph',
                condition: conversionResult?.dependencygraph !== undefined,
                // code: svgDependencyGraph,
            },
            {
                key: TabKey.PREVIEW,
                title: 'preview (ctrl+4)',
                icon: FileEarmarkImage,
                name: 'Preview',
                condition: svgContentData !== undefined,
                code: svgContentData,
            },
        ];

        setTabElems(tabElemValues);
    }, [conversionResult, rbfDecompileData, svgContentData]);

    return (
        !!conversionResult && (
            <div className="tab-main container-lg pt-2">
                <Tab.Container
                    activeKey={tabkey}
                    onSelect={(k) => setTabkey(k as TabKey)}
                    defaultActiveKey={TabKey.PYCODE}
                >
                    <Col>
                        <Row sm={9} className="tabheader">
                            <TabHeaders
                                tabkey={tabkey}
                                setTabkey={setTabkey}
                                tabElems={tabElems}
                            />
                        </Row>

                        {/* Tab Contents */}
                        <Row sm={9} className="tabcontent position-relative">
                            <Tab.Content className="border p-0 position-relative">
                                <TabTopControls
                                    tabkey={tabkey}
                                    setTabkey={setTabkey}
                                    svgRef={svgRef}
                                    graphRef={graphRef}
                                    tabElems={tabElems}
                                />

                                <TabContents
                                    tabkey={tabkey}
                                    setTabkey={setTabkey}
                                    svgRef={svgRef}
                                    graphRef={graphRef}
                                    tabElems={tabElems}
                                />
                            </Tab.Content>
                        </Row>
                    </Col>
                </Tab.Container>
            </div>
        )
    );
};

export default MainTab;
