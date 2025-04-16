#!/bin/bash

# StrangerWave Pitch Deck PDF Generator
# This script converts the markdown pitch deck to a PDF file

echo "Generating StrangerWave Pitch Deck PDF..."

# Check if pandoc is installed
if ! command -v pandoc &> /dev/null; then
    echo "Error: This script requires pandoc to be installed."
    echo "Please install pandoc with: apt-get install pandoc"
    exit 1
fi

# Ensure the pitch deck markdown exists
if [ ! -f "docs/pitch-deck.md" ]; then
    echo "Error: docs/pitch-deck.md not found!"
    exit 1
fi

# Create a temporary CSS file for styling
cat > temp-style.css << EOF
body {
    font-family: 'Arial', sans-serif;
    color: #333;
    max-width: 800px;
    margin: 0 auto;
}
h1, h2, h3 {
    color: #3366cc;
}
h1 {
    font-size: 28px;
    text-align: center;
    margin-top: 40px;
}
h2 {
    font-size: 24px;
    border-bottom: 1px solid #ddd;
    padding-bottom: 5px;
}
table {
    border-collapse: collapse;
    width: 100%;
    margin: 20px 0;
}
table, th, td {
    border: 1px solid #ddd;
}
th, td {
    padding: 10px;
    text-align: left;
}
th {
    background-color: #f2f2f2;
}
hr {
    border: 0;
    height: 1px;
    background: #ddd;
    margin: 40px 0;
}
EOF

# Generate the PDF
echo "Converting Markdown to PDF..."
pandoc docs/pitch-deck.md -o strangerwave-pitch-deck.pdf --pdf-engine=wkhtmltopdf --css=temp-style.css

# Clean up
rm temp-style.css

# Check if conversion was successful
if [ -f "strangerwave-pitch-deck.pdf" ]; then
    echo "Success! PDF created: strangerwave-pitch-deck.pdf"
else
    echo "Error: PDF creation failed!"
    exit 1
fi

echo "Done."