#!/bin/bash
set -e

_port=8202
_dev="false"

for arg in "$@"; do
  if [[ "$arg" == "--dev" ]]; then
    _dev="true"
    break
  fi
done

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
cp "$_build_dir/images/$_ubuntu_img" "$_build_dir/http.$_ubuntu_img"

_config_dir="$_build_dir/config"
mkdir -p "$_config_dir"
touch "$_config_dir/meta-data"
touch "$_config_dir/vendor-data"

if [[ "$_dev" == "true" ]]; then
  (cd .. && pnpm build)
  node ../lib_js/c2.bin.js cloud_init --http $_port > /dev/null 2>&1 &
elif command -v "c2" &> /dev/null; then
  c2 cloud_init --http $_port > /dev/null 2>&1 &
else
  npx --yes -p @eighty4/c2 c2 cloud_init --http $_port > /dev/null 2>&1 &
fi

_http_pid=$!

function cleanup()
{
  kill $_http_pid
}

trap cleanup EXIT

echo
echo "\`c2 cloud_init --http\` is running in background serving the example user data"
echo "    run \`curl http://localhost:$_port/user-data\` to see it"
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
  -drive "file=$_build_dir/http.$_ubuntu_img,index=0,format=qcow2,media=disk" \
  -smbios type=1,serial=ds='nocloud;s=http://10.0.2.2:'$_port'/'
