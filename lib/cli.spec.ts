import { expect, test } from 'bun:test'
import { parseArgs } from '#c2/cli'

test('parseArgs with ts entrypoint', () => {
    expect(
        parseArgs([
            '/Users/who/.bun/bin/bun',
            '/Users/who/user-data/lib/c2.bin.ts',
            'user_data_dir',
        ]),
    ).toStrictEqual({
        base64: false,
        userDataDir: 'user_data_dir',
    })
})

test('parseArgs with executable entrypoint', () => {
    expect(
        parseArgs([
            '/Users/who/.nvm/versions/node/v23.7.0/bin/node',
            '/Users/who/.nvm/versions/node/v23.7.0/bin/c2',
            'user_data_dir',
        ]),
    ).toStrictEqual({
        base64: false,
        userDataDir: 'user_data_dir',
    })
})

test('parseArgs with js entrypoint', () => {
    expect(
        parseArgs([
            '/Users/who/.nvm/versions/node/v23.7.0/bin/node',
            '/Users/who/user-data/lib_js/c2.bin.js',
            'user_data_dir',
        ]),
    ).toStrictEqual({
        base64: false,
        userDataDir: 'user_data_dir',
    })
})

test('parseArgs with unexepected argv', () => {
    expect(() => parseArgs(['tippity', 'doo', 'da'])).toThrow(
        'unexpected program installation\nplease report at https://github.com/eighty4/c2/issues/new and include:\n\n[\n    \"tippity\",\n    \"doo\",\n    \"da\"\n]',
    )
})

test('parseArgs errors without USER_DATA_DIR', () => {
    expect(() =>
        parseArgs([
            '/Users/who/.bun/bin/bun',
            '/Users/who/user-data/lib/c2.bin.ts',
        ]),
    ).toThrow()
})

test('parseArgs errors with extra USER_DATA_DIR', () => {
    expect(() =>
        parseArgs([
            '/Users/who/.bun/bin/bun',
            '/Users/who/user-data/lib/c2.bin.ts',
            'user_data_dir',
            'some_other_arg',
        ]),
    ).toThrow()
})

test('parseArgs with --base64', () => {
    expect(
        parseArgs([
            '/Users/who/.bun/bin/bun',
            '/Users/who/user-data/lib/c2.bin.ts',
            '--base64',
            'user_data_dir',
        ]),
    ).toStrictEqual({
        base64: true,
        userDataDir: 'user_data_dir',
    })
})

test('parseArgs with --http PORT', () => {
    expect(
        parseArgs([
            '/Users/who/.bun/bin/bun',
            '/Users/who/user-data/lib/c2.bin.ts',
            '--http',
            '6666',
            'user_data_dir',
        ]),
    ).toStrictEqual({ httpPort: 6666, userDataDir: 'user_data_dir' })
})

test('parseArgs with --http bunk', () => {
    expect(() =>
        parseArgs([
            '/Users/who/.bun/bin/bun',
            '/Users/who/user-data/lib/c2.bin.ts',
            '--http',
            'bunk',
            'user_data_dir',
        ]),
    ).toThrow('--http bunk is not a valid http port')
})

test('parseArgs with --http without PORT', () => {
    expect(() =>
        parseArgs([
            '/Users/who/.bun/bin/bun',
            '/Users/who/user-data/lib/c2.bin.ts',
            'user_data_dir',
            '--http',
        ]),
    ).toThrow('--http did not include a PORT')
})
