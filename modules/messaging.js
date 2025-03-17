import { logger } from './logger.js';

// 消息处理工具
export const messaging = {
    // 发送消息并等待响应
    async sendMessage(message, timeout = 5000) {
        try {
            const response = await Promise.race([
                chrome.runtime.sendMessage(message),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Message timeout')), timeout)
                )
            ]);
            logger.debug('消息发送成功:', message);
            return response;
        } catch (error) {
            logger.error('消息发送失败:', error);
            throw error;
        }
    },

    // 监听消息
    addListener(callback) {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            logger.debug('收到消息:', message);
            
            // 使用 async/await 处理异步响应
            Promise.resolve(callback(message, sender))
                .then(response => {
                    if (response !== undefined) {
                        logger.debug('发送响应:', response);
                        sendResponse(response);
                    }
                })
                .catch(error => {
                    logger.error('消息处理失败:', error);
                    sendResponse({ error: error.message });
                });
            
            // 返回 true 表示将异步发送响应
            return true;
        });
    },

    // 广播消息到所有标签页
    async broadcast(message) {
        try {
            const tabs = await chrome.tabs.query({});
            const promises = tabs.map(tab => 
                chrome.tabs.sendMessage(tab.id, message).catch(error => {
                    logger.debug(`标签页 ${tab.id} 消息发送失败:`, error);
                    return null;
                })
            );
            
            const results = await Promise.all(promises);
            logger.debug('广播消息完成:', message, '结果:', results.filter(r => r !== null));
            return results.filter(r => r !== null);
        } catch (error) {
            logger.error('广播消息失败:', error);
            throw error;
        }
    }
}; 