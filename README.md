# 地球 Online 玩家测试

一个轻量的网页人格/门派测试小游戏。玩家回答随机抽取的问题后，会得到自己在「地球 Online」服务器中的门派归属、核心属性、天赋短板、生存攻略和玩家信号。

## 在线体验

[https://brunsonliu.github.io/earth-online-test/](https://brunsonliu.github.io/earth-online-test/)

## 功能特色

- 纯前端静态页面，无需后端服务
- 随机抽取 12 道题进行测试
- 根据回答统计门派倾向并生成结果页
- 包含门派属性条、分布占比、角色独白等展示
- 适配移动端浏览器和桌面端浏览器

## 项目结构

```text
.
├── index.html          # 页面结构
├── style.css           # 页面样式和动画
├── data.js             # 门派、题库和属性数据
├── app.js              # 测试流程与结果渲染逻辑
├── .github/workflows/  # GitHub Pages 自动部署配置
└── README.md
```

## 本地运行

这个项目是纯静态页面，直接用浏览器打开 `index.html` 即可。

也可以在项目目录启动一个本地静态服务：

```bash
python -m http.server 8000
```

然后访问：

```text
http://localhost:8000
```

## 部署说明

项目已配置 GitHub Actions：

- 推送到 `main` 分支后自动触发部署
- 工作流会把当前静态文件发布到 `gh-pages` 分支
- GitHub Pages 站点地址为：  
  [https://brunsonliu.github.io/earth-online-test/](https://brunsonliu.github.io/earth-online-test/)

## 技术栈

- HTML
- CSS
- JavaScript
- GitHub Pages
