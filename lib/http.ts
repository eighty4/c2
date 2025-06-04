import { randomUUID } from 'node:crypto'
import { createServer, type ServerResponse } from 'node:http'
import { type Attachment, collectAttachments } from '#c2/attachments'

export function startUserDataHttp(port: number, userDataDir: string) {
    const server = createServer((req, res) => {
        console.log(req.method, req.url)
        if (req.method !== 'GET') {
            res.writeHead(405)
            res.end()
        } else if (req.url === '/user-data') {
            sendUserData(res, userDataDir).then()
        } else {
            res.writeHead(
                req.url === '/meta-data' || req.url === '/network-config'
                    ? 200
                    : 404,
            )
            res.end()
        }
    })
    server.listen(port, () => {
        console.log(userDataDir, `up @ http://localhost:${port}/user-data`)
    })
}

async function sendUserData(res: ServerResponse, userDataDir: string) {
    try {
        const message = new MultipartMessage(
            await collectAttachments(userDataDir),
        )
        res.writeHead(200, message.headers)
        res.write(message.responseBody())
    } catch (e: any) {
        console.error(500, '/user-data', e.message)
        res.writeHead(500)
    } finally {
        res.end()
    }
}

export class MultipartMessage {
    static createBoundary(): string {
        return randomUUID()
    }

    readonly #attachments: Array<MultipartAttachment>
    readonly #boundary: string

    constructor(
        attachments: Array<Attachment>,
        boundary: string = MultipartMessage.createBoundary(),
    ) {
        this.#attachments = attachments.map(a => new MultipartAttachment(a))
        this.#boundary = boundary
    }

    get attachments(): Array<MultipartAttachment> {
        return this.#attachments
    }

    get boundary(): string {
        return this.#boundary
    }

    get headers(): Record<string, string> {
        return {
            'Content-Type': `multipart/mixed; boundary=${this.#boundary}`,
            'MIME-Version': '1.0',
            'Number-Attachments': `${this.#attachments.length}`,
        }
    }

    toHTTP(): string {
        return [
            `Content-Type: multipart/mixed; boundary=${this.#boundary}`,
            'MIME-Version: 1.0',
            `Number-Attachments: ${this.#attachments.length}`,
            this.responseBody(),
        ].join('\r\n')
    }

    responseBody(): string {
        return [
            '--' + this.#boundary,
            this.#attachments
                .map(a => a.toHTTP())
                .join('\r\n--' + this.#boundary + '\r\n'),
            '--' + this.#boundary + '\r\n',
        ].join('\r\n')
    }
}

export class MultipartAttachment {
    #attachment: Attachment

    constructor(attachment: Attachment) {
        this.#attachment = attachment
    }

    toHTTP(): string {
        return [
            `Content-Type: text/${this.#attachment.type}; charset="us-ascii"`,
            'Content-Transfer-Encoding: 7bit',
            `Content-Disposition: attachment; filename="${this.#attachment.filename}"`,
            '',
            this.#attachment.content,
        ].join('\r\n')
    }
}
