#!/bin/bash
# This script is meant to be pasted into the "User Data" section when launching an EC2 instance
# It automatically installs Docker, Docker Compose, and Git on an Amazon Linux 2 or 2023 instance.

# Update system
yum update -y

# Install Git
yum install git -y

# Install Docker
amazon-linux-extras install docker -y || yum install docker -y
service docker start
usermod -a -G docker ec2-user
chkconfig docker on

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

echo "Docker installation complete!"
