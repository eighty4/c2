import assert from 'node:assert/strict'
import { join } from 'node:path'
import { afterEach, beforeEach, test } from 'node:test'
import { collectAttachments } from './attachments.ts'
import { makeFile, makeTempDir, removeDir } from './fs.testing.ts'

let tmpDir: string

beforeEach(async () => (tmpDir = await makeTempDir()))

afterEach(async () => await removeDir(tmpDir))

test('collect throws error for unknown filetype', async () => {
    await makeFile('init-cloud', 'whoopie', tmpDir)
    await assert.rejects(
        () => collectAttachments(tmpDir),
        new Error('init-cloud is an unsupported file type'),
    )
})

test('collect cloud config yml', async () => {
    await makeFile('init-cloud.yml', '#cloud-config\nwhoopie', tmpDir)
    assert.deepEqual(await collectAttachments(tmpDir), [
        {
            path: join(tmpDir, 'init-cloud.yml'),
            content: '#cloud-config\nwhoopie',
            filename: 'init-cloud.yml',
            source: '#cloud-config\nwhoopie',
            type: 'cloud-config',
        },
    ])
})

test('collect cloud config yaml', async () => {
    await makeFile('init-cloud.yaml', '#cloud-config\nwhoopie', tmpDir)
    assert.deepEqual(await collectAttachments(tmpDir), [
        {
            path: join(tmpDir, 'init-cloud.yaml'),
            content: '#cloud-config\nwhoopie',
            filename: 'init-cloud.yaml',
            source: '#cloud-config\nwhoopie',
            type: 'cloud-config',
        },
    ])
})

test('collect throws error when yml does not have #cloud-config comment', async () => {
    await makeFile('init-cloud.yml', 'whoopie', tmpDir)
    await assert.rejects(
        () => collectAttachments(tmpDir),
        new Error('YAML cloud config must start with a #cloud-config comment'),
    )
})

test('collect throws error when yaml does not have #cloud-config comment', async () => {
    await makeFile('init-cloud.yaml', 'whoopie', tmpDir)
    await assert.rejects(
        () => collectAttachments(tmpDir),
        new Error('YAML cloud config must start with a #cloud-config comment'),
    )
})

test('collect shell script', async () => {
    await makeFile('init-cloud.sh', 'whoopie', tmpDir)
    assert.deepEqual(await collectAttachments(tmpDir), [
        {
            path: join(tmpDir, 'init-cloud.sh'),
            content: 'whoopie',
            filename: 'init-cloud.sh',
            source: 'whoopie',
            type: 'x-shellscript',
        },
    ])
})

test('evals template expressions', async () => {
    const resourceTmpDir = await makeTempDir()
    await makeFile('whoopie', 'whoopie', resourceTmpDir)
    await makeFile(
        'init-cloud.sh',
        `\${{ file('${resourceTmpDir}/whoopie') }}`,
        tmpDir,
    )
    assert.deepEqual(await collectAttachments(tmpDir), [
        {
            path: tmpDir + '/init-cloud.sh',
            content: 'whoopie',
            filename: 'init-cloud.sh',
            source: `\${{ file('${resourceTmpDir}/whoopie') }}`,
            type: 'x-shellscript',
        },
    ])
    await removeDir(resourceTmpDir)
})

test('sorts attachments by filename', async () => {
    await makeFile('01-init-cloud.sh', 'whoopie', tmpDir)
    await makeFile('02-init-cloud.sh', 'whoopie', tmpDir)
    assert.deepEqual(await collectAttachments(tmpDir), [
        {
            path: join(tmpDir, '01-init-cloud.sh'),
            content: 'whoopie',
            filename: '01-init-cloud.sh',
            source: 'whoopie',
            type: 'x-shellscript',
        },
        {
            path: join(tmpDir, '02-init-cloud.sh'),
            content: 'whoopie',
            filename: '02-init-cloud.sh',
            source: 'whoopie',
            type: 'x-shellscript',
        },
    ])
})
