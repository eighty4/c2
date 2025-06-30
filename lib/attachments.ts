import { evalTemplateExpressions } from './expression.ts'
import { readDirListing, readToString } from './fs.ts'

export type AttachmentType = 'cloud-config' | 'x-shellscript'

export interface Attachment {
    path: string
    content: string
    filename: string
    source: string
    type: AttachmentType
}

export async function collectAttachments(
    dir: string,
): Promise<Array<Attachment>> {
    const filenames = await readDirListing(dir)
    const attachments = await Promise.all(
        filenames.map(async filename => {
            const path = `${dir}/${filename}`
            const source = await readToString(path)
            const type = resolveAttachmentType(filename, source)
            const content = await evalTemplateExpressions(source)
            return { content, filename, path, type, source }
        }),
    )
    return attachments.sort(compareAttachmentFilenames)
}

function compareAttachmentFilenames(
    a1: Attachment,
    a2: Attachment,
): 1 | 0 | -1 {
    if (a1.filename < a2.filename) return -1
    if (a1.filename > a2.filename) return 1
    return 0
}

export function resolveAttachmentType(
    filename: string,
    source: string,
): AttachmentType {
    if (filename.endsWith('.yml') || filename.endsWith('.yaml')) {
        if (!source.trim().startsWith('#cloud-config')) {
            throw new Error(
                'YAML cloud config must start with a #cloud-config comment',
            )
        }
        return 'cloud-config'
    } else if (filename.endsWith('.sh')) {
        return 'x-shellscript'
    } else {
        throw new Error(`${filename} is an unsupported file type`)
    }
}
