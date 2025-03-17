import { getVersion } from './version.js';
import { logger } from './logger.js';

export class SecurityChecker {
  constructor() {
    this.blacklist = new Set();
    this.whitelist = new Set();
    this.sensitivePatterns = [
      /\.exe$/i,
      /\.dmg$/i,
      /\.zip$/i,
      /\.rar$/i,
      /\.7z$/i,
      /\.tar$/i,
      /\.gz$/i
    ];
  }

  async checkUrl(url) {
    try {
      // 检查白名单
      if (this.whitelist.has(url)) {
        return { safe: true, reason: 'whitelisted' };
      }

      // 检查黑名单
      if (this.blacklist.has(url)) {
        return { safe: false, reason: 'blacklisted' };
      }

      // 检查敏感模式
      if (this.sensitivePatterns.some(pattern => pattern.test(url))) {
        return { safe: false, reason: 'sensitive_pattern' };
      }

      // 检查 SSL 证书
      const response = await fetch(url, { method: 'HEAD' });
      if (!response.ok) {
        return { safe: false, reason: 'invalid_response' };
      }

      // 检查域名信誉
      const domain = new URL(url).hostname;
      const reputation = await this.checkDomainReputation(domain);
      if (!reputation.safe) {
        return { safe: false, reason: reputation.reason };
      }

      return { safe: true, reason: 'verified' };
    } catch (error) {
      logger.error('URL 安全检查失败:', error);
      return { safe: false, reason: 'check_failed' };
    }
  }

  async checkUrls(urls) {
    const results = await Promise.all(
      urls.map(async url => ({
        url,
        ...(await this.checkUrl(url))
      }))
    );

    return results;
  }

  async checkDomainReputation(domain) {
    try {
      // 这里可以集成第三方安全服务 API
      // 例如 Google Safe Browsing API
      const response = await fetch(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=YOUR_API_KEY`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          client: {
            clientId: 'your-client-id',
            clientVersion: '1.4.1'
          },
          threatInfo: {
            threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING'],
            platformTypes: ['ANY_PLATFORM'],
            threatEntryTypes: ['URL'],
            threatEntries: [{ url: domain }]
          }
        })
      });

      const data = await response.json();
      return {
        safe: !data.matches,
        reason: data.matches ? 'malicious_domain' : 'safe_domain'
      };
    } catch (error) {
      logger.error('域名信誉检查失败:', error);
      return { safe: true, reason: 'check_failed' };
    }
  }

  addToBlacklist(url) {
    this.blacklist.add(url);
    this.saveLists();
  }

  addToWhitelist(url) {
    this.whitelist.add(url);
    this.saveLists();
  }

  removeFromBlacklist(url) {
    this.blacklist.delete(url);
    this.saveLists();
  }

  removeFromWhitelist(url) {
    this.whitelist.delete(url);
    this.saveLists();
  }

  async saveLists() {
    try {
      await chrome.storage.local.set({
        blacklist: Array.from(this.blacklist),
        whitelist: Array.from(this.whitelist)
      });
    } catch (error) {
      logger.error('保存安全列表失败:', error);
    }
  }

  async loadLists() {
    try {
      const result = await chrome.storage.local.get(['blacklist', 'whitelist']);
      if (result.blacklist) {
        this.blacklist = new Set(result.blacklist);
      }
      if (result.whitelist) {
        this.whitelist = new Set(result.whitelist);
      }
    } catch (error) {
      logger.error('加载安全列表失败:', error);
    }
  }

  getBlacklist() {
    return Array.from(this.blacklist);
  }

  getWhitelist() {
    return Array.from(this.whitelist);
  }

  clearBlacklist() {
    this.blacklist.clear();
    this.saveLists();
  }

  clearWhitelist() {
    this.whitelist.clear();
    this.saveLists();
  }
} 