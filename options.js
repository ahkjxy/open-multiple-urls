document.addEventListener('DOMContentLoaded', function() {
  // 获取所有设置元素
  const elements = {
    languageSelect: document.getElementById('languageSelect'),
    themeSelect: document.getElementById('themeSelect'),
    showUrlCount: document.getElementById('showUrlCount'),
    showProgressBar: document.getElementById('showProgressBar'),
    defaultMaxUrls: document.getElementById('defaultMaxUrls'),
    defaultValidateUrls: document.getElementById('defaultValidateUrls'),
    defaultAutoProtocol: document.getElementById('defaultAutoProtocol'),
    cacheExpiration: document.getElementById('cacheExpiration'),
    enableDebugMode: document.getElementById('enableDebugMode'),
    status: document.getElementById('status')
  };

  // 默认设置
  const defaultSettings = {
    language: 'zh',
    theme: 'system',
    showUrlCount: true,
    showProgressBar: true,
    defaultMaxUrls: 20,
    defaultValidateUrls: true,
    defaultAutoProtocol: true,
    cacheExpiration: 24,
    enableDebugMode: false
  };

  // 加载设置
  async function loadSettings() {
    try {
      const result = await chrome.storage.local.get('settings');
      const settings = result.settings || defaultSettings;

      // 更新表单元素
      elements.languageSelect.value = settings.language;
      elements.themeSelect.value = settings.theme;
      elements.showUrlCount.checked = settings.showUrlCount;
      elements.showProgressBar.checked = settings.showProgressBar;
      elements.defaultMaxUrls.value = settings.defaultMaxUrls;
      elements.defaultValidateUrls.checked = settings.defaultValidateUrls;
      elements.defaultAutoProtocol.checked = settings.defaultAutoProtocol;
      elements.cacheExpiration.value = settings.cacheExpiration;
      elements.enableDebugMode.checked = settings.enableDebugMode;

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
        language: elements.languageSelect.value,
        theme: elements.themeSelect.value,
        showUrlCount: elements.showUrlCount.checked,
        showProgressBar: elements.showProgressBar.checked,
        defaultMaxUrls: parseInt(elements.defaultMaxUrls.value),
        defaultValidateUrls: elements.defaultValidateUrls.checked,
        defaultAutoProtocol: elements.defaultAutoProtocol.checked,
        cacheExpiration: parseInt(elements.cacheExpiration.value),
        enableDebugMode: elements.enableDebugMode.checked
      };

      console.log('[URL Opener v1.0.0] 正在保存设置:', settings);
      await chrome.storage.local.set({ settings });
      console.log('[URL Opener v1.0.0] 设置保存成功');
      showStatus('设置已保存', 'success');

      // 应用主题
      applyTheme(settings.theme);

      // 通知后台脚本更新设置
      chrome.runtime.sendMessage({
        type: 'SETTINGS_UPDATED',
        data: settings
      });
    } catch (error) {
      console.error('[URL Opener v1.0.0] 保存设置失败:', error);
      showStatus('保存设置失败', 'error');
      throw error;
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
    document.documentElement.classList.remove('light', 'dark');
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.add(prefersDark ? 'dark' : 'light');
    } else {
      document.documentElement.classList.add(theme);
    }
  }

  // 显示状态消息
  function showStatus(message, type = 'success') {
    const statusContainer = document.getElementById('statusContainer');
    const statusDiv = document.createElement('div');
    statusDiv.className = `fixed top-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg text-white transition-all duration-300 transform translate-y-0 opacity-100 bg-gradient-to-r ${type === 'success' ? 'from-green-500/95 to-green-600/95' : 'from-red-500/95 to-red-600/95'} backdrop-blur-sm shadow-xl z-50`;
    statusDiv.textContent = message;
    
    // 添加到容器
    statusContainer.appendChild(statusDiv);

    // 淡出动画
    setTimeout(() => {
      statusDiv.style.opacity = '0';
      statusDiv.style.transform = 'translateY(-100%)';
      setTimeout(() => statusDiv.remove(), 300);
    }, 3000);
  }

  // 页面切换处理
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.section-content');

  function switchSection(targetSection) {
    // 更新导航按钮状态
    navItems.forEach(item => {
      if (item.dataset.section === targetSection) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // 更新内容区域显示
    sections.forEach(section => {
      if (section.id === targetSection) {
        section.classList.add('active');
        section.style.display = 'block';
      } else {
        section.classList.remove('active');
        section.style.display = 'none';
      }
    });
  }

  // 绑定事件监听器
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      switchSection(item.dataset.section);
    });
  });

  // 监听主题变化
  elements.themeSelect.addEventListener('change', () => {
    applyTheme(elements.themeSelect.value);
    saveSettings();
  });

  // 监听系统主题变化
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (elements.themeSelect.value === 'system') {
      applyTheme('system');
    }
  });

  // 为所有设置添加变更监听器
  elements.languageSelect.addEventListener('change', saveSettings);
  elements.showUrlCount.addEventListener('change', saveSettings);
  elements.showProgressBar.addEventListener('change', saveSettings);
  elements.defaultMaxUrls.addEventListener('change', saveSettings);
  elements.defaultValidateUrls.addEventListener('change', saveSettings);
  elements.defaultAutoProtocol.addEventListener('change', saveSettings);
  elements.cacheExpiration.addEventListener('change', saveSettings);
  elements.enableDebugMode.addEventListener('change', saveSettings);

  // 初始化
  loadSettings();
  switchSection('general');
});