import { GithubEntry, GithubGist, GithubRepository } from './utils';
import React, { useEffect, useState } from 'react';
import {
    listReposAndGistsGithub,
    searchPublicReposGithub,
    selectGithub,
} from './githubSlice';
import { useAppDispatch, useAppSelector } from '@/app/hooks';

import Dropdown from 'react-bootstrap/Dropdown';
import FormControl from 'react-bootstrap/FormControl';

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

function getSuggestionEntryKey(entry: SuggestonEntry): string {
    const ghentry = entry as GithubEntry;
    const diventry = entry as DividerEntry;

    return ghentry.html_url ?? diventry.key ?? 'undefined';
}

interface DividerEntry {
    type: 'divider';
    key: string;
}

type SuggestonEntry = GithubEntry | DividerEntry;

const AutocompleteDropdown: React.FC<{
    initialValue: string | undefined;
    handleItemSelect: (item: string) => void;
    setAutoCompleteDroppedDown: (value: boolean) => void;
}> = ({ initialValue, setAutoCompleteDroppedDown, handleItemSelect }) => {
    const dispatch = useAppDispatch();

    const github = useAppSelector(selectGithub);

    const [inputValue, setInputValue] = useState(initialValue ?? '');
    const [inputRepoValue, setInputRepoValue] = useState(
        undefined as GithubEntry | undefined,
    );
    // const [selectedItem, setSelectedItem] = useState<SuggestonEntry | null>(null);
    const [suggestions, setSuggestions] = useState([] as SuggestonEntry[]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const refDropdown = React.useRef<HTMLDivElement>(null);

    const executeFiltering = (value?: string) => {
        const results: SuggestonEntry[] = [];

        // 1. start with search results
        if (github.repositoriesSearch.length) {
            results.push({
                type: 'divider',
                key: 'Public Repositories',
            } as DividerEntry);
            results.push(...github.repositoriesSearch);
        }
        // 2. append search as raw if there is no repositoriesSearch
        else {
            if (value?.length)
                results.push({ full_name: value, html_url: value } as GithubRepository);
        }

        // 3. append filtered results
        const filteredOwn = value
            ? github.repositories
                  .filter(
                      (item) =>
                          getGithubEntryName(item)
                              ?.toLowerCase()
                              .includes(value.toLowerCase()) ||
                          item.html_url.toLowerCase().includes(value.toLowerCase()) ||
                          item.description?.toLowerCase().includes(value.toLowerCase()),
                  )
                  .toSorted()
            : [];
        if (results.length > 0 && filteredOwn.length > 0) {
            results.push({
                type: 'divider',
                key: 'Matching User Repositories',
            } as DividerEntry);
            results.push(
                ...filteredOwn.filter(
                    (item) =>
                        !results.some(
                            (result) =>
                                (result as GithubEntry).html_url === item.html_url,
                        ),
                ),
            );
        }

        // 4. append non-filtered own results
        const nonFilteredOwn = github.repositories
            .filter((item) => !results.includes(item))
            .toSorted();
        if (results.length > 0 && nonFilteredOwn.length > 0) {
            results.push({
                type: 'divider',
                key: 'User Repositories',
            } as DividerEntry);
            results.push(
                ...nonFilteredOwn.filter(
                    (item) =>
                        !results.some(
                            (result) =>
                                (result as GithubEntry).html_url === item.html_url,
                        ),
                ),
            );
        }

        setSuggestions(results);
        if (results.length > 0 && value?.length) {
            // will not be able to select dividers, safe to cast
            setInputRepoValue(results[0] as GithubEntry);
        }
    };

    useEffect(() => {
        const handler = setTimeout(() => {
            // only perform search if url is not found in the suggestions
            if (
                suggestions.some(
                    (s) =>
                        getGithubEntryName(s as GithubEntry) === inputValue &&
                        (s as GithubRepository).full_name !== inputValue, // non-manual entry
                )
            ) {
                return;
            }

            dispatch(searchPublicReposGithub(inputValue));
        }, 1000);

        return () => {
            clearTimeout(handler);
        };
    }, [inputValue]);

    useEffect(() => {
        // do it on startup
        if (github.token && github.repositories.length === 0) {
            dispatch(listReposAndGistsGithub(github.token));
        }
    }, [github.token, github.repositories]);

    useEffect(() => {
        executeFiltering(inputValue);
    }, [inputValue, github.repositories, github.repositoriesSearch]);

    useEffect(() => {
        if (handleItemSelect && inputRepoValue)
            handleItemSelect(inputRepoValue.html_url);
    }, [inputRepoValue]);

    useEffect(() => {
        if (setAutoCompleteDroppedDown) setAutoCompleteDroppedDown(showSuggestions);
    }, [showSuggestions]);

    useEffect(() => {
        if (suggestions.length > 0) {
            setShowSuggestions(true);
        }
    }, [suggestions]);

    const handleSuggestionClick = (suggestion: GithubEntry) => {
        setInputValue(getGithubEntryName(suggestion));
        setInputRepoValue(suggestion);
        setShowSuggestions(false);
        // onSelect(suggestion.url);
    };

    const getDropDownItem = (suggestion: SuggestonEntry, index: number) => {
        if ((suggestion as unknown as any)?.type === 'divider') {
            return (
                <Dropdown.Header key={(suggestion as DividerEntry).key}>
                    {(suggestion as DividerEntry).key}
                </Dropdown.Header>
            );
        } else {
            const suggestion1 = suggestion as GithubEntry;
            return (
                <Dropdown.Item
                    key={suggestion1.html_url}
                    eventKey={suggestion1.html_url}
                    active={suggestion1.html_url === inputRepoValue?.html_url}
                    onClick={() => handleSuggestionClick(suggestion1)}
                    onSelect={() => handleSuggestionClick(suggestion1)}
                    // onSelect={() => setSelectedItem(suggestion1)}
                >
                    {suggestion1.owner?.avatar_url && (
                        <img
                            src={suggestion1.owner.avatar_url}
                            className="float-start me-2"
                            alt="avatar"
                        />
                    )}
                    {getGithubIsPrivate(suggestion1) && '🔒 '}
                    {getGithubEntryName(suggestion1)}{' '}
                    {((suggestion as GithubRepository).stargazers_count ?? 0) > 0 && (
                        <>★ {(suggestion as GithubRepository).stargazers_count}</>
                    )}
                    <br />
                    <span className="text-muted small">
                        {getGithubEntryDescription(suggestion1)}
                    </span>
                </Dropdown.Item>
            );
        }
    };

    return (
        <Dropdown
            ref={refDropdown}
            show={showSuggestions}
            onToggle={setShowSuggestions}
            // autoClose={true}
        >
            <Dropdown.Toggle
                as={FormControl}
                value={inputValue}
                autoComplete="off"
                onChange={(v) => {
                    const value = (v.target as HTMLInputElement).value;
                    setInputValue(value);
                    executeFiltering(value);
                }}
                onClick={() => setShowSuggestions(true)}
                onKeyDown={(e) => {
                    if (e.key === 'ArrowDown') {
                        setShowSuggestions(true);
                        // e.preventDefault();
                    } else if (e.key === 'Enter') {
                        // if (selectedItem)
                        //     handleItemSelect((selectedItem as GithubEntry).html_url);
                        // setShowSuggestions(false);
                        // e.preventDefault();
                    } else if (e.key !== 'Escape') {
                        setShowSuggestions(true);
                    }
                }}
                className="form-control"
                id="autocompleteInput"
                placeholder={inputValue}
            />
            {suggestions.length > 0 && (
                <Dropdown.Menu className="autocomplete-dropdown" autoFocus>
                    {suggestions.map((suggestion, index) =>
                        getDropDownItem(suggestion, index),
                    )}
                </Dropdown.Menu>
            )}
        </Dropdown>
    );
};

export default AutocompleteDropdown;
