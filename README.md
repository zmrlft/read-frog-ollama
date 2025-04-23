# WXT + React

This template should help get you started developing with React in WXT.

style:

# Source

https://archive.ph/RjJt7
https://archive.ph/VFtgq Elon Musk
https://archive.ph/rM6In Main page

# Improvements

- [ ] 提取文章的算法：https://github.com/obsidianmd/obsidian-clipper
- [ ] 分析文章表面之后的意思，比如一些词的讽刺意味

# Bug

- [ ] wrong main content: https://www.cnbc.com/2025/04/18/canadian-small-businesses-trump-tariffs.html
- [ ] https://archive.ph/pMzIG The first line is "T his" but should be "This", write prompt to fix this when extract
- [ ] A CROSS the world, Donald Trump has forced friend and foe alike to realise that they won’t be able to meet the challenge he presents unless they also address the structural vulnerabilities of their own economies.
      在全球范围内，唐纳德·特朗普让朋友和敌人 alike 意识到，除非他们同时解决自身经济的结构性脆弱性，否则无法应对他所带来的挑战。 原句子若有语法错误，就修证

# Extract Pipline

1. extract by readability (if nothing then immediately not readable), and get seo info, and give it to gpt to see if it's a good article
2. if it's a good article, then extract automatically
3. if it's not a good article, ask users to confirm if they want to extract
