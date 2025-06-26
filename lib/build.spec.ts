import { afterEach, beforeEach, expect, test } from 'bun:test'
import { buildUserData } from './build.ts'
import { makeFile, makeTempDir, removeDir } from './fs.testing.ts'

let tmpDir: string

beforeEach(async () => {
    tmpDir = await makeTempDir()
})

afterEach(async () => removeDir(tmpDir))

test('build user data of single file', async () => {
    const initCloudYml = '#cloud-config\nwhoopie'
    await makeFile('init-cloud.yml', initCloudYml, tmpDir)
    expect(await buildUserData(tmpDir)).toStrictEqual(initCloudYml)
})

test('build user data of single file with template expression', async () => {
    const whoopie = await makeTempDir()
    await makeFile('whoopie', 'whoopie', whoopie)
    await makeFile(
        'init-cloud.yml',
        `#cloud-config\n\${{ file('${whoopie}/whoopie')}}`,
        tmpDir,
    )
    expect(await buildUserData(tmpDir)).toStrictEqual('#cloud-config\nwhoopie')
    await removeDir(whoopie)
})

test('build user data multipart message', async () => {
    await makeFile('1-init-cloud.yml', '#cloud-config\nwhoopie', tmpDir)
    await makeFile('2-init-cloud.sh', 'cushion', tmpDir)
    const boundary = Bun.randomUUIDv7()
    expect(
        await buildUserData(tmpDir, { attachmentBoundary: boundary }),
    ).toStrictEqual(
        `Content-Type: multipart/mixed; boundary=${boundary}\r
MIME-Version: 1.0\r
Number-Attachments: 2\r
--${boundary}\r
Content-Type: text/cloud-config; charset="us-ascii"\r
Content-Transfer-Encoding: 7bit\r
Content-Disposition: attachment; filename="1-init-cloud.yml"\r
\r
#cloud-config
whoopie\r
--${boundary}\r
Content-Type: text/x-shellscript; charset="us-ascii"\r
Content-Transfer-Encoding: 7bit\r
Content-Disposition: attachment; filename="2-init-cloud.sh"\r
\r
cushion\r
--${boundary}\r
`,
    )
})

test('build user data multipart with template expression', async () => {
    const whoopie = await makeTempDir()
    await makeFile('whoopie', 'whoopie', whoopie)
    await makeFile(
        '1-init-cloud.yml',
        `#cloud-config\n\${{ file('${whoopie}/whoopie')}}`,
        tmpDir,
    )
    await makeFile('2-init-cloud.sh', 'cushion', tmpDir)
    const boundary = Bun.randomUUIDv7()
    expect(
        await buildUserData(tmpDir, { attachmentBoundary: boundary }),
    ).toStrictEqual(
        `Content-Type: multipart/mixed; boundary=${boundary}\r
MIME-Version: 1.0\r
Number-Attachments: 2\r
--${boundary}\r
Content-Type: text/cloud-config; charset="us-ascii"\r
Content-Transfer-Encoding: 7bit\r
Content-Disposition: attachment; filename="1-init-cloud.yml"\r
\r
#cloud-config\nwhoopie\r
--${boundary}\r
Content-Type: text/x-shellscript; charset="us-ascii"\r
Content-Transfer-Encoding: 7bit\r
Content-Disposition: attachment; filename="2-init-cloud.sh"\r
\r
cushion\r
--${boundary}\r
`,
    )
})
