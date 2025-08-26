import assert from 'node:assert/strict'
import { afterEach, beforeEach, test } from 'node:test'
import { parseArgs } from './cli.ts'

test('parseArgs with ts entrypoint', () => {
    assert.deepEqual(
        parseArgs([
            '/Users/who/.bun/bin/bun',
            '/Users/who/user-data/lib/bin.ts',
            'user_data_dir',
        ]),
        {
            base64: false,
            userDataDir: 'user_data_dir',
        },
    )
})

test('parseArgs with executable entrypoint', () => {
    assert.deepEqual(
        parseArgs([
            '/Users/who/.nvm/versions/node/v23.7.0/bin/node',
            '/Users/who/.nvm/versions/node/v23.7.0/bin/c2',
            'user_data_dir',
        ]),
        {
            base64: false,
            userDataDir: 'user_data_dir',
        },
    )
})

test('parseArgs with js entrypoint', () => {
    assert.deepEqual(
        parseArgs([
            '/Users/who/.nvm/versions/node/v23.7.0/bin/node',
            '/Users/who/user-data/lib_js/bin.js',
            'user_data_dir',
        ]),
        {
            base64: false,
            userDataDir: 'user_data_dir',
        },
    )
})

test('parseArgs with unexepected argv', () => {
    assert.throws(
        () => parseArgs(['tippity', 'doo', 'da']),
        new Error(
            'unexpected program installation\nplease report at https://github.com/eighty4/c2/issues/new and include:\n\n[\n    \"tippity\",\n    \"doo\",\n    \"da\"\n]',
        ),
    )
})

test('parseArgs errors without USER_DATA_DIR', () => {
    assert.throws(
        () =>
            parseArgs([
                '/Users/who/.bun/bin/bun',
                '/Users/who/user-data/lib/bin.ts',
            ]),
        new Error(''),
    )
})

test('parseArgs errors with extra USER_DATA_DIR', () => {
    assert.throws(
        () =>
            parseArgs([
                '/Users/who/.bun/bin/bun',
                '/Users/who/user-data/lib/bin.ts',
                'user_data_dir',
                'some_other_arg',
            ]),
        new Error(''),
    )
})

test('parseArgs with --base64', () => {
    assert.deepEqual(
        parseArgs([
            '/Users/who/.bun/bin/bun',
            '/Users/who/user-data/lib/bin.ts',
            '--base64',
            'user_data_dir',
        ]),
        {
            base64: true,
            userDataDir: 'user_data_dir',
        },
    )
})

test('parseArgs with --http PORT', () => {
    assert.deepEqual(
        parseArgs([
            '/Users/who/.bun/bin/bun',
            '/Users/who/user-data/lib/bin.ts',
            '--http',
            '6666',
            'user_data_dir',
        ]),
        { httpPort: 6666, userDataDir: 'user_data_dir' },
    )
})

test('parseArgs with --http bunk', () => {
    assert.throws(
        () =>
            parseArgs([
                '/Users/who/.bun/bin/bun',
                '/Users/who/user-data/lib/bin.ts',
                '--http',
                'bunk',
                'user_data_dir',
            ]),
        new Error('--http bunk is not a valid http port'),
    )
})

test('parseArgs with --http without PORT', () => {
    assert.throws(
        () =>
            parseArgs([
                '/Users/who/.bun/bin/bun',
                '/Users/who/user-data/lib/bin.ts',
                'user_data_dir',
                '--http',
            ]),
        new Error('--http did not include a PORT'),
    )
})
