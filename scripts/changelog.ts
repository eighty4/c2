if (Bun.main === import.meta.path) {
    let args = [...Bun.argv]
    while (!args.shift()?.endsWith(import.meta.file)) {}

    type TaskType = 'check' | 'get' | 'rollover'

    type Task =
        | { type: 'check' }
        | { type: 'get'; version: string }
        | { type: 'rollover' }

    let task: Task
    let changelogPath: string

    function expectVersionNext(): string | never {
        const version = args.shift()
        if (!version || version.startsWith('--')) {
            printHelp('missing version')
        }
        return version
    }

    switch (args.shift()) {
        case 'check':
            task = { type: 'check' }
            break
        case 'get':
            task = { type: 'get', version: expectVersionNext() }
            break
        case 'rollover':
            task = { type: 'rollover', version: expectVersionNext() }
            break
        default:
            printHelp()
    }

    function printHelp(error?: string): never {
        if (error) console.error(error)
        console.log(
            'bun scripts/changelog.ts check [--changelog-file CHANGELOG_FILE]',
        )
        console.log(
            'bun scripts/changelog.ts get VERSION [--changelog-file CHANGELOG_FILE]',
        )
        console.log(
            'bun scripts/changelog.ts rollover NEXT_VERSION [--changelog-file CHANGELOG_FILE]',
        )
        process.exit(1)
    }

    while (args.length) {
        switch (args.shift()) {
            case '--changelog-file':
                changelogPath = args.shift()
                if (!changelogPath || changelogPath.startsWith('--')) {
                    throw new Error('--changelog-file ?')
                }
                break
            default:
                throw new Error()
        }
    }

    const changelogFile = Bun.file(changelogPath || 'CHANGELOG.md')
    if (!(await changelogFile.exists())) {
        errorExit((changelogPath || 'CHANGELOG.md') + ' does not exist')
    }
    const changelogContent = await changelogFile.text()

    if (task.type === 'check') {
        process.exit(checkUnreleased() ? 0 : 1)
    } else if (task.type === 'get') {
        try {
            console.log(getVersionContent(changelogContent, task.version))
        } catch (e) {
            errorExit(e.message)
        }
    } else if (task.type === 'rollover') {
        try {
            const result = getRolloverResult(changelogContent, task.version)
            await Bun.write(changelogFile, result)
        } catch (e) {
            errorExit(e.message)
        }
    }

    function errorExit(error?: string): never {
        if (error) console.error(error)
        process.exit(1)
    }
}

function isSemverVersion(v: string): boolean {
    return /v\d+\.\d+\.\d+/.test(v)
}

export function checkUnreleased(changelogContent: string): boolean {
    const notes = /## Unreleased(?<notes>[\s\S]+?)(?=\s+[#\[])/
        .exec(changelogContent)
        ?.groups?.notes?.trim()
    return !!notes.length && notes !== '- ???'
}

export function getVersionContent(
    changelogContent: string,
    version: string,
): string {
    if (version !== 'Unreleased' && !isSemverVersion(version)) {
        throw new Error(
            version +
                ' is not a `vX.X.X` format semver or the `Unreleased` label',
        )
    }
    const versionStartStr = '## ' + version
    const versionStart = changelogContent.indexOf(versionStartStr)
    if (versionStart === -1) {
        throw new Error(version + ' not found in changelog file')
    }
    const notesStart = changelogContent.indexOf('\n', versionStart)
    let notesEnd = changelogContent.indexOf('#', notesStart)
    if (notesEnd === -1) {
        notesEnd = changelogContent.indexOf('[', notesStart)
    }
    if (notesEnd === -1) {
        notesEnd = changelogContent.length
    }
    const notes = changelogContent.substring(notesStart, notesEnd).trim()
    if (notes.length === 0 || notes === '- ???') {
        if (version === 'Unreleased') {
            return ''
        } else {
            throw new Error('nothing found for ' + version)
        }
    } else {
        return notes
    }
}

export function getRolloverResult(
    changelogContent: string,
    version: string,
): string {
    if (!isSemverVersion(version)) {
        throw new Error(version + ' is not a `vX.X.X` format semver')
    }
    const unreleasedLinkRegex = /^.*\[Unreleased\]:\s+?(?<url>.*)$/m
    const githubUrlRegex =
        /^https:\/\/github\.com\/(?<owner>\S+?)\/(?<name>\S+?)\/(?<path>.*)$/
    const unreleasedLink =
        changelogContent.match(unreleasedLinkRegex)?.groups?.url
    if (!unreleasedLink) {
        throw new Error()
    }
    const unreleasedLinkGithubUrlMatch = unreleasedLink.match(githubUrlRegex)
    if (!unreleasedLinkGithubUrlMatch?.groups) {
        throw new Error()
    }
    const {
        owner,
        name,
        path: unreleasedGitHubUrlPath,
    } = unreleasedLinkGithubUrlMatch.groups

    let result = changelogContent.replace(
        /## Unreleased/,
        '## Unreleased\n\n- ???\n\n## ' +
            version +
            ' - ' +
            new Date().toISOString().substring(0, 10),
    )

    if (
        unreleasedGitHubUrlPath.startsWith('compare/') &&
        unreleasedGitHubUrlPath.endsWith('...HEAD')
    ) {
        return result
            .replace(/\.\.\.HEAD/, `...${version}`)
            .replace(
                /\[Unreleased\]/,
                `[Unreleased]: https://github.com/${owner}/${name}/compare/${version}...HEAD\n[${version}]`,
            )
    } else {
        const next = `[Unreleased]: https://github.com/${owner}/${name}/compare/${version}...HEAD`
        const previous = `[${version}]: https://github.com/${owner}/${name}/releases/tag/${version}`
        return result.replace(unreleasedLinkRegex, next + '\n' + previous)
    }
}
