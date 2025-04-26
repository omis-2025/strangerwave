import { Router } from 'express';
import * as path from 'path';
import * as fs from 'fs';

const router = Router();

// Direct file download route
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
    res.status(404).send('Deployment package file not found');
  }
});

export default router;