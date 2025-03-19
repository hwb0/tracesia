/**
 * 触摸处理模块
 * 管理移动设备上的触摸交互
 */
import { isMobileDevice } from './utils.js';

export class TouchHandler {
    /**
     * 构造函数
     * @param {CanvasManager} canvasManager - 画布管理器实例
     */
    constructor(canvasManager) {
        this.canvasManager = canvasManager;
        this.canvas = canvasManager.getCanvas();
        this.container = document.querySelector('.canvas-container');
        
        // 初始化触摸状态
        this.touchInfo = {
            lastPinchDistance: 0,
            startScale: 1,
            scale: 1,
            startX: 0,
            startY: 0,
            translateX: 0,
            translateY: 0,
            lastX: 0,
            lastY: 0,
            isPanning: false,
            isZooming: false
        };
        
        // 如果是移动设备，设置触摸事件监听
        if (isMobileDevice()) {
            this.setupTouchEvents();
        }
        
        // 添加双击重置功能
        this.setupDoubleClickReset();
        
        // 显示触摸提示（仅在移动设备上）
        if (isMobileDevice()) {
            this.showTouchHint();
        }
        
        // 监听屏幕方向变化
        this.setupOrientationChangeHandler();
        
        // 监听窗口尺寸变化
        this.setupResizeHandler();
    }
    
    /**
     * 设置触摸事件监听
     */
    setupTouchEvents() {
        // 触摸开始
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        
        // 触摸移动
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        
        // 触摸结束
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
        
        // 触摸取消
        this.canvas.addEventListener('touchcancel', (e) => this.handleTouchEnd(e), { passive: false });
    }
    
    /**
     * 设置双击重置功能
     */
    setupDoubleClickReset() {
        this.canvas.addEventListener('dblclick', () => {
            this.resetCanvasTransform();
        });
    }
    
    /**
     * 处理触摸开始事件
     * @param {TouchEvent} e - 触摸事件
     */
    handleTouchStart(e) {
        // 阻止默认行为，防止页面滚动
        e.preventDefault();
        
        // 防止iOS Safari的橡皮筋效果
        if (/iPhone|iPad|iPod|Safari/.test(navigator.userAgent)) {
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
            document.body.style.height = '100%';
        }
        
        // 保存触摸位置
        const touches = e.touches;
        
        // 单指触摸（拖动）
        if (touches.length === 1) {
            const touch = touches[0];
            this.touchInfo.startX = touch.clientX;
            this.touchInfo.startY = touch.clientY;
            this.touchInfo.lastX = this.touchInfo.translateX;
            this.touchInfo.lastY = this.touchInfo.translateY;
            this.touchInfo.isPanning = true;
            
            // 添加拖动状态类
            this.container.classList.add('panning');
        }
        // 双指触摸（缩放）
        else if (touches.length === 2) {
            this.touchInfo.isPanning = false;
            this.touchInfo.isZooming = true;
            
            // 计算两指间距离
            const distance = this.calculateDistance(
                touches[0].clientX, touches[0].clientY,
                touches[1].clientX, touches[1].clientY
            );
            
            this.touchInfo.lastPinchDistance = distance;
            this.touchInfo.startScale = this.touchInfo.scale;
            
            // 添加缩放状态类
            this.container.classList.add('zooming');
        }
    }
    
    /**
     * 处理触摸移动事件
     * @param {TouchEvent} e - 触摸事件
     */
    handleTouchMove(e) {
        // 阻止默认行为
        e.preventDefault();
        
        const touches = e.touches;
        
        // 单指拖动
        if (touches.length === 1 && this.touchInfo.isPanning) {
            const touch = touches[0];
            const deltaX = touch.clientX - this.touchInfo.startX;
            const deltaY = touch.clientY - this.touchInfo.startY;
            
            // 更新位移
            this.touchInfo.translateX = this.touchInfo.lastX + deltaX;
            this.touchInfo.translateY = this.touchInfo.lastY + deltaY;
            
            // 应用变换
            this.updateCanvasTransform();
        }
        // 双指缩放
        else if (touches.length === 2 && this.touchInfo.isZooming) {
            // 计算当前两指间距离
            const distance = this.calculateDistance(
                touches[0].clientX, touches[0].clientY,
                touches[1].clientX, touches[1].clientY
            );
            
            // 计算缩放比例变化
            const scaleFactor = distance / this.touchInfo.lastPinchDistance;
            this.touchInfo.scale = this.touchInfo.startScale * scaleFactor;
            
            // 限制缩放范围
            this.touchInfo.scale = Math.max(0.5, Math.min(3, this.touchInfo.scale));
            
            // 应用变换
            this.updateCanvasTransform();
        }
    }
    
