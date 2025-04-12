// Static file server for Vercel
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Determine the static path
const staticPath = path.join(__dirname, '../public');
console.log(`Static path: ${staticPath}`);

// Check if the static path exists
if (fs.existsSync(staticPath)) {
  console.log('Static path exists');
} else {
  console.log('Static path does not exist');
  console.log('Contents of current directory:');
  console.log(fs.readdirSync(__dirname));
}

// Serve static files
app.use(express.static(staticPath));

// Fallback for SPA routing
app.get('*', (req, res) => {
  const indexPath = path.join(staticPath, 'index.html');
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // Fallback HTML
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>TalentSync</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background-color: #f5f5f5;
              color: #333;
            }
            .container {
              max-width: 800px;
              padding: 2rem;
              background-color: white;
              border-radius: 8px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              text-align: center;
            }
            h1 {
              color: #4f46e5;
              margin-bottom: 1rem;
            }
            p {
              margin-bottom: 1.5rem;
              line-height: 1.6;
            }
            .button {
              display: inline-block;
              background-color: #4f46e5;
              color: white;
              padding: 0.75rem 1.5rem;
              border-radius: 4px;
              text-decoration: none;
              font-weight: 500;
              transition: background-color 0.2s;
            }
            .button:hover {
              background-color: #4338ca;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Welcome to TalentSync</h1>
            <p>
              TalentSync is a platform that helps you connect with talented professionals and manage your team effectively.
            </p>
            <p>
              <a href="/api/docs" class="button">API Documentation</a>
              <a href="/setup.html" class="button">Setup</a>
            </p>
          </div>
        </body>
      </html>
    `);
  }
});

// Export the Express app
export default app;
