# Resume Archive

这是我的前端开发工程师简历备份仓库。

正式简历使用 [Reactive Resume](https://rxresu.me) 维护，本仓库只保存导出的文件、历史版本和投递记录。

## 文件说明

- `exports/`: 当前最新导出文件，例如 PDF、JSON、DOCX。
- `versions/`: 每次正式投递或阶段性修改后的历史版本。
- `notes/`: 维护说明、投递记录、版本备注。

## 推荐维护方式

1. 在 Reactive Resume 中编辑简历内容和样式。
2. 每次重要修改后导出 PDF 和 JSON。
3. 将最新文件放入 `exports/`。
4. 将投递用版本复制到 `versions/`，文件名带日期和方向。
5. 每次投递前打一个清晰的 tag，例如 `v2026.05-frontend`。

## 建议文件命名

- `exports/resume.frontend.pdf`
- `exports/resume.frontend.json`
- `exports/resume.frontend.docx`
- `versions/2026-05-frontend.pdf`
- `versions/2026-05-frontend.json`

## Reactive Resume

常用入口：

- 在线版：https://rxresu.me
- 官方仓库：https://github.com/amruthpillai/reactive-resume
- 文档：https://docs.rxresu.me

推荐导出：

- PDF：用于投递。
- JSON：用于备份和迁移。
- DOCX：用于需要 Word 格式的场景。
