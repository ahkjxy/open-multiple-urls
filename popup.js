document.addEventListener('DOMContentLoaded', function() {
  const urlInput = document.getElementById('urlInput');
  const openOrder = document.getElementById('openOrder');
  const removeDuplicates = document.getElementById('removeDuplicates');
  const delayLoad = document.getElementById('delayLoad');
  const preserveInput = document.getElementById('preserveInput');
  const searchNonUrls = document.getElementById('searchNonUrls');
  const groupOption = document.getElementById('groupOption');
  const openUrlsButton = document.getElementById('openUrls');
  const extractUrlsButton = document.getElementById('extractUrls');
  const statusDiv = document.getElementById('status');

  // 从localStorage恢复设置
  const restoreSettings = () => {
    const settings = JSON.parse(localStorage.getItem('urlOpenerSettings') || '{}');
    delayLoad.checked = settings.delayLoad || false;
    preserveInput.checked = settings.preserveInput || false;
    removeDuplicates.checked = settings.removeDuplicates || false;
    searchNonUrls.checked = settings.searchNonUrls || false;
    openOrder.value = settings.openOrder || 'normal';
    groupOption.value = settings.groupOption || 'none';
    if (settings.lastInput && preserveInput.checked) {
      urlInput.value = settings.lastInput;
    }
  };

  // 保存设置到localStorage
  const saveSettings = () => {
    const settings = {
      delayLoad: delayLoad.checked,
      preserveInput: preserveInput.checked,
      removeDuplicates: removeDuplicates.checked,
      searchNonUrls: searchNonUrls.checked,
      openOrder: openOrder.value,
      groupOption: groupOption.value,
      lastInput: preserveInput.checked ? urlInput.value : ''
    };
    localStorage.setItem('urlOpenerSettings', JSON.stringify(settings));
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
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'http://' + url;
        console.log(`添加协议前缀: ${url}`);
      }
      return url;
    } catch (error) {
      console.error(`处理URL时出错: ${error.message}`);
      return null;
    }
  };

  // 提取URL
  const extractUrls = (text) => {
    // 匹配形如 "数字--数字，URL" 或纯URL的格式
    const urlRegex = /(?:(?:\d+--\d+[，,]\s*)?)((?:https?:\/\/)?[\w-]+(?:\.[\w-]+)+(?:[\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?)/gi;
    const matches = text.matchAll(urlRegex);
    const urls = Array.from(matches, m => m[1]);
    console.log(`提取到的URL数量: ${urls.length}`);
    console.log('提取的URLs:', urls);
    return urls;
  };

  // 打开URL
  const openUrls = async (urls) => {
    try {
      if (urls.length === 0) {
        throw new Error('没有有效的URL');
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

      // 创建标签页
      const tabs = [];
      let successCount = 0;
      let failCount = 0;

      for (const url of urls) {
        try {
          const tab = await chrome.tabs.create({
            url,
            active: false // 始终创建非活动标签页，避免焦点切换
          });
          console.log(`成功创建标签页: ${url}`);
          tabs.push(tab);
          successCount++;
        } catch (error) {
          console.error(`创建标签页失败 (${url}): ${error.message}`);
          failCount++;
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

      // 处理标签页分组
      if (groupOption.value !== 'none' && tabs.length > 0) {
        try {
          const tabIds = tabs.map(tab => tab.id);
          if (groupOption.value === 'new') {
            await chrome.tabs.group({ tabIds });
            console.log('创建新标签页组');
          } else if (groupOption.value === 'existing') {
            // 获取当前窗口的标签页组
            const groups = await chrome.tabGroups.query({ windowId: tabs[0].windowId });
            if (groups.length > 0) {
              // 添加到最后一个组
              await chrome.tabs.group({ tabIds, groupId: groups[groups.length - 1].id });
              console.log('添加到现有标签页组');
            } else {
              // 如果没有现有的组，创建新组
              await chrome.tabs.group({ tabIds });
              console.log('没有现有组，创建新组');
            }
          }
        } catch (error) {
          console.error(`标签页分组失败: ${error.message}`);
          statusDiv.textContent += '，但标签页分组失败';
        }
      }

      return successCount;
    } catch (error) {
      console.error(`打开URL时出错: ${error.message}`);
      throw error;
    }
  };

  // 事件监听器
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

  extractUrlsButton.addEventListener('click', () => {
    try {
      const text = urlInput.value;
      const urls = extractUrls(text);
      urlInput.value = urls.join('\n');
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

  // 监听设置变更
  [delayLoad, preserveInput, removeDuplicates, searchNonUrls, openOrder, groupOption].forEach(element => {
    element.addEventListener('change', saveSettings);
  });

  // 初始化时恢复设置
  restoreSettings();
});