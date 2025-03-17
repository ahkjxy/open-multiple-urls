export const VERSION = '1.4.2';

// 获取版本号
export function getVersion() {
    return VERSION;
}

// 比较版本号
export function compareVersion(v1, v2) {
    const v1Parts = v1.split('.').map(Number);
    const v2Parts = v2.split('.').map(Number);
    
    for (let i = 0; i < 3; i++) {
        if (v1Parts[i] > v2Parts[i]) return 1;
        if (v1Parts[i] < v2Parts[i]) return -1;
    }
    return 0;
}

// 检查是否需要更新
export function checkNeedsUpdate(currentVersion, latestVersion) {
    return compareVersion(latestVersion, currentVersion) > 0;
} 