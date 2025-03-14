export class URLProcessor {
  constructor() {
    this.cache = new Map();
  }

  async process(urls, options = {}) {
    const {
      validate = true,
      removeDuplicates = true,
      autoProtocol = true,
      maxUrls = 20,
      openOrder = 'normal'
    } = options;

    // 预处理 URL
    let processedUrls = urls
      .map(url => this.preprocessUrl(url, autoProtocol))
      .filter(url => url !== null);

    // 去重
    if (removeDuplicates) {
      processedUrls = [...new Set(processedUrls)];
    }

    // 排序
    switch (openOrder) {
      case 'reverse':
        processedUrls = processedUrls.reverse();
        break;
      case 'random':
        processedUrls = processedUrls.sort(() => Math.random() - 0.5);
        break;
      case 'domain':
        processedUrls = processedUrls.sort((a, b) => {
          const domainA = new URL(a).hostname;
          const domainB = new URL(b).hostname;
          return domainA.localeCompare(domainB);
        });
        break;
      case 'time':
        processedUrls = processedUrls.sort((a, b) => {
          const timeA = this.cache.get(a)?.lastChecked || 0;
          const timeB = this.cache.get(b)?.lastChecked || 0;
          return timeB - timeA;
        });
        break;
    }

    // 限制数量
    if (processedUrls.length > maxUrls) {
      processedUrls = processedUrls.slice(0, maxUrls);
    }

    // 验证 URL
    if (validate) {
      processedUrls = await this.validateUrls(processedUrls);
    }

    return processedUrls;
  }

  preprocessUrl(url, autoProtocol = true) {
    try {
      // 1. 基本清理
      url = url.trim();
      if (!url) return null;

      // 2. 提取 URL
      // 支持以下格式：
      // - 完整 URL: http://example.com 或 https://example.com
      // - 带 www 的域名: www.example.com
      // - 简单域名: example.com
      // - 带路径的 URL: example.com/path 或 http://example.com/path
      // - 带参数的 URL: example.com?param=value 或 http://example.com?param=value
      // - 带端口的 URL: example.com:8080 或 http://example.com:8080
      // - 特定格式: http://150.138.73.6:8708/f/ZHB6ZjdxRDlUeQ==
      const urlPattern = /(?:https?:\/\/)?(?:(?:[\w-]+\.)+[\w-]+|(?:\d{1,3}\.){3}\d{1,3})(?::\d+)?(?:\/[^\s]*)?/i;
      const match = url.match(urlPattern);
      if (!match) return null;

      url = match[0];

      // 3. 添加协议
      if (autoProtocol && !url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'http://' + url;
      }

      // 4. 验证格式
      try {
        new URL(url);
        return url;
      } catch {
        return null;
      }
    } catch (error) {
      console.error('URL 预处理失败:', error);
      return null;
    }
  }

  async validateUrls(urls) {
    const results = await Promise.all(
      urls.map(async url => {
        try {
          const response = await fetch(url, { method: 'HEAD' });
          return response.ok ? url : null;
        } catch {
          return null;
        }
      })
    );

    return results.filter(url => url !== null);
  }

  async getUrlMetadata(url) {
    try {
      const response = await fetch(url);
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      return {
        title: doc.title,
        description: doc.querySelector('meta[name="description"]')?.content || '',
        favicon: doc.querySelector('link[rel="icon"]')?.href || '',
        lastChecked: Date.now()
      };
    } catch (error) {
      console.error('获取 URL 元数据失败:', error);
      return null;
    }
  }

  async batchProcess(urls, options = {}) {
    const {
      batchSize = 5,
      delay = 1000,
      ...processOptions
    } = options;

    const results = [];
    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize);
      const processedBatch = await this.process(batch, processOptions);
      results.push(...processedBatch);

      if (i + batchSize < urls.length) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    return results;
  }
}