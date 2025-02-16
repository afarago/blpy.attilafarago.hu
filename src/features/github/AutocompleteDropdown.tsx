import { useEffect, useState } from 'react';

import Dropdown from 'react-bootstrap/Dropdown';
import FormControl from 'react-bootstrap/FormControl';
import { GitHubRepository } from './ghutils';
import React from 'react';
import { StarFill } from 'react-bootstrap-icons';

const AutocompleteDropdown: React.FC<{
    show: boolean;
    data: GitHubRepository[];
    initialValue: string | undefined;
    onSelect: (item: string) => void;
    onDropdownToggle?: (isOpen: boolean) => void;
}> = ({ show, data, initialValue, onDropdownToggle, onSelect }) => {
    const [inputValue, setInputValue] = useState(initialValue ?? '');
    const [inputRepoValue, setInputRepoValue] = useState(
        undefined as GitHubRepository | undefined,
    );
    const [suggestions, setSuggestions] = useState([] as GitHubRepository[]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const refDropdown = React.useRef<HTMLDivElement>(null);

    const filterexec = (value?: string) => {
        const filteredSuggestions = value
            ? data
                  .filter(
                      (item) =>
                          item.full_name.toLowerCase().includes(value.toLowerCase()) ||
                          item.url.toLowerCase().includes(value.toLowerCase()) ||
                          item.description?.toLowerCase().includes(value.toLowerCase()),
                  )
                  .toSorted()
            : [];
        const nonFilteredSuggestions = data
            .filter((item) => !filteredSuggestions.includes(item))
            .toSorted();
        const suggestions = [
            ...(filteredSuggestions.length || !value?.length
                ? filteredSuggestions
                : [{ full_name: value, url: value } as GitHubRepository]),
            ...nonFilteredSuggestions,
        ];
        setSuggestions(suggestions);

        if (suggestions.length > 0 && value?.length) {
            setInputRepoValue(suggestions[0]);
        }
    };

    useEffect(() => {
        filterexec(inputValue);
    }, [inputValue, data]);

    useEffect(() => {
        if (onSelect && inputRepoValue) onSelect(inputRepoValue.url);
    }, [inputRepoValue]);

    useEffect(() => {
        if (onDropdownToggle) onDropdownToggle(showSuggestions);
    }, [showSuggestions]);

    useEffect(() => {
        if (show && data.length > 0) {
            setShowSuggestions(true);
        }
    }, [show]);

    const handleSuggestionClick = (suggestion: GitHubRepository) => {
        setInputValue(suggestion.full_name);
        setInputRepoValue(suggestion);
        setShowSuggestions(false);
        // onSelect(suggestion.url);
    };

    return (
        <Dropdown
            autoClose={true}
            onToggle={setShowSuggestions}
            ref={refDropdown}
            show={showSuggestions}
        >
            <Dropdown.Toggle
                as={FormControl}
                value={inputValue}
                autoComplete="off"
                onChange={(v) => {
                    const value = (v.target as HTMLInputElement).value;
                    setInputValue(value);
                    filterexec(value);
                }}
                onClick={() => setShowSuggestions(true)}
                className="form-control"
                id="autocompleteInput"
                placeholder={inputValue}
            />
            {suggestions.length > 0 && (
                <Dropdown.Menu className="autocomplete-dropdown" autoFocus>
                    {suggestions.map((suggestion, index) => (
                        <Dropdown.Item
                            key={index}
                            eventKey={suggestion.url}
                            active={suggestion.url === inputRepoValue?.url}
                            onClick={() => handleSuggestionClick(suggestion)}
                        >
                            {suggestion.owner?.avatar_url && (
                                <img
                                    src={suggestion.owner.avatar_url}
                                    className="float-start me-2"
                                />
                            )}
                            {suggestion.full_name}{' '}
                            {(suggestion.stargazers_count ?? 0) > 0 && (
                                <>
                                    <StarFill /> {suggestion.stargazers_count}
                                </>
                            )}
                            <br />
                            <span className="text-muted">{suggestion.description}</span>
                        </Dropdown.Item>
                    ))}
                </Dropdown.Menu>
            )}
        </Dropdown>
    );
};

export default AutocompleteDropdown;
