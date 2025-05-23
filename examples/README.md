# c2 examples

## Cloud VMs

The TypeScript examples will require `bun i` or `pnpm i` before running.

### aws_ec2.ts

Set up AWS credentials on your local environment and run `bun aws_ec2.ts`.

### digitalocean.ts

Create a Linode account and run with a `DIGITALOCEAN_TOKEN` env var:

```
DIGITALOCEAN_TOKEN=XYZ bun digitalocean.ts
```

### linode.ts

Create a Linode account and run with a `LINODE_TOKEN` env var:

```
LINODE_TOKEN=XYZ bun linode.ts
```

## Local Ubuntu with QEMU

These QEMU scripts use `c2` to launch QEMU with the `cloud_init` directory's user data.
They explicitly use `qemu-system-x86_64` and can be tweaked for your OS architecture.

Exit the QEMU VM with ctrl + a, release ctrl, press x.

### http_cloud_init.sh

Ubuntu inits with an HTTP datasource to `c2` running in the background with
the command `c2 cloud-init --http 8202`.

### iso_cloud_init.sh

`genisoimage` or `hdiutil` make an ISO medium of the `cloud-init` built with `c2 cloud-init`.

