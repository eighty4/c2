import MagicString from 'magic-string'
import { readToString } from '#c2/fs'

type TemplateExpression = {
    index: number
    innie: string
    outie: string
}

export async function evalTemplateExpressions(
    content: string,
): Promise<string> {
    const regex = new RegExp(/\${{\s*(.*)\s*}}/g)
    let match: RegExpExecArray | null
    const expressions: Array<TemplateExpression> = []
    while ((match = regex.exec(content)) != null) {
        expressions.push({
            index: match.index,
            innie: match[1],
            outie: match[0],
        })
    }
    if (!expressions.length) {
        return content
    }
    const ms = new MagicString(content)
    for (const expression of expressions) {
        ms.update(
            expression.index,
            expression.index + expression.outie.length,
            await evaluate(expression.innie),
        )
    }
    return ms.toString()
}

async function evaluate(expression: string): Promise<string> {
    let match: RegExpMatchArray | null
    if ((match = expression.match(/env\(\s*'(.*)'\s*\)/)) != null) {
        const envVarKey = match[1]
        if (!/^[A-Z_][A-Z_\d]+$/.test(envVarKey)) {
            throw new Error(`env var \`${envVarKey}\` is not a valid name`)
        }
        const envVarValue = process.env[envVarKey]
        if (!envVarValue) {
            throw new Error(`env var \`${envVarKey}\` does not exist`)
        }
        return envVarValue
    } else if ((match = expression.match(/file\(\s*'(.*)'\s*\)/)) != null) {
        let path = match[1]
        if (path.startsWith('~/')) {
            if (!process.env.HOME) {
                throw new Error(
                    `file \`${path}\` cannot be resolved without env var HOME`,
                )
            }
            path = `${process.env.HOME}${path.substring(1)}`
        }
        return readToString(path)
    }

    throw new Error(`unsupported expression: ${expression}`)
}
