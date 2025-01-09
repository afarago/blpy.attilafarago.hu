import React, { useContext, useEffect, useRef, useState } from 'react';

import Col from 'react-bootstrap/Col';
import { MyContext } from './contexts/MyContext';
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

const MainTab: React.FC = () => {
    const context = useContext(MyContext);
    if (!context) throw new Error('MyComponent must be used within a MyProvider');
    const { conversionResult, svgContentData, rbfDecompileData } = context;

    const [tabkey, setTabkey] = useState(TabKey.PYCODE);
    const svgRef = useRef<HTMLDivElement>(null);
    const graphRef = useRef<HTMLDivElement>(null);

    useHotkeys('control+1', () => setTabkey(TabKey.PYCODE));
    useHotkeys('control+2', () => setTabkey(TabKey.PLAINCODE));
    useHotkeys('control+3', () => setTabkey(TabKey.CALLGRAPH));
    useHotkeys('control+4', () => setTabkey(TabKey.PREVIEW));

    useEffect(() => {
        if (
            (tabkey === TabKey.PREVIEW && !svgContentData) ||
            (tabkey === TabKey.PLAINCODE && !conversionResult?.plaincode) ||
            (tabkey === TabKey.EV3BDECOMPILED && !rbfDecompileData)
        ) {
            setTabkey(TabKey.PYCODE);
        }
    }, [conversionResult, tabkey, setTabkey]);

    useEffect(() => {
        ReactGA.send({
            hitType: 'event',
            eventCategory: 'navigation',
            eventAction: 'select_tab',
            eventLabel: tabkey,
            // eventValue: ,
        });
    });

    return (
        !!conversionResult && (
            <div className="tab-main p-2">
                <Tab.Container
                    activeKey={tabkey}
                    onSelect={(k) => setTabkey(k as TabKey)}
                    defaultActiveKey={TabKey.PYCODE}
                >
                    <Col>
                        <Row sm={9}>
                            <TabHeaders conversionResult={conversionResult} />
                        </Row>

                        {/* Tab Contents */}
                        <Row sm={9} className="position-relative">
                            <Tab.Content className="border p-0 position-relative">
                                <TabTopControls
                                    tabkey={tabkey}
                                    setTabkey={setTabkey}
                                    svgRef={svgRef}
                                    graphRef={graphRef}
                                />

                                <TabContents
                                    tabkey={tabkey}
                                    svgRef={svgRef}
                                    graphRef={graphRef}
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
