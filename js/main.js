/**
 * 线迹幻境 - 主入口
 * 负责初始化和协调各个模块
 */
import { CanvasManager } from './canvas-manager.js';
import { LineGenerator } from './line-generator.js';
import { ExportManager } from './export-manager.js';
import { TouchHandler } from './touch-handler.js';
import { UIController } from './ui-controller.js';
import { isMobileDevice } from './utils.js';

/**
 * 应用主类
 */
class App {
    /**
     * 构造函数，初始化应用
     */
    constructor() {
        try {
            const canvas = document.getElementById('main-canvas');
            if (!canvas) {
                console.error('找不到main-canvas元素');
                return;
            }
            
            // 初始化Canvas管理器
            this.canvasManager = new CanvasManager(canvas);
            
            // 初始化线条生成器
            this.lineGenerator = new LineGenerator(this.canvasManager);
            
            // 初始化导出管理器
            this.exportManager = new ExportManager(this.canvasManager, this.lineGenerator);
            
            // 初始化UI控制器
            this.uiController = new UIController(
                this.canvasManager, 
                this.lineGenerator,
                this.exportManager
            );
            
            // 如果是移动设备，初始化触摸处理
            if (isMobileDevice()) {
                this.touchHandler = new TouchHandler(this.canvasManager);
            }
            
            // 初始应用
            this.initialize();
        } catch (e) {
            console.error('应用初始化失败:', e);
        }
    }
    
    /**
     * 初始化应用
     */
    initialize() {
        try {
            // 初始化UI控制器 - 必须首先初始化UI
            this.uiController.initialize();
            
            // 加载保存的设置
            this.uiController.loadSettings();
            
            // 初始化画布大小 - 在加载设置后调用
            this.canvasManager.initializeCanvas();
            
            // 生成初始线条
            const initialLineCount = parseInt(document.getElementById('line-count')?.value || '8');
            this.lineGenerator.generateLines(initialLineCount);
            
            // 绘制初始场景
            this.uiController.drawCurrentScene();
            
            // 更新状态栏
            this.uiController.updateStatusbar();
            
            // 检查URL参数
            this.checkURLParameters();
            
            // 监听设备方向改变事件
            window.addEventListener('orientationchange', () => {
                setTimeout(() => {
                    // 重置和重新初始化画布
                    this.canvasManager.initializeCanvas();
                    
                    // 重新生成线条
                    const lineCount = parseInt(document.getElementById('line-count')?.value || '8');
                    this.lineGenerator.generateLines(lineCount);
                    
                    // 重新绘制场景
                    this.uiController.drawCurrentScene();
                    
                    // 更新状态栏
                    this.uiController.updateStatusbar();
                }, 300);
            });
            
            console.log('线迹幻境应用已初始化');
        } catch (e) {
            console.error('应用初始化过程失败:', e);
        }
    }
    
    /**
     * 检查URL参数，用于分享和预设
     */
    checkURLParameters() {
        // 这里可以添加解析URL参数的逻辑
        // 例如：从URL导入预设参数
    }
}

/**
 * 等待DOM加载完成后初始化应用
 */
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
    
    // Safari和iOS兼容性处理
    if (/iPhone|iPad|iPod|Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)) {
        // 解决Safari的渲染问题
        const canvas = document.getElementById('main-canvas');
        
        // 强制重新计算
        function forceReflow() {
            canvas.style.display = 'none';
            void canvas.offsetHeight; // 触发重排
            canvas.style.display = '';
        }
        
        // 在方向变化和尺寸变化时应用
        window.addEventListener('orientationchange', forceReflow);
        window.addEventListener('resize', forceReflow);
    }
}); 