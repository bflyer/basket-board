# 🏀 篮球战术板

在线地址：<https://bflyer.github.io/basket-board/>

这是一个不需要后端的篮球战术板：浏览器负责编辑、回放、导入/导出 JSON 和录制视频。站点不上传或保存用户数据。

## 功能

- 5 名红队球员、5 名黄队球员和 1 个篮球
- 初始站位、多步骤跑位、轨迹与步骤注释
- 回放速度调节、撤销与分级重置
- 战术 JSON 导入/导出
- 浏览器视频录制；优先原生 MP4，不支持时保存 WebM 并可在浏览器内转为 H.264 MP4
- PWA 安装和离线使用
- Capacitor Android 工程，可打包为 APK

## 文件结构

```text
.
├── index.html                 # 页面、样式和业务代码
├── basketball_court.png       # 球场背景
├── manifest.json              # PWA 配置
├── service-worker.js          # 离线缓存
├── icon-192.png / icon-512.png
├── fix-webm-duration.js       # WebM 时长修复
├── ffmpeg/                    # 本地 ffmpeg.wasm（WebM → MP4）
├── scripts/prepare-web.mjs    # 生成 Capacitor 使用的 www/
├── capacitor.config.json
├── android/                   # Android 原生工程
└── package.json
```

`node_modules/`、`www/`、Gradle 缓存、Android WebView 资源和 APK 都是可再生成文件，不应提交到 Git。

## 无域名上线（推荐）

项目是静态站点，可以直接用 GitHub Pages 的免费 `github.io` 地址，不需要购买域名或服务器，也不需要在访客电脑上安装 Node.js。

1. 将仓库推送到 GitHub。
2. 进入仓库的 **Settings → Pages**。
3. Source 选择 **Deploy from a branch**。
4. Branch 选择 `main`，目录选择 `/ (root)`，保存。
5. 等待发布后访问 `https://<用户名>.github.io/<仓库名>/`。

这个仓库的静态源文件已经位于根目录，发布网页前不需要运行 `npm install` 或构建命令。GitHub Pages 的 `github.io` 地址自带 HTTPS，PWA、Service Worker 和浏览器视频能力可直接使用。

## 新电脑上的开发与部署

### 只修改/发布网页

安装 Git，然后：

```bash
git clone <仓库地址>
cd basket-board
```

修改根目录静态文件，提交并推送即可。Pages 会自动重新发布。

本地预览必须通过 HTTP 打开，不能直接双击 `index.html`：

```bash
python3 -m http.server 8080
```

然后访问 <http://localhost:8080/>。也可以使用任意 IDE 静态服务器。

### 构建 Android APK

网页发布不需要以下环境；只有打 APK 才需要：

- Node.js 18 或更高版本
- Android Studio（含 JDK）
- Android SDK API 34

第一次执行：

```bash
npm ci
npm run sync
npm run android
```

在 Android Studio 中等待 Gradle Sync，然后选择 **Build → Build Bundle(s) / APK(s) → Build APK(s)**。

Linux/macOS 也可直接执行：

```bash
npm run build-apk
```

Debug APK 输出在 `android/app/build/outputs/apk/debug/app-debug.apk`。Android 工程已经存在，不要再运行 `npx cap add android`。

每次修改网页源码后，先执行 `npm run sync`，再重新构建 APK。`sync` 会重新生成 `www/`，并复制完整的页面、WebM 修复库和 FFmpeg 编码器。

## 视频与浏览器兼容性

录制依赖 `canvas.captureStream()`、`MediaRecorder` 和浏览器支持的编码器：

- 浏览器支持 H.264/MP4 录制时，直接下载 MP4。
- 只支持 WebM 时，先下载已修复时长的 WebM；页面随后提供“转码为手机 MP4”，使用仓库内约 32 MB 的 ffmpeg.wasm 转为 H.264/yuv420p MP4。
- FFmpeg、WebM 修复库和页面资源会被 PWA 缓存；首次完整加载后可离线使用和转码。
- 最新版 Chrome、Edge、Firefox 和 Safari 覆盖面较好，但无法承诺“任意浏览器”：旧浏览器、内嵌微信浏览器、部分 iOS/Android WebView 可能缺少录制、Worker、WebAssembly 或下载能力。
- 视频跨播放器兼容也不是绝对保证。最稳妥的交付格式是页面直接生成或转码后的 MP4，而不是原始 WebM。

直接以 `file://` 打开时，项目会禁用视频录制。线上应使用 HTTPS；本地开发使用 `localhost`。

## 数据与运维边界

- 战术数据只存在于当前页面内存和用户下载的 JSON 文件中，没有账号、数据库或云同步。
- 静态站点没有服务端运维环境；访客只需现代浏览器。
- GitHub Pages 是公开互联网服务。若要私有访问、账号同步、服务端统一转码或严格保证某一种视频格式，需要增加后端/对象存储，不再是当前的零环境静态项目。
