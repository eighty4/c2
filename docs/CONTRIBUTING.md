Unit tests use `bun:test` so [install Bun](https://bun.sh/docs/installation) before contributing!

The `ci_verify.sh` script will perform all checks required by a PR and uses `bun test` and the `typecheck` and `fmtcheck` package.json scripts.

The script has flags to create symlinks to itself in `.git/hooks`:

```bash
./ci_verify.sh --on-git-commit
./ci_verify.sh --on-git-push
```

Type checking with `bun typecheck` will run `tsc`.

Formatting is provided by `prettier`.

```bash
# install prettier
npm i -g prettier

# check if project is correctly formatted
prettier --check .

# formate project and write to disk
prettier --write .
```

Linting is subjectively left to personal taste after `prettier` and `tsc` run.

Code should be written for Bun and Node compatibility, with the exception of unit tests.

Document changes made by your PR in `CHANGELOG.md` under the `Unreleased` section.
