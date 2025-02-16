import axios from 'axios';
import { supportsExtension } from 'blocklypy';

const GITHUB_API_URL = 'https://api.github.com';

export interface GitHubRepository {
    full_name: string;
    url: string;
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

interface GistFile {
    filename: string;
    type: string;
    raw_url: string;
    content: string;
}

interface GithubFile {
    name: string;
    type: string;
    download_url: string;
    content: string;
    path: string;
}

export async function getGithubContents(
    owner: string,
    repo: string,
    path: string,
    ref: string,
    token: string | null,
): Promise<{ name: string; content: Blob }[] | null> {
    try {
        if (repo === 'gist') {
            return getGistContents(path, token);
        } else {
            return getGithubRepoContents(owner, repo, path, ref, token);
        }
    } catch (error) {
        throw new Error(`Error getting public GitHub contents: ${error}`);
    }
}

interface Gist {
    files: { [filename: string]: GistFile };
    // ... other Gist properties if needed
}

async function getGistContents(
    gistId: string,
    token: string | null,
): Promise<{ name: string; content: Blob }[] | null> {
    const url = `${GITHUB_API_URL}/gists/${gistId}`;

    const response = await axios.get(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const data = response.data;

    const data1 = await Promise.all(
        Object.values((data as Gist).files)
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

async function getGithubRepoContents(
    owner: string,
    repo: string,
    path: string,
    ref: string,
    token: string | null,
): Promise<{ name: string; content: Blob }[] | null> {
    let url = `${GITHUB_API_URL}/repos/${owner}/${repo}/contents/${path ?? ''}${
        ref ? `?ref=${ref}` : ''
    }`;

    const response = await axios.get(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const data = response.data as GithubFile | GithubFile[];
    if (!data) throw new Error(`HTTP error! status: ${response.status}`);
    // Handle the data.  If 'path' is a directory, 'data' will be an array of file/directory objects.
    // If 'path' is a file, 'data' will be the file content (depending on the 'Accept' header - see below).

    let retval: { name: string; content: Blob }[] = [];
    if (Array.isArray(data)) {
        for (const item of data) {
            if (item.type === 'file') {
                if (!supportsExtension(item.name)) continue;

                // To get the actual file content, you'd make another fetch to item.download_url
                //?? However, for binary files, you need to set the 'Accept' header to 'application/vnd.github.v3.raw'

                // parse download_url - https://raw.githubusercontent.com/afarago/2025educup-masters-attilafarago/master/erc25.py
                const parsedUrl = new URL(item.download_url);
                let pathParts = parsedUrl.pathname.split('/');
                [owner, repo, ref, ...pathParts] = pathParts.slice(1);
                path = pathParts.join('/');

                const url2 = `/.netlify/functions/github-raw?owner=${owner}&repo=${repo}&path=${item.path}&branch=${ref}`;
                const fileResponse = await axios.get(url2, {
                    responseType: 'blob',
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                if (fileResponse.status === 200) {
                    const fileContent = fileResponse.data;
                    retval.push({ name: item.name, content: fileContent });
                }
            } else if (item.type === 'dir') {
                // Recursively get the contents of the directory
                const subdirContents = await getGithubRepoContents(
                    owner,
                    repo,
                    item.path,
                    ref,
                    token,
                );
                if (subdirContents) retval = retval.concat(subdirContents);
            }
        }
        return retval;
    } else {
        const byteArray = Uint8Array.from(atob(data.content), (c) => c.charCodeAt(0));
        const fileContent = new Blob([byteArray]);
        retval = [{ name: path, content: fileContent }];
        return retval;
    }
}
