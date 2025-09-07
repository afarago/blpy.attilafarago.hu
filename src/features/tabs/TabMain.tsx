import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Anthropic,
    BookHalf,
    CodeSlash,
    Diagram2,
    FileEarmarkImage,
    FiletypePy,
    Icon,
} from 'react-bootstrap-icons';

import { useAppDispatch } from '@/app/hooks';
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
import { fetchAiSummary, selectAiSummary } from '../aiSummary/aiSummarySlice';
import { selectFileContent } from '../fileContent/fileContentSlice';
import TabContents from './TabContents';
import TabHeaders from './TabHeaders';
import { TabKey } from './TabMainTabKeys';
import { selectTabs } from './tabsSlice';
import TabTopControls from './TabTopControls';

export interface ITabElem {
    key: string;
    title: string;
    icon?: Icon;
    name: string;
    shortname: string;
    condition: boolean;
    code?: string;
    children?: ITabElem[];
    disabled?: boolean;
}

const TabMain: React.FC = () => {
    const dispatch = useAppDispatch();

    const { disabledFiles } = useSelector(selectFileContent);
    const { conversionResult } = useSelector(selectConversion);
    const svgContentData = useSelector(selectSvgContentData);
    const wedo2preview = useSelector(selectWeDo2PreviewData);
    const rbfDecompileData = useSelector(selectRbfDecompileData);
    const aiSummary = useSelector(selectAiSummary);
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
                shortname: 'Pseudo',
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
                shortname: 'Python',
                code: Array.isArray(conversionResult?.name)
                    ? undefined
                    : (conversionResult?.pycode as string),
                condition: conversionResult?.pycode !== undefined,
                children: Array.isArray(conversionResult?.name)
                    ? conversionResult?.name.map(
                          (elem, index) =>
                              ({
                                  name: elem,
                                  shortname: elem,
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
                shortname: 'Decompiled',
                condition: rbfDecompileData !== undefined,
                code: rbfDecompileData,
            },
            {
                key: TabKey.CALLGRAPH,
                title: 'call graph (ctrl+3)',
                icon: Diagram2,
                name: 'Call Graph',
                shortname: 'Graph',
                condition: conversionResult?.dependencygraph !== undefined,
                // code: svgDependencyGraph,
            },
            {
                key: TabKey.PREVIEW,
                title: 'preview (ctrl+4)',
                icon: FileEarmarkImage,
                name: 'Preview',
                shortname: 'Preview',
                condition: !!svgContentData || !!wedo2preview,
                code: svgContentData,
            },
            {
                key: TabKey.AISUMMARY,
                title: 'AI Summary (ctrl+5)',
                icon: Anthropic,
                name: 'AI Summary',
                shortname: 'AI',
                condition:
                    conversionResult?.plaincode !== undefined ||
                    conversionResult?.pycode !== undefined,
                code: aiSummary.code,
            },
        ];

        setTabElems(tabElemValues);
    }, [conversionResult, rbfDecompileData, svgContentData, disabledFiles, aiSummary]);

    const handleSelectTab = useCallback((k: string | null) => {
        if (k) setSelectedTabkey(k as TabKey);
    }, []);

    useEffect(() => {
        if (
            selectedTabkey === TabKey.AISUMMARY &&
            !aiSummary?.shortSummary &&
            (conversionResult?.plaincode || conversionResult?.pycode)
        ) {
            dispatch(
                fetchAiSummary({
                    pseudocode: conversionResult?.plaincode,
                    pycode: Array.isArray(conversionResult?.pycode)
                        ? (conversionResult?.pycode as string[]).join('\n')
                        : conversionResult?.pycode,
                }),
            );
        }
    }, [selectedTabkey, conversionResult, dispatch]);

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
