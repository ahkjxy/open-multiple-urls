# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- URL 批量编辑功能
  - 复制/粘贴/删除多个 URL
  - 拖拽排序功能
  - URL 历史记录
  - 自定义标签分类
  - URL 预览缩略图
- URL 有效性检查
  - 批量检查 URL 可访问性
  - 显示网页标题
  - 自定义 URL 显示名称
  - 扩展导出格式（JSON、CSV、TXT）
  - 智能识别导入格式
- 单元测试和自动化测试
- 云同步功能
- URL 定时打开功能
- URL 批量替换功能
- 规则过滤功能
- 统计分析功能

### Changed
- 优化大量 URL 处理
  - 添加处理进度显示
  - 实现 URL 缓存机制
  - 添加后台处理机制
  - 优化内存使用
- 优化代码结构
- 完善开发文档
- 添加性能监控
- 支持不同地区 URL 格式
- 添加时区相关功能
- 支持与其他扩展集成

### Fixed
- 优化错误提示
- 添加错误恢复机制
- 支持操作撤销/重做

## [1.4.2] - 2015-03-21

### Added
- 消息广播功能，支持向所有标签页发送消息
- 日志时间戳和类型标识
- 消息超时处理机制

### Changed
- 重构模块结构，分离日志、消息和版本管理功能
- 改进日志格式，添加时间戳和类型标识
- 优化消息处理机制，提高可靠性
- 更新错误处理和日志记录方式

### Fixed
- 修复消息通道关闭问题
- 修复日志格式化问题

## [1.4.1] - 2015-03-20

### Added
- 国际化支持
- 深色模式切换
- 设置同步功能

### Changed
- 改进 URL 处理逻辑
- 优化用户界面响应性
- 更新设置保存机制

### Fixed
- 修复语言切换问题
- 修复设置同步问题
- 修复主题切换延迟问题

## [1.4.0] - 2015-03-19

### Added
- URL 批量打开功能
- 标签页分组功能
- URL 预览功能
- 导入导出功能
- 安全检查功能

### Changed
- 重新设计用户界面
- 优化 URL 处理性能
- 改进错误处理机制

### Fixed
- 修复 URL 验证问题
- 修复标签页创建问题
- 修复分组功能问题

## [1.3.9] - 2015-03-18

### Changed
- 全面优化界面设计和视觉效果
  - 更新主题配色为靛青色系，提升视觉层次感
  - 优化按钮和控件的视觉效果，增加阴影和悬停状态
  - 改进深色模式下的颜色方案，提高可读性
  - 统一边框和圆角样式，增强一致性
  - 优化输入框和选择器的焦点状态
  - 美化进度条和状态显示样式
  - 改进模态框设计，添加模糊背景效果
  - 优化滚动条样式
- 优化打开顺序、分组和分类选项的布局
- 改进中英文切换时的显示效果
- 统一标签和选择框的样式
- 增加布局的响应性

## [1.3.8] - 2015-03-17

### Changed
- 重构选项页面代码
  - 优化设置项的数据结构
  - 改进事件处理逻辑
  - 优化状态提示样式
  - 简化页面切换机制
  - 改进主题切换功能
- 配置 Tailwind CSS
  - 自定义组件样式
  - 优化颜色系统，统一使用 pink 色系
  - 添加渐变、阴影等视觉效果
  - 实现响应式交互效果
  - 优化组件间距和布局

## [1.3.7] - 2015-03-16

### Changed
- 改进选项页面的导航交互
  - 移除基于 URL hash 的导航方式
  - 使用现代的 JavaScript 切换方案
  - 添加平滑的过渡效果
  - 优化导航按钮的状态显示

### Fixed
- 修复选项页面切换功能
  - 修复内容区域切换逻辑
  - 优化导航按钮状态切换
  - 改进页面初始化流程

## [1.3.6] - 2015-03-15

### Changed
- 重构选项页面布局和样式
  - 采用左右分栏结构，提升导航体验
  - 优化各设置项的分组和展示
  - 统一使用 Tailwind CSS 样式
  - 添加磨砂玻璃效果和渐变背景
  - 改进深色模式适配
  - 优化响应式布局

## [1.3.5] - 2015-03-14

### Fixed
- 修复部分文本未使用国际化的问题
- 完善所有界面元素的国际化支持

## [1.3.4] - 2015-03-13

### Fixed
- 修复部分文本未使用国际化的问题
- 完善所有界面元素的国际化支持

## [1.3.3] - 2015-03-12

### Changed
- 移除商品相关的显示内容和翻译项
- 优化界面布局，使其更加简洁

## [1.3.2] - 2015-03-11

### Changed
- 改进国际化系统
  - 统一使用 data-i18n 属性标记需要翻译的文本
  - 优化动态文本的国际化处理
  - 完善中英文翻译内容

### Fixed
- 修复国际化功能的问题
  - 修复部分文本未正确翻译的问题
  - 添加商品相关文本的国际化支持
  - 优化 HTML 元素的国际化属性
  - 确保所有硬编码文本使用国际化系统

## [1.3.1] - 2015-03-10

### Fixed
- 修复 URL 预览功能的问题
  - 修复预览列表显示 404 的问题
  - 优化 URL 预览逻辑，直接显示 URL 而不是尝试获取标题
  - 改进预览界面的稳定性

## [1.3.0] - 2015-03-09

### Added
- 选项页面，提供更完整的设置界面
- 完善国际化支持，添加更多翻译内容
- 深色模式支持
- 语言切换功能（中文/英文）
- 版本信息和功能列表展示

