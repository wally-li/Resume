# Frontend Resume

这是我的前端开发工程师简历仓库。

## 文件说明

- `resume.frontend.md`: 简历主源文件，后续主要维护这里。
- `styles/resume.css`: HTML/PDF 共用的简历样式。
- `scripts/build-resume.mjs`: 生成 HTML 并用 Chromium 打印 PDF。
- `scripts/build-pdf.sh`: 本地生成 PDF 的兼容脚本。
- `.github/workflows/build-resume.yml`: 推送到 GitHub 后自动生成 PDF 构建产物。

## 推荐维护方式

1. 在 `resume.frontend.md` 中维护公开版简历内容。
2. 联系方式只放求职专用邮箱、GitHub、作品集等公开信息。
3. 每次投递前打一个清晰的 tag，例如 `v2026.05-frontend`。
4. 如果需要针对不同公司微调，可以从主文件复制到 `variants/` 目录中维护。

## 本地生成 PDF

安装依赖后运行：

```bash
npm install
npx playwright install chromium
npm run build
```

也可以运行兼容脚本：

```bash
./scripts/build-pdf.sh
```

生成文件会输出到：

- `dist/resume.frontend.html`
- `dist/resume.frontend.pdf`
