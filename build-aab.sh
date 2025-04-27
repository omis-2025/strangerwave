#!/bin/bash
# Build script for generating Android App Bundle (AAB)

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}StrangerWave AAB Builder${NC}"
echo -e "${YELLOW}=======================${NC}"

# Check if Android directory exists
if [ ! -d "android" ]; then
  echo -e "${RED}Error: android directory not found!${NC}"
  echo "Make sure you're running this script from the project root directory."
  exit 1
fi

# Make gradlew executable
echo -e "\n${GREEN}Making gradlew executable...${NC}"
chmod +x android/gradlew

# Ensure the web assets are built
echo -e "\n${GREEN}Building web assets...${NC}"
npm run build

# Copy and sync the web assets to Android
echo -e "\n${GREEN}Copying web assets to Android...${NC}"
npx cap copy android

echo -e "\n${GREEN}Syncing Android project...${NC}"
npx cap sync android

# Build the AAB
echo -e "\n${GREEN}Building Android App Bundle (AAB)...${NC}"
cd android && ./gradlew bundleRelease

# Check if build was successful
if [ $? -eq 0 ]; then
  AAB_PATH="app/build/outputs/bundle/release/app-release.aab"
  if [ -f "$AAB_PATH" ]; then
    echo -e "\n${GREEN}Build successful!${NC}"
    echo -e "${GREEN}AAB file created at:${NC} android/$AAB_PATH"
    echo -e "\n${YELLOW}You can now upload this file to Google Play Console.${NC}"
  else
    echo -e "\n${RED}Build failed: AAB file was not created.${NC}"
    exit 1
  fi
else
  echo -e "\n${RED}Build failed!${NC}"
  exit 1
fi