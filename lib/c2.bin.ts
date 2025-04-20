#!/usr/bin/env node

import { buildUserData } from '#c2/build'
import { parseArgs, type ParsedArgs } from '#c2/cli'
import { doesDirExist } from '#c2/fs'
import { startUserDataHttp } from '#c2/http'

let args: ParsedArgs | undefined
try {
    args = parseArgs()
} catch (e: any) {
    if (e.message) {
        console.error(e.message)
    }
}

if (!args || args.help) {
    const optional = (s: string) => `\u001b[90m${s}\u001b[0m`
    const required = (s: string) => `\u001b[1m${s}\u001b[0m`
    errorExit(
        `c2 ${optional('[[--base64] | [--http PORT]]')} ${required('USER_DATA_DIR')}`,
    )
}

if (!(await doesDirExist(args.userDataDir))) {
    errorExit(`${args.userDataDir} directory does not exist`)
}

let work: () => Promise<void>

if (typeof args.httpPort !== 'undefined') {
    work = async () => {
        startUserDataHttp(args.httpPort!, args.userDataDir)
    }
} else {
    work = async () => {
        const userData = await buildUserData(args.userDataDir)
        console.log(args.base64 ? btoa(userData) : userData)
    }
}

try {
    await work()
} catch (e: any) {
    errorExit(e.message)
}

function errorExit(msg: string): never {
    console.error(msg)
    process.exit(1)
}