    /**
     * 处理触摸结束事件
     * @param {TouchEvent} e - 触摸事件
     */
    handleTouchEnd(e) {
        // 结束拖动和缩放状态
        this.touchInfo.isPanning = false;
        this.touchInfo.isZooming = false;
        
        // 移除状态类
        this.container.classList.remove('panning');
        this.container.classList.remove('zooming');
        
        // 恢复iOS Safari的橡皮筋效果
        if (/iPhone|iPad|iPod|Safari/.test(navigator.userAgent)) {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
            document.body.style.height = '';
        }
    }
    
    /**
     * 计算两点之间的距离
     * @param {number} x1 - 第一个点的X坐标
     * @param {number} y1 - 第一个点的Y坐标
     * @param {number} x2 - 第二个点的X坐标
     * @param {number} y2 - 第二个点的Y坐标
     * @returns {number} 两点间的距离
     */
    calculateDistance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }
    
    /**
     * 更新Canvas变换
     */
    updateCanvasTransform() {
        this.canvas.style.transform = `translate(calc(-50% + ${this.touchInfo.translateX}px), calc(-50% + ${this.touchInfo.translateY}px)) scale(${this.touchInfo.scale})`;
        
        // 更新缩放显示
        const zoomValue = document.getElementById('zoom-value');
        zoomValue.textContent = `${this.touchInfo.scale.toFixed(2)}x (手动)`;
    }
    
    /**
     * 重置Canvas变换
     */
    resetCanvasTransform() {
        // 重置变换状态
        this.touchInfo.translateX = 0;
        this.touchInfo.translateY = 0;
        this.touchInfo.scale = 1;
        
        // 应用重置
        this.canvas.style.transform = 'translate(-50%, -50%) scale(1)';
        
        // 更新缩放显示
        const zoomValue = document.getElementById('zoom-value');
        const displayMode = document.getElementById('display-mode').value;
        let modeName = "自适应";
        
        switch (displayMode) {
            case 'original':
                modeName = "原始尺寸";
                break;
            case 'fit-width':
                modeName = "适应宽度";
                break;
            case 'fit-height':
                modeName = "适应高度";
                break;
        }
        
        zoomValue.textContent = `${this.canvasManager.currentScaleFactor.toFixed(2)}x (${modeName})`;
    }
    
    /**
     * 显示触摸提示
     * @param {number} duration - 提示显示时间（毫秒），默认为5000ms
     */
    showTouchHint(duration = 5000) {
        const hintElement = document.querySelector('.canvas-touch-hint');
        if (hintElement) {
            hintElement.classList.add('active');
            
            // 指定时间后自动隐藏提示
            setTimeout(() => {
                hintElement.classList.remove('active');
            }, duration);
        }
    }
    
    /**
     * 设置方向变化事件处理
     */
    setupOrientationChangeHandler() {
        window.addEventListener('orientationchange', () => {
            // 延迟执行，等待浏览器完成方向变化
            setTimeout(() => {
                // 重置所有变换参数
                this.resetCanvasTransform();
                
                // 显示短暂提示
                this.showTouchHint(1500);
            }, 300);
        });
    }
    
    /**
     * 设置窗口尺寸变化事件处理
     */
    setupResizeHandler() {
        window.addEventListener('resize', () => {
            // 当窗口大小变化较大时才重置
            const currentWidth = window.innerWidth;
            const currentHeight = window.innerHeight;
            
            if (!this.lastWindowWidth || !this.lastWindowHeight) {
                this.lastWindowWidth = currentWidth;
                this.lastWindowHeight = currentHeight;
                return;
            }
            
            const widthChange = Math.abs(currentWidth - this.lastWindowWidth) / this.lastWindowWidth;
            const heightChange = Math.abs(currentHeight - this.lastWindowHeight) / this.lastWindowHeight;
            
            // 如果尺寸变化超过10%，重置变换
            if (widthChange > 0.1 || heightChange > 0.1) {
                this.resetCanvasTransform();
                this.lastWindowWidth = currentWidth;
                this.lastWindowHeight = currentHeight;
            }
        });
    }
} 