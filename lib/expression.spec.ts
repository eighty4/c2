import { afterAll, afterEach, beforeEach, expect, test } from 'bun:test'
import { join } from 'node:path'
import { evalTemplateExpressions } from './expression.ts'
import { makeFile, makeTempDir, removeDir } from './fs.testing.ts'

let files: Array<string> = []
let tmpDir: string

beforeEach(async () => (tmpDir = await makeTempDir()))

afterEach(async () => await removeDir(tmpDir))

afterAll(async () => {
    for (const p of files) {
        await Bun.file(p).delete()
    }
})

test('env() found', async () => {
    const envVar = 'C2_TEST_' + Bun.randomUUIDv7().substring(0, 8).toUpperCase()
    Bun.env[envVar] = Bun.randomUUIDv7()
    expect(await evalTemplateExpressions(`\${{ env('${envVar}') }}`)).toBe(
        Bun.env[envVar],
    )
    delete Bun.env[envVar]
})

test('env() not found', async () => {
    const envVar = 'C2_TEST_' + Bun.randomUUIDv7().substring(0, 8).toUpperCase()
    expect(() => evalTemplateExpressions(` \${{ env('${envVar}') }}`)).toThrow(
        `env var \`${envVar}\` does not exist`,
    )
})

test('file() not found', async () => {
    const path = join(await makeTempDir(), 'whoopie')
    expect(() => evalTemplateExpressions(`\${{ file('${path}') }}`)).toThrow(
        `ENOENT: no such file or directory, open '${path}'`,
    )
})

test('file() absolute', async () => {
    const content = Bun.randomUUIDv7()
    const path = await makeFile('.user-data', content, tmpDir)
    expect(await evalTemplateExpressions(`\${{ file('${path}') }}`)).toBe(
        content,
    )
})

test('file() home', async () => {
    const content = Bun.randomUUIDv7()
    const filename = `.user-data.${Bun.randomUUIDv7()}`
    const path = join(Bun.env.HOME!, filename)
    await makeFile(path, content)
    files.push(path)
    expect(await evalTemplateExpressions(`\${{ file('~/${filename}') }}`)).toBe(
        content,
    )
})

test('file() relative', async () => {
    const content = Bun.randomUUIDv7()
    const filename = `.user-data.${Bun.randomUUIDv7()}`
    await makeFile(filename, content, tmpDir)
    const prevPwd = process.cwd()
    process.chdir(tmpDir)
    try {
        expect(
            await evalTemplateExpressions(`\${{ file('${filename}') }}`),
        ).toBe(content)
    } finally {
        process.chdir(prevPwd)
    }
})
