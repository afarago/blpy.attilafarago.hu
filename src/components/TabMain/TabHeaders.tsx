import { Dropdown, NavDropdown } from 'react-bootstrap'; //!!
import { ITabElem, TabKey } from './TabMain';
import React, { useContext, useEffect } from 'react';

import { Icon } from 'react-bootstrap-icons';
import { MyContext } from '../../contexts/MyContext';
import Nav from 'react-bootstrap/Nav';

interface TabHeadersProps {
    tabkey: string;
    setTabkey: (key: string) => void;
    tabElems: ITabElem[];
}

const TabHeaders: React.FC<TabHeadersProps> = ({ tabkey, setTabkey, tabElems }) => {
    const context = useContext(MyContext);
    if (!context) throw new Error('MyComponent must be used within a MyProvider');
    const { conversionResult, selectedFileContent } = context;

    useEffect(() => {
        // if the selection changes, but the tab is not visible anymore - nav to the first visible tab (pycode)
        if (
            !tabkey.startsWith(TabKey.PYCODE) &&
            !tabElems.find((elem) => elem.key === tabkey)?.condition
        ) {
            setTabkey(TabKey.PYCODE);
        }
    }, [tabElems, tabkey]);

    return (
        <>
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
                                        className="icon-link icon-link-hover"
                                        active={tabkey.startsWith(elem.key)}
                                    >
                                        {elem.icon && (
                                            <elem.icon className="d-none d-md-inline" />
                                        )}
                                        {elem.name}
                                    </Nav.Link>
                                    {/* )} */}

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
                                            active={tabkey.startsWith(elem.key)}
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
                </div>
            </Nav>
        </>
    );
};

export default TabHeaders;
