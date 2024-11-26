const fs = require("fs");
const path = require("path");

const filePath = path.resolve(__dirname, "../views.json");
const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
const viewer = process.env.GITHUB_ACTOR;

if (!data.visitors) data.visitors = [];

if (!data.visitors.includes(viewer)) {
  data.visitors.push(viewer);
  data.uniqueViews = data.visitors.length;
}

fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
