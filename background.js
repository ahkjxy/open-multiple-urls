// 后台服务工作进程
import { URLProcessor } from './modules/url-processor.js';
import { CacheManager } from './modules/cache-manager.js';
import { SecurityChecker } from './modules/security-checker.js';

// 初始化模块
const urlProcessor = new URLProcessor();
const cacheManager = new CacheManager();
const securityChecker = new SecurityChecker();

// 监听来自 popup 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'PROCESS_URLS':
      handleProcessUrls(request.data);
      break;
    case 'CHECK_URLS':
      handleCheckUrls(request.data);
      break;
    case 'CACHE_URL':
      handleCacheUrl(request.data);
      break;
    case 'GET_CACHED_DATA':
      handleGetCachedData(request.data);
      break;
    case 'SCHEDULE_URLS':
      handleScheduleUrls(request.data);
      break;
    default:
      console.warn('Unknown message type:', request.type);
  }
  return true; // 保持消息通道开放
});

// 处理 URL 处理请求
async function handleProcessUrls(data) {
  try {
    const { urls, options } = data;
    const processedUrls = await urlProcessor.process(urls, options);
    sendResponse({ success: true, data: processedUrls });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

// 处理 URL 检查请求
async function handleCheckUrls(data) {
  try {
    const { urls } = data;
    const results = await securityChecker.checkUrls(urls);
    sendResponse({ success: true, data: results });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

// 处理 URL 缓存请求
async function handleCacheUrl(data) {
  try {
    const { url, metadata } = data;
    await cacheManager.cache(url, metadata);
    sendResponse({ success: true });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

// 处理获取缓存数据请求
async function handleGetCachedData(data) {
  try {
    const { url } = data;
    const cachedData = await cacheManager.get(url);
    sendResponse({ success: true, data: cachedData });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

// 处理 URL 定时打开请求
async function handleScheduleUrls(data) {
  try {
    const { urls, schedule } = data;
    await scheduleUrls(urls, schedule);
    sendResponse({ success: true });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

// 定时打开 URL
async function scheduleUrls(urls, schedule) {
  const { time, repeat } = schedule;
  const alarmName = `url_schedule_${Date.now()}`;
  
  await chrome.alarms.create(alarmName, {
    when: time,
    periodInMinutes: repeat ? 60 * 24 : undefined
  });

  chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === alarmName) {
      await urlProcessor.process(urls);
    }
  });
}

// 监听网络请求
chrome.webRequest.onBeforeRequest.addListener(
  async (details) => {
    if (details.type === 'main_frame') {
      await securityChecker.checkUrl(details.url);
    }
  },
  { urls: ['<all_urls>'] }
);

// 导出模块供其他文件使用
export { urlProcessor, cacheManager, securityChecker }; 