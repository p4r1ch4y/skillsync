import express, { type Express, Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg: string, options: any) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req: Request, res: Response, next: NextFunction) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        path.dirname(import.meta.url.replace("file://", "")),
        "..",
        "client",
        "index.html",
      );

      // Always reload the index.html file from disk in case it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // Use a relative path from the current working directory
  const staticPath = path.resolve(process.cwd(), "dist/public");

  // Log the static path for debugging
  console.log(`Attempting to serve static files from: ${staticPath}`);

  // In production on Vercel, we might not have direct file access
  // so we'll just log a warning instead of exiting
  if (!fs.existsSync(staticPath)) {
    console.warn(`Static path does not exist: ${staticPath}`);
    console.warn('This is expected in some environments like Vercel. Continuing...');
  }

  app.use(express.static(staticPath));

  // Fallback for SPA routing
  app.use("*", (_req: Request, res: Response) => {
    const indexPath = path.join(staticPath, "index.html");

    try {
      if (fs.existsSync(indexPath)) {
        console.log(`Serving index.html from: ${indexPath}`);
        res.sendFile(indexPath);
      } else {
        console.warn(`Index.html not found at: ${indexPath}`);
        // In production, especially on Vercel, we might not have direct file access
        // Try to serve a basic HTML response
        res.status(200).send(`
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
    } catch (error) {
      console.error('Error serving index.html:', error);
      res.status(500).send('Server error');
    }
  });
}
