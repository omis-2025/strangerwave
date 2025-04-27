import { Router } from 'express';
import * as path from 'path';
import * as fs from 'fs';

const router = Router();

// Simple text output route for testing
router.get('/download-test', (req, res) => {
  res.send('Download route is working correctly. Go to /download-package to download the file.');
});

// Main direct download route - simple URL for direct-download.html
router.get('/download', (req, res) => {
  const filePath = path.join(process.cwd(), 'strangerwave-deployment-package.tar.gz');
  
  // Check if file exists
  if (fs.existsSync(filePath)) {
    // Set headers for file download
    res.setHeader('Content-Disposition', 'attachment; filename=strangerwave-deployment-package.tar.gz');
    res.setHeader('Content-Type', 'application/gzip');
    
    // Create read stream and pipe to response
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } else {
    // Try the public directory version as a fallback
    const publicFilePath = path.join(process.cwd(), 'public', 'strangerwave-deployment-package.tar.gz');
    
    if (fs.existsSync(publicFilePath)) {
      // Set headers for file download
      res.setHeader('Content-Disposition', 'attachment; filename=strangerwave-deployment-package.tar.gz');
      res.setHeader('Content-Type', 'application/gzip');
      
      // Create read stream and pipe to response
      const fileStream = fs.createReadStream(publicFilePath);
      fileStream.pipe(res);
    } else {
      res.status(404).send('Deployment package file not found in either location');
    }
  }
});

// Direct file download route (alternative URL)
router.get('/download-package', (req, res) => {
  const filePath = path.join(process.cwd(), 'strangerwave-deployment-package.tar.gz');
  
  // Check if file exists
  if (fs.existsSync(filePath)) {
    // Set headers for file download
    res.setHeader('Content-Disposition', 'attachment; filename=strangerwave-deployment-package.tar.gz');
    res.setHeader('Content-Type', 'application/gzip');
    
    // Create read stream and pipe to response
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } else {
    // Try the public directory version as a fallback
    const publicFilePath = path.join(process.cwd(), 'public', 'strangerwave-deployment-package.tar.gz');
    
    if (fs.existsSync(publicFilePath)) {
      // Set headers for file download
      res.setHeader('Content-Disposition', 'attachment; filename=strangerwave-deployment-package.tar.gz');
      res.setHeader('Content-Type', 'application/gzip');
      
      // Create read stream and pipe to response
      const fileStream = fs.createReadStream(publicFilePath);
      fileStream.pipe(res);
    } else {
      res.status(404).send('Deployment package file not found in either location');
    }
  }
});

// Alternate download route with a different name
router.get('/download-android-package', (req, res) => {
  const filePath = path.join(process.cwd(), 'public', 'strangerwave-deployment-package.tar.gz');
  
  if (fs.existsSync(filePath)) {
    // Set headers for file download
    res.setHeader('Content-Disposition', 'attachment; filename=strangerwave-deployment-package.tar.gz');
    res.setHeader('Content-Type', 'application/gzip');
    
    // Create read stream and pipe to response
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } else {
    res.status(404).send('Deployment package file not found');
  }
});

// Simple download page
router.get('/simple-download', (req, res) => {
  const filePath = path.join(process.cwd(), 'simple-download.html');
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('Simple download page not found');
  }
});

// Direct download page (prettier version)
router.get('/direct', (req, res) => {
  const filePath = path.join(process.cwd(), 'direct-download.html');
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('Direct download page not found');
  }
});

// Track download analytics
router.post('/track-download', async (req, res) => {
  try {
    const { option, timestamp } = req.body;
    
    // Log download event
    console.log(`Download tracked - Option: ${option}, Time: ${timestamp}`);
    
    // Here you would typically save to your analytics database
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking download:', error);
    res.status(500).json({ success: false });
  }
});

export default router;