import { expect, test } from 'bun:test'
import {
    checkUnreleased,
    getRolloverResult,
    getVersionContent,
} from './changelog.ts'

test('getRolloverResult adds first tag', () => {
    const tag = 'v0.0.1'
    const s = `
## Unreleased

- did some stuff

[Unreleased]: https://github.com/eighty4/c2/commits/main
`

    expect(getRolloverResult(s, tag)).toBe(`
## Unreleased

- ???

## v0.0.1 - ${new Date().toISOString().substring(0, 10)}

- did some stuff

[Unreleased]: https://github.com/eighty4/c2/compare/v0.0.1...HEAD
[v0.0.1]: https://github.com/eighty4/c2/releases/tag/v0.0.1
`)
})

test('getRolloverResult adds another tag', () => {
    const tag = 'v0.0.2'
    const s = `
## Unreleased

- did more stuff

## v0.0.1 - ${new Date().toISOString().substring(0, 10)}

- did some stuff

[Unreleased]: https://github.com/eighty4/c2/compare/v0.0.1...HEAD
[v0.0.1]: https://github.com/eighty4/c2/releases/tag/v0.0.1
`

    expect(getRolloverResult(s, tag)).toBe(`
## Unreleased

- ???

## v0.0.2 - ${new Date().toISOString().substring(0, 10)}

- did more stuff

## v0.0.1 - ${new Date().toISOString().substring(0, 10)}

- did some stuff

[Unreleased]: https://github.com/eighty4/c2/compare/v0.0.2...HEAD
[v0.0.2]: https://github.com/eighty4/c2/compare/v0.0.1...v0.0.2
[v0.0.1]: https://github.com/eighty4/c2/releases/tag/v0.0.1
`)
})

test('getRolloverResult throws for bogus semver tag', () => {
    expect(() => getRolloverResult('', 'a.b.c')).toThrow()
})

test('getVersionContent throws error when empty', () => {
    expect(() => getVersionContent('## v0.0.3\n\n\n', 'Unreleased')).toThrow()
})

test('getVersionContent throws error when ??? teaser', () => {
    expect(() =>
        getVersionContent('## v0.0.2\n- ???\n\n', 'Unreleased'),
    ).toThrow()
})

test('getVersionContent throws for bogus semver tag', () => {
    expect(() => getVersionContent('25.6.4')).toThrow()
})

test('getVersionContent gets Unreleased notes until prev version', () => {
    const s = `
## Unreleased

- big feature
- a bug

## v0.0.1

- mo' bugs
- mo' problems

[Unreleased]: ...
`
    expect(getVersionContent(s, 'Unreleased')).toBe('- big feature\n- a bug')
})

test('getVersionContent gets Unreleased without a prev version', () => {
    const s = `
## Unreleased

- big feature
- a bug

[Unreleased]: https://github.com/eighty4/c2/commits/main
`
    expect(getVersionContent(s, 'Unreleased')).toBe('- big feature\n- a bug')
})

test('getVersionContent gets Unreleased notes until EOF', () => {
    const s = `
## Unreleased

- big feature
- a bug
`
    expect(getVersionContent(s, 'Unreleased')).toBe('- big feature\n- a bug')
})

test('getVersionContent gets version without date', () => {
    const s = `
## Unreleased

- ???

## v0.0.1 

- big feature
- a bug

[Unreleased]: ...
`
    expect(getVersionContent(s, 'v0.0.1')).toBe('- big feature\n- a bug')
})

test('getVersionContent gets version with date', () => {
    const s = `
## Unreleased

- ???

## v0.0.1 - 2025-04-21 

- big feature
- a bug

[Unreleased]: ...
`
    expect(getVersionContent(s, 'v0.0.1')).toBe('- big feature\n- a bug')
})

test('getVersionContent returns empty string when Unreleased teaser present', () => {
    const s = `
## Unreleased

- ???

## v0.0.1 - 2025-04-21 

- big feature
- a bug

[Unreleased]: ...
`
    expect(getVersionContent(s, 'Unreleased')).toBe('')
})

test('getVersionContent returns empty string when Unreleased empty', () => {
    const s = `
## Unreleased

## v0.0.1 - 2025-04-21 

- big feature
- a bug

[Unreleased]: ...
`
    expect(getVersionContent(s, 'Unreleased')).toBe('')
})

test('getVersionContent throws when version is not present', () => {
    const s = `
## Unreleased

- ???

## v0.0.1 - 2025-04-21 

- big feature
- a bug

[Unreleased]: ...
`
    expect(() => getVersionContent(s, 'v0.0.2')).toThrow()
})

test('checkUnreleased returns true', () => {
    expect(
        checkUnreleased(`
## Unreleased

- Area 51 photos

[Unreleased]: ...
`),
    ).toBe(true)
})

test('checkUnreleased returns false', () => {
    expect(
        checkUnreleased(`
## Unreleased

[Unreleased]: ...
`),
    ).toBe(false)
})

test('checkUnreleased returns false ??? teaser', () => {
    expect(
        checkUnreleased(`
## Unreleased
- ???
[Unreleased]: ...
`),
    ).toBe(false)
})
