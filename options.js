import { initializeI18n } from './modules/i18n.js';
import { Game2024 } from './modules/game2024.js';
import { initializeTheme } from './modules/theme.js';
import { getVersion } from './modules/version.js';
import { logger } from './modules/logger.js';

document.addEventListener('DOMContentLoaded', async function() {
    // Initialize theme
    initializeTheme();
    
    // Initialize i18n
    const i18n = initializeI18n();

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
        enableDebugMode: document.getElementById('enableDebugMode')
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

    // 更新界面文本
    const updateUIText = () => {
        try {
            // 更新标题
            document.title = i18n.t('settings');
            
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
            updateSelectOptions(elements.languageSelect);
            updateSelectOptions(elements.themeSelect);
        } catch (error) {
            console.error('更新界面文本失败:', error);
        }
    };

    // 显示状态消息
    function showStatus(message, type = 'success') {
        const statusContainer = document.getElementById('statusContainer');
        const statusDiv = document.createElement('div');
        statusDiv.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg text-white transition-all duration-300 transform translate-y-0 opacity-100 ${
            type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`;
        statusDiv.textContent = message;
        statusContainer.appendChild(statusDiv);

        setTimeout(() => {
            statusDiv.style.opacity = '0';
            statusDiv.style.transform = 'translateY(100%)';
            setTimeout(() => statusDiv.remove(), 300);
        }, 3000);
    }

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

            // 应用语言设置
            if (settings.language) {
                i18n.setLocale(settings.language);
                updateUIText();
            }
        } catch (error) {
            console.error('加载设置失败:', error);
            showStatus(i18n.t('error', { message: '加载设置失败' }), 'error');
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
                enableDebugMode: elements.enableDebugMode.checked,

            };

            await chrome.storage.local.set({ settings });
            showStatus(i18n.t('settingsSaved'));

            // 应用主题
            applyTheme(settings.theme);

            // 通知其他页面
            chrome.runtime.sendMessage({
                type: 'SETTINGS_UPDATED',
                data: settings
            });
        } catch (error) {
            console.error('保存设置失败:', error);
            showStatus(i18n.t('error', { message: '保存设置失败' }), 'error');
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

    // 页面切换处理
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.section-content');

    function switchSection(targetSection) {
        navItems.forEach(item => {
            item.classList.toggle('active', item.dataset.section === targetSection);
        });

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

    // 绑定导航事件
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const section = item.dataset.section;
            switchSection(section);
            
            // 初始化游戏（如果是游戏部分）
            if (section === 'game2024' && !window.game2024Instance) {
                window.game2024Instance = new Game2024();
            }
        });
    });

    // 绑定设置变更事件
    elements.languageSelect.addEventListener('change', async () => {
        const locale = elements.languageSelect.value;
        if (i18n.setLocale(locale)) {
            updateUIText();
            await saveSettings();
        }
    });

    elements.themeSelect.addEventListener('change', saveSettings);
    elements.showUrlCount.addEventListener('change', saveSettings);
    elements.showProgressBar.addEventListener('change', saveSettings);
    elements.defaultMaxUrls.addEventListener('change', saveSettings);
    elements.defaultValidateUrls.addEventListener('change', saveSettings);
    elements.defaultAutoProtocol.addEventListener('change', saveSettings);
    elements.cacheExpiration.addEventListener('change', saveSettings);
    elements.enableDebugMode.addEventListener('change', saveSettings);

    // 监听系统主题变化
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (elements.themeSelect.value === 'system') {
            applyTheme('system');
        }
    });

    // 设置版本号
    document.getElementById('versionNumber').textContent = getVersion();

    // 初始化
    await loadSettings();
    updateUIText();
    switchSection('general');
}); 