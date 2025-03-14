import { URLProcessor } from './modules/url-processor.js';
import { CacheManager } from './modules/cache-manager.js';
import { SecurityChecker } from './modules/security-checker.js';
import { I18n } from './modules/i18n.js';

document.addEventListener('DOMContentLoaded', function() {
  // 初始化模块
  const urlProcessor = new URLProcessor();
  const cacheManager = new CacheManager();
  const securityChecker = new SecurityChecker();
  const i18n = new I18n();

  // 获取DOM元素
  const urlInput = document.getElementById('urlInput');
  const openOrder = document.getElementById('openOrder');
  const removeDuplicates = document.getElementById('removeDuplicates');
  const delayLoad = document.getElementById('delayLoad');
  const preserveInput = document.getElementById('preserveInput');
  const searchNonUrls = document.getElementById('searchNonUrls');
  const validateUrls = document.getElementById('validateUrls');
  const autoProtocol = document.getElementById('autoProtocol');
  const groupOption = document.getElementById('groupOption');
  const urlCategory = document.getElementById('urlCategory');
  const maxUrls = document.getElementById('maxUrls');
  const openUrlsButton = document.getElementById('openUrls');
  const extractUrlsButton = document.getElementById('extractUrls');
  const importUrlsButton = document.getElementById('importUrls');
  const exportUrlsButton = document.getElementById('exportUrls');
  const statusModal = document.getElementById('statusModal');
  const statusDiv = document.getElementById('status');
  const closeStatus = document.getElementById('closeStatus');
  const progressContainer = document.getElementById('progressContainer');
  const progressBar = document.getElementById('progressBar');
  const progressText = document.getElementById('progressText');
  const urlCount = document.getElementById('urlCount');
  const validUrlCount = document.getElementById('validUrlCount');
  const urlPreviewModal = document.getElementById('urlPreviewModal');
  const urlPreviewList = document.getElementById('urlPreviewList');
  const closePreview = document.getElementById('closePreview');
  const confirmOpen = document.getElementById('confirmOpen');
  const themeToggle = document.getElementById('themeToggle');
  const sunIcon = document.getElementById('sunIcon');
  const moonIcon = document.getElementById('moonIcon');
  const languageSelect = document.getElementById('languageSelect');

  let pendingUrls = [];
  let isDarkMode = false;

  // 显示状态信息
  const showStatus = (message, type = 'success') => {
    statusDiv.textContent = message;
    statusDiv.className = `text-lg font-medium ${type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`;
    statusModal.classList.remove('hidden');
    statusModal.classList.add('flex');
  };

  // 隐藏状态信息
  const hideStatus = () => {
    statusModal.classList.remove('flex');
    statusModal.classList.add('hidden');
  };

  // 关闭状态弹窗
  closeStatus.addEventListener('click', hideStatus);

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
      updateSelectOptions(openOrder);
      updateSelectOptions(groupOption);
      updateSelectOptions(urlCategory);
      updateSelectOptions(languageSelect);

    } catch (error) {
      console.error('更新界面文本失败:', error);
    }
  };

  // 切换深色模式
  const toggleDarkMode = () => {
    isDarkMode = !isDarkMode;
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      sunIcon.classList.add('hidden');
      moonIcon.classList.remove('hidden');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      sunIcon.classList.remove('hidden');
      moonIcon.classList.add('hidden');
    }
    chrome.storage.local.set({ darkMode: isDarkMode });
  };

  // 从Chrome Storage恢复设置和URL
  const restoreSettings = async () => {
    try {
      const result = await chrome.storage.local.get({
        settings: {
          delayLoad: false,
          preserveInput: false,
          removeDuplicates: false,
          searchNonUrls: false,
          validateUrls: false,
          autoProtocol: true,
          openOrder: 'normal',
          groupOption: 'none',
          urlCategory: 'none',
          maxUrls: 20,
          checkSecurity: true
        },
        lastUrls: '',
        darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
        locale: 'zh'
      });

      const { settings, lastUrls, darkMode, locale } = result;
      
      delayLoad.checked = settings.delayLoad;
      preserveInput.checked = settings.preserveInput;
      removeDuplicates.checked = settings.removeDuplicates;
      searchNonUrls.checked = settings.searchNonUrls;
      validateUrls.checked = settings.validateUrls;
      autoProtocol.checked = settings.autoProtocol;
      openOrder.value = settings.openOrder;
      groupOption.value = settings.groupOption;
      urlCategory.value = settings.urlCategory;
      maxUrls.value = settings.maxUrls;

      // 恢复深色模式
      isDarkMode = darkMode;
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
      } else {
        document.documentElement.classList.remove('dark');
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
      }

      // 恢复语言设置
      if (locale) {
        i18n.setLocale(locale);
        languageSelect.value = locale;
        updateUIText();
      }

      // 恢复上次的URL列表
      if (lastUrls) {
        urlInput.value = lastUrls;
        updateUrlCount();
      }
    } catch (error) {
      console.error('恢复设置失败:', error);
    }
  };

  // 保存设置到Chrome Storage
  const saveSettings = async () => {
    try {
      const settings = {
        delayLoad: delayLoad.checked,
        preserveInput: preserveInput.checked,
        removeDuplicates: removeDuplicates.checked,
        searchNonUrls: searchNonUrls.checked,
        validateUrls: validateUrls.checked,
        autoProtocol: autoProtocol.checked,
        openOrder: openOrder.value,
        groupOption: groupOption.value,
        urlCategory: urlCategory.value,
        maxUrls: maxUrls.value
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
      showStatus(i18n.t('settingsSaved'), 'success');
    } catch (error) {
      console.error('[URL Opener v1.4.0] 保存设置失败:', error);
      showStatus(i18n.t('settingsSaveError', { message: error.message }), 'error');
      throw error;
    }
  };

  // 更新URL计数
  const updateUrlCount = async () => {
    try {
      const urls = urlInput.value.split('\n').filter(url => url.trim() !== '');
      const processedUrls = await urlProcessor.process(urls, {
        validate: false,
        removeDuplicates: false,
        autoProtocol: autoProtocol.checked,
        maxUrls: parseInt(maxUrls.value)
      });
      
      urlCount.textContent = i18n.t('urlCount', { count: urls.length });
      validUrlCount.textContent = i18n.t('validUrlCount', { count: processedUrls.length });
    } catch (error) {
      console.error('更新URL计数失败:', error);
      urlCount.textContent = i18n.t('urlCount', { count: 0 });
      validUrlCount.textContent = i18n.t('validUrlCount', { count: 0 });
    }
  };

  // 显示URL预览
  const showUrlPreview = async (urls) => {
    try {
      urlPreviewList.innerHTML = '';
      
      // 使用与提取URL相同的正则表达式和处理逻辑
      const urlRegex = /(?:(?:https?:\/\/)?(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}|(?:\d{1,3}\.){3}\d{1,3})(?::\d{1,5})?(?:\/[^\s]*)?)|(?:(?:https?:\/\/)\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(?::\d{1,5})?(?:\/[^\s]*)?)/gi;
      
      const processedUrls = [];
      for (const url of urls) {
        const urlMatches = url.match(urlRegex);
        if (urlMatches) {
          for (const match of urlMatches) {
            // 额外验证，确保不是纯数字
            if (!/^\d+(\.\d+)*$/.test(match.replace(/^https?:\/\//, ''))) {
              const processedUrl = urlProcessor.preprocessUrl(match, autoProtocol.checked);
              if (processedUrl) {
                processedUrls.push(processedUrl);
              }
            }
          }
        }
      }
      
      // 更新待处理的URL列表
      pendingUrls = processedUrls;
      
      for (const [index, url] of processedUrls.entries()) {
        const div = document.createElement('div');
        div.className = 'flex items-center space-x-2 p-2 hover:bg-pink-50 dark:hover:bg-gray-700 rounded';
        
        div.innerHTML = `
          <input type="checkbox" class="rounded text-pink-500 border-pink-300 dark:border-gray-600" checked>
          <span class="text-sm text-pink-600 dark:text-pink-400">${index + 1}.</span>
          <span class="text-sm text-pink-600 dark:text-pink-400 truncate" title="${url}">${url}</span>
        `;
        urlPreviewList.appendChild(div);
      }
      
      urlPreviewModal.classList.remove('hidden');
      urlPreviewModal.classList.add('flex');
    } catch (error) {
      console.error('显示URL预览失败:', error);
      statusDiv.textContent = i18n.t('error', { message: error.message });
      statusDiv.classList.remove('hidden', 'text-green-600');
      statusDiv.classList.add('text-red-600');
    }
  };

  // 打开URL
  const openUrls = async (urls) => {
    try {
      if (urls.length === 0) {
        throw new Error('没有有效的URL');
      }

      // 限制URL数量
      if (urls.length > maxUrls.value) {
        urls = urls.slice(0, maxUrls.value);
        console.log(`[URL Opener v1.4.0] URL数量超过限制，已截取前 ${maxUrls.value} 个`);
      }

      // 安全检查
      const securityResults = await securityChecker.checkUrls(urls);
      const unsafeUrls = securityResults.filter(result => !result.safe);
      if (unsafeUrls.length > 0) {
        console.warn(`[URL Opener v1.4.0] 安全警告：发现 ${unsafeUrls.length} 个不安全的URL:`, unsafeUrls);
      }

      console.log(`[URL Opener v1.4.0] 准备打开 ${urls.length} 个URL，打开顺序: ${openOrder.value}`);
      console.log(`[URL Opener v1.4.0] 分组选项: ${groupOption.value}, 分类选项: ${urlCategory.value}`);

      // 应用打开顺序
      if (openOrder.value === 'reverse') {
        urls.reverse();
      } else if (openOrder.value === 'random') {
        for (let i = urls.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [urls[i], urls[j]] = [urls[j], urls[i]];
        }
      }

      // 显示进度条
      progressContainer.classList.remove('hidden');
      progressBar.style.width = '0%';
      progressText.textContent = `0/${urls.length}`;

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

          // 更新进度
          const progress = ((i + 1) / urls.length) * 100;
          progressBar.style.width = `${progress}%`;
          progressText.textContent = `${i + 1}/${urls.length}`;
        } catch (error) {
          console.error(`[URL Opener v1.4.0] [${i + 1}/${urls.length}] 创建标签页失败: ${urls[i]}, 错误: ${error.message}`);
          failCount++;
        }
      }

      // 处理标签页分组
      if (groupOption.value !== 'none' && tabs.length > 0) {
        try {
          const tabIds = tabs.map(tab => tab.id);
          if (groupOption.value === 'new') {
            await chrome.tabs.group({ tabIds });
            console.log(`[URL Opener v1.4.0] 创建新标签页组，包含 ${tabs.length} 个标签页`);
          } else if (groupOption.value === 'existing') {
            const groups = await chrome.tabGroups.query({ windowId: tabs[0].windowId });
            if (groups.length > 0) {
              await chrome.tabs.group({ tabIds, groupId: groups[groups.length - 1].id });
              console.log(`[URL Opener v1.4.0] 添加 ${tabs.length} 个标签页到现有组`);
            } else {
              await chrome.tabs.group({ tabIds });
              console.log(`[URL Opener v1.4.0] 没有现有组，创建新组包含 ${tabs.length} 个标签页`);
            }
          }
        } catch (error) {
          console.error(`[URL Opener v1.4.0] 标签页分组失败: ${error.message}`);
          statusDiv.textContent += '，但标签页分组失败';
        }
      }

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

      // 更新状态信息
      if (failCount > 0) {
        statusDiv.textContent = `成功打开 ${successCount} 个URL，失败 ${failCount} 个`;
        statusDiv.className = 'text-lg font-medium text-red-600 dark:text-red-400';
        statusModal.classList.remove('hidden');
        statusModal.classList.add('flex');
      } else {
        statusDiv.textContent = `成功打开 ${successCount} 个URL`;
        statusDiv.className = 'text-lg font-medium text-green-600 dark:text-green-400';
        statusModal.classList.remove('hidden');
        statusModal.classList.add('flex');
      }

      return successCount;
    } catch (error) {
      console.error(`[URL Opener v1.4.0] 打开URL时出错: ${error.message}`);
      throw error;
    }
  };

  // 按域名分类URL
  const groupUrlsByDomain = (urls) => {
    const groups = {};
    urls.forEach(url => {
      try {
        const domain = new URL(url).hostname;
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

  // 导入URL
  const importUrls = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.json,.csv';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          const content = await file.text();
          let urls = [];

          if (file.name.endsWith('.json')) {
            const data = JSON.parse(content);
            urls = Array.isArray(data) ? data : data.urls;
          } else if (file.name.endsWith('.csv')) {
            urls = content.split('\n')
              .map(line => line.split(',')[0].trim())
              .filter(url => url);
          } else {
            urls = content.split('\n')
              .map(line => line.trim())
              .filter(line => line);
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
      // 获取并处理URL列表
      const inputText = urlInput.value;
      const lines = inputText.split('\n').filter(line => line.trim());
      let urls = [];

      // 使用与提取URL相同的正则表达式和处理逻辑
      const urlRegex = /(?:(?:https?:\/\/)?(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}|(?:\d{1,3}\.){3}\d{1,3})(?::\d{1,5})?(?:\/[^\s]*)?)|(?:(?:https?:\/\/)\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(?::\d{1,5})?(?:\/[^\s]*)?)/gi;

      for (const line of lines) {
        const urlMatches = line.match(urlRegex);
        if (urlMatches) {
          for (const match of urlMatches) {
            // 额外验证，确保不是纯数字
            if (!/^\d+(\.\d+)*$/.test(match.replace(/^https?:\/\//, ''))) {
              const url = urlProcessor.preprocessUrl(match, autoProtocol.checked);
              if (url) {
                urls.push(url);
              }
            }
          }
        }
      }

      console.log(`处理后的URL数量: ${urls.length}`);

      // 去除重复URL
      if (removeDuplicates.checked) {
        const originalLength = urls.length;
        urls = [...new Set(urls)];
        console.log(`去重后的URL数量: ${urls.length} (移除了 ${originalLength - urls.length} 个重复URL)`);
      }

      if (urls.length === 0) {
        throw new Error(i18n.t('noValidUrls'));
      }

      // 保存待处理的URL列表
      pendingUrls = urls;
      // 显示URL预览
      await showUrlPreview(urls);
    } catch (error) {
      console.error('操作失败:', error);
      statusDiv.textContent = i18n.t('error', { message: error.message });
      statusDiv.classList.remove('hidden', 'text-green-600');
      statusDiv.classList.add('text-red-600');
    }
  });

  confirmOpen.addEventListener('click', async () => {
    try {
      const checkboxes = urlPreviewList.querySelectorAll('input[type="checkbox"]');
      const urls = Array.from(checkboxes)
        .map((checkbox, index) => checkbox.checked ? pendingUrls[index] : null)
        .filter(url => url !== null);

      if (urls.length === 0) {
        throw new Error(i18n.t('selectAtLeastOne'));
      }

      urlPreviewModal.classList.add('hidden');
      urlPreviewModal.classList.remove('flex');
      
      const count = await openUrls(urls);
      
      // 创建并显示成功提示弹窗
      const successToast = document.createElement('div');
      successToast.className = 'fixed top-4 right-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 flex items-center space-x-2 transform transition-all duration-300 translate-y-0 opacity-100';
      successToast.innerHTML = `
        <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span class="text-gray-900 dark:text-gray-100">${i18n.t('success', { count })}</span>
      `;
      document.body.appendChild(successToast);

      // 3秒后淡出并移除弹窗
      setTimeout(() => {
        successToast.style.opacity = '0';
        successToast.style.transform = 'translateY(-100%)';
        setTimeout(() => successToast.remove(), 300);
      }, 3000);

      // 保存设置
      saveSettings();
    } catch (error) {
      console.error('操作失败:', error);
      statusDiv.textContent = i18n.t('error', { message: error.message });
      statusDiv.classList.remove('hidden', 'text-green-600');
      statusDiv.classList.add('text-red-600');
    }
  });

  closePreview.addEventListener('click', () => {
    urlPreviewModal.classList.add('hidden');
    urlPreviewModal.classList.remove('flex');
  });

  extractUrlsButton.addEventListener('click', async () => {
    try {
      // 显示处理状态
      statusDiv.textContent = i18n.t('processing');
      statusDiv.classList.remove('hidden', 'text-green-600', 'text-red-600');
      statusDiv.classList.add('text-yellow-600');

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
        // 1. 匹配带协议的完整 URL
        // 2. 匹配 IP 地址（包含端口）
        // 3. 匹配域名（包含端口和路径）
        const urlRegex = /(?:(?:https?:\/\/)?(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}|(?:\d{1,3}\.){3}\d{1,3})(?::\d{1,5})?(?:\/[^\s]*)?)|(?:(?:https?:\/\/)\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(?::\d{1,5})?(?:\/[^\s]*)?)/gi;
        
        const urlMatches = line.match(urlRegex);
        if (urlMatches) {
          for (const match of urlMatches) {
            // 额外验证，确保不是纯数字
            if (!/^\d+(\.\d+)*$/.test(match.replace(/^https?:\/\//, ''))) {
              const url = urlProcessor.preprocessUrl(match, autoProtocol.checked);
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
      statusDiv.textContent = i18n.t('success', { count: urls.length });
      statusDiv.classList.remove('text-yellow-600', 'text-red-600');
      statusDiv.classList.add('text-green-600');

    } catch (error) {
      console.error(`[URL Opener v1.4.0] 提取URL失败: ${error.message}`);
      showStatus(i18n.t('error', { message: error.message }), 'error');
    }
  });

  importUrlsButton.addEventListener('click', importUrls);
  exportUrlsButton.addEventListener('click', exportUrls);

  // 监听设置变更
  [delayLoad, preserveInput, removeDuplicates, searchNonUrls, validateUrls, autoProtocol, openOrder, groupOption, urlCategory].forEach(element => {
    element.addEventListener('change', saveSettings);
  });

  // 监听主题切换
  themeToggle.addEventListener('click', toggleDarkMode);

  // 监听语言切换
  languageSelect.addEventListener('change', async (e) => {
    const locale = e.target.value;
    if (i18n.setLocale(locale)) {
      updateUIText();
      await i18n.saveLocale();
      saveSettings();
    }
  });

  // 初始化时恢复设置
  restoreSettings();
  updateUrlCount();
});