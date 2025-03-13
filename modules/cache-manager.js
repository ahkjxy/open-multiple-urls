export class CacheManager {
  constructor() {
    this.cache = new Map();
    this.maxSize = 1000; // 最大缓存条目数
    this.maxAge = 24 * 60 * 60 * 1000; // 缓存最大年龄（24小时）
  }

  async cache(url, metadata) {
    try {
      // 检查缓存大小
      if (this.cache.size >= this.maxSize) {
        this.cleanup();
      }

      // 存储数据
      this.cache.set(url, {
        ...metadata,
        timestamp: Date.now()
      });

      // 保存到 Chrome Storage
      await this.saveToStorage();
    } catch (error) {
      console.error('缓存 URL 失败:', error);
    }
  }

  async get(url) {
    try {
      const data = this.cache.get(url);
      if (!data) return null;

      // 检查缓存是否过期
      if (Date.now() - data.timestamp > this.maxAge) {
        this.cache.delete(url);
        await this.saveToStorage();
        return null;
      }

      return data;
    } catch (error) {
      console.error('获取缓存数据失败:', error);
      return null;
    }
  }

  async delete(url) {
    try {
      this.cache.delete(url);
      await this.saveToStorage();
    } catch (error) {
      console.error('删除缓存数据失败:', error);
    }
  }

  async clear() {
    try {
      this.cache.clear();
      await this.saveToStorage();
    } catch (error) {
      console.error('清除缓存失败:', error);
    }
  }

  cleanup() {
    const now = Date.now();
    for (const [url, data] of this.cache.entries()) {
      if (now - data.timestamp > this.maxAge) {
        this.cache.delete(url);
      }
    }
  }

  async saveToStorage() {
    try {
      const data = Array.from(this.cache.entries());
      await chrome.storage.local.set({ urlCache: data });
    } catch (error) {
      console.error('保存缓存到存储失败:', error);
    }
  }

  async loadFromStorage() {
    try {
      const result = await chrome.storage.local.get('urlCache');
      if (result.urlCache) {
        this.cache = new Map(result.urlCache);
        this.cleanup();
      }
    } catch (error) {
      console.error('从存储加载缓存失败:', error);
    }
  }

  getSize() {
    return this.cache.size;
  }

  getMaxSize() {
    return this.maxSize;
  }

  setMaxSize(size) {
    this.maxSize = size;
    if (this.cache.size > size) {
      this.cleanup();
    }
  }

  setMaxAge(age) {
    this.maxAge = age;
    this.cleanup();
  }
} 