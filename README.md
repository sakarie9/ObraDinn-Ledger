# 《奥伯拉丁的回归》身份与下落提示与查验程序 (Web版)

这是 [ObraDinn-HintsAndCheck](https://github.com/Yide-Zhang/ObraDinn-HintsAndCheck) 的网页移植版本。它帮助玩家游玩《奥伯拉丁的回归》，支持玩家获取提示并查证自己的答案。

## 功能

*   **完全的网页体验**：无需下载安装，直接在浏览器中运行。
*   **获取提示**：点击“获取新提示”即可逐步获取身份和下落的线索。
*   **查验答案**：
    *   在详情页中选择身份和下落（包括死因、凶器、凶手）。
    *   点击“查验”按钮检验答案是否正确。
    *   正确答案会被锁定，且字体会从手写体变为打印体。
*   **进度保存**：程序会自动保存你的推测和提示进度到浏览器的本地存储（LocalStorage），即使关闭页面也不会丢失。
*   **格式化**：支持一键重置所有进度。

## 如何运行

### 在线运行

本程序可以直接部署到 GitHub Pages 或任何静态网页托管服务。

### 本地运行

由于浏览器安全策略（CORS），直接双击打开 `index.html` 可能无法加载数据文件。你需要启动一个简单的本地 HTTP 服务器。

**方法 1: 使用 Python (已安装 Python 3)**

1.  在项目根目录下打开终端/命令行。
2.  运行命令：
    ```bash
    python -m http.server
    ```
3.  在浏览器中访问 `http://localhost:8000`。

**方法 2: 使用 VS Code Live Server**

1.  使用 VS Code 打开项目文件夹。
2.  安装 "Live Server" 扩展。
3.  右键点击 `index.html`，选择 "Open with Live Server"。

## 部署到 GitHub Pages

1.  Fork 本仓库或将代码上传到你的 GitHub 仓库。
2.  进入仓库设置 (Settings) -> Pages。
3.  在 "Build and deployment" 下的 Source 选择 "Deploy from a branch"。
4.  Branch 选择 `main` (或 `master`)，文件夹选择 `/ (root)`。
5.  点击 Save。
6.  稍等片刻，GitHub 会生成访问链接。

## 致谢

*   原作者：[Yide-Zhang](https://github.com/Yide-Zhang)
*   字体：
    *   IM Fell English (Google Fonts)
    *   Noto Serif SC (Google Fonts)
    *   Ma Shan Zheng (Google Fonts)

## 声明

本项目仅供学习交流使用，游戏资源版权归原作者所有。
