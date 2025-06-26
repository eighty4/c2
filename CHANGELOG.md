# Changelog

## [Unreleased]

- ???

## [v0.0.3] - 2025-06-26

### Fixed

- TypeScript type declarations were broken because subpath imports
  used internally in package were output in `.d.ts` files and
  `package.json` pointed `types` to a directory instead of the
  export entrypoint `.d.ts` file

## [v0.0.2] - 2025-06-07

### Added

- Serve user data over http with `c2 DIR --http PORT`
- Encode user data in base 64 with `c2 DIR --base64`
- Evaluate env() and file() expressions in user data
- Merge multiple user data into a MIME multipart message

[Unreleased]: https://github.com/eighty4/c2/compare/v0.0.3...HEAD
[v0.0.3]: https://github.com/eighty4/c2/compare/v0.0.2...v0.0.3
[v0.0.2]: https://github.com/eighty4/c2/releases/tag/v0.0.2
