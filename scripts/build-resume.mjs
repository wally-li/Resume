import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const sourceFile = path.join(rootDir, "data", "resume.frontend.md");
const distDir = path.join(rootDir, "exports");
const stylesheetFile = path.join(rootDir, "styles", "resume.css");
const avatarFile = path.join(rootDir, "assets", "avatar-resume.jpg");

const sectionClassNames = new Map([
  ["基本信息", "section-profile"],
  ["专业技能", "section-skills"],
  ["职业摘要", "section-summary"],
  ["工作经历", "section-experience"],
  ["项目经历", "section-projects"],
  ["早期经历", "section-experience"],
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

function sanitizeFilePart(value) {
  return value
    .replace(/简历$/g, "")
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/\s+/g, "")
    .trim();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function formatBuildMonth(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function removeStaleExports(name, role) {
  if (!fs.existsSync(distDir)) {
    return;
  }

  const legacyFiles = new Set(["resume.frontend.html", "resume.frontend.pdf"]);
  const sameResumePattern = new RegExp(`^${escapeRegExp(name)}-${escapeRegExp(role)}(?:-简历)?-\\d{4}-\\d{2}\\.(html|pdf)$`);

  for (const fileName of fs.readdirSync(distDir)) {
    if (legacyFiles.has(fileName) || sameResumePattern.test(fileName)) {
      fs.rmSync(path.join(distDir, fileName), { force: true });
    }
  }
}

const profileIcons = {
  "姓名": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></g></svg>`,
  "方向": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M12 12h.01M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2m14 7a18.15 18.15 0 0 1-20 0"/><rect width="20" height="14" x="2" y="6" rx="2"/></g></svg>`,
  "地点": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></g></svg>`,
  "手机": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233a14 14 0 0 0 6.392 6.384"/></svg>`,
  "邮箱": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="m22 7l-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/><rect width="20" height="16" x="2" y="4" rx="2"/></g></svg>`,
  "工作年限": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M8 2v4m8-4v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18M9 16l2 2l4-4"/></g></svg>`,
  "期望薪资": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></g></svg>`,
  "到岗状态": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M8 2v4m8-4v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18M9 16l2 2l4-4"/></g></svg>`,
  "技术博客": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></g></svg>`,
  "语雀": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></g></svg>`,
};

const metricPhrases = [
  "50+ 国家/地区企业进件",
  "发卡活跃客户从 0 增长至 557",
  "3 个 Vue + Element UI + TypeScript 子应用",
  "2 套企业级跨境金融系统",
  "B 轮数亿人民币融资",
  "约四分之一核心迁移开发工作",
  "约 25% 核心迁移开发",
  "50+ 国家/地区 KYC 流程",
  "2021 年度 MVP 项目",
  "6 个用户设置模块",
  "数十个基础组件",
  "近百种业务变体",
  "50+ 国家/地区",
  "200+ 直营门店",
  "400+ 页面",
  "上百个业务模块",
  "三次实习评级均为 S",
  "超 10 倍",
  "40%+",
  "约 30%",
  "477%",
  "569%",
  "58%",
  "45%",
  "42%",
  "25%",
  "20%",
].sort((a, b) => b.length - a.length);

function parseListItems(content) {
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => line.slice(2).trim())
    .map((item) => {
      const separatorIndex = item.indexOf("：");
      if (separatorIndex === -1) {
        return { label: "", value: item };
      }

      return {
        label: item.slice(0, separatorIndex).trim(),
        value: item.slice(separatorIndex + 1).trim(),
      };
    });
}

function renderProfileValue(label, value) {
  const escapedValue = escapeHtml(value);
  if (label === "邮箱") {
    return `<a href="mailto:${escapedValue}">${escapedValue}</a>`;
  }

  if (/^https?:\/\//.test(value)) {
    return `<a href="${escapedValue}">${escapedValue}</a>`;
  }

  return escapedValue;
}

function renderProfileSection(section) {
  const items = parseListItems(section.content)
    .map(({ label, value }) => {
      const icon = profileIcons[label] ?? profileIcons["方向"];
      return `<li><span class="profile-icon" aria-hidden="true">${icon}</span><span><strong>${escapeHtml(label)}：</strong>${renderProfileValue(label, value)}</span></li>`;
    })
    .join("\n");

  return `
    <section class="resume-section section-profile">
      <h2>${escapeHtml(section.title)}</h2>
      <ul>
${items}
</ul>
    </section>
  `;
}

function renderSkillsSection(section) {
  const items = parseListItems(section.content)
    .map(({ label, value }) => `<li><strong>${escapeHtml(label)}</strong><span>${escapeHtml(value)}</span></li>`)
    .join("\n");

  return `
    <section class="resume-section section-skills">
      <h2>${escapeHtml(section.title)}</h2>
      <ul>
${items}
</ul>
    </section>
  `;
}

function highlightMetrics(html) {
  const replacements = [];
  const htmlWithTokens = metricPhrases.reduce((current, phrase, index) => {
    const escapedPhrase = escapeHtml(phrase);
    const token = `@@METRIC_${index}@@`;
    replacements.push([token, `<strong class="metric">${escapedPhrase}</strong>`]);
    return current.split(escapedPhrase).join(token);
  }, html);

  return replacements.reduce((current, [token, markup]) => current.split(token).join(markup), htmlWithTokens);
}

function splitTitle(rawTitle) {
  const normalizedTitle = rawTitle.replace(/简历$/, "").trim();
  const parts = normalizedTitle.split(/\s+-\s+/).map((part) => part.trim()).filter(Boolean);
  if (parts.length < 2) {
    return { name: normalizedTitle, role: "Frontend Engineer" };
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
  if (section.title === "基本信息") {
    return renderProfileSection(section);
  }

  if (section.title === "专业技能") {
    return renderSkillsSection(section);
  }

  const className = sectionClassNames.get(section.title) ?? "section-generic";
  return `
    <section class="resume-section ${className}">
      <h2>${escapeHtml(section.title)}</h2>
      ${highlightMetrics(marked.parse(section.content))}
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

const markdown = fs.readFileSync(sourceFile, "utf8")
  .replace(/^>\s*维护说明：.*\n+/m, "")
  .trimStart();
const titleMatch = markdown.match(/^#\s+(.+)$/m);
const rawTitle = titleMatch?.[1]?.trim() ?? "Frontend Resume";
const { name, role } = splitTitle(rawTitle);
const safeName = sanitizeFilePart(name);
const safeRole = sanitizeFilePart(role);
const updatedMonth = formatBuildMonth(new Date());
const exportBaseName = `${safeName}-${safeRole}-${updatedMonth}`;
const htmlFile = path.join(distDir, `${exportBaseName}.html`);
const pdfFile = path.join(distDir, `${exportBaseName}.pdf`);
const bodyMarkdown = markdown.replace(/^#\s+.+\n?/, "").trim();
const sections = splitSections(bodyMarkdown);

const profileSection = findSection(sections, "基本信息");
const skillsSection = findSection(sections, "专业技能");
const summarySection = findSection(sections, "职业摘要");
const educationSection = findSection(sections, "教育经历");
const flowSections = withoutSections(sections, ["基本信息", "教育经历", "职业摘要", "专业技能"]);
const avatarSrc = fs.existsSync(avatarFile) ? "../assets/avatar-resume.jpg" : null;

fs.mkdirSync(distDir, { recursive: true });
removeStaleExports(safeName, safeRole);

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
        <div class="hero-main">
          <p class="eyebrow">Frontend Resume</p>
          <h1>${escapeHtml(name)}</h1>
          <p class="role">${escapeHtml(role)}</p>
        </div>
        ${avatarSrc ? `<img class="hero-avatar" src="${avatarSrc}" alt="${escapeHtml(name)}" />` : `<div class="hero-mark"><span>FE</span></div>`}
      </header>

      ${profileSection ? `<div class="resume-contact">${renderSection(profileSection)}</div>` : ""}
      ${educationSection ? `<div class="resume-summary-band">${renderSection(educationSection)}</div>` : ""}
      ${summarySection ? `<div class="resume-summary-band">${renderSection(summarySection)}</div>` : ""}
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
