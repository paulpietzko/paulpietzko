// api/tracker.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';
import crypto from 'crypto';

const uri = process.env.MONGODB_URI!;

let cachedDb: typeof mongoose | null = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  const client = await mongoose.connect(uri);
  cachedDb = client;
  return client;
}

// Define a schema and model for views
const viewSchema = new mongoose.Schema({
  ipHash: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now },
});

const View = mongoose.models.View || mongoose.model('View', viewSchema);

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    await connectToDatabase();

    // Get viewer's IP
    const viewerIP = Array.isArray(req.headers['x-forwarded-for'])
      ? req.headers['x-forwarded-for'][0]
      : (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '';

    // Hash the IP for privacy
    const viewerHash = crypto.createHash('sha256').update(viewerIP).digest('hex');

    // Check if viewer already exists
    const existingView = await View.findOne({ ipHash: viewerHash });

    if (!existingView) {
      // Save new unique view
      await View.create({ ipHash: viewerHash });
    }

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