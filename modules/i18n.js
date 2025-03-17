export class I18n {
  constructor() {
    this.locale = 'zh';
    this.translations = {
      zh: {
        title: '批量打开URL',
        urlInputLabel: '输入URL（每行一个）',
        urlInputPlaceholder: '在此输入URL，每行一个...',
        delayLoad: '延迟加载',
        preserveInput: '保留输入',
        removeDuplicates: '去除重复',
        searchNonUrls: '搜索非URL文本',
        validateUrls: '验证URL',
        autoProtocol: '自动添加协议',
        openOrder: '打开顺序',
        openOrderNormal: '正常顺序',
        openOrderReverse: '反向顺序',
        openOrderRandom: '随机顺序',
        openOrderDomain: '按域名排序',
        openOrderTime: '按时间排序',
        groupOption: '标签页分组',
        groupOptionNone: '不分组',
        groupOptionNew: '新建分组',
        groupOptionExisting: '添加到现有分组',
        urlCategory: 'URL分类',
        urlCategoryNone: '不分类',
        urlCategoryDomain: '按域名分类',
        urlCategoryCustom: '自定义分类',
        maxUrls: '最大URL数量',
        openUrls: '打开URL',
        extractUrls: '提取URL',
        import: '导入',
        export: '导出',
        close: '关闭',
        confirmOpen: '确认打开',
        urlPreview: 'URL预览',
        processing: '处理中...',
        success: '成功处理 {count} 个URL',
        error: '错误：{message}',
        noValidUrls: '没有找到有效的URL',
        noUrlsToExport: '没有可导出的URL',
        importSuccess: '成功导入URL',
        importError: '导入失败',
        exportSuccess: '成功导出URL',
        exportError: '导出失败：{message}',
        selectAtLeastOne: '请至少选择一个URL',
        urlCount: 'URL总数：{count}',
        validUrlCount: '有效URL数：{count}',
        themeLight: '浅色主题',
        themeDark: '深色主题',
        language: '语言',
        languageZh: '中文',
        languageEn: 'English',
        settings: '设置',
        about: '关于',
        version: '版本',
        description: '一个用于批量打开URL的Chrome扩展',
        features: '功能特点',
        feature1: '支持批量打开多个URL，可自定义打开顺序',
        feature2: '支持URL预览和选择性打开，提供更好的控制',
        feature3: '支持标签页分组管理，自动整理标签页',
        feature4: '支持URL提取和验证，确保链接有效性',
        feature5: '支持URL导入导出，方便数据迁移',
        feature6: '支持进度显示和状态反馈，操作更直观',
        feature7: '支持URL安全检查，提供安全警告',
        feature8: '支持中英文界面切换，适应不同用户',
        feature9: '支持深色模式和系统主题同步，护眼美观',
        feature10: '支持自定义设置和偏好保存，个性化体验',
        feature11: '支持URL安全性检查',
        feature12: '支持URL元数据缓存',
        feature13: '支持自定义设置保存',
        feature14: '支持URL计数统计',
        settingsSaved: '设置已保存',
        maxUrlsLimitReached: 'URL数量超过限制，已截取前 {count} 个',
        generalSettings: '常规设置',
        appearanceSettings: '外观设置',
        urlSettings: 'URL设置',
        advancedSettings: '高级设置',
        theme: '主题',
        themeSystem: '跟随系统',
        showUrlCount: '显示URL计数',
        showProgressBar: '显示进度条',
        defaultMaxUrls: '默认最大URL数量',
        defaultValidateUrls: '默认验证URL',
        defaultAutoProtocol: '默认自动添加协议',
        cacheExpiration: '缓存过期时间（小时）',
        enableDebugMode: '启用调试模式',
        game2024: '2024 游戏',
        score: '得分',
        newGame: '新游戏',
        gameInstructions: '使用方向键或滑动来移动方块。合并相同数字以达到2024！',
        gameOver: '游戏结束！最终得分：'
      },
      en: {
        title: 'Open Multiple URLs',
        urlInputLabel: 'Enter URLs (one per line)',
        urlInputPlaceholder: 'Enter URLs here, one per line...',
        delayLoad: 'Delay Loading',
        preserveInput: 'Preserve Input',
        removeDuplicates: 'Remove Duplicates',
        searchNonUrls: 'Search Non-URL Text',
        validateUrls: 'Validate URLs',
        autoProtocol: 'Auto Add Protocol',
        openOrder: 'Open Order',
        openOrderNormal: 'Normal Order',
        openOrderReverse: 'Reverse Order',
        openOrderRandom: 'Random Order',
        openOrderDomain: 'Sort by Domain',
        openOrderTime: 'Sort by Time',
        groupOption: 'Tab Grouping',
        groupOptionNone: 'No Grouping',
        groupOptionNew: 'New Group',
        groupOptionExisting: 'Add to Existing Group',
        urlCategory: 'URL Categorization',
        urlCategoryNone: 'No Categorization',
        urlCategoryDomain: 'By Domain',
        urlCategoryCustom: 'Custom',
        maxUrls: 'Max URLs',
        openUrls: 'Open URLs',
        extractUrls: 'Extract URLs',
        import: 'Import',
        export: 'Export',
        close: 'Close',
        confirmOpen: 'Confirm Open',
        urlPreview: 'URL Preview',
        processing: 'Processing...',
        success: 'Successfully processed {count} URLs',
        error: 'Error: {message}',
        noValidUrls: 'No valid URLs found',
        noUrlsToExport: 'No URLs to export',
        importSuccess: 'Successfully imported URLs',
        importError: 'Import failed',
        exportSuccess: 'Successfully exported URLs',
        exportError: 'Export failed: {message}',
        selectAtLeastOne: 'Please select at least one URL',
        urlCount: 'Total URLs: {count}',
        validUrlCount: 'Valid URLs: {count}',
        themeLight: 'Light Theme',
        themeDark: 'Dark Theme',
        language: 'Language',
        languageZh: '中文',
        languageEn: 'English',
        settings: 'Settings',
        about: 'About',
        version: 'Version',
        description: 'A Chrome extension for opening multiple URLs',
        features: 'Features',
        feature1: 'Support batch opening URLs with customizable order',
        feature2: 'URL preview and selective opening for better control',
        feature3: 'Tab group management for automatic organization',
        feature4: 'URL extraction and validation for link integrity',
        feature5: 'URL import/export for easy data migration',
        feature6: 'Progress display and status feedback for better visibility',
        feature7: 'URL security check with safety warnings',
        feature8: 'Chinese/English interface for different users',
        feature9: 'Dark mode and system theme sync for eye comfort',
        feature10: 'Custom settings and preferences for personalization',
        feature11: 'URL security checking',
        feature12: 'URL metadata caching',
        feature13: 'Custom settings saving',
        feature14: 'URL counting statistics',
        settingsSaved: 'Settings saved',
        generalSettings: 'General Settings',
        appearanceSettings: 'Appearance Settings',
        urlSettings: 'URL Settings',
        advancedSettings: 'Advanced Settings',
        theme: 'Theme',
        themeSystem: 'System',
        showUrlCount: 'Show URL Count',
        showProgressBar: 'Show Progress Bar',
        defaultMaxUrls: 'Default Max URLs',
        defaultValidateUrls: 'Default Validate URLs',
        defaultAutoProtocol: 'Default Auto Protocol',
        cacheExpiration: 'Cache Expiration (Hours)',
        enableDebugMode: 'Enable Debug Mode',
        game2024: '2024 Game',
        score: 'Score',
        newGame: 'New Game',
        gameInstructions: 'Use arrow keys or swipe to move tiles. Combine matching numbers to reach 2024!',
        gameOver: 'Game Over! Final Score: '
      }
    };
  }

  setLocale(locale) {
    if (this.translations[locale]) {
      this.locale = locale;
      return true;
    }
    return false;
  }

  getLocale() {
    return this.locale;
  }

  t(key, params = {}) {
    const translation = this.translations[this.locale][key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }

    return translation.replace(/\{(\w+)\}/g, (match, key) => {
      return params[key] !== undefined ? params[key] : match;
    });
  }

  async saveLocale() {
    try {
      await chrome.storage.local.set({ locale: this.locale });
    } catch (error) {
      console.error('Failed to save locale:', error);
    }
  }

  async loadLocale() {
    try {
      const result = await chrome.storage.local.get('locale');
      if (result.locale && this.translations[result.locale]) {
        this.locale = result.locale;
      }
    } catch (error) {
      console.error('Failed to load locale:', error);
    }
  }
}

export function initializeI18n() {
  const i18n = new I18n();
  i18n.loadLocale();
  return i18n;
}