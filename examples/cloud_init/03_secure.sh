#!/bin/bash
set -e

usermod -s /sbin/nologin root

cat <<EOF > /etc/ssh/sshd_config
Port 2805
PermitRootLogin no
MaxAuthTries 2
MaxSessions 2
PasswordAuthentication no
PermitEmptyPasswords no
KbdInteractiveAuthentication no
UsePAM no
AllowAgentForwarding yes
AllowTcpForwarding yes
X11Forwarding no
PrintMotd no
TCPKeepAlive no
UseDNS no
Subsystem	sftp	/usr/lib/openssh/sftp-server
EOF

systemctl restart ssh
