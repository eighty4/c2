import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { rm } from 'node:fs/promises'
import { join } from 'node:path'
import { after, afterEach, beforeEach, test } from 'node:test'
import { evalTemplateExpressions } from './expression.ts'
import { makeFile, makeTempDir, removeDir } from './fs.testing.ts'

let files: Array<string> = []
let tmpDir: string

beforeEach(async () => (tmpDir = await makeTempDir()))

afterEach(async () => await removeDir(tmpDir))

after(async () => {
    for (const p of files) {
        await rm(p)
    }
})

test('env() found', async () => {
    const envVar = 'C2_TEST_' + randomUUID().substring(0, 8).toUpperCase()
    process.env[envVar] = randomUUID()
    assert.equal(
        await evalTemplateExpressions(`\${{ env('${envVar}') }}`),
        process.env[envVar],
    )
    delete process.env[envVar]
})

test('env() not found', async () => {
    const envVar = 'C2_TEST_' + randomUUID().substring(0, 8).toUpperCase()
    assert.rejects(
        () => evalTemplateExpressions(` \${{ env('${envVar}') }}`),
        new Error(`env var \`${envVar}\` does not exist`),
    )
})

test('env() name not valid', async () => {
    ;['2_NOT_VALID', 'NOT=VALID', 'NOT@VALID'].forEach(envVar =>
        assert.rejects(
            () => evalTemplateExpressions(`\${{ env('${envVar}') }}`),
            new Error(`env var \`${envVar}\` is not a valid name`),
        ),
    )
})

test('file() not found', async () => {
    const path = join(await makeTempDir(), 'whoopie')
    assert.rejects(
        () => evalTemplateExpressions(`\${{ file('${path}') }}`),
        new Error(`ENOENT: no such file or directory, open '${path}'`),
    )
})

test('file() absolute', async () => {
    const content = randomUUID()
    const path = await makeFile('.user-data', content, tmpDir)
    assert.equal(
        await evalTemplateExpressions(`\${{ file('${path}') }}`),
        content,
    )
})

test('file() home', async () => {
    const content = randomUUID()
    const filename = `.user-data.${randomUUID()}`
    const path = join(process.env.HOME!, filename)
    await makeFile(path, content)
    files.push(path)
    assert.equal(
        await evalTemplateExpressions(`\${{ file('~/${filename}') }}`),
        content,
    )
})

test('file() relative', async () => {
    const content = randomUUID()
    const filename = `.user-data.${randomUUID()}`
    await makeFile(filename, content, tmpDir)
    const prevPwd = process.cwd()
    process.chdir(tmpDir)
    try {
        assert.equal(
            await evalTemplateExpressions(`\${{ file('${filename}') }}`),
            content,
        )
    } finally {
        process.chdir(prevPwd)
    }
})
