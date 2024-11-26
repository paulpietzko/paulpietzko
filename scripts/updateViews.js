const fs = require("fs");
const path = require("path");

const filePath = path.resolve(__dirname, "../views.json");

try {
  // Read and parse the JSON file
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  
  // Ensure visitors array exists
  if (!Array.isArray(data.visitors)) throw new Error("Invalid visitors format");
  
  const viewer = process.env.GITHUB_ACTOR; // Get the current viewer's GitHub username
  
  // Add viewer if not already tracked
  if (!data.visitors.includes(viewer)) {
    data.visitors.push(viewer);
    data.uniqueViews = data.visitors.length; // Update unique view count
    data.totalViews = (data.totalViews || 0) + 1; // Increment total views
  } else {
    // If viewer already exists, increment total views only
    data.totalViews = (data.totalViews || 0) + 1;
  }
  
  // Save the updated JSON file
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
} catch (error) {
  console.error("Failed to process views:", error.message);
  process.exit(1);
}
