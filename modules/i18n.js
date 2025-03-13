export class I18n {
  constructor() {
    this.translations = {
      zh: {
        title: '批量打开URL',
        urlInputLabel: '输入URL列表（每行一个）',
        urlInputPlaceholder: 'https://example.com\nhttps://example.org',
        import: '导入',
        export: '导出',
        openUrls: '打开URL',
        extractUrls: '提取URL',
        delayLoad: '延迟加载',
        preserveInput: '保留输入',
        removeDuplicates: '去重',
        searchNonUrls: '搜索非URL',
        validateUrls: '验证URL',
        autoProtocol: '自动https',
        openOrder: '打开顺序',
        openOrderNormal: '正常顺序',
        openOrderReverse: '反向顺序',
        openOrderRandom: '随机顺序',
        groupOption: '标签页分组',
        groupOptionNone: '不分组',
        groupOptionNew: '新建分组',
        groupOptionExisting: '现有分组',
        urlCategory: 'URL分类',
        urlCategoryNone: '不分类',
        urlCategoryDomain: '按域名',
        urlCategoryCustom: '自定义',
        maxUrls: '最大URL数量',
        urlCount: '{count} 个URL',
        validUrlCount: '{count} 个有效URL',
        urlPreview: 'URL预览',
        close: '关闭',
        confirmOpen: '确认打开',
        processing: '正在处理URL...',
        success: '成功打开 {count} 个URL',
        error: '发生错误: {message}',
        noValidUrls: '没有有效的URL',
        selectAtLeastOne: '请至少选择一个URL',
        importSuccess: 'URL导入成功',
        importError: '导入文件失败：文件格式不正确',
        exportSuccess: 'URL导出成功',
        exportError: '导出失败: {message}',
        noUrlsToExport: '没有可导出的URL',
        themeLight: '浅色模式',
        themeDark: '深色模式'
      },
      en: {
        title: 'Open Multiple URLs',
        urlInputLabel: 'Enter URLs (one per line)',
        urlInputPlaceholder: 'https://example.com\nhttps://example.org',
        import: 'Import',
        export: 'Export',
        openUrls: 'Open URLs',
        extractUrls: 'Extract URLs',
        delayLoad: 'Delay Load',
        preserveInput: 'Preserve Input',
        removeDuplicates: 'Remove Duplicates',
        searchNonUrls: 'Search Non-URLs',
        validateUrls: 'Validate URLs',
        autoProtocol: 'Auto HTTPS',
        openOrder: 'Open Order',
        openOrderNormal: 'Normal',
        openOrderReverse: 'Reverse',
        openOrderRandom: 'Random',
        groupOption: 'Tab Group',
        groupOptionNone: 'No Group',
        groupOptionNew: 'New Group',
        groupOptionExisting: 'Existing Group',
        urlCategory: 'URL Category',
        urlCategoryNone: 'No Category',
        urlCategoryDomain: 'By Domain',
        urlCategoryCustom: 'Custom',
        maxUrls: 'Max URLs',
        urlCount: '{count} URLs',
        validUrlCount: '{count} Valid URLs',
        urlPreview: 'URL Preview',
        close: 'Close',
        confirmOpen: 'Confirm Open',
        processing: 'Processing URLs...',
        success: 'Successfully opened {count} URLs',
        error: 'Error: {message}',
        noValidUrls: 'No valid URLs',
        selectAtLeastOne: 'Please select at least one URL',
        importSuccess: 'URLs imported successfully',
        importError: 'Import failed: Invalid file format',
        exportSuccess: 'URLs exported successfully',
        exportError: 'Export failed: {message}',
        noUrlsToExport: 'No URLs to export',
        themeLight: 'Light Mode',
        themeDark: 'Dark Mode'
      }
    };
    this.currentLocale = 'zh';
  }

  setLocale(locale) {
    if (this.translations[locale]) {
      this.currentLocale = locale;
      return true;
    }
    return false;
  }

  getLocale() {
    return this.currentLocale;
  }

  t(key, params = {}) {
    const translation = this.translations[this.currentLocale][key];
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
      await chrome.storage.local.set({ locale: this.currentLocale });
    } catch (error) {
      console.error('Failed to save locale:', error);
    }
  }

  async loadLocale() {
    try {
      const result = await chrome.storage.local.get('locale');
      if (result.locale && this.translations[result.locale]) {
        this.currentLocale = result.locale;
      }
    } catch (error) {
      console.error('Failed to load locale:', error);
    }
  }
} 