### Changed
- 改进设置保存和加载机制
- 优化深色模式切换体验
- 优化语言切换体验
- 优化选项页面的布局和样式
- 改进错误处理和状态提示

### Fixed
- 修复国际化文本不完整的问题
- 修复深色模式切换不生效的问题
- 修复设置保存失败的问题
- 修复语言切换后部分文本未更新的问题

## [1.2.7] - 2015-03-08

### Added
- 深色模式支持
  - 手动切换深色/浅色主题
  - 自动保存主题偏好
  - 优化深色模式下的 UI 显示
- 国际化支持
  - 支持中文和英文切换
  - 自动保存语言偏好
  - 所有界面文本支持多语言

### Changed
- 优化 UI 适配深色模式
- 改进设置保存机制
- 优化语言切换体验
- 改进错误提示信息

### Fixed
- 修复主题切换问题
- 修复语言切换问题
- 修复设置保存失败的问题

## [1.2.6] - 2015-03-07

### Added
- URL 预览功能
  - 显示 URL 标题和描述
  - 支持选择性打开
  - 优化预览界面设计
- URL 元数据缓存
  - 缓存 URL 标题和描述
  - 支持离线预览
  - 自动更新缓存

### Changed
- 改进 URL 处理逻辑
- 优化预览界面性能
- 改进缓存管理机制
- 优化错误处理

### Fixed
- 修复 URL 预览加载失败的问题
- 修复缓存更新不及时的问题
- 修复预览界面卡顿的问题

## [1.2.5] - 2015-03-06

### Added
- URL 安全性检查
  - 检查 URL 是否安全
  - 支持自定义安全规则
  - 添加安全警告提示
- URL 黑名单功能
  - 支持自定义黑名单
  - 自动过滤不安全 URL
  - 提供黑名单管理界面

### Changed
- 改进 URL 验证机制
- 优化安全检查性能
- 改进错误提示信息
- 优化黑名单管理

### Fixed
- 修复安全检查误报问题
- 修复黑名单过滤失效的问题
- 修复设置保存失败的问题

## [1.2.4] - 2015-03-05

### Added
- URL 导入导出功能
  - 支持 JSON 格式导入导出
  - 支持文本格式导入导出
  - 添加导入导出进度提示
- URL 提取功能
  - 支持从文本中提取 URL
  - 自动验证提取的 URL
  - 优化提取结果展示

### Changed
- 改进导入导出性能
- 优化 URL 提取算法
- 改进错误处理机制
- 优化用户界面交互

### Fixed
- 修复导入导出失败的问题
- 修复 URL 提取不准确的问题
- 修复进度提示不显示的问题

## [1.2.3] - 2015-03-04

### Added
- 标签页分组功能
  - 支持创建新分组
  - 支持添加到现有分组
  - 优化分组管理界面
- URL 分类功能
  - 支持按域名分类
  - 支持自定义分类
  - 优化分类展示效果

### Changed
- 改进分组管理机制
- 优化分类算法
- 改进用户界面设计
- 优化性能表现

### Fixed
- 修复分组创建失败的问题
- 修复分类不准确的问题
- 修复界面显示异常的问题

## [1.2.2] - 2015-03-03

### Added
- 延迟加载功能
  - 支持自定义延迟时间
  - 添加延迟进度提示
  - 优化加载体验
- URL 验证功能
  - 支持 URL 有效性验证
  - 添加验证结果提示
  - 优化验证性能

### Changed
- 改进延迟加载机制
- 优化验证算法
- 改进错误处理
- 优化用户界面

### Fixed
- 修复延迟加载不准确的问题
- 修复验证失败的问题
- 修复界面卡顿的问题

## [1.2.1] - 2015-03-02

### Added
- 自动协议功能
  - 自动添加 https:// 协议
  - 支持自定义协议
  - 优化协议处理逻辑
- URL 去重功能
  - 自动去除重复 URL
  - 支持自定义去重规则
  - 优化去重性能

### Changed
- 改进协议处理机制
- 优化去重算法
- 改进错误处理
- 优化用户界面

### Fixed
- 修复协议添加失败的问题
- 修复去重不准确的问题
- 修复界面显示异常的问题

## [1.2.0] - 2015-03-01

### Added
- 设置保存功能
  - 自动保存用户设置
  - 支持设置导入导出
  - 优化设置管理界面
- URL 计数功能
  - 显示 URL 总数
  - 显示有效 URL 数
  - 优化计数显示效果

### Changed
- 改进设置保存机制
- 优化计数算法
- 改进用户界面
- 优化性能表现

### Fixed
- 修复设置保存失败的问题
- 修复计数不准确的问题
- 修复界面显示异常的问题

## [1.1.0] - 2015-02-28

### Added
- 进度条显示
  - 显示打开进度
  - 支持取消操作
  - 优化进度显示效果
- 错误处理机制
  - 显示详细错误信息
  - 支持错误重试
  - 优化错误提示界面

### Changed
- 改进进度显示机制
- 优化错误处理流程
- 改进用户界面
- 优化性能表现

### Fixed
- 修复进度显示不准确的问题
- 修复错误处理不完善的问题
- 修复界面显示异常的问题

## [1.0.0] - 2015-02-27

### Added
- 初始版本发布
  - 支持批量打开 URL
  - 支持自定义打开顺序
  - 支持最大 URL 数量限制
  - 支持保留输入内容
  - 支持搜索非 URL 文本 