#!/bin/bash

sudo apt-get update; apt-get clean

# Install x11vnc.
sudo apt-get install -y x11vnc

# Install xvfb.
sudo apt-get install -y xvfb

# Install fluxbox.
sudo apt-get install -y fluxbox

# Install wget.
sudo apt-get install -y wget

# Install wmctrl.
sudo apt-get install -y wmctrl

# replace Firefox w/ Firefox-esr
sudo rm -f /opt/firefox/firefox
sudo rm -f /usr/local/bin/firefox
sudo apt install firefox-esr
sudo ln -s /usr/bin/firefox-esr /usr/local/bin/firefox

# need gedit to quickly edit inside docker
sudo aptget install gedit
