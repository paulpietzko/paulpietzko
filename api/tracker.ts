import { VercelRequest, VercelResponse } from '@vercel/node';
import { promises as fs } from 'fs';
import path from 'path';

interface ViewData {
  totalViews: number;
  uniqueViews: number;
  visitors: string[];
}

export default async (req: VercelRequest, res: VercelResponse) => {
  const filePath = path.join('/tmp', 'views.json');
  let data: ViewData = {
    totalViews: 0,
    uniqueViews: 0,
    visitors: [],
  };

  try {
    // Read existing data
    try {
      const fileData = await fs.readFile(filePath, 'utf8');
      data = JSON.parse(fileData) as ViewData;
    } catch (err) {
      // File doesn't exist or can't be read; initialize new data
      console.log('No existing data found, initializing.');
    }

    // Get viewer's IP
    const viewer = Array.isArray(req.headers['x-forwarded-for'])
      ? req.headers['x-forwarded-for'][0]
      : (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '';

    if (viewer && !data.visitors.includes(viewer)) {
      data.visitors.push(viewer);
      data.uniqueViews = data.visitors.length;
    }

    data.totalViews += 1;

    // Save updated data
    await fs.writeFile(filePath, JSON.stringify(data));

    // Return a 1x1 pixel GIF
    const img = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==',
      'base64'
    );
    res.setHeader('Content-Type', 'image/gif');
    res.status(200).end(img);
  } catch (error) {
    console.error('Error in tracker function:', error);
    res.status(500).send('Internal Server Error');
  }
};