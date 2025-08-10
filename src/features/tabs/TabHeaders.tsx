import type { ITabElem } from './TabMain';
import { TabKey } from './TabMainTabKeys';
import React, { useEffect } from 'react';

import BrandLogo from '@/features/header/BrandLogo';
import Nav from 'react-bootstrap/Nav';
import ReactGA from 'react-ga4';
import { selectTabs } from './tabsSlice';
import { useHotkeys } from 'react-hotkeys-hook';
import { useSelector } from 'react-redux';

interface TabHeadersProps {
    selectedTabkey: string;
    setSelectedTabkey: (key: string) => void;
    selectedSubTabkey: string;
    setSelectedSubTabkey: (key: string) => void;
    tabElems: ITabElem[];
}

const TabHeaders: React.FC<TabHeadersProps> = ({
    selectedTabkey,
    setSelectedTabkey,
    selectedSubTabkey,
    setSelectedSubTabkey,
    tabElems,
}) => {
    const { fullScreen } = useSelector(selectTabs);

    useHotkeys('control+1', () => setSelectedTabkey(TabKey.PLAINCODE));
    useHotkeys('control+2', () => setSelectedTabkey(TabKey.PYCODE));
    useHotkeys('control+3', () => setSelectedTabkey(TabKey.CALLGRAPH));
    useHotkeys('control+4', () => setSelectedTabkey(TabKey.PREVIEW));

    useEffect(() => {
        ReactGA.send({
            hitType: 'event',
            eventCategory: 'navigation',
            eventAction: 'select_tab',
            eventLabel: selectedTabkey,
            eventValue: selectedSubTabkey,
        });
    }, [selectedTabkey, selectedSubTabkey]);

    useEffect(() => {
        // if the selection changes, but the tab is not visible anymore - nav to the first visible tab (pycode)
        // also if there are pycode children - nav to the first child
        let targetkey: string | undefined = undefined;
        const tabElem = tabElems.find((elem) => selectedTabkey === elem.key);
        const tabSubElem = tabElem?.children?.find(
            (elem) => selectedSubTabkey === elem.key,
        );
        if (
            !tabElem?.condition ||
            (tabElem?.key === TabKey.PYCODE && tabElem?.children && !tabSubElem)
        ) {
            targetkey = tabElems.find((elem) => elem.condition)?.key;
            if (!targetkey) return;

            setSelectedTabkey(targetkey);

            if (tabElem?.children && !tabSubElem) {
                setSelectedSubTabkey(tabElem.children[0].key);
            }
        }
    }, [tabElems, selectedTabkey, selectedSubTabkey]);

    return (
        <Nav variant="tabs" className="px-0">
            <div className="d-flex flex-row px-0">
                {tabElems.map(
                    (elem) =>
                        elem.condition !== false && (
                            <Nav.Item key={elem.key}>
                                {/* Single file tab */}
                                {/* {!elem.children && ( */}
                                <Nav.Link
                                    eventKey={elem.key}
                                    key={elem.key}
                                    title={`${elem.title}`}
                                    active={selectedTabkey === elem.key}
                                >
                                    <span className="d-none d-md-inline icon-link icon-link-hover">
                                        {elem.icon && <elem.icon />}
                                        {elem.name}
                                    </span>
                                    <span className="d-inline d-md-none">
                                        {elem.shortname}
                                    </span>
                                </Nav.Link>

                                {/* Multi-file dropdown tab */}
                                {/* {elem.children && (
                                        <NavDropdown
                                            title={
                                                <span
                                                    onClick={() => setTabkey(elem.key)}
                                                >
                                                    {elem.icon && (
                                                        <elem.icon className="d-none d-md-inline" />
                                                    )}
                                                    {elem.name}
                                                </span>
                                            }
                                            active={tabkey === (elem.key)}
                                            onSelect={(eventkey) => {
                                                if (eventkey) {
                                                    setTabkey(
                                                        `${elem.key}:${eventkey}`,
                                                    );
                                                }
                                            }}
                                        >
                                            {selectedFileContent?.files[0].name !==
                                                conversionResult?.name?.[0] && (
                                                <NavDropdown.Header>
                                                    {selectedFileContent?.files[0].name}
                                                </NavDropdown.Header>
                                            )}
                                            {elem.children.map((elem2) => (
                                                <NavDropdown.Item
                                                    eventKey={elem2.key}
                                                    key={elem2.key}
                                                    title={`${elem2.title}`}
                                                >
                                                    {elem2.icon && (
                                                        <elem2.icon className="d-none d-md-inline" />
                                                    )}
                                                    {elem2.name}
                                                </NavDropdown.Item>
                                            ))}
                                        </NavDropdown>
                                    )} */}
                            </Nav.Item>
                        ),
                )}

                {fullScreen && (
                    <Nav.Item className="brandlogo">
                        <BrandLogo />
                    </Nav.Item>
                )}
            </div>
        </Nav>
    );
};

export default TabHeaders;
