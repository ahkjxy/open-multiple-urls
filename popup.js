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
  const statusDiv = document.getElementById('status');
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

  // 更新界面文本
  const updateUIText = () => {
    const elements = {
      title: document.querySelector('h1'),
      urlInputLabel: document.querySelector('label[for="urlInput"]'),
      delayLoadLabel: document.querySelector('label[for="delayLoad"]'),
      preserveInputLabel: document.querySelector('label[for="preserveInput"]'),
      removeDuplicatesLabel: document.querySelector('label[for="removeDuplicates"]'),
      searchNonUrlsLabel: document.querySelector('label[for="searchNonUrls"]'),
      validateUrlsLabel: document.querySelector('label[for="validateUrls"]'),
      autoProtocolLabel: document.querySelector('label[for="autoProtocol"]'),
      openOrderLabel: document.querySelector('label[for="openOrder"]'),
      groupOptionLabel: document.querySelector('label[for="groupOption"]'),
      urlCategoryLabel: document.querySelector('label[for="urlCategory"]'),
      maxUrlsLabel: document.querySelector('label[for="maxUrls"]'),
      previewTitle: document.querySelector('#urlPreviewModal h3')
    };

    // 更新标题
    document.title = i18n.t('title');
    if (elements.title) elements.title.textContent = i18n.t('title');
    
    // 更新按钮文本
    if (importUrlsButton) importUrlsButton.textContent = i18n.t('import');
    if (exportUrlsButton) exportUrlsButton.textContent = i18n.t('export');
    if (openUrlsButton) openUrlsButton.textContent = i18n.t('openUrls');
    if (extractUrlsButton) extractUrlsButton.textContent = i18n.t('extractUrls');
    
    // 更新标签文本
    if (elements.urlInputLabel) elements.urlInputLabel.textContent = i18n.t('urlInputLabel');
    if (elements.delayLoadLabel) elements.delayLoadLabel.textContent = i18n.t('delayLoad');
    if (elements.preserveInputLabel) elements.preserveInputLabel.textContent = i18n.t('preserveInput');
    if (elements.removeDuplicatesLabel) elements.removeDuplicatesLabel.textContent = i18n.t('removeDuplicates');
    if (elements.searchNonUrlsLabel) elements.searchNonUrlsLabel.textContent = i18n.t('searchNonUrls');
    if (elements.validateUrlsLabel) elements.validateUrlsLabel.textContent = i18n.t('validateUrls');
    if (elements.autoProtocolLabel) elements.autoProtocolLabel.textContent = i18n.t('autoProtocol');
    if (elements.openOrderLabel) elements.openOrderLabel.textContent = i18n.t('openOrder');
    if (elements.groupOptionLabel) elements.groupOptionLabel.textContent = i18n.t('groupOption');
    if (elements.urlCategoryLabel) elements.urlCategoryLabel.textContent = i18n.t('urlCategory');
    if (elements.maxUrlsLabel) elements.maxUrlsLabel.textContent = i18n.t('maxUrls');
    if (elements.previewTitle) elements.previewTitle.textContent = i18n.t('urlPreview');
    
    // 更新按钮文本
    if (closePreview) closePreview.textContent = i18n.t('close');
    if (confirmOpen) confirmOpen.textContent = i18n.t('confirmOpen');

    // 更新选项文本
    if (openOrder) {
      openOrder.innerHTML = `
        <option value="normal">${i18n.t('openOrderNormal')}</option>
        <option value="reverse">${i18n.t('openOrderReverse')}</option>
        <option value="random">${i18n.t('openOrderRandom')}</option>
      `;
    }

    if (groupOption) {
      groupOption.innerHTML = `
        <option value="none">${i18n.t('groupOptionNone')}</option>
        <option value="new">${i18n.t('groupOptionNew')}</option>
        <option value="existing">${i18n.t('groupOptionExisting')}</option>
      `;
    }

    if (urlCategory) {
      urlCategory.innerHTML = `
        <option value="none">${i18n.t('urlCategoryNone')}</option>
        <option value="domain">${i18n.t('urlCategoryDomain')}</option>
        <option value="custom">${i18n.t('urlCategoryCustom')}</option>
      `;
    }

    // 更新占位符文本
    document.querySelector('h1').textContent = i18n.t('title');
    document.querySelector('label[for="urlInput"]').textContent = i18n.t('urlInputLabel');
    importUrlsButton.textContent = i18n.t('import');
    exportUrlsButton.textContent = i18n.t('export');
    openUrlsButton.textContent = i18n.t('openUrls');
    extractUrlsButton.textContent = i18n.t('extractUrls');
    document.querySelector('label[for="delayLoad"]').textContent = i18n.t('delayLoad');
    document.querySelector('label[for="preserveInput"]').textContent = i18n.t('preserveInput');
    document.querySelector('label[for="removeDuplicates"]').textContent = i18n.t('removeDuplicates');
    document.querySelector('label[for="searchNonUrls"]').textContent = i18n.t('searchNonUrls');
    document.querySelector('label[for="validateUrls"]').textContent = i18n.t('validateUrls');
    document.querySelector('label[for="autoProtocol"]').textContent = i18n.t('autoProtocol');
    document.querySelector('label[for="openOrder"]').textContent = i18n.t('openOrder');
    document.querySelector('label[for="groupOption"]').textContent = i18n.t('groupOption');
    document.querySelector('label[for="urlCategory"]').textContent = i18n.t('urlCategory');
    document.querySelector('label[for="maxUrls"]').textContent = i18n.t('maxUrls');
    document.querySelector('#urlPreviewModal h3').textContent = i18n.t('urlPreview');
    closePreview.textContent = i18n.t('close');
    confirmOpen.textContent = i18n.t('confirmOpen');

    // 更新选项文本
    openOrder.innerHTML = `
      <option value="normal">${i18n.t('openOrderNormal')}</option>
      <option value="reverse">${i18n.t('openOrderReverse')}</option>
      <option value="random">${i18n.t('openOrderRandom')}</option>
    `;

    groupOption.innerHTML = `
      <option value="none">${i18n.t('groupOptionNone')}</option>
      <option value="new">${i18n.t('groupOptionNew')}</option>
      <option value="existing">${i18n.t('groupOptionExisting')}</option>
    `;

    urlCategory.innerHTML = `
      <option value="none">${i18n.t('urlCategoryNone')}</option>
      <option value="domain">${i18n.t('urlCategoryDomain')}</option>
      <option value="custom">${i18n.t('urlCategoryCustom')}</option>
    `;

    // 更新占位符文本
    urlInput.placeholder = i18n.t('urlInputPlaceholder');
  };

  // 切换深色模式
  const toggleDarkMode = () => {
    isDarkMode = !isDarkMode;
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      sunIcon.classList.add('hidden');
      moonIcon.classList.remove('hidden');
    } else {
      document.documentElement.classList.remove('dark');
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
        darkMode: false,
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

      // 保存设置和URL列表
      await chrome.storage.local.set({
        settings,
        lastUrls: urlInput.value,
        darkMode: isDarkMode,
        locale: i18n.getLocale()
      });
    } catch (error) {
      console.error('保存设置失败:', error);
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
    urlPreviewList.innerHTML = '';
    
    for (const [index, url] of urls.entries()) {
      const div = document.createElement('div');
      div.className = 'flex items-center space-x-2 p-2 hover:bg-pink-50 dark:hover:bg-gray-700 rounded';
      
      // 获取URL元数据
      const metadata = await cacheManager.get(url) || await urlProcessor.getUrlMetadata(url);
      const title = metadata?.title || url;
      
      div.innerHTML = `
        <input type="checkbox" class="rounded text-pink-500 border-pink-300 dark:border-gray-600" checked>
        <span class="text-sm text-pink-600 dark:text-pink-400">${index + 1}.</span>
        <span class="text-sm text-pink-600 dark:text-pink-400 truncate" title="${url}">${title}</span>
      `;
      urlPreviewList.appendChild(div);
    }
    
    urlPreviewModal.classList.remove('hidden');
    urlPreviewModal.classList.add('flex');
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
        console.log(`URL数量超过限制，已截取前 ${maxUrls.value} 个`);
      }

      // 安全检查
      const securityResults = await securityChecker.checkUrls(urls);
      const unsafeUrls = securityResults.filter(result => !result.safe);
      if (unsafeUrls.length > 0) {
        console.warn('发现不安全的URL:', unsafeUrls);
      }

      console.log(`准备打开 ${urls.length} 个URL`);
      console.log('URL列表:', urls);

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
          console.log(`成功创建标签页: ${urls[i]}`);
          tabs.push(tab);
          successCount++;

          // 更新进度
          const progress = ((i + 1) / urls.length) * 100;
          progressBar.style.width = `${progress}%`;
          progressText.textContent = `${i + 1}/${urls.length}`;
        } catch (error) {
          console.error(`创建标签页失败 (${urls[i]}): ${error.message}`);
          failCount++;
        }
      }

      // 处理标签页分组
      if (groupOption.value !== 'none' && tabs.length > 0) {
        try {
          const tabIds = tabs.map(tab => tab.id);
          if (groupOption.value === 'new') {
            await chrome.tabs.group({ tabIds });
            console.log('创建新标签页组');
          } else if (groupOption.value === 'existing') {
            const groups = await chrome.tabGroups.query({ windowId: tabs[0].windowId });
            if (groups.length > 0) {
              await chrome.tabs.group({ tabIds, groupId: groups[groups.length - 1].id });
              console.log('添加到现有标签页组');
            } else {
              await chrome.tabs.group({ tabIds });
              console.log('没有现有组，创建新组');
            }
          }
        } catch (error) {
          console.error(`标签页分组失败: ${error.message}`);
          statusDiv.textContent += '，但标签页分组失败';
        }
      }

      // 处理URL分类
      if (urlCategory.value !== 'none') {
        try {
          if (urlCategory.value === 'domain') {
            const groups = groupUrlsByDomain(urls);
            console.log('按域名分组:', groups);
          } else if (urlCategory.value === 'custom') {
            // TODO: 实现自定义分类
          }
        } catch (error) {
          console.error(`URL分类失败: ${error.message}`);
        }
      }

      // 更新状态信息
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
      console.error(`打开URL时出错: ${error.message}`);
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
        console.error(`处理域名时出错: ${error.message}`);
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

          urlInput.value = urls.join('\n');
          updateUrlCount();
          statusDiv.textContent = i18n.t('importSuccess');
          statusDiv.classList.remove('hidden', 'text-red-600');
          statusDiv.classList.add('text-green-600');
        } catch (error) {
          console.error('导入文件失败:', error);
          statusDiv.textContent = i18n.t('importError');
          statusDiv.classList.remove('hidden', 'text-green-600');
          statusDiv.classList.add('text-red-600');
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
        statusDiv.textContent = i18n.t('noUrlsToExport');
        statusDiv.classList.remove('hidden', 'text-green-600');
        statusDiv.classList.add('text-yellow-600');
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

      statusDiv.textContent = i18n.t('exportSuccess');
      statusDiv.classList.remove('hidden', 'text-red-600', 'text-yellow-600');
      statusDiv.classList.add('text-green-600');
    } catch (error) {
      console.error('导出URL失败:', error);
      statusDiv.textContent = i18n.t('exportError', { message: error.message });
      statusDiv.classList.remove('hidden', 'text-green-600', 'text-yellow-600');
      statusDiv.classList.add('text-red-600');
    }
  };

  // 事件监听器
  urlInput.addEventListener('input', () => {
    updateUrlCount();
    saveSettings();
  });
  
  openUrlsButton.addEventListener('click', async () => {
    try {
      statusDiv.textContent = i18n.t('processing');
      statusDiv.classList.remove('hidden');

      // 获取并处理URL列表
      let urls = urlInput.value.split('\n')
        .map(url => urlProcessor.preprocessUrl(url, autoProtocol.checked))
        .filter(url => url !== null);

      console.log(`处理后的URL数量: ${urls.length}`);

      // 去除重复URL
      if (removeDuplicates.checked) {
        const originalLength = urls.length;
        urls = [...new Set(urls)];
        console.log(`去重后的URL数量: ${urls.length} (移除了 ${originalLength - urls.length} 个重复URL)`);
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
      statusDiv.textContent = i18n.t('success', { count });
      statusDiv.classList.remove('hidden', 'text-red-600');
      statusDiv.classList.add('text-green-600');

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
      statusDiv.textContent = i18n.t('processing');
      statusDiv.classList.remove('hidden');

      const text = urlInput.value;
      const urls = await urlProcessor.process(text.split('\n'), {
        validate: validateUrls.checked,
        removeDuplicates: removeDuplicates.checked,
        autoProtocol: autoProtocol.checked,
        maxUrls: parseInt(maxUrls.value)
      });
      
      if (Array.isArray(urls) && urls.length > 0) {
        // 更新输入框内容为提取的 URL
        urlInput.value = urls.join('\n');
        await updateUrlCount();
        statusDiv.textContent = i18n.t('success', { count: urls.length });
        statusDiv.classList.remove('hidden', 'text-red-600');
        statusDiv.classList.add('text-green-600');
      } else {
        throw new Error(i18n.t('noValidUrls'));
      }
    } catch (error) {
      console.error('提取URL失败:', error);
      statusDiv.textContent = i18n.t('error', { message: error.message });
      statusDiv.classList.remove('hidden', 'text-green-600');
      statusDiv.classList.add('text-red-600');
    }
  });

  importUrlsButton.addEventListener('click', importUrls);
  exportUrlsButton.addEventListener('click', exportUrls);

  // 监听设置变更
  [delayLoad, preserveInput, removeDuplicates, searchNonUrls, validateUrls, autoProtocol, openOrder, groupOption, urlCategory, maxUrls].forEach(element => {
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