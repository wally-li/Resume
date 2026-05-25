import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const sourceFile = path.join(rootDir, "resume.frontend.md");
const distDir = path.join(rootDir, "dist");
const htmlFile = path.join(distDir, "resume.frontend.html");
const pdfFile = path.join(distDir, "resume.frontend.pdf");
const stylesheetFile = path.join(rootDir, "styles", "resume.css");

const sectionClassNames = new Map([
  ["基本信息", "section-profile"],
  ["技术栈", "section-skills"],
  ["个人简介", "section-summary"],
  ["工作经历", "section-experience"],
  ["项目经历", "section-projects"],
  ["开源与作品", "section-open-source"],
  ["教育经历", "section-education"],
  ["证书与其他", "section-extra"],
]);

marked.setOptions({
  gfm: true,
  breaks: true,
  headerIds: false,
  mangle: false,
});

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function splitTitle(rawTitle) {
  const parts = rawTitle.split(/\s+-\s+/).map((part) => part.trim()).filter(Boolean);
  if (parts.length < 2) {
    return { name: rawTitle, role: "Frontend Engineer" };
  }

  const [first, second] = parts;
  if (/工程师|开发|Engineer/i.test(first) && !/工程师|开发|Engineer/i.test(second)) {
    return { name: second, role: first };
  }

  return { name: first, role: second };
}

function splitSections(markdown) {
  const sectionHeading = /^##\s+(.+)$/gm;
  const matches = [...markdown.matchAll(sectionHeading)];

  return matches.map((match, index) => {
    const start = match.index + match[0].length;
    const end = matches[index + 1]?.index ?? markdown.length;
    return {
      title: match[1].trim(),
      content: markdown.slice(start, end).trim(),
    };
  });
}

function renderSection(section) {
  const className = sectionClassNames.get(section.title) ?? "section-generic";
  return `
    <section class="resume-section ${className}">
      <h2>${escapeHtml(section.title)}</h2>
      ${marked.parse(section.content)}
    </section>
  `;
}

function renderColumn(sections) {
  return sections.map(renderSection).join("\n");
}

function findSection(sections, title) {
  return sections.find((section) => section.title === title);
}

function withoutSections(sections, titles) {
  const titleSet = new Set(titles);
  return sections.filter((section) => !titleSet.has(section.title));
}

const markdown = fs.readFileSync(sourceFile, "utf8");
const titleMatch = markdown.match(/^#\s+(.+)$/m);
const rawTitle = titleMatch?.[1]?.trim() ?? "Frontend Resume";
const { name, role } = splitTitle(rawTitle);
const bodyMarkdown = markdown.replace(/^#\s+.+\n?/, "").trim();
const sections = splitSections(bodyMarkdown);

const profileSection = findSection(sections, "基本信息");
const skillsSection = findSection(sections, "技术栈");
const sidebarSections = sections.filter((section) => ["教育经历", "证书与其他"].includes(section.title));
const mainSections = withoutSections(sections, ["基本信息", "技术栈", "教育经历", "证书与其他"]);
const flowSections = [...mainSections, ...sidebarSections];

fs.mkdirSync(distDir, { recursive: true });

const html = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(rawTitle)}</title>
    <link rel="stylesheet" href="../styles/resume.css" />
  </head>
  <body>
    <article class="resume-page">
      <header class="resume-hero">
        <div>
          <p class="eyebrow">Frontend Resume</p>
          <h1>${escapeHtml(name)}</h1>
          <p class="role">${escapeHtml(role)}</p>
        </div>
        <div class="hero-mark">
          <span>FE</span>
        </div>
      </header>

      ${profileSection ? `<div class="resume-contact">${renderSection(profileSection)}</div>` : ""}
      ${skillsSection ? `<div class="resume-skill-band">${renderSection(skillsSection)}</div>` : ""}

      <main class="resume-flow">
        ${renderColumn(flowSections)}
      </main>
    </article>
  </body>
</html>
`;

fs.writeFileSync(htmlFile, html);

if (!fs.existsSync(stylesheetFile)) {
  throw new Error(`Missing stylesheet: ${stylesheetFile}`);
}

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1240, height: 1754 },
    deviceScaleFactor: 1,
  });

  await page.goto(`file://${htmlFile}`, { waitUntil: "networkidle" });
  await page.pdf({
    path: pdfFile,
    format: "A4",
    printBackground: true,
    margin: { top: "0", right: "0", bottom: "0", left: "0" },
    preferCSSPageSize: true,
  });
} finally {
  await browser.close();
}

console.log(`Built ${htmlFile}`);
console.log(`Built ${pdfFile}`);
