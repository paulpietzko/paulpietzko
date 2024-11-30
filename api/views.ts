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

  // Read existing data
  try {
    const fileData = await fs.readFile(filePath, 'utf8');
    data = JSON.parse(fileData) as ViewData;
  } catch (err) {
    // File doesn't exist; starting fresh
    console.error('Views file not found, starting with defaults.');
  }

  // Determine which metric to return based on query parameter
  const metric = req.query.metric;
  let label = 'Unique Views';
  let message = data.uniqueViews.toString();
  let color = 'green';

  if (metric === 'total') {
    label = 'Total Views';
    message = data.totalViews.toString();
    color = 'blue';
  }

  // Return data in Shields.io format
  const responseData = {
    schemaVersion: 1,
    label: label,
    message: message,
    color: color,
  };

  res.setHeader('Content-Type', 'application/json');
  res.status(200).json(responseData);
};