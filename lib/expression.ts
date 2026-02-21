import { readFile } from 'node:fs/promises'

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
    let offset = 0
    for (const expression of expressions) {
        const expressionResult = await evaluate(expression.innie)
        content =
            content.substring(0, expression.index + offset) +
            expressionResult +
            content.substring(
                expression.index + expression.outie.length + offset,
            )
        offset += expressionResult.length - expression.outie.length
    }
    return content
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
        return await readFile(path, 'utf-8')
    }

    throw new Error(`unsupported expression: ${expression}`)
}
