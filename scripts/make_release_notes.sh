#!/bin/bash
set -e

_changelog=$(bun scripts/changelog.ts get $CHANGELOG_TAG)

echo "### Release notes"
echo
echo -e "$_changelog"
echo
echo "#### Published to npm"
echo
echo "[@eighty4/c2](https://www.npmjs.com/package/@eighty4/c2/v/$VERSION)"
echo
