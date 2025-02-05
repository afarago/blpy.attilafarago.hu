const GITHUB_API_URL = 'https://api.github.com';

export async function getPublicGithubContents(
    owner: string,
    repo: string,
    path: string,
    ref: string,
): Promise<{ name: string; content: Blob }[] | null> {
    try {
        if (repo === 'gist') {
            return getPublicGistContents(path);
        } else {
            return getPublicGithubRepoContents(owner, repo, path, ref);
        }
    } catch (error) {
        throw new Error(`Error getting public GitHub contents: ${error}`);
    }
}

interface GistFile {
    filename: string;
    type: string;
    raw_url: string;
    content: string;
}

interface Gist {
    files: { [filename: string]: GistFile };
    // ... other Gist properties if needed
}

async function getPublicGistContents(
    gistId: string,
): Promise<{ name: string; content: Blob }[] | null> {
    const url = `${GITHUB_API_URL}/gists/${gistId}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();

    const data1 = await Promise.all(
        Object.values((data as Gist).files).map(async (gistfile) => {
            let content: Blob | null = null;

            if (gistfile.content) {
                content = new Blob([gistfile.content]);
            } else {
                const contentResponse = await fetch(gistfile.raw_url);
                if (contentResponse.ok) {
                    content = await contentResponse.blob();
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

interface GithubFile {
    name: string;
    type: string;
    download_url: string;
    content: string;
    path: string;
}

async function getPublicGithubRepoContents(
    owner: string,
    repo: string,
    path: string,
    ref: string,
): Promise<{ name: string; content: Blob }[] | null> {
    let url = `${GITHUB_API_URL}/repos/${owner}/${repo}/contents/${path ?? ''}${
        ref ? `?ref=${ref}` : ''
    }`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = (await response.json()) as GithubFile | GithubFile[];

    // Handle the data.  If 'path' is a directory, 'data' will be an array of file/directory objects.
    // If 'path' is a file, 'data' will be the file content (depending on the 'Accept' header - see below).

    let retval: { name: string; content: Blob }[] = [];
    if (Array.isArray(data)) {
        for (const item of data) {
            if (item.type === 'file') {
                // To get the actual file content, you'd make another fetch to item.download_url
                const fileResponse = await fetch(item.download_url);
                if (fileResponse.ok) {
                    const fileContent = await fileResponse.blob(); // Or .blob() for binary files
                    retval.push({ name: item.name, content: fileContent });
                }
            } else if (item.type === 'dir') {
                // Recursively get the contents of the directory
                const subdirContents = await getPublicGithubRepoContents(
                    owner,
                    repo,
                    item.path,
                    ref,
                );
                if (subdirContents) {
                    retval = retval.concat(subdirContents);
                }
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
