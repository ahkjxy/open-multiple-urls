// YouTube API 服务模块
class YouTubeAPI {
  constructor() {
    this.apiKey = 'AIzaSyB3XLmosF8neF8QgX9AXCM6mmb3VSO_Pc4'; // 默认API密钥
    this.baseUrl = 'https://www.googleapis.com/youtube/v3';
    this.maxResults = 10;
  }

  // 设置API密钥
  setApiKey(apiKey) {
    this.apiKey = apiKey;
  }

  // 检查API密钥是否已设置
  hasApiKey() {
    return this.apiKey && this.apiKey.trim() !== '';
  }

  // 搜索视频
  async searchVideos(query, pageToken = null) {
    if (!this.hasApiKey()) {
      throw new Error('YouTube API密钥未配置');
    }

    const params = new URLSearchParams({
      part: 'snippet',
      q: query,
      type: 'video',
      maxResults: this.maxResults,
      key: this.apiKey
    });

    if (pageToken) {
      params.append('pageToken', pageToken);
    }

    console.log('[YouTube API] 搜索URL:', `${this.baseUrl}/search?${params}`);
    console.log('[YouTube API] 搜索参数:', Object.fromEntries(params));

    try {
      const response = await fetch(`${this.baseUrl}/search?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || '搜索请求失败');
      }

      const data = await response.json();
      return {
        items: data.items || [],
        nextPageToken: data.nextPageToken,
        totalResults: data.pageInfo?.totalResults || 0
      };
    } catch (error) {
      console.error('[YouTube API] 搜索失败:', error);
      throw error;
    }
  }

  // 获取视频详细信息
  async getVideoDetails(videoIds) {
    if (!this.hasApiKey()) {
      throw new Error('YouTube API密钥未配置');
    }

    const params = new URLSearchParams({
      part: 'snippet,statistics,contentDetails',
      id: videoIds.join(','),
      key: this.apiKey
    });

    try {
      const response = await fetch(`${this.baseUrl}/videos?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || '获取视频详情失败');
      }

      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('[YouTube API] 获取视频详情失败:', error);
      throw error;
    }
  }

  // 格式化时长
  formatDuration(duration) {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return '未知';

    const hours = (match[1] || '').replace('H', '');
    const minutes = (match[2] || '').replace('M', '');
    const seconds = (match[3] || '').replace('S', '');

    let result = '';
    if (hours) result += `${hours}:`;
    result += `${minutes.padStart(2, '0')}:`;
    result += seconds.padStart(2, '0');

    return result;
  }

  // 格式化观看次数
  formatViews(views) {
    if (!views) return '0';
    
    const num = parseInt(views);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  }

  // 格式化发布时间
  formatPublishedDate(publishedAt) {
    if (!publishedAt) return '未知';
    
    const date = new Date(publishedAt);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '昨天';
    if (diffDays < 7) return `${diffDays}天前`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}个月前`;
    
    return `${Math.floor(diffDays / 365)}年前`;
  }

  // 生成视频URL
  getVideoUrl(videoId) {
    return `https://www.youtube.com/watch?v=${videoId}`;
  }

  // 生成缩略图URL
  getThumbnailUrl(videoId, quality = 'medium') {
    // 确保videoId是有效的
    if (!videoId) {
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDMyMCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMTgwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjE2MCIgeT0iOTAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+5o6I5p2D5Y2g5L2N5paH5Lu2PC90ZXh0Pgo8L3N2Zz4K';
    }
    
    // 使用YouTube的标准缩略图URL格式
    const qualities = {
      'default': 'default.jpg',
      'medium': 'mqdefault.jpg', 
      'high': 'hqdefault.jpg',
      'standard': 'sddefault.jpg',
      'maxres': 'maxresdefault.jpg'
    };
    
    const qualityKey = qualities[quality] || qualities['medium'];
    return `https://img.youtube.com/vi/${videoId}/${qualityKey}`;
  }
}

export default YouTubeAPI;
