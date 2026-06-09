#!/bin/bash
# Find and delete macOS metadata (AppleDouble) files starting with ._
echo "Cleaning macOS metadata (._*) files from the project..."
find . -name "._*" -depth -exec rm -rf {} +
echo "Clean complete!"
