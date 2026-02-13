# 《奥伯拉丁的回归》身份与下落提示与查验程序 (Astro版)

这是 [ObraDinn-HintsAndCheck](https://github.com/Yide-Zhang/ObraDinn-HintsAndCheck) 的重构版本，使用 **Astro** + **Tailwind CSS** 构建，并支持 **PWA** (渐进式 Web 应用)。

## 功能

*   **完全的网页体验**：SPA 风格的流畅导航（使用 Astro View Transitions）。
*   **PWA 支持**：可安装到桌面或手机，支持离线访问（缓存资源）。
*   **获取提示**：点击“获取提示”逐步解锁线索。
*   **查验答案**：
    *   交互式身份和下落选择器。
    *   即时验证答案，正确答案自动锁定并显示。
    *   错误答案会有震动反馈。
*   **进度保存**：自动保存到浏览器 LocalStorage。
*   **格式化**：支持一键重置所有进度。

## 技术栈

*   **框架**: [Astro](https://astro.build/)
*   **样式**: [Tailwind CSS v4](https://tailwindcss.com/)
*   **PWA**: [Vite PWA](https://vite-pwa-org.netlify.app/)
*   **部署**: 静态站点生成 (SSG)，可部署到 GitHub Pages, Vercel, Netlify 等。

## 开发与构建

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```
访问 `http://localhost:4321`。

### 构建生产版本

```bash
npm run build
```
构建产物位于 `dist/` 目录。

### 本地预览构建产物

```bash
npm run preview
```

## 部署

本项目配置为静态站点。构建后的 `dist/` 目录包含所有静态文件，可以直接部署到任何静态托管服务。

## 致谢

*   原作者：[Yide-Zhang](https://github.com/Yide-Zhang)
*   字体：
    *   IM Fell English / Crimson Text
    *   Noto Serif SC
    *   Ma Shan Zheng

## 声明

本项目仅供学习交流使用，游戏资源版权归原作者所有。
