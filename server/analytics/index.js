import express from 'express';
import analyticsApi from './api/analyticsApi';
import partnerApi from './api/partnerApi';
import dataExportApi from './api/dataExportApi';

const router = express.Router();

// Register analytics API routes
router.use('/analytics', analyticsApi);
router.use('/partner', partnerApi);
router.use('/export', dataExportApi);

export default router;