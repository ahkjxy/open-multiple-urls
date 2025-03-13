export class URLProcessor {
  constructor() {
    this.cache = new Map();
  }

  async process(urls, options = {}) {
    const {
      validate = true,
      removeDuplicates = true,
      autoProtocol = true,
      maxUrls = 20
    } = options;

    // 预处理 URL
    let processedUrls = urls
      .map(url => this.preprocessUrl(url, autoProtocol))
      .filter(url => url !== null);

    // 去重
    if (removeDuplicates) {
      processedUrls = [...new Set(processedUrls)];
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
      url = url.trim();
      if (!url) return null;

      // 提取 URL 部分，支持更多格式
      const urlMatch = url.match(/(?:https?:\/\/)?(?:www\.)?[\w-]+(?:\.[\w-]+)+(?::\d+)?(?:\/[\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?/i);
      if (!urlMatch) return null;

      url = urlMatch[0];

      // 添加协议
      if (autoProtocol && !url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'http://' + url;
      }

      // 验证 URL 格式
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