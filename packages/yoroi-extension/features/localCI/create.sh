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

# need gedit to quickly edit inside docker
sudo apt-get install gedit
