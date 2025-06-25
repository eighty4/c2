# Changelog

## [Unreleased]

### Fixed

- TypeScript type declarations were broken by pointing to a
  directory instead of the export entrypoint `.d.ts` file

## [v0.0.2] - 2025-06-07

### Added

- Serve user data over http with `c2 DIR --http PORT`
- Encode user data in base 64 with `c2 DIR --base64`
- Evaluate env() and file() expressions in user data
- Merge multiple user data into a MIME multipart message

[Unreleased]: https://github.com/eighty4/c2/compare/v0.0.2...HEAD
[v0.0.2]: https://github.com/eighty4/c2/releases/tag/v0.0.2
