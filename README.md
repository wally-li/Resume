# Resume Archive

这是我的前端开发工程师简历备份仓库。

正式简历以 Markdown 源稿和本地 HTML/PDF 渲染引擎维护。本仓库同时保存源文件、导出文件、历史版本和投递记录。

## 文件说明

- `data/`: 当前维护中的简历 Markdown 源文件。
- `exports/`: 当前最新导出文件，例如 HTML、PDF。
- `scripts/`: 本地简历渲染与导出脚本。
- `styles/`: 本地简历渲染样式。
- `versions/`: 每次正式投递或阶段性修改后的历史版本。
- `notes/`: 维护说明、投递记录、版本备注。

## 推荐维护方式

1. 维护 `data/resume.frontend.md` 作为主要内容源。
2. 运行 `npm install` 安装依赖。
3. 运行 `npm run build` 生成 `exports/姓名-职位-YYYY-MM.html` 和 `exports/姓名-职位-YYYY-MM.pdf`。
4. 将投递用版本复制到 `versions/`，文件名带日期和方向。
5. 每次投递前打一个清晰的 tag，例如 `v2026.05-frontend`。

## 建议文件命名

- `exports/李宪-高级前端开发工程师-2026-05.pdf`
- `exports/李宪-高级前端开发工程师-2026-05.html`
- `versions/2026-05-frontend.pdf`

## 本地渲染

常用命令：

- `npm install`
- `npm run build`
