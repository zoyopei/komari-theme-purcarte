import { useEffect, useState, useMemo } from "react";
import { BACKGROUND } from "@/config/default";
import type { PublicInfo } from "@/types/node.d";

/**
 * 动态背景组件
 * 根据设定的时间间隔自动切换背景图片
 * 并预加载所有图片以提高用户体验
 * 支持自定义过渡效果和切换时间
 */
interface ThemeSettings {
  backgroundImage?: string; // 逗号分隔的背景图片URL列表
  switchTime?: number; // 背景切换时间间隔(秒)
  transition?: string; // CSS过渡效果
}

interface BackgroundProps {
  publicSettings: PublicInfo;
}

function DynamicPseudoBackground({ publicSettings }: BackgroundProps) {
  const theme = (publicSettings?.theme_settings as ThemeSettings) || {};

  // 使用 useMemo 缓存背景图片列表，避免每次渲染时重新计算
  const imageList = useMemo(() => {
    return theme.backgroundImage
      ? theme.backgroundImage.split(",").map((url) => url.trim())
      : [BACKGROUND.backgroundImage];
  }, [theme.backgroundImage]);

  // 将切换时间从秒转换为毫秒
  const switchTime = useMemo(() => {
    return (theme.switchTime || BACKGROUND.switchTime) * 1000;
  }, [theme.switchTime]);

  const transition = useMemo(() => {
    return theme.transition || BACKGROUND.transition;
  }, [theme.transition]);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const currentImageUrl = imageList[currentImageIndex];

  // 预加载指定的图片
  const preloadImage = (url: string) => {
    if (!url) return;
    const img = new Image();
    img.src = url;
  };

  // 预加载所有图片，只在组件初始化或图片列表变化时执行一次
  useEffect(() => {
    // 只有当有多张图片时才设置过渡效果
    if (imageList.length > 1) {
      document.body.style.setProperty(
        "--body-background-transition",
        transition
      );

      // 预加载所有图片以提高用户体验
      imageList.forEach((url) => {
        preloadImage(url);
      });
    }

    // 组件卸载时清理
    return () => {
      document.body.style.removeProperty("--body-background-transition");
    };
  }, [imageList, transition]);

  // 背景切换逻辑
  useEffect(() => {
    // 当当前图片URL变化时，更新CSS变量
    document.body.style.setProperty(
      "--body-background-url",
      `url(${currentImageUrl})`
    );

    // 只有当有多张图片时才设置定时器进行轮换
    let intervalId: number | undefined;
    if (imageList.length > 1) {
      intervalId = window.setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageList.length);
      }, switchTime);
    }

    // 清理函数，组件卸载或依赖项变化时执行
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [currentImageUrl, imageList, switchTime]);

  // 此组件不渲染任何可见内容
  return null;
}

export default DynamicPseudoBackground;
