# c2 examples

The example scripts using `c2` depend on QEMU and explicitly use `qemu-system-x86_64`.

Exit the QEMU VM with ctrl + a, release ctrl, press x.

## HTTP cloud-init user-data

The example folder `examples/cloud-init` will be served to the VM over HTTP
with the command `c2 cloud-init --http 8000`.

## ISO cloud-init user-data

`genisoimage` or `hdiutil` will make an ISO medium of the `cloud-init` built with `c2 cloud-init`.
