import { GithubEntry, GithubGist, GithubRepository } from './utils';
import { useEffect, useState } from 'react';

import Dropdown from 'react-bootstrap/Dropdown';
import FormControl from 'react-bootstrap/FormControl';
import React from 'react';

function getGithubEntryName(entry: GithubEntry): string {
    const repo = entry as GithubRepository;
    const gist = entry as GithubGist;

    if (repo.full_name) return repo.full_name;
    if (gist.id) return `gist_${gist.id}`;

    return 'undefined';
}

function getGithubEntryDescription(entry: GithubEntry): string | undefined {
    const repo = entry as GithubRepository;
    const gist = entry as GithubGist;

    if (gist.files && gist.id) {
        const filenames = Object.keys(gist.files);
        return [gist.description, filenames.join(', ')].filter(Boolean).join(' | ');
    }

    if (repo.description) return repo.description;
}

function getGithubIsPrivate(entry: GithubEntry): boolean {
    return (
        (entry as GithubRepository).private ??
        ((entry as GithubGist).public !== undefined &&
            (entry as GithubGist).public !== true)
    );
}
const AutocompleteDropdown: React.FC<{
    show: boolean;
    data: GithubEntry[];
    initialValue: string | undefined;
    onSelect: (item: string) => void;
    onDropdownToggle?: (isOpen: boolean) => void;
}> = ({ show, data, initialValue, onDropdownToggle, onSelect }) => {
    const [inputValue, setInputValue] = useState(initialValue ?? '');
    const [inputRepoValue, setInputRepoValue] = useState(
        undefined as GithubEntry | undefined,
    );
    const [suggestions, setSuggestions] = useState([] as GithubEntry[]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const refDropdown = React.useRef<HTMLDivElement>(null);

    const filterexec = (value?: string) => {
        const filteredSuggestions = value
            ? data
                  .filter(
                      (item) =>
                          getGithubEntryName(item)
                              ?.toLowerCase()
                              .includes(value.toLowerCase()) ||
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
                : [{ full_name: value, url: value } as GithubRepository]),
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
    }, [show, data]);

    const handleSuggestionClick = (suggestion: GithubEntry) => {
        setInputValue(getGithubEntryName(suggestion));
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
                onKeyDown={() => setShowSuggestions(true)}
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
                            {getGithubIsPrivate(suggestion) && '🔒 '}
                            {getGithubEntryName(suggestion)}{' '}
                            {((suggestion as GithubRepository).stargazers_count ?? 0) >
                                0 && (
                                <>
                                    ★{' '}
                                    {(suggestion as GithubRepository).stargazers_count}
                                </>
                            )}
                            <br />
                            <span className="text-muted small">
                                {getGithubEntryDescription(suggestion)}
                            </span>
                        </Dropdown.Item>
                    ))}
                </Dropdown.Menu>
            )}
        </Dropdown>
    );
};

export default AutocompleteDropdown;
