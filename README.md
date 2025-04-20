# Cloud Config

Blow up your `cloud-init` developer workflows!

## Getting started

```shell
npm i -g @eighty4/c2
c2 -h
```

(tests use `bun:test` so [install Bun](https://bun.sh/docs/installation) for contributing!)

## Using the CLI program

```
c2 ./cloud_init_dir

# base64 encode your user data
c2 --base64 ./cloud_init_dir
```

## Using the JS API

```
import { buildUserData } from '@eighty4/c2'

const userData: string = await buildUserData('./cloud_init_dir')
```

## Cloud Config data dir

Multiple user data are ordered by filenames and `01_` numbered prefixes help declare execution order.

```
ls ./cloud_init_dir
01_upgrades.yml
02_security.yml
03_services.sh
```

Shell scripts are supported as `x-shellscript` and YAML is included as `cloud-config` MIME types.

## Evaluating expressions in user data

Scripts and YAML support two template functions that can be used in expressions.

### env()

Replaces expression with content of a local environment variable.

```bash
#!/bin/sh

ENV_VAR="${{ env('LOCAL_ENV_VAR') }}"
```

### file()

Looks up a file from your local filesystem and replaces the expression with its content.

```yaml
#cloud-config

users:
    - name: devops-baller
      ssh_authorized_keys:
          - ${{ file('~/.ssh/my_ssh_key.pub') }}
```

Relative, absolute and `~/` paths are supported.

## Contributing

I use `c2` for initializing Debian cloud instances and locally test with QEMU and Ubuntu.

Feedback on your use cases and worfklows is greatly appreciated!
