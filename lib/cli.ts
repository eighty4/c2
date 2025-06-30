export type ParsedArgs =
    | { help: true }
    | {
          help?: false
          base64?: boolean
          httpPort?: number
          userDataDir: string
      }

const SCRIPT_SUFFIXES = Object.freeze(['/c2', '/lib_js/bin.js', '/lib/bin.ts'])

export function parseArgs(input?: Array<string>): ParsedArgs {
    if (!input) {
        input = process.argv
    }
    let parsing: Array<string> = [...input]
    let shifted: string | undefined
    let found_cli: boolean = false
    while ((shifted = parsing.shift())) {
        if (SCRIPT_SUFFIXES.some(suffix => shifted!.endsWith(suffix))) {
            found_cli = true
            break
        }
    }
    if (!found_cli) {
        throw new Error(
            `unexpected program installation\nplease report at https://github.com/eighty4/c2/issues/new and include:\n\n${JSON.stringify(input, null, 4)}`,
        )
    }
    let base64 = false
    let httpPort: number | undefined
    let userData: Array<string> = []
    let expectHttpPort = false
    for (const arg of parsing) {
        if (expectHttpPort) {
            expectHttpPort = false
            httpPort = parseInt(arg, 10)
            if (isNaN(httpPort)) {
                throw new Error(`--http ${arg} is not a valid http port`)
            }
        } else if (arg === '-h' || arg === '--help') {
            return { help: true }
        } else if (arg === '--base64') {
            base64 = true
        } else if (arg === '--http') {
            expectHttpPort = true
        } else {
            userData.push(arg)
        }
    }
    if (expectHttpPort) {
        throw new Error('--http did not include a PORT')
    }
    switch (userData.length) {
        case 1:
            const userDataDir = userData[0]
            if (typeof httpPort !== 'undefined') {
                return { httpPort, userDataDir }
            } else {
                return { base64, userDataDir }
            }
        default:
            throw new Error()
    }
}
