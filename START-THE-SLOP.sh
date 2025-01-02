#!/bin/bash

# Build the Docker image
echo "🏗️ Building Docker image. Please wait..."
docker build -t slopify .

# Run the container
echo "🚀 Starting container..."
docker run -p 3000:3000 slopify

echo "🎉 Slopify is running on http://localhost:3000"
