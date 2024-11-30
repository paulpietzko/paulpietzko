// api/views.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';

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

// Reuse the same schema and model
const viewSchema = new mongoose.Schema({
  ipHash: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now },
});

const View = mongoose.models.View || mongoose.model('View', viewSchema);

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    await connectToDatabase();

    // Get the metric parameter from query string
    const metric = req.query.metric;

    // Get counts from the database
    const uniqueViews = await View.countDocuments();
    const totalViews = uniqueViews; // Since we're only tracking unique views in this setup

    // Prepare data for Shields.io
    let label = 'Unique Views';
    let message = uniqueViews.toString();
    let color = 'green';

    if (metric === 'total') {
      label = 'Total Views';
      message = totalViews.toString();
      color = 'blue';
    }

    const responseData = {
      schemaVersion: 1,
      label,
      message,
      color,
    };

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(responseData);
  } catch (error) {
    console.error('Error in views function:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};