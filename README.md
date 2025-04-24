# WXT + React

This template should help get you started developing with React in WXT.

style:

# Source

https://archive.ph/RjJt7
https://archive.ph/VFtgq Elon Musk
https://archive.ph/rM6In Main page

# Todos

## Features

- [ ] 多语言

### Popup

- [ ] 语言检测和设置
- [ ] 翻译服务：OpenAI，DeepSeek（前期仅 OpenAI）
- [ ] 英语等级
- [ ] 开始翻译按钮
- [ ] 开启关闭悬浮按钮
- [ ] 设置按钮

### Setting Page

- [ ] API Key 配置，默认服务配置，模型选择（允许配字符串）
- [ ] API Key 配置教学，放在 飞书 上
- [ ] 配置单请求最大段落数，每秒最大请求数（延后）
- [ ] 界面语言，翻译目标语言（延后）

### Side Content

- [ ] 难度分析，判断是否超过难度，超过的话，弹出 continue？界面（延后）
- [ ] 难度设置，影响 openai api 解析
- [ ] 关闭悬浮按钮
- [ ] 打开设置页面

### Website （延后）

- [ ] 插件地址导航
- [ ] demo
- [ ] Feature Request (Tally)
- [ ] API Key 配置教学

## Improvements

- [ ] 提取文章的算法：https://github.com/obsidianmd/obsidian-clipper
- [ ] 分析文章表面之后的意思，比如一些词的讽刺意味
- [ ] OpenAI Cached Input? 有会员机制后再说

# Bug

- [ ] Don't include text in dom where display is None https://onboarding.immersivetranslate.com/en/instruct/step-3/, 这个网页中有很多 display none 的英文 dom，不应该取到
