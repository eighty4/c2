import { afterEach, beforeEach, expect, test } from 'bun:test'
import { join } from 'node:path'
import { collectAttachments } from '#c2/attachments'
import { makeFile, makeTempDir, removeDir } from '#c2/fs.testing'

let tmpDir: string

beforeEach(async () => (tmpDir = await makeTempDir()))

afterEach(async () => await removeDir(tmpDir))

test('collect throws error when yml does not have #cloud-config comment', async () => {
    await makeFile('init-cloud', 'whoopie', tmpDir)
    await expect(() => collectAttachments(tmpDir)).toThrow(
        'init-cloud is an unsupported file type',
    )
})

test('collect cloud config yml', async () => {
    await makeFile('init-cloud.yml', '#cloud-config\nwhoopie', tmpDir)
    expect(await collectAttachments(tmpDir)).toStrictEqual([
        {
            path: join(tmpDir, 'init-cloud.yml'),
            content: '#cloud-config\nwhoopie',
            filename: 'init-cloud.yml',
            source: '#cloud-config\nwhoopie',
            type: 'cloud-config',
        },
    ])
})

test('collect throws error when yml does not have #cloud-config comment', async () => {
    await makeFile('init-cloud.yml', 'whoopie', tmpDir)
    await expect(() => collectAttachments(tmpDir)).toThrow(
        'YAML cloud config must start with a #cloud-config comment',
    )
})

test('collect throws error when yaml does not have #cloud-config comment', async () => {
    await makeFile('init-cloud.yaml', 'whoopie', tmpDir)
    await expect(() => collectAttachments(tmpDir)).toThrow(
        'YAML cloud config must start with a #cloud-config comment',
    )
})

test('collect shell script', async () => {
    await makeFile('init-cloud.sh', 'whoopie', tmpDir)
    expect(await collectAttachments(tmpDir)).toStrictEqual([
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
    expect(await collectAttachments(tmpDir)).toStrictEqual([
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
    expect(await collectAttachments(tmpDir)).toStrictEqual([
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
