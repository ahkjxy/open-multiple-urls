document.addEventListener('DOMContentLoaded', function() {
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

  let pendingUrls = [];

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
          maxUrls: 20
        },
        lastUrls: ''
      });

      const { settings, lastUrls } = result;
      
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
        lastUrls: urlInput.value
      });
    } catch (error) {
      console.error('保存设置失败:', error);
    }
  };

  // URL验证函数
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // 处理URL格式
  const processUrl = (url) => {
    try {
      url = url.trim();
      if (url === '') return null;

      // 提取URL部分（如果有前缀数字和描述，只保留URL）
      const urlMatch = url.match(/(?:https?:\/\/)?[\w-]+(?:\.[\w-]+)+(?:[\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?/i);
      if (!urlMatch) {
        console.log(`未找到有效URL: ${url}`);
        return null;
      }
      url = urlMatch[0];

      // 添加协议前缀
      if (autoProtocol.checked && !url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
        console.log(`添加协议前缀: ${url}`);
      }

      // 验证URL
      if (validateUrls.checked && !isValidUrl(url)) {
        console.log(`无效的URL: ${url}`);
        return null;
      }

      return url;
    } catch (error) {
      console.error(`处理URL时出错: ${error.message}`);
      return null;
    }
  };

  // 更新URL计数
  const updateUrlCount = () => {
    const urls = urlInput.value.split('\n').filter(url => url.trim() !== '');
    const validUrls = urls.filter(url => processUrl(url) !== null);
    urlCount.textContent = `${urls.length} 个URL`;
    validUrlCount.textContent = `${validUrls.length} 个有效URL`;
  };

  // 提取URL的函数
  function extractUrls(text) {
    // 1. 首先尝试匹配标准URL格式
    const standardUrlRegex = /(https?:\/\/[^\s<>"]+)/g;
    let urls = text.match(standardUrlRegex) || [];

    // 2. 如果没有找到标准URL，尝试匹配其他格式
    if (urls.length === 0) {
      // 匹配形如 "数字--数字，URL" 的格式
      const numberedUrlRegex = /(?:\d+--\d+[，,]\s*)?((?:https?:\/\/)?[\w-]+(?:\.[\w-]+)+(?:[\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?)/gi;
      const matches = text.matchAll(numberedUrlRegex);
      urls = Array.from(matches, m => m[1]);
    }

    // 3. 清理和验证URL
    return urls
      .map(url => {
        // 移除URL前后的空白字符和标点符号
        url = url.trim().replace(/^[.,，。\s]+|[.,，。\s]+$/g, '');
        
        // 如果URL不包含协议，添加https://
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          url = 'https://' + url;
        }
        
        return url;
      })
      .filter(url => {
        // 过滤掉无效的URL
        if (!url) return false;
        
        // 检查URL是否包含有效的域名
        try {
          const urlObj = new URL(url);
          return urlObj.hostname.includes('.');
        } catch {
          return false;
        }
      });
  }

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

  // 显示URL预览
  const showUrlPreview = (urls) => {
    urlPreviewList.innerHTML = '';
    urls.forEach((url, index) => {
      const div = document.createElement('div');
      div.className = 'flex items-center space-x-2 p-2 hover:bg-pink-50 rounded';
      div.innerHTML = `
        <input type="checkbox" class="rounded text-pink-500 border-pink-300" checked>
        <span class="text-sm text-pink-600">${index + 1}.</span>
        <span class="text-sm text-pink-600 truncate">${url}</span>
      `;
      urlPreviewList.appendChild(div);
    });
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

  // 导入URL
  const importUrls = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            let content = e.target.result;
            if (file.name.endsWith('.json')) {
              const data = JSON.parse(content);
              content = Array.isArray(data) ? data.join('\n') : data.urls.join('\n');
            }
            urlInput.value = content;
            updateUrlCount();
            statusDiv.textContent = 'URL导入成功';
            statusDiv.classList.remove('hidden', 'text-red-600');
            statusDiv.classList.add('text-green-600');
          } catch (error) {
            console.error('导入文件失败:', error);
            statusDiv.textContent = '导入文件失败：文件格式不正确';
            statusDiv.classList.remove('hidden', 'text-green-600');
            statusDiv.classList.add('text-red-600');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  // 导出URL
  const exportUrls = () => {
    try {
      const urls = urlInput.value.split('\n').filter(url => url.trim() !== '');
      if (urls.length === 0) {
        throw new Error('没有可导出的URL');
      }
      const content = JSON.stringify({ urls }, null, 2);
      const blob = new Blob([content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'urls.json';
      a.click();
      URL.revokeObjectURL(url);
      statusDiv.textContent = 'URL导出成功';
      statusDiv.classList.remove('hidden', 'text-red-600');
      statusDiv.classList.add('text-green-600');
    } catch (error) {
      console.error('导出URL失败:', error);
      statusDiv.textContent = `导出失败: ${error.message}`;
      statusDiv.classList.remove('hidden', 'text-green-600');
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
      statusDiv.textContent = '正在处理URL...';
      statusDiv.classList.remove('hidden');

      // 获取并处理URL列表
      let urls = urlInput.value.split('\n')
        .map(processUrl)
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
      showUrlPreview(urls);
    } catch (error) {
      console.error('操作失败:', error);
      statusDiv.textContent = `发生错误: ${error.message}`;
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
        throw new Error('请至少选择一个URL');
      }

      urlPreviewModal.classList.add('hidden');
      urlPreviewModal.classList.remove('flex');
      
      const count = await openUrls(urls);
      statusDiv.textContent = `成功打开 ${count} 个URL`;
      statusDiv.classList.remove('hidden', 'text-red-600');
      statusDiv.classList.add('text-green-600');

      // 保存设置
      saveSettings();
    } catch (error) {
      console.error('操作失败:', error);
      statusDiv.textContent = `发生错误: ${error.message}`;
      statusDiv.classList.remove('hidden', 'text-green-600');
      statusDiv.classList.add('text-red-600');
    }
  });

  closePreview.addEventListener('click', () => {
    urlPreviewModal.classList.add('hidden');
    urlPreviewModal.classList.remove('flex');
  });

  extractUrlsButton.addEventListener('click', () => {
    try {
      const text = urlInput.value;
      const urls = extractUrls(text);
      urlInput.value = urls.join('\n');
      updateUrlCount();
      statusDiv.textContent = `已提取 ${urls.length} 个URL`;
      statusDiv.classList.remove('hidden', 'text-red-600');
      statusDiv.classList.add('text-green-600');
    } catch (error) {
      console.error('提取URL失败:', error);
      statusDiv.textContent = `提取URL失败: ${error.message}`;
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

  // 初始化时恢复设置
  restoreSettings();
  updateUrlCount();
});