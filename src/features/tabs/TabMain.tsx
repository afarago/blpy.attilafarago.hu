import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    BookHalf,
    CodeSlash,
    Diagram2,
    FileEarmarkImage,
    FiletypePy,
    Icon,
} from 'react-bootstrap-icons';

import {
    selectConversion,
    selectRbfDecompileData,
    selectSvgContentData,
    selectWeDo2PreviewData,
} from '@/features/conversion/conversionSlice';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Tab from 'react-bootstrap/Tab';
import { useSelector } from 'react-redux';
import { selectFileContent } from '../fileContent/fileContentSlice';
import TabContents from './TabContents';
import TabHeaders from './TabHeaders';
import { selectTabs } from './tabsSlice';
import TabTopControls from './TabTopControls';

export enum TabKey {
    PYCODE = 'pycode',
    PLAINCODE = 'plaincode',
    EV3BDECOMPILED = 'ev3b_decompiled',
    PREVIEW = 'preview',
    CALLGRAPH = 'callgraph',
}

export interface ITabElem {
    key: string;
    title: string;
    icon?: Icon;
    name: string;
    condition: boolean;
    code?: string;
    children?: ITabElem[];
    disabled?: boolean;
}

const TabMain: React.FC = () => {
    const { disabledFiles } = useSelector(selectFileContent);
    const { conversionResult } = useSelector(selectConversion);
    const svgContentData = useSelector(selectSvgContentData);
    const wedo2preview = useSelector(selectWeDo2PreviewData);
    const rbfDecompileData = useSelector(selectRbfDecompileData);
    const { additionalCommentsChecked } = useSelector(selectTabs);

    const [selectedTabkey, setSelectedTabkey] = useState<string>('');
    const [selectedSubTabkey, setSelectedSubTabkey] = useState<string>('');
    const [tabElems, setTabElems] = useState<ITabElem[]>([]);
    const previewRef = useRef<HTMLDivElement>(null);
    const graphRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const tabElemValues: ITabElem[] = [
            {
                key: TabKey.PLAINCODE,
                title: 'pseudocode (ctrl+1)',
                icon: CodeSlash,
                name: 'Pseudocode',
                condition: conversionResult?.plaincode !== undefined,
                code: !additionalCommentsChecked
                    ? conversionResult?.plaincode
                    : // replace @ .* ending with /* () */ for css formatter
                      conversionResult?.plaincode?.replaceAll(
                          /@ ?([^\r\n]{1,32})/g,
                          '/* $1 */',
                      ),
            },
            {
                key: TabKey.PYCODE,
                title: 'pycode (ctrl+2)',
                icon: FiletypePy,
                name: 'Python',
                code: Array.isArray(conversionResult?.name)
                    ? undefined
                    : (conversionResult?.pycode as string),
                condition: conversionResult?.pycode !== undefined,
                children: Array.isArray(conversionResult?.name)
                    ? conversionResult?.name.map(
                          (elem, index) =>
                              ({
                                  name: elem,
                                  title: elem,
                                  key: elem,
                                  code: (conversionResult?.pycode as string[])[index],
                                  condition: true,
                                  disabled: disabledFiles.includes(elem),
                              } satisfies ITabElem),
                      )
                    : undefined,
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
                condition: !!svgContentData || !!wedo2preview,
                code: svgContentData,
            },
        ];

        setTabElems(tabElemValues);
    }, [conversionResult, rbfDecompileData, svgContentData, disabledFiles]);

    const handleSelectTab = useCallback((k: string | null) => {
        if (k) setSelectedTabkey(k as TabKey);
    }, []);

    return (
        <div className="tab-main container-lg pt-2">
            <Tab.Container
                activeKey={selectedTabkey}
                onSelect={handleSelectTab}
                defaultActiveKey={TabKey.PYCODE}
            >
                <Col>
                    <Row sm={9} className="tabheader">
                        <TabHeaders
                            selectedTabkey={selectedTabkey}
                            setSelectedTabkey={setSelectedTabkey}
                            selectedSubTabkey={selectedSubTabkey}
                            setSelectedSubTabkey={setSelectedSubTabkey}
                            tabElems={tabElems}
                        />
                    </Row>

                    {/* Tab Contents */}
                    <Row sm={9} className="tabcontent position-relative">
                        <Tab.Content className="border p-0 position-relative">
                            <TabTopControls
                                key="topcontrols"
                                selectedTabkey={selectedTabkey}
                                setSelectedTabkey={setSelectedTabkey}
                                selectedSubTabkey={selectedSubTabkey}
                                setSelectedSubTabkey={setSelectedSubTabkey}
                                previewRef={previewRef}
                                graphRef={graphRef}
                                tabElems={tabElems}
                            />

                            {tabElems.map((ikey) => {
                                if (!ikey.children?.length) {
                                    // show only if children is empty, pycode will show all codes under children
                                    return (
                                        <TabContents
                                            key={ikey.key}
                                            genkey={ikey.key}
                                            selectedTabkey={selectedTabkey}
                                            setSelectedTabkey={setSelectedTabkey}
                                            selectedSubTabkey={selectedSubTabkey}
                                            setSelectedSubTabkey={setSelectedSubTabkey}
                                            previewRef={previewRef}
                                            graphRef={graphRef}
                                            tabElems={tabElems}
                                        />
                                    );
                                } else {
                                    // show only if children, pycode will show all codes under children
                                    return ikey.children?.map((elem, index) => (
                                        <TabContents
                                            key={ikey.key + '_' + elem.key}
                                            genkey={ikey.key}
                                            gensubkey={elem.key}
                                            selectedTabkey={selectedTabkey}
                                            setSelectedTabkey={setSelectedTabkey}
                                            selectedSubTabkey={selectedSubTabkey}
                                            setSelectedSubTabkey={setSelectedSubTabkey}
                                            previewRef={previewRef}
                                            graphRef={graphRef}
                                            tabElems={tabElems}
                                        />
                                    ));
                                }
                            })}
                        </Tab.Content>
                    </Row>
                </Col>
            </Tab.Container>
        </div>
    );
};

export default TabMain;
