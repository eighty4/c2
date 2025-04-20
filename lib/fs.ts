import { readdir, readFile, stat } from 'node:fs/promises'

export async function doesDirExist(p: string): Promise<boolean> {
    try {
        return (await stat(p)).isDirectory()
    } catch (ignore) {
        return false
    }
}

export async function readDirListing(p: string): Promise<Array<string>> {
    return readdir(p)
}

export async function readToString(p: string): Promise<string> {
    return readFile(p, 'utf8')
}
