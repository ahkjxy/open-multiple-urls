document.addEventListener('DOMContentLoaded', function() {
  // 获取所有设置元素
  const elements = {
    maxUrls: document.getElementById('maxUrls'),
    openOrder: document.getElementById('openOrder'),
    removeDuplicates: document.getElementById('removeDuplicates'),
    validateUrls: document.getElementById('validateUrls'),
    autoProtocol: document.getElementById('autoProtocol'),
    groupOption: document.getElementById('groupOption'),
    urlCategory: document.getElementById('urlCategory'),
    checkSecurity: document.getElementById('checkSecurity'),
    blacklist: document.getElementById('blacklist'),
    whitelist: document.getElementById('whitelist'),
    maxCacheSize: document.getElementById('maxCacheSize'),
    cacheExpiry: document.getElementById('cacheExpiry'),
    theme: document.getElementById('theme'),
    language: document.getElementById('language'),
    saveButton: document.getElementById('saveButton'),
    resetButton: document.getElementById('resetButton'),
    status: document.getElementById('status')
  };

  // 默认设置
  const defaultSettings = {
    maxUrls: 20,
    openOrder: 'normal',
    removeDuplicates: true,
    validateUrls: true,
    autoProtocol: true,
    groupOption: 'none',
    urlCategory: 'none',
    checkSecurity: true,
    blacklist: '',
    whitelist: '',
    maxCacheSize: 1000,
    cacheExpiry: 24,
    theme: 'light',
    language: 'zh-CN'
  };

  // 加载设置
  async function loadSettings() {
    try {
      const result = await chrome.storage.local.get('settings');
      const settings = result.settings || defaultSettings;

      // 更新表单元素
      elements.maxUrls.value = settings.maxUrls;
      elements.openOrder.value = settings.openOrder;
      elements.removeDuplicates.checked = settings.removeDuplicates;
      elements.validateUrls.checked = settings.validateUrls;
      elements.autoProtocol.checked = settings.autoProtocol;
      elements.groupOption.value = settings.groupOption;
      elements.urlCategory.value = settings.urlCategory;
      elements.checkSecurity.checked = settings.checkSecurity;
      elements.blacklist.value = settings.blacklist;
      elements.whitelist.value = settings.whitelist;
      elements.maxCacheSize.value = settings.maxCacheSize;
      elements.cacheExpiry.value = settings.cacheExpiry;
      elements.theme.value = settings.theme;
      elements.language.value = settings.language;

      // 应用主题
      applyTheme(settings.theme);
    } catch (error) {
      console.error('加载设置失败:', error);
      showStatus('加载设置失败', 'error');
    }
  }

  // 保存设置
  async function saveSettings() {
    try {
      const settings = {
        maxUrls: parseInt(elements.maxUrls.value),
        openOrder: elements.openOrder.value,
        removeDuplicates: elements.removeDuplicates.checked,
        validateUrls: elements.validateUrls.checked,
        autoProtocol: elements.autoProtocol.checked,
        groupOption: elements.groupOption.value,
        urlCategory: elements.urlCategory.value,
        checkSecurity: elements.checkSecurity.checked,
        blacklist: elements.blacklist.value,
        whitelist: elements.whitelist.value,
        maxCacheSize: parseInt(elements.maxCacheSize.value),
        cacheExpiry: parseInt(elements.cacheExpiry.value),
        theme: elements.theme.value,
        language: elements.language.value
      };

      await chrome.storage.local.set({ settings });
      showStatus('设置已保存', 'success');

      // 应用主题
      applyTheme(settings.theme);

      // 通知后台脚本更新设置
      chrome.runtime.sendMessage({
        type: 'SETTINGS_UPDATED',
        data: settings
      });
    } catch (error) {
      console.error('保存设置失败:', error);
      showStatus('保存设置失败', 'error');
    }
  }

  // 重置设置
  async function resetSettings() {
    try {
      await chrome.storage.local.set({ settings: defaultSettings });
      loadSettings();
      showStatus('设置已重置', 'success');
    } catch (error) {
      console.error('重置设置失败:', error);
      showStatus('重置设置失败', 'error');
    }
  }

  // 应用主题
  function applyTheme(theme) {
    document.body.classList.remove('light-theme', 'dark-theme');
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.body.classList.add(prefersDark ? 'dark-theme' : 'light-theme');
    } else {
      document.body.classList.add(`${theme}-theme`);
    }
  }

  // 显示状态消息
  function showStatus(message, type) {
    elements.status.textContent = message;
    elements.status.className = `status status-${type}`;
    elements.status.classList.remove('hidden');

    setTimeout(() => {
      elements.status.classList.add('hidden');
    }, 3000);
  }

  // 事件监听器
  elements.saveButton.addEventListener('click', saveSettings);
  elements.resetButton.addEventListener('click', resetSettings);

  // 监听系统主题变化
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (elements.theme.value === 'system') {
      applyTheme('system');
    }
  });

  // 初始化
  loadSettings();
}); 