/**
 * 画布管理模块
 * 处理画布尺寸、缩放和分辨率相关功能
 */
import { getDevicePixelRatio } from './utils.js';

export class CanvasManager {
    /**
     * 构造函数
     * @param {HTMLCanvasElement} canvas - Canvas元素
     */
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // 画布尺寸
        this.width = 500;  // 默认宽度
        this.height = 500; // 默认高度
        this.currentScaleFactor = 1; // 当前缩放系数
        
        // 初始化触摸状态
        this.resetTouchState();
    }
    
    /**
     * 初始化画布尺寸和显示
     * @param {number} width - 画布宽度
     * @param {number} height - 画布高度
     */
    initializeCanvas(width, height) {
        try {
            this.width = width || parseInt(document.getElementById('width')?.value || '500');
            this.height = height || parseInt(document.getElementById('height')?.value || '500');
            
            // 获取显示模式
            const displayModeElement = document.getElementById('display-mode');
            let displayMode = 'auto'; // 默认值
            
            if (displayModeElement && displayModeElement.value) {
                displayMode = displayModeElement.value;
            }
            
            console.log('当前显示模式:', displayMode); // 调试信息
            
            // 获取容器元素
            const container = document.querySelector('.canvas-container');
            if (!container) {
                console.error('找不到canvas容器元素');
                return;
            }
            
            // 获取容器的可用宽度和高度（减去内边距）
            const containerWidth = container.clientWidth - 40; // 留出边距
            const containerHeight = container.clientHeight - 40; // 留出边距
            
            // 判断容器是否足够大显示原始尺寸
            const canFitOriginalSize = (this.width <= containerWidth && this.height <= containerHeight);
            
            // 如果容器足够大且不是强制适应模式，则使用原始尺寸
            if (canFitOriginalSize && displayMode !== 'fit-width' && displayMode !== 'fit-height') {
                this.setCanvasSize(this.width, this.height, 1, "原始尺寸");
                return;
            }
            
            // 计算宽高比
            const canvasRatio = this.width / this.height;
            const containerRatio = containerWidth / containerHeight;
            
            // 根据显示模式决定如何缩放
            switch (displayMode) {
                case 'original':
                    // 原始尺寸 (1:1) - 即使容器不够大也强制使用原始尺寸
                    this.setCanvasSize(this.width, this.height, 1, "原始尺寸");
                    break;
                    
                case 'fit-width':
                    // 适应宽度
                    const widthScale = containerWidth / this.width;
                    this.setCanvasSize(containerWidth, containerWidth / canvasRatio, widthScale, "适应宽度");
                    break;
                    
                case 'fit-height':
                    // 适应高度
                    const heightScale = containerHeight / this.height;
                    this.setCanvasSize(containerHeight * canvasRatio, containerHeight, heightScale, "适应高度");
                    break;
                    
                case 'auto':
                default:
                    // 自动适应容器
                    if (canvasRatio > containerRatio) {
                        // Canvas比容器更宽，以宽度为基准缩放
                        const autoWidthScale = containerWidth / this.width;
                        this.setCanvasSize(containerWidth, containerWidth / canvasRatio, autoWidthScale, "自适应");
                    } else {
                        // Canvas比容器更高或相等，以高度为基准缩放
                        const autoHeightScale = containerHeight / this.height;
                        this.setCanvasSize(containerHeight * canvasRatio, containerHeight, autoHeightScale, "自适应");
                    }
                    break;
            }
        } catch (e) {
            console.error('初始化画布失败:', e);
            
            // 使用默认值初始化
            try {
                this.setCanvasSize(500, 500, 1, "默认尺寸");
            } catch (err) {
                console.error('使用默认设置初始化画布失败:', err);
            }
        }
    }
    
    /**
     * 设置Canvas尺寸并应用高质量渲染
     * @param {number} displayWidth - 显示宽度
     * @param {number} displayHeight - 显示高度
     * @param {number} scaleFactor - 缩放系数
     * @param {string} modeName - 显示模式名称
     */
    setCanvasSize(displayWidth, displayHeight, scaleFactor, modeName) {
        try {
            // 设置Canvas的实际尺寸（画布的实际分辨率）
            // 检查是否需要使用高DPI渲染以避免模糊
            const useHighDPI = document.getElementById('high-quality')?.checked || false;
            
            // 获取设备像素比
            const devicePixelRatio = getDevicePixelRatio();
            
            if (useHighDPI && scaleFactor < 1) {
                // 高质量模式：保持Canvas分辨率不变，只缩小显示尺寸
                // 此时Canvas的绘图分辨率为原始尺寸
                this.canvas.width = this.width;
                this.canvas.height = this.height;
                
                // 设置分辨率相关属性
                this.ctx.imageSmoothingEnabled = true;
                this.ctx.imageSmoothingQuality = 'high';
                
                // 应用0.5像素偏移以防止模糊
                this.ctx.translate(0.5, 0.5);
                
                console.log(`高质量模式: 使用原始尺寸 ${this.width}x${this.height}`);
            } else {
                // 标准模式：计算考虑设备像素比的尺寸
                const canvasWidth = Math.round(displayWidth * devicePixelRatio);
                const canvasHeight = Math.round(displayHeight * devicePixelRatio);
                
                this.canvas.width = canvasWidth;
                this.canvas.height = canvasHeight;
                
                // 缩放上下文以匹配设备像素比
                this.ctx.scale(devicePixelRatio, devicePixelRatio);
                
                // 应用0.5像素偏移以防止模糊
                this.ctx.translate(0.5, 0.5);
                
                console.log(`标准模式: 使用缩放尺寸 ${canvasWidth}x${canvasHeight} (DPR: ${devicePixelRatio})`);
            }
            
            // 更新缩放信息显示
            const scaleInfo = document.getElementById('zoom-value');
            if (scaleInfo) {
                scaleInfo.textContent = `${scaleFactor.toFixed(2)}x (${modeName})`;
            }
            
            // 设置canvas的显示尺寸
            this.canvas.style.width = `${displayWidth}px`;
            this.canvas.style.height = `${displayHeight}px`;
            
            // 重置transform，避免之前的变换影响
            this.canvas.style.transform = 'translate(-50%, -50%)';
            
            // 保存当前缩放比例，供触摸交互使用
            this.currentScaleFactor = scaleFactor;
            
            // 设置渲染品质相关CSS
            this.canvas.style.imageRendering = '-webkit-optimize-contrast';
        } catch (e) {
            console.error('设置画布尺寸失败:', e);
        }
    }
    
    /**
     * 清除画布
     */
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    /**
     * 重置触摸状态
     */
    resetTouchState() {
        this.touchInfo = {
            lastPinchDistance: 0,
            scale: 1,
            startX: 0,
            startY: 0,
            translateX: 0,
            translateY: 0,
            lastX: 0,
            lastY: 0,
            isPanning: false,
            isDragging: false
        };
    }
    
    /**
     * 设置画布背景
     * @param {string} color - 背景颜色
     * @param {number} opacity - 透明度 (0-100)
     */
    setBackground(color, opacity) {
        // 先清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (opacity <= 0) return; // 如果透明度为0，直接返回，不绘制背景
        
        // 使用RGB颜色和透明度设置
        const opacityValue = opacity / 100;
        
        // 保存当前绘图上下文状态
        this.ctx.save();
        this.ctx.globalAlpha = opacityValue;
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();
    }
    
    /**
     * 绘制网格
     */
    drawGrid() {
        // 网格间距（像素）
        const gridSize = 20;
        
        // 保存当前绘图状态
        this.ctx.save();
        
        // 设置网格样式
        this.ctx.strokeStyle = '#cccccc';
        this.ctx.lineWidth = 0.5;
        this.ctx.globalAlpha = 0.5;
        
        // 绘制垂直线
        for (let x = 0; x <= this.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }
        
        // 绘制水平线
        for (let y = 0; y <= this.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }
        
        // 恢复绘图状态
        this.ctx.restore();
    }
    
    /**
     * 获取当前Canvas的尺寸
     * @returns {Object} 包含width和height的对象
     */
    getSize() {
        return {
            width: this.width,
            height: this.height
        };
    }
    
    /**
     * 获取绘图上下文
     * @returns {CanvasRenderingContext2D} 绘图上下文
     */
    getContext() {
        return this.ctx;
    }
    
    /**
     * 获取Canvas元素
     * @returns {HTMLCanvasElement} Canvas元素
     */
    getCanvas() {
        return this.canvas;
    }
} 