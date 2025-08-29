import { URLProcessor } from './modules/url-processor.js';
import { CacheManager } from './modules/cache-manager.js';
import { SecurityChecker } from './modules/security-checker.js';
import { I18n } from './modules/i18n.js';
import { logger } from './modules/logger.js';
import { messaging } from './modules/messaging.js';
import YouTubeAPI from './modules/youtube-api.js';

document.addEventListener('DOMContentLoaded', function() {
  // 初始化模块
  const urlProcessor = new URLProcessor();
  const cacheManager = new CacheManager();
  const securityChecker = new SecurityChecker();
  const i18n = new I18n();
  const youtubeAPI = new YouTubeAPI();

  // 获取DOM元素
  const urlInput = document.getElementById('urlInput');
  const openUrlsButton = document.getElementById('openUrls');
  const extractUrlsButton = document.getElementById('extractUrls');
  const importUrlsButton = document.getElementById('importUrls');
  const exportUrlsButton = document.getElementById('exportUrls');
  const urlCount = document.getElementById('urlCount');
  const validUrlCount = document.getElementById('validUrlCount');
  const urlPreviewList = document.getElementById('urlPreviewList');
  const closePreview = document.getElementById('closePreview');
  const confirmOpen = document.getElementById('confirmOpen');
  const themeToggle = document.getElementById('themeToggle');
  const sunIcon = document.getElementById('sunIcon');
  const moonIcon = document.getElementById('moonIcon');
  const languageSelect = document.getElementById('languageSelect');
  
  // 标签页相关元素
  const urlTab = document.getElementById('urlTab');
  const contentTab = document.getElementById('contentTab');
  const notepadTab = document.getElementById('notepadTab');
  const urlContent = document.getElementById('urlContent');
  const contentReplaceContent = document.getElementById('contentReplaceContent');
  const notepadContent = document.getElementById('notepadContent');
  
  // 内容替换相关元素
  const originalContent = document.getElementById('originalContent');
  const findText = document.getElementById('findText');
  const replaceWith = document.getElementById('replaceWith');
  const replaceBtn = document.getElementById('replaceBtn');
  const replaceAllBtn = document.getElementById('replaceAllBtn');
  const copyBtn = document.getElementById('copyBtn');
  const clearBtn = document.getElementById('clearBtn');
  
  // 记事本相关元素
  const newNote = document.getElementById('newNote');
  const searchNotes = document.getElementById('searchNotes');
  const noteList = document.getElementById('noteList');
  
  // 记事编辑弹窗相关元素
  const noteEditModal = document.getElementById('noteEditModal');
  const closeNoteEdit = document.getElementById('closeNoteEdit');
  const cancelNoteEdit = document.getElementById('cancelNoteEdit');
  const saveNoteEdit = document.getElementById('saveNoteEdit');
  const modalNoteTitle = document.getElementById('modalNoteTitle');
  const modalNoteContent = document.getElementById('modalNoteContent');
  const modalNoteCreatedDate = document.getElementById('modalNoteCreatedDate');
  const modalNoteModifiedDate = document.getElementById('modalNoteModifiedDate');

  // YouTube相关元素
  const youtubeTab = document.getElementById('youtubeTab');
  const youtubeContent = document.getElementById('youtubeContent');
  const youtubeApiKeyInput = document.getElementById('youtubeApiKeyInput');
  const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
  const youtubeSearch = document.getElementById('youtubeSearch');
  const youtubeSearchBtn = document.getElementById('youtubeSearchBtn');
  const youtubeResults = document.getElementById('youtubeResults');
  const youtubeLoadMore = document.getElementById('youtubeLoadMore');
  const loadMoreBtn = document.getElementById('loadMoreBtn');

  let pendingUrls = [];
  let isDarkMode = false;
  
  // 记事本相关变量
  let notes = [];
  let currentNoteId = null;
  let filteredNotes = [];

  // YouTube相关变量
  let youtubeSearchResults = [];
  let youtubeNextPageToken = null;
  let youtubeCurrentQuery = '';
  let youtubeCache = new Map(); // 添加缓存机制
  const CACHE_EXPIRY = 30 * 60 * 1000; // 30分钟缓存过期时间

  // 确保YouTube API在初始化时就设置好默认密钥
  youtubeAPI.setApiKey('AIzaSyB3XLmosF8neF8QgX9AXCM6mmb3VSO_Pc4');

  // 缓存管理函数
  function getCachedResults(query) {
    const cached = youtubeCache.get(query);
    if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
      return cached.data;
    }
    return null;
  }

  function setCachedResults(query, data) {
    youtubeCache.set(query, {
      data: data,
      timestamp: Date.now()
    });
  }

  function clearExpiredCache() {
    const now = Date.now();
    for (const [key, value] of youtubeCache.entries()) {
      if (now - value.timestamp > CACHE_EXPIRY) {
        youtubeCache.delete(key);
      }
    }
  }

  // 显示状态信息
  const showStatus = (message, type = 'success') => {
    // 简单的控制台日志，避免引用不存在的元素
    console.log(`[${type.toUpperCase()}] ${message}`);
  };

  // 更新界面文本
  const updateUIText = () => {
    try {
      // 更新标题
      document.title = i18n.t('title');
      
      // 更新所有带data-i18n属性的元素
      document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (key) {
          if (element.hasAttribute('placeholder')) {
            element.placeholder = i18n.t(key);
          } else if (element.hasAttribute('title')) {
            element.title = i18n.t(key);
          } else {
            element.textContent = i18n.t(key);
          }
        }
      });

      // 更新带data-i18n-params的元素
      document.querySelectorAll('[data-i18n-params]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const paramsStr = element.getAttribute('data-i18n-params');
        if (key && paramsStr) {
          try {
            const params = JSON.parse(paramsStr);
            element.textContent = i18n.t(key, params);
          } catch (e) {
            console.error('Invalid data-i18n-params:', e);
          }
        }
      });

      // 更新所有选项文本
      const updateSelectOptions = (selectElement) => {
        if (selectElement) {
          const options = selectElement.querySelectorAll('option');
          options.forEach(option => {
            const key = option.getAttribute('data-i18n');
            if (key) option.textContent = i18n.t(key);
          });
        }
      };

      // 更新所有下拉选择框的选项
      updateSelectOptions(languageSelect);

    } catch (error) {
      console.error('更新界面文本失败:', error);
    }
  };

  // 切换深色模式
  const toggleDarkMode = async () => {
    isDarkMode = !isDarkMode;
    const theme = isDarkMode ? 'dark' : 'light';
    
    // 更新 UI
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      sunIcon.classList.remove('hidden');
      moonIcon.classList.add('hidden');
    } else {
      document.documentElement.classList.remove('dark');
      sunIcon.classList.add('hidden');
      moonIcon.classList.remove('hidden');
    }

    // 保存到 localStorage
    localStorage.setItem('theme', theme);
    
    // 保存到 Chrome 存储
    try {
      await chrome.storage.local.set({ darkMode: isDarkMode });
    } catch (error) {
      console.error('保存深色模式设置失败:', error);
    }
  };

  // 保存设置
  const saveSettings = async (showMessage = false) => {
    try {
      const settings = {
        // 已移除URL管理选项
      };

      console.log('[URL Opener v1.4.0] 正在保存设置:', settings);

      // 保存设置和URL列表
      await chrome.storage.local.set({
        settings,
        lastUrls: urlInput.value,
        darkMode: isDarkMode,
        locale: i18n.getLocale()
      });

      console.log('[URL Opener v1.4.0] 设置保存成功');
      
      // 只有在明确要求时才显示保存成功的提示
      if (showMessage) {
        showStatus(i18n.t('settingsSaved'), 'success');
      }
    } catch (error) {
      console.error('[URL Opener v1.4.0] 保存设置失败:', error);
      showStatus(i18n.t('settingsSaveError', { message: error.message }), 'error');
      throw error;
    }
  };

  // 恢复设置
  const restoreSettings = async () => {
    try {
      const result = await chrome.storage.local.get(['settings', 'lastUrls', 'darkMode', 'locale']);
      
      // 已移除URL管理选项的恢复

      if (result.lastUrls) {
        urlInput.value = result.lastUrls;
      }

      if (result.darkMode !== undefined) {
        isDarkMode = result.darkMode;
        if (isDarkMode) {
          document.documentElement.classList.add('dark');
          sunIcon.classList.remove('hidden');
          moonIcon.classList.add('hidden');
        }
      }

      if (result.locale) {
        i18n.setLocale(result.locale);
        updateUIText();
      }

      // 更新URL计数
      await updateUrlCount();
    } catch (error) {
      console.error('恢复设置失败:', error);
    }
  };

  // 更新URL计数
  const updateUrlCount = async () => {
    try {
      const urls = urlInput.value.split('\n').filter(url => url.trim() !== '');
      const processedUrls = await urlProcessor.process(urls, {
        validate: false,
        removeDuplicates: false,
        autoProtocol: false,
        maxUrls: 50
      });
      
      urlCount.textContent = i18n.t('urlCount', { count: urls.length });
      validUrlCount.textContent = i18n.t('validUrlCount', { count: processedUrls.length });
    } catch (error) {
      console.error('更新URL计数失败:', error);
      urlCount.textContent = i18n.t('urlCount', { count: 0 });
      validUrlCount.textContent = i18n.t('validUrlCount', { count: 0 });
    }
  };

  // 按域名分组URL
  const groupUrlsByDomain = (urls) => {
    const groups = {};
    urls.forEach(url => {
      try {
        const urlObj = new URL(url.startsWith('http') ? url : `http://${url}`);
        const domain = urlObj.hostname;
        if (!groups[domain]) {
          groups[domain] = [];
        }
        groups[domain].push(url);
      } catch (error) {
        console.error(`[URL Opener v1.4.0] 处理域名时出错: ${url}, ${error.message}`);
      }
    });
    return groups;
  };

  // 打开URL
  const openUrls = async (urls) => {
    try {
      if (urls.length === 0) {
        throw new Error('没有有效的URL');
      }

      // 限制URL数量
      const maxUrlCount = 50;
      if (urls.length > maxUrlCount) {
        urls = urls.slice(0, maxUrlCount);
        console.log(`[URL Opener v1.4.0] URL数量超过限制，已截取前 ${maxUrlCount} 个`);
        showStatus(i18n.t('maxUrlsLimitReached', { count: maxUrlCount }), 'warning');
      }

      // 安全检查
      const securityResults = await securityChecker.checkUrls(urls);
      const unsafeUrls = securityResults.filter(result => !result.safe);
      if (unsafeUrls.length > 0) {
        console.warn(`[URL Opener v1.4.0] 安全警告：发现 ${unsafeUrls.length} 个不安全的URL:`, unsafeUrls);
      }

      console.log(`[URL Opener v1.4.0] 准备打开 ${urls.length} 个URL`);

      // 应用打开顺序 - 使用默认顺序

      // 显示进度条 - 已移除进度条功能

      // 创建标签页
      const tabs = [];
      let successCount = 0;
      let failCount = 0;

      for (let i = 0; i < urls.length; i++) {
        try {
          const tab = await chrome.tabs.create({
            url: urls[i],
            active: false
          });
          console.log(`[URL Opener v1.4.0] [${i + 1}/${urls.length}] 成功创建标签页: ${urls[i]}`);
          tabs.push(tab);
          successCount++;

          // 更新进度 - 已移除进度条功能
        } catch (error) {
          console.error(`[URL Opener v1.4.0] [${i + 1}/${urls.length}] 创建标签页失败: ${urls[i]}, 错误: ${error.message}`);
          failCount++;
        }
      }

      // 处理标签页分组 - 已移除分组功能

      // 处理URL分类
      if (urlCategory.value !== 'none') {
        try {
          if (urlCategory.value === 'domain') {
            const groups = groupUrlsByDomain(urls);
            console.log(`[URL Opener v1.4.0] 按域名分组完成，共 ${Object.keys(groups).length} 个域名组:`, groups);
          } else if (urlCategory.value === 'custom') {
            // TODO: 实现自定义分类
          }
        } catch (error) {
          console.error(`[URL Opener v1.4.0] URL分类失败: ${error.message}`);
        }
      }

      // 隐藏进度条
      progressContainer.classList.add('hidden');

      // 更新状态
      if (failCount > 0) {
        statusDiv.textContent = `成功打开 ${successCount} 个URL，失败 ${failCount} 个`;
        statusDiv.classList.remove('hidden', 'text-green-600');
        statusDiv.classList.add('text-red-600');
      } else {
        statusDiv.textContent = `成功打开 ${successCount} 个URL`;
        statusDiv.classList.remove('hidden', 'text-red-600');
        statusDiv.classList.add('text-green-600');
      }

      return successCount;
    } catch (error) {
      console.error(`[URL Opener v1.4.0] 打开URL时出错: ${error.message}`);
      throw error;
    }
  };

  // 导入URL
  const importUrls = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          const text = await file.text();
          let urls = [];
          
          if (file.name.endsWith('.json')) {
            const data = JSON.parse(text);
            urls = data.urls || [];
          } else {
            urls = text.split('\n').filter(url => url.trim() !== '');
          }

          if (urls.length === 0) {
            throw new Error('文件中没有找到有效的URL');
          }

          console.log(`[URL Opener v1.4.0] 导入文件成功: ${file.name}, 包含 ${urls.length} 个URL`);
          urlInput.value = urls.join('\n');
          updateUrlCount();
          showStatus(i18n.t('importSuccess'));
        } catch (error) {
          console.error(`[URL Opener v1.4.0] 导入文件失败: ${file.name}, 错误: ${error.message}`);
          showStatus(i18n.t('importError'), 'error');
        }
      }
    };
    input.click();
  };

  // 导出URL
  const exportUrls = () => {
    try {
      const urls = urlInput.value.split('\n').filter(url => url.trim() !== '');
      if (urls.length === 0) {
        console.warn('[URL Opener v1.4.0] 导出失败：没有可导出的URL');
        showStatus(i18n.t('noUrlsToExport'), 'error');
        return;
      }

      const format = 'json';
      const content = JSON.stringify({ urls }, null, 2);
      const blob = new Blob([content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'urls.json';
      a.click();
      URL.revokeObjectURL(url);

      console.log(`[URL Opener v1.4.0] 导出成功：${urls.length} 个URL已保存到 urls.json`);
      showStatus(i18n.t('exportSuccess'));
    } catch (error) {
      console.error(`[URL Opener v1.4.0] 导出URL失败: ${error.message}`);
      showStatus(i18n.t('exportError', { message: error.message }), 'error');
    }
  };

  // 事件监听器
  urlInput.addEventListener('input', () => {
    updateUrlCount();
    saveSettings();
  });
  
  openUrlsButton.addEventListener('click', async () => {
    try {
      // 显示处理状态
      console.log('[PROCESSING]', i18n.t('processing'));

      // 获取输入文本并处理
      const inputText = urlInput.value;
      const lines = inputText.split('\n').filter(line => line.trim());
      
      if (lines.length === 0) {
        throw new Error(i18n.t('noValidUrls'));
      }

      // 使用正则表达式提取URL
      const urlRegex = /(?:(?:https?:\/\/)?(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}|(?:\d{1,3}\.){3}\d{1,3})(?::\d{1,5})?(?:\/[^\s]*)?)|(?:(?:https?:\/\/)\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(?::\d{1,5})?(?:\/[^\s]*)?)/gi;
      
      const urls = [];
      for (const line of lines) {
        const urlMatches = line.match(urlRegex);
        if (urlMatches) {
          for (const match of urlMatches) {
            // 额外验证，确保不是纯数字
            if (!/^\d+(\.\d+)*$/.test(match.replace(/^https?:\/\//, ''))) {
              const url = urlProcessor.preprocessUrl(match, false);
              if (url) {
                urls.push(url);
              }
            }
          }
        }
      }

      if (urls.length === 0) {
        throw new Error(i18n.t('noValidUrls'));
      }

      // 直接打开URL，不显示预览弹窗
      const count = await openUrls(urls);
      
      // 显示成功状态
      showStatus(i18n.t('success', { count }), 'success');
      
      // 保存设置（不显示提示）
      saveSettings(false);
    } catch (error) {
      console.error('操作失败:', error);
      showStatus(i18n.t('error', { message: error.message }), 'error');
    }
  });

  extractUrlsButton.addEventListener('click', async () => {
    try {
      // 显示处理状态
      console.log('[PROCESSING]', i18n.t('processing'));

      // 获取输入文本
      const text = urlInput.value;
      if (!text.trim()) {
        throw new Error(i18n.t('noValidUrls'));
      }

      // 分行并过滤空行
      const lines = text.split('\n').filter(line => line.trim());
      console.log(`[URL Opener v1.4.0] 开始处理 ${lines.length} 行文本`);

      // 处理每一行，提取 URL
      const urls = [];
      for (const line of lines) {
        // 使用更精确的正则表达式匹配 URL
        const urlRegex = /(?:(?:https?:\/\/)?(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}|(?:\d{1,3}\.){3}\d{1,3})(?::\d{1,5})?(?:\/[^\s]*)?)|(?:(?:https?:\/\/)\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(?::\d{1,5})?(?:\/[^\s]*)?)/gi;
        
        const urlMatches = line.match(urlRegex);
        if (urlMatches) {
          for (const match of urlMatches) {
            // 额外验证，确保不是纯数字
            if (!/^\d+(\.\d+)*$/.test(match.replace(/^https?:\/\//, ''))) {
              const url = urlProcessor.preprocessUrl(match, false);
              if (url) {
                urls.push(url);
              }
            }
          }
        }
      }
      console.log(`[URL Opener v1.4.0] 提取完成：找到 ${urls.length} 个有效URL`);

      if (urls.length === 0) {
        throw new Error(i18n.t('noValidUrls'));
      }

      // 更新输入框内容
      urlInput.value = urls.join('\n');
      
      // 更新计数
      await updateUrlCount();

      // 显示成功消息
      console.log('[SUCCESS]', i18n.t('success', { count: urls.length }));

    } catch (error) {
      console.error(`[URL Opener v1.4.0] 提取URL失败: ${error.message}`);
      showStatus(i18n.t('error', { message: error.message }), 'error');
    }
  });

  importUrlsButton.addEventListener('click', importUrls);
  exportUrlsButton.addEventListener('click', exportUrls);

  // 标签页切换功能
  function switchTab(activeTab, activeContent) {
    // 所有标签页
    const allTabs = [urlTab, contentTab, notepadTab, calculatorTab, youtubeTab];
    const allContents = [urlContent, contentReplaceContent, notepadContent, calculatorContent, youtubeContent];
    
    // 重置所有标签页状态
    allTabs.forEach(tab => {
      tab.classList.remove('bg-blue-600', 'text-white', 'shadow-md');
      tab.classList.add('bg-slate-100', 'dark:bg-slate-700', 'text-slate-700', 'dark:text-slate-300');
    });
    
    // 隐藏所有内容
    allContents.forEach(content => {
      content.classList.add('hidden');
    });
    
    // 激活选中的标签页
    activeTab.classList.remove('bg-slate-100', 'dark:bg-slate-700', 'text-slate-700', 'dark:text-slate-300');
    activeTab.classList.add('bg-blue-600', 'text-white', 'shadow-md');
    
    // 显示对应内容
    activeContent.classList.remove('hidden');
  }

  urlTab.addEventListener('click', () => {
    switchTab(urlTab, urlContent);
  });

  contentTab.addEventListener('click', () => {
    switchTab(contentTab, contentReplaceContent);
  });

  notepadTab.addEventListener('click', () => {
    switchTab(notepadTab, notepadContent);
    // 加载记事列表
    loadNotes();
  });

  calculatorTab.addEventListener('click', () => {
    switchTab(calculatorTab, calculatorContent);
  });

  youtubeTab.addEventListener('click', () => {
    console.log('[YouTube] 点击YouTube标签页');
    switchTab(youtubeTab, youtubeContent);
    
    // 清理过期缓存
    clearExpiredCache();
    clearExpiredCache();
    
    // 显示欢迎信息，不进行默认搜索
    if (youtubeResults.children.length === 0) {
      youtubeResults.innerHTML = `
        <div class="text-center py-12">
          <div class="text-slate-400 mb-4">
            <svg class="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">YouTube 视频搜索</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">输入关键词搜索您喜欢的视频</p>
          <div class="text-xs text-slate-400">
            <p>• 支持缓存机制，相同搜索会使用缓存结果</p>
            <p>• 缓存有效期为30分钟</p>
            <p>• 点击视频卡片可直接播放</p>
          </div>
        </div>
      `;
    }
    
    // 初始化YouTube API密钥
    initializeYouTubeAPI();
  });

  // 内容替换功能
  function performReplace(replaceAll = false) {
    try {
      const original = originalContent.value.trim();
      const find = findText.value.trim();
      const replace = replaceWith.value.trim();
      
      if (!original) {
        showStatus(i18n.t('originalContentRequired'), 'warning');
        return;
      }
      
      if (!find) {
        showStatus(i18n.t('findTextRequired'), 'warning');
        return;
      }
      
      let result = original;
      let count = 0;
      
      // 简单的文本替换，不区分大小写
      const regex = new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      
      if (replaceAll) {
        result = original.replace(regex, replace);
        count = (original.match(regex) || []).length;
      } else {
        result = original.replace(regex, replace);
        count = 1;
      }
      
      // 更新原内容区域显示替换结果
      originalContent.value = result;
      
      showStatus(i18n.t('replaceSuccess'), 'success');
      
    } catch (error) {
      console.error(`[URL Opener v1.4.0] 内容替换失败: ${error.message}`);
      showStatus(i18n.t('replaceError', { message: error.message }), 'error');
    }
  }

  replaceBtn.addEventListener('click', () => performReplace(false));
  replaceAllBtn.addEventListener('click', () => performReplace(true));

  // 复制按钮
  copyBtn.addEventListener('click', async () => {
    try {
      const content = originalContent.value.trim();
      
      if (!content) {
        showStatus(i18n.t('noContentToCopy'), 'warning');
        return;
      }
      
      await navigator.clipboard.writeText(content);
      showStatus(i18n.t('copySuccess'), 'success');
      
    } catch (error) {
      console.error(`[URL Opener v1.4.0] 复制失败: ${error.message}`);
      showStatus(i18n.t('copyError', { message: error.message }), 'error');
    }
  });

  // 清空按钮
  clearBtn.addEventListener('click', () => {
    originalContent.value = '';
    findText.value = '';
    replaceWith.value = '';
    showStatus(i18n.t('clearSuccess'), 'success');
  });

  // 监听设置变更 - 已移除URL管理选项

  // 监听主题切换
  themeToggle.addEventListener('click', toggleDarkMode);

  // 监听语言切换
  languageSelect.addEventListener('change', async (e) => {
    const locale = e.target.value;
    if (i18n.setLocale(locale)) {
      updateUIText();
      
      // 保存设置
      try {
        await saveLanguageSetting(locale);
      } catch (error) {
        console.error('保存语言设置失败:', error);
      }
    }
  });

  // 保存语言设置
  async function saveLanguageSetting(locale) {
    try {
      await chrome.storage.local.set({ language: locale });
      // 使用新的消息处理工具
      await messaging.sendMessage({
        type: 'LANGUAGE_CHANGED',
        data: { locale }
      });
      logger.info('语言设置已保存:', locale);
    } catch (error) {
      logger.error('保存语言设置失败:', error);
      throw error;
    }
  }

  // 记事本功能
  function loadNotes() {
    chrome.storage.local.get(['notes'], (result) => {
      notes = result.notes || [];
      filteredNotes = [...notes];
      renderNoteList();
    });
  }

  function saveNotes() {
    chrome.storage.local.set({ notes: notes }, () => {
      console.log('[URL Opener v1.4.0] 记事已保存');
    });
  }

  function renderNoteList() {
    noteList.innerHTML = '';
    
    if (filteredNotes.length === 0) {
      noteList.innerHTML = '<div class="text-sm text-slate-500 dark:text-slate-400 text-center py-4">暂无记事</div>';
      return;
    }
    
    filteredNotes.forEach(note => {
      const noteItem = document.createElement('div');
      noteItem.className = `group p-3 border-b border-gray-200 last:border-b-0 transition-colors duration-200 cursor-pointer ${note.id === currentNoteId ? 'bg-blue-50' : 'hover:bg-gray-50'}`;
      
      const content = note.content ? note.content.substring(0, 60) + (note.content.length > 60 ? '...' : '') : '';
      
      noteItem.innerHTML = `
        <div class="flex justify-between items-start">
          <div class="flex-1 min-w-0">
            <div class="text-sm font-medium text-gray-900 truncate mb-1">${note.title || '无标题'}</div>
            <div class="text-xs text-gray-600 mb-1 line-clamp-1">${content}</div>
            <div class="text-xs text-gray-400">${formatDate(note.modifiedDate)}</div>
          </div>
          <div class="flex space-x-2 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
            <button class="edit-note-btn px-2 py-1 text-xs text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" data-note-id="${note.id}">编辑</button>
            <button class="delete-note-btn px-2 py-1 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors" data-note-id="${note.id}">删除</button>
          </div>
        </div>
      `;
      
      // 添加编辑和删除按钮的事件监听器
      const editBtn = noteItem.querySelector('.edit-note-btn');
      const deleteBtn = noteItem.querySelector('.delete-note-btn');
      
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        editNoteById(note.id);
      });
      
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteNoteById(note.id);
      });
      
      noteItem.addEventListener('click', () => selectNote(note.id));
      noteList.appendChild(noteItem);
    });
  }

  function selectNote(noteId) {
    currentNoteId = noteId;
    renderNoteList();
  }

  function createNewNote() {
    currentNoteId = null;
    openNoteEditModal();
  }



  function editNoteById(noteId) {
    const note = notes.find(n => n.id === noteId);
    if (note) {
      currentNoteId = noteId;
      openNoteEditModal(note);
    }
  }

  function deleteNoteById(noteId) {
    const note = notes.find(n => n.id === noteId);
    if (note && confirm(i18n.t('confirmDeleteNote'))) {
      notes = notes.filter(n => n.id !== noteId);
      if (currentNoteId === noteId) {
        currentNoteId = null;
      }
      
      // 更新过滤后的列表
      filteredNotes = filteredNotes.filter(n => n.id !== noteId);
      
      saveNotes();
      renderNoteList();
      showStatus(i18n.t('noteDeletedSuccess'), 'success');
    }
  }

  let autoSaveTimer = null;
  let currentEditingNote = null;

  function openNoteEditModal(note = null) {
    if (note) {
      // 编辑现有记事
      currentEditingNote = { ...note };
      modalNoteTitle.value = note.title || '';
      modalNoteContent.value = note.content || '';
      modalNoteCreatedDate.textContent = `创建时间：${formatDate(note.createdDate)}`;
      modalNoteModifiedDate.textContent = `修改时间：${formatDate(note.modifiedDate)}`;
    } else {
      // 新建记事
      currentEditingNote = null;
      modalNoteTitle.value = '';
      modalNoteContent.value = '';
      const now = new Date();
      modalNoteCreatedDate.textContent = `创建时间：${formatDate(now)}`;
      modalNoteModifiedDate.textContent = `修改时间：${formatDate(now)}`;
    }
    
    noteEditModal.classList.remove('hidden');
    noteEditModal.classList.add('flex');
    
    // 启动自动保存
    startAutoSave();
  }

  function startAutoSave() {
    // 清除之前的定时器
    if (autoSaveTimer) {
      clearInterval(autoSaveTimer);
    }
    
    // 每30秒自动保存一次
    autoSaveTimer = setInterval(() => {
      if (noteEditModal.classList.contains('flex')) {
        autoSaveCurrentNote();
      }
    }, 30000);
  }

  function stopAutoSave() {
    if (autoSaveTimer) {
      clearInterval(autoSaveTimer);
      autoSaveTimer = null;
    }
  }

  function autoSaveCurrentNote() {
    const title = modalNoteTitle.value.trim();
    const content = modalNoteContent.value.trim();
    
    if (!title && !content) {
      return; // 不保存空内容
    }
    
    const now = new Date();
    
    if (currentEditingNote && currentEditingNote.id) {
      // 更新现有记事
      const noteIndex = notes.findIndex(n => n.id === currentEditingNote.id);
      if (noteIndex !== -1) {
        notes[noteIndex] = {
          ...notes[noteIndex],
          title,
          content,
          modifiedDate: now
        };
        currentEditingNote = { ...notes[noteIndex] };
      }
    } else if (currentNoteId) {
      // 如果已经有currentNoteId，说明是编辑现有记事
      const noteIndex = notes.findIndex(n => n.id === currentNoteId);
      if (noteIndex !== -1) {
        notes[noteIndex] = {
          ...notes[noteIndex],
          title,
          content,
          modifiedDate: now
        };
        currentEditingNote = { ...notes[noteIndex] };
      }
    } else {
      // 创建新记事
      const newNote = {
        id: Date.now().toString(),
        title,
        content,
        createdDate: now,
        modifiedDate: now
      };
      notes.unshift(newNote);
      currentEditingNote = { ...newNote };
      currentNoteId = newNote.id;
    }
    
    // 更新过滤后的列表
    filteredNotes = [...notes];
    
    saveNotes();
    renderNoteList();
    
    // 更新弹窗中的时间显示
    if (noteEditModal.classList.contains('flex')) {
      const savedNote = notes.find(n => n.id === currentNoteId);
      if (savedNote) {
        modalNoteCreatedDate.textContent = `创建时间：${formatDate(savedNote.createdDate)}`;
        modalNoteModifiedDate.textContent = `修改时间：${formatDate(savedNote.modifiedDate)}`;
      }
    }
    
    console.log('[URL Opener v1.4.0] 自动保存记事完成');
  }

  function closeNoteEditModal() {
    // 停止自动保存
    stopAutoSave();
    
    noteEditModal.classList.remove('flex');
    noteEditModal.classList.add('hidden');
    
    // 清理编辑状态
    currentEditingNote = null;
  }

  function saveNoteFromModal() {
    const title = modalNoteTitle.value.trim();
    const content = modalNoteContent.value.trim();
    
    if (!title && !content) {
      showStatus(i18n.t('noteEmptyError'), 'warning');
      return;
    }
    
    const now = new Date();
    
    if (currentEditingNote && currentEditingNote.id) {
      // 更新现有记事
      const noteIndex = notes.findIndex(n => n.id === currentEditingNote.id);
      if (noteIndex !== -1) {
        notes[noteIndex] = {
          ...notes[noteIndex],
          title,
          content,
          modifiedDate: now
        };
      }
    } else if (currentNoteId) {
      // 如果已经有currentNoteId，说明是编辑现有记事
      const noteIndex = notes.findIndex(n => n.id === currentNoteId);
      if (noteIndex !== -1) {
        notes[noteIndex] = {
          ...notes[noteIndex],
          title,
          content,
          modifiedDate: now
        };
      }
    } else {
      // 创建新记事
      const newNote = {
        id: Date.now().toString(),
        title,
        content,
        createdDate: now,
        modifiedDate: now
      };
      notes.unshift(newNote);
      currentNoteId = newNote.id;
    }
    
    // 更新过滤后的列表
    filteredNotes = [...notes];
    
    saveNotes();
    renderNoteList();
    
    // 更新弹窗中的时间显示
    if (noteEditModal.classList.contains('flex')) {
      const savedNote = notes.find(n => n.id === currentNoteId);
      if (savedNote) {
        modalNoteCreatedDate.textContent = `创建时间：${formatDate(savedNote.createdDate)}`;
        modalNoteModifiedDate.textContent = `修改时间：${formatDate(savedNote.modifiedDate)}`;
      }
    }
    
    closeNoteEditModal();
    showStatus(i18n.t('noteSavedSuccess'), 'success');
  }

  function deleteCurrentNote() {
    if (!currentNoteId) {
      showStatus(i18n.t('noNoteSelected'), 'warning');
      return;
    }
    
    if (confirm(i18n.t('confirmDeleteNote'))) {
      notes = notes.filter(n => n.id !== currentNoteId);
      saveNotes();
      createNewNote();
      showStatus(i18n.t('noteDeletedSuccess'), 'success');
    }
  }

  function searchNotesFunction() {
    const searchTerm = searchNotes.value.toLowerCase().trim();
    
    if (!searchTerm) {
      filteredNotes = [...notes];
    } else {
      filteredNotes = notes.filter(note => 
        (note.title && note.title.toLowerCase().includes(searchTerm)) ||
        (note.content && note.content.toLowerCase().includes(searchTerm))
      );
    }
    
    renderNoteList();
  }

  function formatDate(date) {
    if (!date) return '';
    
    let d;
    if (typeof date === 'string') {
      d = new Date(date);
    } else if (date instanceof Date) {
      d = date;
    } else {
      return '';
    }
    
    // 检查日期是否有效
    if (isNaN(d.getTime())) {
      return '';
    }
    
    return d.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // 记事本事件监听器
  newNote.addEventListener('click', createNewNote);
  searchNotes.addEventListener('input', searchNotesFunction);
  
  // 记事编辑弹窗事件监听器
  closeNoteEdit.addEventListener('click', closeNoteEditModal);
  cancelNoteEdit.addEventListener('click', closeNoteEditModal);
  saveNoteEdit.addEventListener('click', saveNoteFromModal);
  
  // 点击弹窗背景关闭弹窗
  noteEditModal.addEventListener('click', (e) => {
    if (e.target === noteEditModal) {
      closeNoteEditModal();
    }
  });

  // 监听页面可见性变化，在用户切换页面时自动保存
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && noteEditModal.classList.contains('flex')) {
      autoSaveCurrentNote();
    }
  });

  // 监听窗口失去焦点时自动保存
  window.addEventListener('blur', () => {
    if (noteEditModal.classList.contains('flex')) {
      autoSaveCurrentNote();
    }
  });

  // 初始化国际化
  i18n.loadLocale();
  
  // 初始化时恢复设置
  restoreSettings();
  updateUrlCount();

  // YouTube功能
  function initializeYouTubeAPI() {
    // 从输入框获取API密钥
    const apiKey = youtubeApiKeyInput.value.trim();
    if (apiKey) {
      youtubeAPI.setApiKey(apiKey);
    } else {
      // 如果没有输入，使用默认密钥
      youtubeAPI.setApiKey('AIzaSyB3XLmosF8neF8QgX9AXCM6mmb3VSO_Pc4');
    }
  }

  function saveApiKey() {
    const apiKey = youtubeApiKeyInput.value.trim();
    if (apiKey) {
      youtubeAPI.setApiKey(apiKey);
      showStatus('API密钥已保存', 'success');
    } else {
      showStatus('请输入有效的API密钥', 'warning');
    }
  }

  function searchYouTubeVideos() {
    const query = youtubeSearch.value.trim();
    if (!query) {
      showStatus('请输入搜索关键词', 'warning');
      return;
    }

    // 检查缓存
    const cachedData = getCachedResults(query);
    if (cachedData) {
      console.log('[YouTube] 使用缓存结果:', query);
      youtubeSearchResults = cachedData.items;
      youtubeNextPageToken = cachedData.nextPageToken;
      youtubeCurrentQuery = query;
      
      if (cachedData.items.length === 0) {
        youtubeResults.innerHTML = `<div class="text-center py-8 text-slate-500">没有找到相关视频</div>`;
        youtubeLoadMore.classList.add('hidden');
      } else {
        renderYouTubeResults(cachedData.items);
        if (cachedData.nextPageToken) {
          youtubeLoadMore.classList.remove('hidden');
        } else {
          youtubeLoadMore.classList.add('hidden');
        }
      }
      
      showStatus(`找到 ${cachedData.totalResults} 个视频 (缓存)`, 'success');
      return;
    }

    // 确保API密钥已设置
    initializeYouTubeAPI();
    
    console.log('[YouTube] 开始搜索:', query);
    console.log('[YouTube] API密钥:', youtubeAPI.apiKey);

    // 显示加载状态
    youtubeSearchBtn.disabled = true;
    youtubeSearchBtn.textContent = '搜索中...';
    youtubeResults.innerHTML = '<div class="text-center py-8 text-slate-500">搜索中...</div>';

    youtubeAPI.searchVideos(query)
      .then(data => {
        // 缓存结果
        setCachedResults(query, data);
        
        youtubeSearchResults = data.items;
        youtubeNextPageToken = data.nextPageToken;
        youtubeCurrentQuery = query;
        
        if (data.items.length === 0) {
          youtubeResults.innerHTML = `<div class="text-center py-8 text-slate-500">没有找到相关视频</div>`;
          youtubeLoadMore.classList.add('hidden');
        } else {
          renderYouTubeResults(data.items);
          if (data.nextPageToken) {
            youtubeLoadMore.classList.remove('hidden');
          } else {
            youtubeLoadMore.classList.add('hidden');
          }
        }
        
        showStatus(`找到 ${data.totalResults} 个视频`, 'success');
      })
      .catch(error => {
        console.error('[YouTube] 搜索失败:', error);
        youtubeResults.innerHTML = `<div class="text-center py-8 text-red-500">搜索失败：${error.message}</div>`;
        showStatus(`搜索失败：${error.message}`, 'error');
      })
      .finally(() => {
        youtubeSearchBtn.disabled = false;
        youtubeSearchBtn.textContent = '搜索';
      });
  }

  function loadMoreYouTubeVideos() {
    if (!youtubeNextPageToken || !youtubeCurrentQuery) {
      return;
    }

    loadMoreBtn.disabled = true;
    loadMoreBtn.textContent = '加载中...';

    youtubeAPI.searchVideos(youtubeCurrentQuery, youtubeNextPageToken)
      .then(data => {
        youtubeSearchResults = [...youtubeSearchResults, ...data.items];
        youtubeNextPageToken = data.nextPageToken;
        
        renderYouTubeResults(data.items, true);
        
        if (!data.nextPageToken) {
          youtubeLoadMore.classList.add('hidden');
        }
        
        showStatus(`已加载 ${data.items.length} 个视频`, 'success');
      })
      .catch(error => {
        console.error('[YouTube] 加载更多失败:', error);
        showStatus(`搜索失败：${error.message}`, 'error');
      })
      .finally(() => {
        loadMoreBtn.disabled = false;
        loadMoreBtn.textContent = '加载更多';
      });
  }

  function renderYouTubeResults(videos, append = false) {
    if (!append) {
      youtubeResults.innerHTML = '';
    }

    videos.forEach(video => {
      const videoCard = document.createElement('div');
      videoCard.className = 'bg-white dark:bg-slate-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer group';
      
      const thumbnailUrl = youtubeAPI.getThumbnailUrl(video.id.videoId, 'high');
      const videoUrl = youtubeAPI.getVideoUrl(video.id.videoId);
      
      videoCard.innerHTML = `
        <div class="relative">
          <img src="${thumbnailUrl}" alt="${video.snippet.title}" class="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-200">
          <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
            <div class="bg-red-600 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
        </div>
        <div class="p-3">
          <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 mb-2 group-hover:text-red-600 transition-colors">${video.snippet.title}</h3>
          <p class="text-xs text-slate-600 dark:text-slate-400 mb-1">${video.snippet.channelTitle}</p>
          <p class="text-xs text-slate-500 dark:text-slate-500 mb-2">${youtubeAPI.formatPublishedDate(video.snippet.publishedAt)}</p>
          <p class="text-xs text-slate-500 dark:text-slate-500 line-clamp-2">${video.snippet.description}</p>
        </div>
      `;
      
      // 添加点击事件 - 点击整个卡片都可以播放
      videoCard.addEventListener('click', () => {
        console.log('[YouTube] 点击视频卡片，URL:', videoUrl);
        chrome.tabs.create({ url: videoUrl, active: false });
        showStatus('视频已在新标签页中打开', 'success');
      });
      
      youtubeResults.appendChild(videoCard);
    });
  }

  // YouTube事件监听器
  saveApiKeyBtn.addEventListener('click', saveApiKey);
  youtubeSearchBtn.addEventListener('click', () => {
    console.log('[YouTube] 点击搜索按钮');
    searchYouTubeVideos();
  });
  loadMoreBtn.addEventListener('click', loadMoreYouTubeVideos);
  
  // 搜索框回车键事件
  youtubeSearch.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      searchYouTubeVideos();
    }
  });

  // 计算器功能
  let calculatorDisplay = '0';
  let calculatorHistory = '';
  let calculatorMemory = 0;
  let calculatorHistoryList = [];

  // 计算器显示更新
  function updateCalculatorDisplay() {
    document.getElementById('calculatorDisplay').textContent = calculatorDisplay;
    document.getElementById('calculatorHistory').textContent = calculatorHistory;
  }

  // 计算器数字输入
  function appendNumber(number) {
    if (calculatorDisplay === '0' && number !== '.') {
      calculatorDisplay = number;
    } else {
      if (number === '.' && calculatorDisplay.includes('.')) return;
      calculatorDisplay += number;
    }
    updateCalculatorDisplay();
  }

  // 计算器操作符
  function setOperator(operator) {
    if (calculatorDisplay !== '0') {
      calculatorHistory = calculatorDisplay + ' ' + operator;
      calculatorMemory = parseFloat(calculatorDisplay);
      calculatorDisplay = '0';
      updateCalculatorDisplay();
    }
  }

  // 计算器计算
  function calculate() {
    if (calculatorHistory && calculatorDisplay !== '0') {
      const currentNumber = parseFloat(calculatorDisplay);
      const operator = calculatorHistory.split(' ')[1];
      let result = 0;

      switch (operator) {
        case '+':
          result = calculatorMemory + currentNumber;
          break;
        case '-':
          result = calculatorMemory - currentNumber;
          break;
        case '*':
          result = calculatorMemory * currentNumber;
          break;
        case '/':
          result = calculatorMemory / currentNumber;
          break;
        case '%':
          result = calculatorMemory % currentNumber;
          break;
      }

      const calculation = `${calculatorHistory} ${calculatorDisplay} = ${result}`;
      addToHistory(calculation);
      
      calculatorDisplay = result.toString();
      calculatorHistory = '';
      updateCalculatorDisplay();
    }
  }

  // 计算器清除
  function clearCalculator() {
    calculatorDisplay = '0';
    calculatorHistory = '';
    updateCalculatorDisplay();
  }

  // 计算器退格
  function backspace() {
    if (calculatorDisplay.length > 1) {
      calculatorDisplay = calculatorDisplay.slice(0, -1);
    } else {
      calculatorDisplay = '0';
    }
    updateCalculatorDisplay();
  }



  function percent() {
    const num = parseFloat(calculatorDisplay);
    const result = num / 100;
    calculatorDisplay = result.toString();
    updateCalculatorDisplay();
  }

  // 添加计算历史
  function addToHistory(calculation) {
    calculatorHistoryList.unshift(calculation);
    if (calculatorHistoryList.length > 10) {
      calculatorHistoryList.pop();
    }
    updateHistoryDisplay();
  }

  // 更新历史显示
  function updateHistoryDisplay() {
    const historyContainer = document.getElementById('calculatorHistoryList');
    historyContainer.innerHTML = calculatorHistoryList.map(item => 
      `<div class="text-xs text-slate-600 dark:text-slate-400 p-2 bg-slate-50 dark:bg-slate-700 rounded border-l-2 border-blue-500">${item}</div>`
    ).join('');
  }

  // 清空历史
  function clearHistory() {
    calculatorHistoryList = [];
    updateHistoryDisplay();
  }

  // 计算器事件监听器
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('calc-btn')) {
      const action = e.target.getAttribute('data-action');
      const value = e.target.getAttribute('data-value');

      switch (action) {
        case 'number':
          appendNumber(value);
          break;
        case 'operator':
          setOperator(value);
          break;
        case 'equals':
          calculate();
          break;
        case 'clear':
          clearCalculator();
          break;
        case 'backspace':
          backspace();
          break;
        case 'decimal':
          appendNumber('.');
          break;
        case 'percent':
          percent();
          break;
      }
    }


  });

  // 清空历史按钮
  document.getElementById('clearHistory').addEventListener('click', clearHistory);

  // 键盘支持
  document.addEventListener('keydown', (e) => {
    if (document.getElementById('calculatorContent').classList.contains('hidden')) {
      return;
    }

    const key = e.key;
    
    if (key >= '0' && key <= '9') {
      appendNumber(key);
    } else if (key === '.') {
      appendNumber('.');
    } else if (key === '+') {
      setOperator('+');
    } else if (key === '-') {
      setOperator('-');
    } else if (key === '*') {
      setOperator('*');
    } else if (key === '/') {
      setOperator('/');
    } else if (key === 'Enter' || key === '=') {
      calculate();
    } else if (key === 'Escape') {
      clearCalculator();
    } else if (key === 'Backspace') {
      backspace();
    } else if (key === '%') {
      percent();
    }
  });
});