import { collectAttachments } from './attachments.ts'
import { MultipartMessage } from './http.ts'

export type BuildUserDataOpts = {
    attachmentBoundary?: string
}

export async function buildUserData(
    userDataDir: string,
    opts?: BuildUserDataOpts,
): Promise<string> {
    const attachments = await collectAttachments(userDataDir)
    switch (attachments.length) {
        case 0:
            throw new Error(`nothing found in dir ${userDataDir}`)
        case 1:
            return attachments[0].content
        default:
            return new MultipartMessage(
                attachments,
                opts?.attachmentBoundary,
            ).toHTTP()
    }
}
