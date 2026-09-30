import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { preview } from "vite";

const SITE_URL = "https://cocbase.vercel.app";
const DIST = "dist";
const LEVELS = Array.from({ length: 16 }, (_, i) => i + 3);

const PUBLIC_ROUTES = [
  "/",
  "/bases",
  ...LEVELS.map((level) => `/bases/th-${level}`),
  "/descargar",
  "/aviso-legal",
  "/privacidad",
];

const PRIVATE_ROUTES = ["/panel", "/comunidad", "/imagenes", "/favoritos", "/contribuir", "/dashboard", "/revision"];

async function writeSeoFiles() {
  const urls = PUBLIC_ROUTES.map((route) => `  <url><loc>${SITE_URL}${route}</loc></url>`).join("\n");
  await writeFile(
    join(DIST, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
  );
  await writeFile(
    join(DIST, "robots.txt"),
    `User-agent: *\nAllow: /\n${PRIVATE_ROUTES.map((route) => `Disallow: ${route}`).join("\n")}\n\nSitemap: ${SITE_URL}/sitemap.xml\n`,
  );
}

async function writeAppShell() {
  const html = await readFile(join(DIST, "index.html"), "utf8");
  await writeFile(
    join(DIST, "app.html"),
    html.replace(
      '<meta name="robots" content="index, follow" />',
      '<meta name="robots" content="noindex, nofollow" />',
    ),
  );
}

async function renderRoute(browser, origin, route) {
  const page = await browser.newPage();
  try {
    await page.goto(origin + route, { waitUntil: "networkidle0", timeout: 30000 });
    await page.waitForFunction(() => !document.querySelector(".app-splash") && document.querySelector("h1"), {
      timeout: 15000,
    });
    await new Promise((resolve) => setTimeout(resolve, 800));
    const [html, bases] = await page.evaluate(() => [
      document.documentElement.outerHTML,
      window.__BASES__ ? JSON.stringify(window.__BASES__) : null,
    ]);
    const clean = html.replaceAll(origin, "").replace('<div id="app" data-v-app="">', '<div id="app">');
    const data = bases ? `<script>window.__BASES__=${bases.replaceAll("<", "\\u003c")}</script></head>` : "</head>";
    return "<!doctype html>\n" + clean.replace("</head>", data);
  } finally {
    await page.close();
  }
}

async function prerender() {
  let puppeteer;
  try {
    puppeteer = (await import("puppeteer")).default;
  } catch {
    console.warn("[prerender] puppeteer no disponible, se omite el prerender");
    return;
  }

  const server = await preview({ preview: { port: 4179, strictPort: true }, logLevel: "error" });
  const origin = "http://localhost:4179";
  let browser;
  try {
    browser = await puppeteer.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  } catch (error) {
    console.warn(`[prerender] no se pudo lanzar Chromium, se omite el prerender: ${error.message}`);
    await server.close();
    return;
  }

  try {
    const pages = [
      ...PUBLIC_ROUTES.map((route) => [route, route === "/" ? "index.html" : `${route.slice(1)}/index.html`]),
      ["/__404", "404.html"],
    ];
    const rendered = [];
    for (const [route, file] of pages) {
      rendered.push([file, await renderRoute(browser, origin, route)]);
      console.log(`[prerender] ${route}`);
    }
    for (const [file, html] of rendered) {
      const target = join(DIST, file);
      await mkdir(dirname(target), { recursive: true });
      await writeFile(target, html);
    }
  } finally {
    await browser.close();
    await server.close();
  }
}

await writeSeoFiles();
await writeAppShell();
await prerender();
