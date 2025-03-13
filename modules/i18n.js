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
        feature1: '支持批量打开多个URL',
        feature2: '支持URL验证和去重',
        feature3: '支持标签页分组',
        feature4: '支持自定义打开顺序',
        feature5: '支持深色模式',
        feature6: '支持多语言',
        feature7: '支持URL导入导出',
        feature8: '支持URL预览',
        feature9: '支持URL分类',
        feature10: '支持延迟加载',
        feature11: '支持自动添加协议',
        feature12: '支持URL安全性检查',
        feature13: '支持URL元数据缓存',
        feature14: '支持自定义设置保存',
        feature15: '支持URL计数统计'
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
        feature1: 'Support for opening multiple URLs in batch',
        feature2: 'URL validation and duplicate removal',
        feature3: 'Tab grouping support',
        feature4: 'Customizable opening order',
        feature5: 'Dark mode support',
        feature6: 'Multi-language support',
        feature7: 'URL import/export support',
        feature8: 'URL preview support',
        feature9: 'URL categorization support',
        feature10: 'Delayed loading support',
        feature11: 'Automatic protocol addition',
        feature12: 'URL security checking',
        feature13: 'URL metadata caching',
        feature14: 'Custom settings saving',
        feature15: 'URL counting statistics'
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