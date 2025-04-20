export type ParsedArgs =
    | { help: true }
    | {
          help?: false
          base64?: boolean
          httpPort?: number
          userDataDir: string
      }

export function parseArgs(args?: Array<string>): ParsedArgs {
    if (!args) {
        args = process.argv
    }
    args = [...args]
    let shifted
    while ((shifted = args.shift())) {
        if (
            shifted.endsWith('/lib_js/c2.bin.js') ||
            shifted.endsWith('/lib/c2.bin.ts')
        ) {
            break
        }
    }
    let base64 = false
    let httpPort: number | undefined
    let userData: Array<string> = []
    let expectHttpPort = false
    for (const arg of args) {
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
