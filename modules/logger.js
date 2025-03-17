import { VERSION } from './version.js';

// 日志工具
export const logger = {
    prefix: `[Open Multiple URLs v${VERSION}]`,
    
    _getTimestamp() {
        return new Date().toISOString();
    },

    _formatMessage(type, args) {
        return [`${this.prefix} [${this._getTimestamp()}] [${type}]`, ...args];
    },
    
    log(...args) {
        console.log(...this._formatMessage('LOG', args));
    },
    
    warn(...args) {
        console.warn(...this._formatMessage('WARN', args));
    },
    
    error(...args) {
        console.error(...this._formatMessage('ERROR', args));
    },
    
    info(...args) {
        console.info(...this._formatMessage('INFO', args));
    },
    
    debug(...args) {
        console.debug(...this._formatMessage('DEBUG', args));
    }
}; 