# Examples using c2

## Cloud VMs

Many cloud providers support launching VMs from their JavaScript SDKs.
This allows `c2` to integrate directly into your DevOps workflows.

The TypeScript examples will require `bun i` or `pnpm i` in this directory
before running.

### linode.ts

Create a Linode account and run with a `LINODE_TOKEN` env var:

```
LINODE_TOKEN=XYZ bun linode.ts
```

## Local Ubuntu with QEMU

The following section is for Linux and OSX users.

These QEMU scripts use `c2` to launch QEMU with Ubuntu initializing from the
`cloud_init` directory. They explicitly use `qemu-system-x86_64` and can be
tweaked for your OS architecture.

Exit the QEMU VM with ctrl + a, release ctrl, press x.

### qemu_http.sh

Ubuntu inits with an HTTP datasource with `c2` running an HTTP server in the
background using the command `c2 cloud-init --http 8202`.

### qemu_iso.sh

`genisoimage` or `hdiutil` make an ISO medium of the `cloud-init` directory
built with `c2 cloud-init`.

### Using local dev changes

These scripts will run the globally installed `c2` or will run a released
version of `c2` via `npx`. Run either script with `--dev` to build and run
from the cloned repo sources.
