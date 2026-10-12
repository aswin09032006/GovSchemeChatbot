import express from 'express';
import { getSchemeImage } from '../services/imageSearchService.js';

const router = express.Router();

router.get('/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const data = await getSchemeImage(query);
    if (!data) {
      return res.status(404).json({ error: 'No image found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error in /api/images/search:', error);
    res.status(500).json({ error: 'Internal server error while searching for image' });
  }
});

export default router;
