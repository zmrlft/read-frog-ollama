/**
 * 获取页面 favicon 的最通用方法
 * @return {string} favicon 的 URL
 */
export function getFaviconUrl() {
  // 优先级列表：常见 rel 属性
  const relList = [
    "icon",
    "shortcut icon",
    "apple-touch-icon",
    "apple-touch-icon-precomposed",
    "mask-icon",
  ];

  let url = null;
  for (const rel of relList) {
    // 注意：选择器对大小写不敏感，但属性值要写全称
    const link = document.head.querySelector(
      `link[rel="${rel}"]`
    ) as HTMLLinkElement | null;
    if (link && link.href) {
      url = link.href;
      break;
    }
  }

  // 如果依然没找到，就回退到站点根目录的 /favicon.ico
  if (!url) {
    const { origin } = window.location;
    url = origin + "/favicon.ico";
  }

  return url;
}
