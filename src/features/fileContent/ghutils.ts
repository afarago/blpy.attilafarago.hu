interface GistFile {
    filename: string;
    type: string;
    language: string;
    raw_url: string;
    size: number;
    content: string; // This will hold the file content
}

interface Gist {
    files: { [filename: string]: GistFile };
    // ... other Gist properties if needed
}

export async function getPublicGithubContents(
    owner: string,
    repo: string,
    path: string = '',
): Promise<{ name: string; content: Blob }[] | null> {
    try {
        if (repo === 'gist') {
            return getPublicGistContents(path);
        } else {
            return getPublicGithubRepoContents(owner, repo, path);
        }
    } catch (error) {
        throw new Error(`Error getting public GitHub contents: ${error}`);
    }
}

async function getPublicGistContents(
    gistId: string,
): Promise<{ name: string; content: Blob }[] | null> {
    const url = `https://api.github.com/gists/${gistId}`;

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

async function getPublicGithubRepoContents(
    owner: string,
    repo: string,
    path: string,
): Promise<{ name: string; content: Blob }[] | null> {
    let url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();

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
