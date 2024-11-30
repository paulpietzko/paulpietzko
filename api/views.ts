import { VercelRequest, VercelResponse } from '@vercel/node';
import { promises as fs } from 'fs';
import path from 'path';

interface ViewData {
  totalViews: number;
  uniqueViews: number;
  visitors: string[];
}

export default async (_req: VercelRequest, res: VercelResponse) => {
  const filePath = path.join('../data', 'views.json');
  let data: ViewData = {
    totalViews: 0,
    uniqueViews: 0,
    visitors: [],
  };

  // Read existing data
  try {
    const fileData = await fs.readFile(filePath, 'utf8');
    data = JSON.parse(fileData) as ViewData;
  } catch {
    // File doesn't exist
  }

  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({
    totalViews: data.totalViews,
    uniqueViews: data.uniqueViews,
  });
};