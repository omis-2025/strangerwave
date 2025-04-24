import fs from 'fs';
import path from 'path';
import { marked } from 'marked';

// Function to convert markdown to HTML
function convertMarkdownToHTML(markdownFilePath, outputPath) {
  try {
    // Read the markdown file
    const markdown = fs.readFileSync(markdownFilePath, 'utf8');
    
    // Convert markdown to HTML
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>StrangerWave Documentation</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
          }
          h1, h2, h3, h4 {
            color: #333;
            margin-top: 1.5em;
          }
          h1 {
            text-align: center;
            font-size: 2.2em;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
          }
          h2 {
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
          }
          table {
            border-collapse: collapse;
            width: 100%;
            margin: 1em 0;
          }
          th, td {
            text-align: left;
            padding: 8px;
            border: 1px solid #ddd;
          }
          th {
            background-color: #f2f2f2;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          code {
            background-color: #f5f5f5;
            padding: 2px 4px;
            border-radius: 4px;
            font-family: monospace;
          }
          pre {
            background-color: #f5f5f5;
            padding: 10px;
            border-radius: 4px;
            overflow-x: auto;
          }
          .print-instruction {
            background-color: #f8f9fa;
            border: 1px solid #ddd;
            padding: 10px;
            margin: 20px 0;
            border-radius: 4px;
          }
          @media print {
            .print-instruction {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-instruction">
          <p><strong>To convert to PDF:</strong> Use your browser's print function (Ctrl+P or Cmd+P) and select "Save as PDF".</p>
        </div>
        ${marked.parse(markdown)}
      </body>
      </html>
    `;
    
    // Write the HTML file
    fs.writeFileSync(outputPath, html);
    console.log(`Successfully converted ${markdownFilePath} to ${outputPath}`);
    return true;
  } catch (error) {
    console.error(`Error converting ${markdownFilePath}:`, error);
    return false;
  }
}

// Files to convert
const filesToConvert = [
  {
    src: 'docs/executive-summary-for-acquirers.md',
    dest: 'executive-summary.html'
  },
  {
    src: 'docs/financial-projections.md',
    dest: 'financial-projections.html'
  },
  {
    src: 'docs/competitor-analysis.md',
    dest: 'competitor-analysis.html'
  },
  {
    src: 'docs/technical-architecture.md',
    dest: 'technical-architecture.html'
  },
  {
    src: 'docs/growth-strategy-and-roadmap.md',
    dest: 'growth-strategy-and-roadmap.html'
  }
];

// Main function
const main = () => {
  
  console.log('Converting markdown files to HTML...');
  let allSuccessful = true;
  
  filesToConvert.forEach(file => {
    const success = convertMarkdownToHTML(file.src, file.dest);
    if (!success) {
      allSuccessful = false;
    }
  });
  
  if (allSuccessful) {
    console.log('\nAll files converted successfully!');
    console.log('\nTo convert to PDF:');
    console.log('1. Open each HTML file in your browser');
    console.log('2. Use your browser\'s print function (Ctrl+P or Cmd+P)');
    console.log('3. Select "Save as PDF" as the destination');
    console.log('4. Click "Save" or "Print"');
  } else {
    console.log('\nSome files failed to convert. Please check the errors above.');
  }
};

main();