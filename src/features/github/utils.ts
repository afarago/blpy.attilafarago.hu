import axios from 'axios';
import { supportsExtension } from '@/features/conversion/blpyutil';

export const GITHUB_API_URL = 'https://api.github.com';
export const GITHUB_DOMAIN = 'github.com';

export interface GithubRepository {
    full_name: string;
    // url: string;
    html_url: string;
    stargazers_count?: number;
    private?: boolean;
    // visibility: 'public' | 'private';
    description?: string;
    language?: string;
    owner: {
        login: string;
        avatar_url: string;
    };
}

export interface GithubGist {
    id: string;
    // url: string;
    html_url: string;
    public?: boolean;
    description?: string;
    owner: {
        login: string;
        avatar_url: string;
    };
    files: { [filename: string]: GistFile };
}

export type GithubEntry = GithubRepository | GithubGist;

interface GistFile {
    filename: string;
    type: string;
    language: string;
    raw_url: string;
    content: string; // will be added later
}

interface GithubFile {
    name: string;
    type: string;
    download_url: string;
    content: string;
    path: string;
}

export interface GithubUrlInfo {
    type: string;
    owner: string;
    repo: string;
    path: string;
    ref?: string;
}

export function extractGithubUrlInfo(url: string): GithubUrlInfo | undefined {
    /** 1. Try to match gist path
     * examples:
     *      https://api.github.com/gists/4718cffcbea66ca88f99be64fd912cd8
     *      https://gist.github.com/afarago/4718cffcbea66ca88f99be64fd912cd8
     */
    // const matchGist = url.match(
    //     /gist\.github\.com\/(?<owner>[^\/]+)\/(?<path>[a-f0-9]+)|api\.github\.com\/gists\/(?<path>[a-f0-9]+)/,
    // )?.groups;
    const gistRegex =
        /((gist\.github\.com\/(?<owner>[^/]+))|(api\.github\.com\/gists))\/(?<path>[a-f0-9]+)/;
    const matchGist = gistRegex.exec(url)?.groups;
    if (matchGist) return { ...matchGist, type: 'gist' } as GithubUrlInfo;

    /** 2. Try to match git repo path
     * examples:
     *      https://github.com/afarago/2025educup-masters-attilafarago
     *      https://api.github.com/repos/afarago/2025educup-masters-attilafarago
     */
    const repoRegex =
        /github\.com\/(?:repos\/)?(?<owner>[^/]+)\/(?<repo>[^/]+)(?:\/(?:tree|blob)\/(?<ref>[^/]+)\/(?<path>.*))?/;
    const matchRepo = repoRegex.exec(url)?.groups;
    if (matchRepo) return { ...matchRepo, type: 'repo' } as GithubUrlInfo;
}

export async function getGithubContents(
    ghinfo: GithubUrlInfo,
    token: string | null,
    useBackendProxy: boolean,
): Promise<{ name: string; content: Blob }[] | null> {
    try {
        if (ghinfo.type === 'gist') {
            return await getGistContents(ghinfo, token);
        } else {
            return await getGithubRepoContents(ghinfo, token, useBackendProxy);
        }
    } catch (error) {
        throw new Error(`Error getting public GitHub contents: ${error}`);
    }
}

async function getGistContents(
    ghinfo: GithubUrlInfo,
    token: string | null,
): Promise<{ name: string; content: Blob }[] | null> {
    const url = `${GITHUB_API_URL}/gists/${ghinfo.path}`;

    const response = await axios.get(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const data = response.data;

    // TODO: use useBackendProxy for secret gists/all?

    const data1 = await Promise.all(
        Object.values((data as GithubGist).files)
            .filter((gistfile) => supportsExtension(gistfile.filename))
            .map(async (gistfile) => {
                let content: Blob | null = null;

                if (gistfile.content) {
                    content = new Blob([gistfile.content]);
                } else {
                    const contentResponse = await axios.get(gistfile.raw_url, {
                        responseType: 'blob',
                    });
                    if (contentResponse.status === 200) {
                        content = contentResponse.data;
                    }
                }

                if (content) {
                    const name = gistfile.filename;
                    return { name, content };
                }
            }),
    );

    const retval = data1.filter((item) => !!item);
    return retval;
}

async function fetchGitHubFile(
    ghinfo: GithubUrlInfo,
    token: string | null,
    useBackendProxy: boolean,
    item: GithubFile,
): Promise<{ name: string; content: Blob } | undefined> {
    // To get the actual file content, you'd make another fetch to item.download_url
    //?? However, for binary files, you need to set the 'Accept' header to 'application/vnd.github.v3.raw'

    // parse download_url - https://raw.githubusercontent.com/afarago/2025educup-masters-attilafarago/master/erc25.py
    const parsedUrl = new URL(item.download_url);
    let pathParts = parsedUrl.pathname.split('/');
    let { owner, repo, ref, path } = ghinfo;
    [owner, repo, ref, ...pathParts] = pathParts.slice(1);
    path = pathParts.join('/');

    const url2 = useBackendProxy
        ? `/api/github-raw?owner=${owner}&repo=${repo}&path=${item.path}&branch=${ref}`
        : item.download_url;
    const fileResponse = await axios.get(url2, {
        responseType: 'blob',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (fileResponse.status === 200) {
        const fileContent = fileResponse.data;
        return { name: item.name, content: fileContent };
    }
}

async function getGithubRepoContents(
    ghinfo: GithubUrlInfo,
    token: string | null,
    useBackendProxy: boolean,
): Promise<{ name: string; content: Blob }[] | null> {
    const url = `${GITHUB_API_URL}/repos/${ghinfo.owner}/${ghinfo.repo}/contents/${
        ghinfo.path ?? ''
    }${ghinfo.ref ? '?ref=' + ghinfo.ref : ''}`;

    const response = await axios.get(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const data = response.data as GithubFile | GithubFile[];
    if (!data) throw new Error(`HTTP error! status: ${response.status}`);
    // Handle the data.  If 'path' is a directory, 'data' will be an array of file/directory objects.
    // If 'path' is a file, 'data' will be the file content (depending on the 'Accept' header - see below).

    let retval: { name: string; content: Blob }[] = [];
    if (Array.isArray(data)) {
        const filePromises = data.map(async (item) => {
            if (item.type === 'file') {
                if (!supportsExtension(item.name)) return null;
                const fileContent = await fetchGitHubFile(
                    ghinfo,
                    token,
                    useBackendProxy,
                    item,
                );
                return fileContent;
            } else if (item.type === 'dir') {
                // Recursively get the contents of the directory
                const subdirContents = await getGithubRepoContents(
                    { ...ghinfo, path: item.path },
                    token,
                    useBackendProxy,
                );
                return subdirContents;
            }
        });

        const results = await Promise.all(filePromises);
        results.forEach((result) => {
            if (result) {
                if (Array.isArray(result)) retval.push(...result);
                else retval.push(result);
            }
        });
        return retval;
    } else {
        const byteArray = Uint8Array.from(atob(data.content), (c) => c.charCodeAt(0));
        const fileContent = new Blob([byteArray]);
        retval = [{ name: ghinfo.path, content: fileContent }];
        return retval;
    }
}
