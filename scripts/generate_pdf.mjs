import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { marked } from "marked";

const mdPath = path.resolve("./API_DOCUMENTATION.md");
const outHtmlPath = path.resolve("./temp_api_doc.html");
const outPdfPath = path.resolve("./HariSumiran_API_Documentation.pdf");

const markdownContent = fs.readFileSync(mdPath, "utf-8");
const rawHtml = marked.parse(markdownContent);

const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>HariSumiran API Documentation</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&family=Inter:wght@400;500;600;700&family=Outfit:wght@500;600;700;800&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 portrait;
      margin: 18mm 14mm 18mm 14mm;
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 11pt;
      line-height: 1.55;
      color: #1E293B;
      background-color: #FFFFFF;
      margin: 0;
      padding: 0;
    }

    /* Brand Header Banner */
    .brand-cover {
      background: linear-gradient(135deg, #FFF7ED 0%, #FEF3C7 50%, #FFFBEB 100%);
      border: 1.5px solid #FDBA74;
      border-radius: 12px;
      padding: 24px 28px;
      margin-bottom: 28px;
      page-break-after: avoid;
    }

    .brand-title {
      font-family: 'Outfit', sans-serif;
      font-size: 24pt;
      font-weight: 800;
      color: #C2410C;
      margin: 0 0 6px 0;
      letter-spacing: -0.5px;
    }

    .brand-subtitle {
      font-size: 13pt;
      font-weight: 600;
      color: #9A3412;
      margin: 0 0 14px 0;
    }

    .meta-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 10px;
    }

    .pill {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 8.5pt;
      font-weight: 600;
      background: #FFFFFF;
      border: 1px solid #FED7AA;
      color: #EA580C;
    }

    /* Headings */
    h1 {
      font-family: 'Outfit', sans-serif;
      font-size: 18pt;
      font-weight: 800;
      color: #9A3412;
      border-bottom: 2px solid #FFEDD5;
      padding-bottom: 6px;
      margin-top: 26px;
      margin-bottom: 14px;
      page-break-after: avoid;
      break-after: avoid;
    }

    h2 {
      font-family: 'Outfit', sans-serif;
      font-size: 14pt;
      font-weight: 700;
      color: #C2410C;
      margin-top: 22px;
      margin-bottom: 10px;
      border-bottom: 1px solid #FED7AA;
      padding-bottom: 4px;
      page-break-after: avoid;
      break-after: avoid;
    }

    h3 {
      font-family: 'Outfit', sans-serif;
      font-size: 12pt;
      font-weight: 700;
      color: #EA580C;
      margin-top: 18px;
      margin-bottom: 8px;
      page-break-after: avoid;
      break-after: avoid;
    }

    h4 {
      font-family: 'Inter', sans-serif;
      font-size: 10.5pt;
      font-weight: 700;
      color: #334155;
      margin-top: 14px;
      margin-bottom: 6px;
      page-break-after: avoid;
      break-after: avoid;
    }

    p, li {
      color: #334155;
    }

    ul, ol {
      margin-top: 6px;
      margin-bottom: 12px;
      padding-left: 22px;
    }

    li {
      margin-bottom: 4px;
    }

    /* Code Blocks */
    pre {
      background-color: #0F172A !important;
      color: #F8FAFC !important;
      padding: 12px 16px;
      border-radius: 8px;
      font-family: 'Fira Code', 'Courier New', monospace;
      font-size: 8.5pt;
      line-height: 1.45;
      overflow-x: hidden;
      white-space: pre-wrap;
      word-wrap: break-word;
      border: 1px solid #334155;
      margin: 10px 0 14px 0;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    code {
      font-family: 'Fira Code', monospace;
      font-size: 8.8pt;
      background-color: #FEF3C7;
      color: #9A3412;
      padding: 2px 5px;
      border-radius: 4px;
      border: 1px solid #FDE68A;
    }

    pre code {
      background-color: transparent !important;
      color: #38BDF8 !important;
      padding: 0;
      border: none;
      font-size: 8.5pt;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0 16px 0;
      font-size: 9pt;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    th {
      background: #FFF7ED !important;
      color: #9A3412;
      font-weight: 700;
      text-align: left;
      padding: 8px 10px;
      border: 1px solid #FED7AA;
      font-family: 'Outfit', sans-serif;
    }

    td {
      padding: 7px 10px;
      border: 1px solid #E2E8F0;
      color: #334155;
    }

    tr:nth-child(even) td {
      background-color: #FAFAF9;
    }

    /* Blockquotes */
    blockquote {
      background: #FFFBEB;
      border-left: 4px solid #F59E0B;
      margin: 12px 0;
      padding: 10px 16px;
      border-radius: 0 8px 8px 0;
      color: #92400E;
      font-size: 9.5pt;
    }

    blockquote p {
      margin: 0;
      color: #92400E;
    }

    /* Horizontal Rules */
    hr {
      border: none;
      height: 1px;
      background: #E2E8F0;
      margin: 24px 0;
    }

    .badge-method {
      display: inline-block;
      padding: 2px 7px;
      border-radius: 4px;
      font-size: 7.5pt;
      font-weight: 700;
      font-family: 'Inter', sans-serif;
      text-transform: uppercase;
    }

    .method-get { background: #ECFDF5; color: #047857; border: 1px solid #A7F3D0; }
    .method-post { background: #EFF6FF; color: #1D4ED8; border: 1px solid #BFDBFE; }
    .method-put { background: #FFFBEB; color: #B45309; border: 1px solid #FDE68A; }
    .method-delete { background: #FEF2F2; color: #B91C1C; border: 1px solid #FECACA; }
  </style>
</head>
<body>
  <div class="brand-cover">
    <div class="brand-title">HariSumiran Mandir Operations</div>
    <div class="brand-subtitle">Complete REST API Specification & Mobile Application Integration Guide</div>
    <div class="meta-pills">
      <span class="pill">Base URL: https://hari-sumiran-admin-dashboard.vercel.app</span>
      <span class="pill">Local: http://localhost:3000</span>
      <span class="pill">Version: 2.4.0 Production</span>
      <span class="pill">Auth: Bearer JWT</span>
      <span class="pill">Format: JSON</span>
    </div>
  </div>

  ${rawHtml}
</body>
</html>`;

fs.writeFileSync(outHtmlPath, fullHtml, "utf-8");

console.log("Generating high-resolution PDF via Google Chrome headless engine...");

const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const cmd = `"${chromePath}" --headless --disable-gpu --run-all-compositor-stages-before-draw --no-pdf-header-footer --print-to-pdf="${outPdfPath}" "${outHtmlPath}"`;

execSync(cmd, { stdio: "inherit" });

fs.unlinkSync(outHtmlPath);

console.log("PDF generated successfully at:", outPdfPath);
