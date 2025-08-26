import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

export async function makeFile(
    path: string,
    content: string,
    pathPrefix?: string,
): Promise<string> {
    const p = !!pathPrefix ? join(pathPrefix, path) : path
    await writeFile(p, content)
    return p
}

export async function makeTempDir(): Promise<string> {
    return await mkdtemp(join(tmpdir(), 'c2-test-'))
}

export async function removeDir(p: string): Promise<void> {
    await rm(p, { force: true, recursive: true })
}
