// Simple Express server for Vercel
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
const staticPath = path.join(__dirname, 'dist/public');
console.log(`Static path: ${staticPath}`);

// Check if the static path exists
if (fs.existsSync(staticPath)) {
  console.log('Static path exists');
} else {
  console.log('Static path does not exist');
  // List the contents of the current directory
  console.log('Contents of current directory:');
  console.log(fs.readdirSync(__dirname));
}

// Serve static files
app.use(express.static(staticPath));

// API routes
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from TalentSync API!' });
});

// Fallback for SPA routing
app.get('*', (req, res) => {
  const indexPath = path.join(staticPath, 'index.html');

  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // Fallback HTML
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>TalentSync</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <script type="module" src="/assets/index-D5kg3YhS.js"></script>
          <link rel="stylesheet" href="/assets/index-DtX4t95D.css">
        </head>
        <body>
          <div id="root"></div>
        </body>
      </html>
    `);
  }
});

// Start the server
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel
export default app;