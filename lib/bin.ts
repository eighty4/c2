#!/usr/bin/env node

import { stat } from 'node:fs/promises'
import { buildUserData } from './build.ts'
import { parseArgs, type ParsedArgs } from './cli.ts'
import { startUserDataHttp } from './http.ts'

let args: ParsedArgs | undefined
try {
    args = parseArgs()
} catch (e: any) {
    errorExit(e.message)
}

if (!args || args.help) {
    const optional = (s: string) => `\u001b[90m${s}\u001b[0m`
    const required = (s: string) => `\u001b[1m${s}\u001b[0m`
    console.error(
        `c2 ${optional('[[--base64] | [--http PORT]]')} ${required('USER_DATA_DIR')}`,
    )
    process.exit(1)
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
    console.error(errorText('error:'), msg)
    process.exit(1)
}

function errorText(s: string): string {
    return `\u001b[1;31m${s}\u001b[0m`
}

async function doesDirExist(p: string): Promise<boolean> {
    try {
        return (await stat(p)).isDirectory()
    } catch (ignore) {
        return false
    }
}
