<div align="center">

<img width="300" src="./preview.png" alt="PurCarte Theme Preview">

## ✨ PurCarte ✨

一款为 [Komari](https://github.com/komari-monitor/komari) 设计的磨砂玻璃风格主题。

</div>

---

> [!NOTE]
> 本主题在 Gemini 的辅助下完成，融合了官方主题的部分设计与个人审美偏好，旨在提供一种简洁、美观的磨砂玻璃质感界面

## 🚀 快速开始

### 安装与启用

1.  前往 [Releases](https://github.com/Montia37/komari-theme-purcarte/releases) 页面下载最新的 `komari-theme-purcarte.zip` 文件。
2.  进入 Komari 后台，上传 `zip` 压缩包并启用本主题。

### 配置背景图片

> 为获得最佳视觉效果，建议搭配背景图片使用。

#### Komari v1.0.5 及以上版本

如果 Komari 版本为 v1.0.5 或更高版本，可直接在 `Komari 后台 > PurCarte设置` 中配置背景图片等主题选项，无需手动添加自定义代码，如已添加自定义代码需要删去背景相关 style 避免干扰

#### 旧版本配置方法

<details>

对于旧版本，请在 `Komari 后台 > 设置 > 站点 > 自定义 Body` 处添加以下代码并保存：

```html
<style>
  /* 自定义背景图片 */
  body::before {
    content: "";
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    background: url(https://i.yon.li/w/682f73d97eade.png) center/cover no-repeat;
  }
</style>
```

</details>

## 🛠️ 本地开发

1.  **克隆仓库**

    ```bash
    git clone https://github.com/Montia37/komari-theme-purcarte.git
    cd komari-theme-purcarte
    ```

2.  **安装依赖**

    ```bash
    yarn install
    ```

3.  **启动开发服务器**

    ```bash
    yarn dev
    ```

4.  在浏览器中打开 `http://localhost:5173` (或 Vite 提示的其他端口) 即可进行预览和调试。

## 📄 许可证

本项目采用 [MIT License](LICENSE) 授权。
