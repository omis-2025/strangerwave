#!/bin/bash

# StrangerWave Acquisition Documents PDF Generator
# This script converts the markdown acquisition documents to PDF files

echo "Generating StrangerWave Acquisition Documents PDFs..."

# Check if pandoc is installed
if ! command -v pandoc &> /dev/null; then
    echo "Error: This script requires pandoc to be installed."
    echo "Please install pandoc with: apt-get install pandoc"
    exit 1
fi

# Files to convert
DOCUMENTS=(
    "executive-summary-for-acquirers:StrangerWave_Executive_Summary"
    "financial-projections:StrangerWave_Financial_Projections"
    "competitor-analysis:StrangerWave_Competitor_Analysis"
    "technical-architecture:StrangerWave_Technical_Architecture"
    "growth-strategy-and-roadmap:StrangerWave_Growth_Strategy_and_Roadmap"
)

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

# Process each document
for DOC in "${DOCUMENTS[@]}"; do
    # Split the string into source and output names
    SOURCE=${DOC%%:*}
    OUTPUT=${DOC#*:}
    
    # Check if source file exists
    if [ ! -f "docs/${SOURCE}.md" ]; then
        echo "Warning: docs/${SOURCE}.md not found! Skipping..."
        continue
    fi
    
    # Generate the PDF
    echo "Converting docs/${SOURCE}.md to ${OUTPUT}.pdf..."
    pandoc "docs/${SOURCE}.md" -o "${OUTPUT}.pdf" --metadata title="${OUTPUT}"
    
    # Check if conversion was successful
    if [ -f "${OUTPUT}.pdf" ]; then
        echo "Success! PDF created: ${OUTPUT}.pdf"
    else
        echo "Error: PDF creation failed for ${SOURCE}!"
    fi
done

# Clean up
rm temp-style.css

echo "Done."