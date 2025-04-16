#!/bin/bash

# StrangerWave Documentation Bundler
# This script creates a ZIP file containing all documentation and assets needed for handover

echo "Creating StrangerWave documentation bundle..."

# Create temp directory for the bundle
mkdir -p temp_bundle
mkdir -p temp_bundle/docs
mkdir -p temp_bundle/assets
mkdir -p temp_bundle/config

# Copy documentation files
cp -r docs/* temp_bundle/docs/

# Copy environment sample
cp .env.sample temp_bundle/config/

# Copy key assets (logo, etc.)
cp -r public/assets/* temp_bundle/assets/ 2>/dev/null || echo "No assets folder found, skipping..."

# Copy README and LICENSE
cp README.md temp_bundle/ 2>/dev/null || echo "No README.md found, skipping..."
cp LICENSE temp_bundle/ 2>/dev/null || echo "No LICENSE found, skipping..."

# Create the ZIP file
zip -r strangerwave-documentation.zip temp_bundle

# Clean up
rm -rf temp_bundle

echo "Documentation bundle created: strangerwave-documentation.zip"
echo "This file contains all documentation and assets needed for handover."