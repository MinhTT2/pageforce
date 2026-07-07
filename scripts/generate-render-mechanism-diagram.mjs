import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";

const screenshotsDir = path.join(process.cwd(), "docs", "assets", "screenshots");
const outputPath = path.join(screenshotsDir, "render-mechanism-diagram.png");

async function imageDataUrl(filename) {
  const source = await readFile(path.join(screenshotsDir, filename));
  return `data:image/png;base64,${source.toString("base64")}`;
}

const builderImage = await imageDataUrl("builder-overview.png");
const previewImage = await imageDataUrl("builder-preview-mode.png");
const publicImage = await imageDataUrl("public-demo-site.png");

const html = String.raw`
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        width: 1600px;
        height: 940px;
        overflow: hidden;
        background:
          radial-gradient(circle at 16% 4%, rgba(37, 99, 235, 0.14), transparent 34%),
          radial-gradient(circle at 90% 4%, rgba(20, 184, 166, 0.12), transparent 30%),
          linear-gradient(135deg, #f8fafc 0%, #eef2ff 56%, #f8fafc 100%);
        color: #0f172a;
        font-family:
          Inter,
          ui-sans-serif,
          system-ui,
          -apple-system,
          BlinkMacSystemFont,
          "Segoe UI",
          sans-serif;
      }

      .page {
        display: grid;
        grid-template-rows: auto 1fr auto;
        gap: 16px;
        height: 940px;
        padding: 34px 54px 28px;
      }

      .eyebrow {
        color: #4f46e5;
        font-size: 17px;
        font-weight: 850;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      h1 {
        margin: 6px 0 6px;
        color: #111827;
        font-size: 46px;
        line-height: 1.02;
      }

      .subtitle {
        margin: 0;
        max-width: 1200px;
        color: #475569;
        font-size: 20px;
        line-height: 1.32;
      }

      .flow {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows: repeat(2, 1fr);
        gap: 16px 26px;
        min-height: 0;
      }

      .panel {
        position: relative;
        display: grid;
        grid-template-rows: auto 1fr;
        gap: 10px;
        border: 1px solid rgba(148, 163, 184, 0.58);
        border-radius: 24px;
        background: rgba(255, 255, 255, 0.92);
        padding: 16px;
        box-shadow: 0 18px 44px rgba(15, 23, 42, 0.09);
      }

      .panel:not(.panel-3):not(.panel-6)::after {
        content: "";
        position: absolute;
        top: 50%;
        right: -22px;
        width: 0;
        height: 0;
        border-top: 11px solid transparent;
        border-bottom: 11px solid transparent;
        border-left: 17px solid #6366f1;
        transform: translateY(-50%);
        z-index: 2;
      }

      .panel-3::after {
        content: "";
        position: absolute;
        left: 50%;
        bottom: -23px;
        width: 0;
        height: 0;
        border-left: 11px solid transparent;
        border-right: 11px solid transparent;
        border-top: 17px solid #6366f1;
        transform: translateX(-50%);
        z-index: 2;
      }

      .panel-head {
        display: flex;
        align-items: flex-start;
        gap: 12px;
      }

      .num {
        display: grid;
        flex: none;
        width: 40px;
        height: 40px;
        place-items: center;
        border-radius: 13px;
        background: linear-gradient(135deg, #2563eb, #4f46e5);
        color: #ffffff;
        font-size: 18px;
        font-weight: 900;
        box-shadow: 0 12px 24px rgba(37, 99, 235, 0.22);
      }

      h2 {
        margin: 0;
        color: #1e293b;
        font-size: 20px;
        line-height: 1.1;
      }

      .panel-head p {
        margin: 6px 0 0;
        color: #64748b;
        font-size: 13px;
        font-weight: 650;
        line-height: 1.34;
      }

      .visual {
        height: 176px;
        overflow: hidden;
        border: 1px solid #dbe3ef;
        border-radius: 18px;
        background: #f8fafc;
      }

      .builder-visual {
        position: relative;
      }

      .example-chips {
        position: absolute;
        left: 14px;
        right: 14px;
        bottom: 12px;
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 8px;
      }

      .example-chips span {
        border: 1px solid rgba(79, 70, 229, 0.24);
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.92);
        color: #3730a3;
        padding: 7px 8px;
        text-align: center;
        font-size: 12px;
        font-weight: 900;
        box-shadow: 0 10px 22px rgba(15, 23, 42, 0.1);
      }

      .shot img {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: top left;
      }

      .json-visual {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        padding: 14px;
        background: #0f172a;
        color: #dbeafe;
      }

      .json-card {
        display: grid;
        align-content: center;
        min-height: 0;
        border: 1px solid rgba(147, 197, 253, 0.28);
        border-radius: 14px;
        background: rgba(15, 23, 42, 0.78);
        padding: 13px;
        font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
        font-size: 13px;
        font-weight: 800;
        line-height: 1.34;
      }

      .json-card span {
        color: #6ee7b7;
      }

      .renderer-visual {
        display: grid;
        grid-template-columns: 1fr;
        gap: 8px;
        padding: 12px;
      }

      .map-row {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        align-items: center;
        gap: 10px;
      }

      .map-card.code {
        display: grid;
        align-content: center;
        min-height: 68px;
        border-radius: 14px;
        background: #0f172a;
        color: #bfdbfe;
        padding: 12px;
        font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
        font-size: 13px;
        font-weight: 900;
        line-height: 1.45;
        text-align: center;
      }

      .map-card.ui {
        display: grid;
        align-content: center;
        min-height: 68px;
        border-radius: 14px;
        padding: 12px;
        background: #eef2ff;
        color: #3730a3;
        font-size: 16px;
        font-weight: 900;
        line-height: 1.25;
        text-align: center;
      }

      .map-card small {
        display: block;
        margin-top: 5px;
        color: #64748b;
        font-size: 11px;
      }

      .arrow {
        color: #4f46e5;
        font-size: 42px;
        font-weight: 900;
      }

      .save-visual {
        display: grid;
        grid-template-columns: 1.18fr auto 0.9fr;
        align-items: center;
        gap: 12px;
        padding: 14px;
      }

      .save-node {
        display: grid;
        place-items: center;
        min-height: 0;
        border-radius: 16px;
        padding: 14px;
        text-align: center;
        font-size: 17px;
        font-weight: 900;
      }

      .save-node.api {
        background: #eff6ff;
        color: #1d4ed8;
      }

      .save-node.db {
        background: #ecfdf5;
        color: #047857;
      }

      .save-node small {
        display: block;
        margin-top: 8px;
        color: #64748b;
        font-size: 12px;
      }

      .request-card {
        display: grid;
        align-content: center;
        min-height: 128px;
        border-radius: 16px;
        background: #0f172a;
        color: #bfdbfe;
        padding: 13px;
        font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
        font-size: 12px;
        font-weight: 850;
        line-height: 1.38;
      }

      .request-card b {
        color: #6ee7b7;
      }

      .public-visual {
        display: grid;
        grid-template-columns: 0.92fr auto 1.15fr;
        align-items: center;
        gap: 12px;
        padding: 14px;
      }

      .route-card {
        display: grid;
        gap: 10px;
        align-content: center;
        min-height: 132px;
        border-radius: 16px;
        background: #f0fdfa;
        color: #0f766e;
        padding: 16px;
        text-align: center;
        font-size: 18px;
        font-weight: 900;
      }

      .route-card b {
        display: block;
        color: #4f46e5;
        font-size: 14px;
      }

      .route-card small {
        color: #64748b;
        font-size: 13px;
      }

      .public-shot {
        height: 132px;
        overflow: hidden;
        border-radius: 16px;
        border: 1px solid #dbe3ef;
        background: #ffffff;
      }

      .bridge {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 22px;
        border-radius: 22px;
        background: linear-gradient(135deg, #2563eb, #4f46e5);
        color: #ffffff;
        padding: 16px 24px;
        box-shadow: 0 18px 42px rgba(37, 99, 235, 0.28);
      }

      .bridge strong {
        font-size: 23px;
        line-height: 1.1;
      }

      .bridge p {
        margin: 4px 0 0;
        font-size: 14px;
        font-weight: 750;
        opacity: 0.92;
      }

      .bridge-badge {
        flex: none;
        border: 1px solid rgba(255, 255, 255, 0.42);
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.16);
        padding: 11px 18px;
        font-size: 15px;
        font-weight: 900;
        white-space: nowrap;
      }
    </style>
  </head>
  <body>
    <main class="page">
      <header>
        <div class="eyebrow">Pageforce render mechanism</div>
        <h1>From dragged blocks to a public page</h1>
        <p class="subtitle">
          The Builder keeps section content and style as JSON objects. BlockRenderer reads each
          block's type, props, and style to generate both preview and public UI.
        </p>
      </header>

      <section class="flow" aria-label="Pageforce render flow">
        <article class="panel panel-1">
          <div class="panel-head">
            <span class="num">1</span>
            <div>
              <h2>Drag blocks in Builder</h2>
              <p>User chooses system blocks like Hero, Pricing, FAQ, or Lead Form.</p>
            </div>
          </div>
          <div class="visual shot builder-visual">
            <img src="${builderImage}" alt="Builder editor screenshot" />
            <div class="example-chips">
              <span>Hero</span>
              <span>Pricing</span>
              <span>FAQ</span>
              <span>Lead Form</span>
            </div>
          </div>
        </article>

        <article class="panel panel-2">
          <div class="panel-head">
            <span class="num">2</span>
            <div>
              <h2>Create JSON objects</h2>
              <p>Section content and style become a list of typed block objects.</p>
            </div>
          </div>
          <div class="visual json-visual">
            <div class="json-card">{ type: <span>"hero"</span>,<br />props: {<br />&nbsp;&nbsp;heading,<br />&nbsp;&nbsp;buttonText<br />},<br />style: { width } }</div>
            <div class="json-card">{ type: <span>"pricing"</span>,<br />props: {<br />&nbsp;&nbsp;plans,<br />&nbsp;&nbsp;ctaLabel<br />},<br />style: { accent } }</div>
          </div>
        </article>

        <article class="panel panel-3">
          <div class="panel-head">
            <span class="num">3</span>
            <div>
              <h2>BlockRenderer maps JSON to UI</h2>
              <p>It checks block type, props, and style to choose the right component.</p>
            </div>
          </div>
          <div class="visual renderer-visual">
            <div class="map-row">
              <div class="map-card code">type: "hero"<br />props.heading</div>
              <div class="arrow">→</div>
              <div class="map-card ui">Hero UI<small>headline + CTA</small></div>
            </div>
            <div class="map-row">
              <div class="map-card code">type: "pricing"<br />props.plans</div>
              <div class="arrow">→</div>
              <div class="map-card ui">Pricing UI<small>plan cards</small></div>
            </div>
          </div>
        </article>

        <article class="panel panel-4">
          <div class="panel-head">
            <span class="num">4</span>
            <div>
              <h2>Preview before save</h2>
              <p>Builder passes the JSON schema into BlockRenderer for canvas preview.</p>
            </div>
          </div>
          <div class="visual shot"><img src="${previewImage}" alt="Builder preview screenshot" /></div>
        </article>

        <article class="panel panel-5">
          <div class="panel-head">
            <span class="num">5</span>
            <div>
              <h2>Save to Page.schema</h2>
              <p>On Save, the JSON list goes through the API and is stored in Postgres.</p>
            </div>
          </div>
          <div class="visual save-visual">
            <div class="request-card"><b>PATCH</b> /api/pages/:id<br />{<br />&nbsp;&nbsp;schema: [hero, pricing],<br />&nbsp;&nbsp;title, slug<br />}</div>
            <div class="arrow">→</div>
            <div class="save-node db">Postgres<small>Page.schema</small></div>
          </div>
        </article>

        <article class="panel panel-6">
          <div class="panel-head">
            <span class="num">6</span>
            <div>
              <h2>Public route renders page</h2>
              <p>/s/siteSlug/pageSlug loads the saved JSON and sends it to BlockRenderer.</p>
            </div>
          </div>
          <div class="visual public-visual">
            <div class="route-card"><b>visitor URL</b>/s/demo/pricing<small>load saved schema</small></div>
            <div class="arrow">→</div>
            <div class="public-shot shot"><img src="${publicImage}" alt="Public page screenshot" /></div>
          </div>
        </article>
      </section>

      <footer class="bridge">
        <div>
          <strong>BlockRenderer is the bridge: JSON schema in, UI out.</strong>
          <p>The same JSON contract powers Builder preview and the public landing page.</p>
        </div>
        <span class="bridge-badge">Preview = Public output</span>
      </footer>
    </main>
  </body>
</html>
`;

await mkdir(screenshotsDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1600, height: 940 },
  deviceScaleFactor: 1,
});

try {
  await page.setContent(html, { waitUntil: "load" });
  await page.screenshot({ path: outputPath, fullPage: false, scale: "css" });
} finally {
  await browser.close();
}

console.log(`Render mechanism diagram written to ${path.relative(process.cwd(), outputPath)}`);
