#!/bin/bash
set -e

if ! command -v "qemu-system-x86_64" &> /dev/null; then
  echo "install QEMU to run this script"
  exit 1
fi

_ubuntu_img="noble-server-cloudimg-amd64.img"

_build_dir="$(dirname "$0")/.qemu"
mkdir -p "$_build_dir/images"

if ! stat "$_build_dir/images/$_ubuntu_img" &> /dev/null; then
  echo "downloading $_ubuntu_img"
  _ubuntu_url="https://cloud-images.ubuntu.com/noble/current/$_ubuntu_img"
  curl -L "$_ubuntu_url" -o "$_build_dir/images/$_ubuntu_img"
fi

rm -f "$_build_dir/$_ubuntu_img"
cp "$_build_dir/images/$_ubuntu_img" "$_build_dir/$_ubuntu_img"

_config_dir="$_build_dir/config"
mkdir -p "$_config_dir"
touch "$_config_dir/meta-data"
touch "$_config_dir/vendor-data"

if command -v "c2" &> /dev/null; then
  c2 cloud_init > .qemu/config/user-data
else
  npx -p @eighty4/c2 c2 cloud_init > .qemu/config/user-data
fi

rm -f "$_build_dir/cloud_init.iso"
if command -v "genisoimage" &> /dev/null; then
  genisoimage \
    -output "$_build_dir/cloud_init.iso" \
    -volid cidata -rational-rock -joliet \
    "$_config_dir/user-data" "$_config_dir/meta-data" "$_config_dir/network-config"
elif command -v "hdiutil"; then
  hdiutil makehybrid \
    -o "$_build_dir/cloud_init.iso" \
    -hfs -joliet -iso -default-volume-name cidata \
    "$_config_dir"
else
  echo "genisoimage or hdiutil is required"
  exit 1
fi

echo
echo "\`c2 cloud_init\` was written to $_config_dir/user-data and $_build_dir/cloud_init.iso"
echo
echo "QEMU will start the Ubuntu image in this shell."
echo
echo "Exit the QEMU VM with ctrl + a, release ctrl, press x."
echo
printf "%s " "Press enter to continue"
read ans

qemu-system-x86_64 \
  -nographic \
  -snapshot \
  -m 1536 \
  -accel hvf \
  -net nic \
  -net user \
  -drive "file=$_build_dir/$_ubuntu_img,index=0,format=qcow2,media=disk" \
  -drive "file=$_build_dir/cloud_init.iso,media=cdrom"
