#!/bin/bash

# Install FFmpeg
apt-get update
apt-get install -y ffmpeg

# Run the default build command
npm run build