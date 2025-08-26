import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'
import { MultipartMessage, MultipartAttachment } from './http.ts'

let message: MultipartMessage

beforeEach(() => {
    message = new MultipartMessage(
        [
            {
                path: 'upgrades',
                content: '#cloud-config\nupgrades',
                filename: 'upgrades.yml',
                source: '#cloud-config\nupgrades',
                type: 'cloud-config',
            },
            {
                path: 'security',
                content: 'security',
                filename: 'security.sh',
                source: 'security',
                type: 'x-shellscript',
            },
        ],
        'BOUNDARY',
    )
})

test('multipart message creates cloud-init payload', () => {
    assert.equal(
        message.toHTTP(),
        `Content-Type: multipart/mixed; boundary=BOUNDARY\r
MIME-Version: 1.0\r
Number-Attachments: 2\r
--BOUNDARY\r
Content-Type: text/cloud-config; charset="us-ascii"\r
Content-Transfer-Encoding: 7bit\r
Content-Disposition: attachment; filename="upgrades.yml"\r
\r
#cloud-config
upgrades\r
--BOUNDARY\r
Content-Type: text/x-shellscript; charset="us-ascii"\r
Content-Transfer-Encoding: 7bit\r
Content-Disposition: attachment; filename="security.sh"\r
\r
security\r
--BOUNDARY\r
`,
    )
})

test('multipart message creates HTTP headers', () => {
    assert.deepEqual(message.headers, {
        'Content-Type': 'multipart/mixed; boundary=BOUNDARY',
        'MIME-Version': '1.0',
        'Number-Attachments': '2',
    })
})
