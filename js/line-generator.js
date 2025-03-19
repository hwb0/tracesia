/**
 * 线条生成器模块
 * 用于生成和绘制随机线条
 */
import { randomInt, randomFloat } from './utils.js';

export class LineGenerator {
    /**
     * 构造函数
     * @param {CanvasManager} canvasManager - 画布管理器实例
     */
    constructor(canvasManager) {
        this.canvasManager = canvasManager;
        this.ctx = canvasManager.getContext();
        this.canvas = canvasManager.getCanvas();
        this.lines = []; // 存储所有生成的线条
        
        // 默认参数
        this.params = {
            lineMode: 'mixed',
            colorMode: 'black',
            minWidth: 1,
            maxWidth: 5,
            curveStrength: 50,
            lineCap: 'mixed'
        };
    }

    /**
     * 设置线条生成参数
     * @param {Object} params - 线条参数对象
     */
    setParams(params) {
        // 更新参数，只更新提供的属性
        this.params = {
            ...this.params,
            ...params
        };
    }

    /**
     * 生成单条线迹
     * @returns {Object} 生成的线条对象
     */
    generateLine() {
        try {
            const canvasSize = this.canvasManager.getSize();
            const width = canvasSize.width;
            const height = canvasSize.height;
            
            // 使用参数
            const lineMode = this.params.lineMode;
            const colorMode = this.params.colorMode;
            const minWidth = this.params.minWidth;
            const maxWidth = this.params.maxWidth;
            const curveStrength = this.params.curveStrength;
            const lineCap = this.params.lineCap;
            
            // 记录当前使用的参数
            console.log('使用线迹模式:', lineMode, '生成线条'); 
            
            // 线宽
            const lineWidth = randomFloat(minWidth, maxWidth);
            
            // 坐标点
            let startPoint = { x: 0, y: 0 };
            let endPoint = { x: 0, y: 0 };
            
            // 根据线迹模式确定起点和终点
            if (lineMode === 'through' || (lineMode === 'mixed' && Math.random() > 0.5)) {
                // 贯穿模式逻辑
                const isHorizontal = Math.random() > 0.5;
                const orientation = isHorizontal ? '水平' : '垂直';
                console.log(`执行贯穿模式，方向: ${orientation}`);
                
                if (isHorizontal) {
                    // 水平贯穿 (左边到右边)
                    startPoint = { x: 0, y: randomInt(0, height) };
                    endPoint = { x: width, y: randomInt(0, height) };
                } else {
                    // 垂直贯穿 (上边到下边)
                    startPoint = { x: randomInt(0, width), y: 0 };
                    endPoint = { x: randomInt(0, width), y: height };
                }
                console.log('贯穿模式点坐标:', startPoint, endPoint);
            } else { // lineMode === 'random'
                // 随机模式：可以在整个画布内生成完全随机的点（与原代码保持一致）
                console.log('执行随机模式');
                
                // 完全随机点（整个画布范围内）
                startPoint = { x: randomInt(0, width), y: randomInt(0, height) };
                endPoint = { x: randomInt(0, width), y: randomInt(0, height) };
                console.log('随机模式点坐标:', startPoint, endPoint);
            }
            
            // 计算贝塞尔曲线控制点
            const dx = endPoint.x - startPoint.x;
            const dy = endPoint.y - startPoint.y;
            const centerX = startPoint.x + dx / 2;
            const centerY = startPoint.y + dy / 2;
            
            // 曲线强度：控制点距离线段中心的最大距离
            const maxOffsetPercent = curveStrength / 100;  // 转为0-1范围
            const maxOffset = Math.max(width, height) * maxOffsetPercent;
            
            // 随机生成控制点的偏移量
            const offsetX1 = randomFloat(-maxOffset, maxOffset);
            const offsetY1 = randomFloat(-maxOffset, maxOffset);
            const offsetX2 = randomFloat(-maxOffset, maxOffset);
            const offsetY2 = randomFloat(-maxOffset, maxOffset);
            
            // 设置贝塞尔曲线控制点
            const controlPoint1 = {
                x: centerX + offsetX1,
                y: centerY + offsetY1
            };
            
            const controlPoint2 = {
                x: centerX + offsetX2,
                y: centerY + offsetY2
            };
            
            // 颜色设置
            let strokeColor;
            switch (colorMode) {
                case 'black':
                    strokeColor = '#000000';
                    break;
                case 'theme':
                    // 主题配色 - 使用三种配色系列之一（与原代码保持一致）
                    const themes = [
                        // 蓝色系
                        { hue: 200 + randomInt(0, 40), saturation: 70 + randomInt(0, 20), lightness: 45 + randomInt(0, 15) },
                        // 绿色系
                        { hue: 100 + randomInt(0, 40), saturation: 70 + randomInt(0, 20), lightness: 40 + randomInt(0, 15) },
                        // 紫红色系
                        { hue: 280 + randomInt(0, 40), saturation: 70 + randomInt(0, 20), lightness: 45 + randomInt(0, 15) }
                    ];
                    const theme = themes[randomInt(0, themes.length - 1)];
                    strokeColor = `hsl(${theme.hue}, ${theme.saturation}%, ${theme.lightness}%)`;
                    break;
                case 'random':
                    // 完全随机颜色
                    const randomHue = randomInt(0, 360);
                    const randomSat = randomInt(70, 100);
                    const randomLight = randomInt(30, 70);
                    strokeColor = `hsl(${randomHue}, ${randomSat}%, ${randomLight}%)`;
                    break;
                default:
                    strokeColor = '#000000';
            }
            
            // 确定线帽样式
            let strokeLineCap;
            switch (lineCap) {
                case 'butt':
                    strokeLineCap = 'butt';
                    break;
                case 'round':
                    strokeLineCap = 'round';
                    break;
                case 'mixed':
                    // 随机选择
                    strokeLineCap = Math.random() > 0.5 ? 'butt' : 'round';
                    break;
                default:
                    strokeLineCap = 'butt';
            }
            
            // 创建线条对象
            return {
                startPoint,
                endPoint,
                controlPoint1,
                controlPoint2,
                width: lineWidth,
                color: strokeColor,
                lineCap: strokeLineCap
            };
        } catch (e) {
            console.error('生成线条失败:', e);
            
            // 返回一个默认的线条对象，避免程序崩溃
            const defaultWidth = 500;
            const defaultHeight = 500;
            
            return {
                startPoint: { x: 0, y: randomInt(0, defaultHeight) },
                endPoint: { x: defaultWidth, y: randomInt(0, defaultHeight) },
                controlPoint1: { x: defaultWidth * 0.3, y: defaultHeight * 0.5 },
                controlPoint2: { x: defaultWidth * 0.7, y: defaultHeight * 0.5 },
                width: 2,
                color: '#000000',
                lineCap: 'butt'
            };
        }
    }
    
    /**
     * 在画布上绘制一条线
     * @param {Object} line - 线条对象 
     */
    drawLine(line) {
        this.ctx.save();
        
        // 设置线条样式
        this.ctx.lineWidth = line.width;
        this.ctx.strokeStyle = line.color;
        this.ctx.lineCap = line.lineCap;
        
        // 开始绘制
        this.ctx.beginPath();
        this.ctx.moveTo(line.startPoint.x, line.startPoint.y);
        
        // 使用贝塞尔曲线
        this.ctx.bezierCurveTo(
            line.controlPoint1.x, line.controlPoint1.y,
            line.controlPoint2.x, line.controlPoint2.y,
            line.endPoint.x, line.endPoint.y
        );
        
        this.ctx.stroke();
        this.ctx.restore();
    }
    
    /**
     * 在画布上绘制一条线（用于导出高分辨率）
     * @param {Object} line - 线条对象
     * @param {CanvasRenderingContext2D} ctx - 绘图上下文
     * @param {number} resolution - 分辨率倍数
     */
    drawLineOnCanvas(line, ctx, resolution = 1) {
        ctx.save();
        
        // 设置线条样式，适应分辨率
        ctx.lineWidth = line.width * resolution;
        ctx.strokeStyle = line.color;
        ctx.lineCap = line.lineCap;
        
        // 开始绘制
        ctx.beginPath();
        ctx.moveTo(line.startPoint.x * resolution, line.startPoint.y * resolution);
        
        // 使用贝塞尔曲线，适应分辨率
        ctx.bezierCurveTo(
            line.controlPoint1.x * resolution, line.controlPoint1.y * resolution,
            line.controlPoint2.x * resolution, line.controlPoint2.y * resolution,
            line.endPoint.x * resolution, line.endPoint.y * resolution
        );
        
        ctx.stroke();
        ctx.restore();
    }
    
    /**
     * 生成特定数量的线条
     * @param {number} count - 要生成的线条数量
     * @returns {Array} 生成的线条数组
     */
    generateLines(count) {
        // 清空原有线条
        this.lines = [];
        
        // 确保画布有__lines属性存储线条数据(兼容原始代码)
        this.canvas.__lines = [];
        
        // 生成新线条
        for (let i = 0; i < count; i++) {
            const line = this.generateLine();
            this.lines.push(line);
            
            // 同时存储到canvas对象中(兼容原始代码)
            this.canvas.__lines.push({
                start: line.startPoint,
                end: line.endPoint, 
                controlPoints: [line.controlPoint1, line.controlPoint2],
                width: line.width,
                color: line.color,
                cap: line.lineCap
            });
        }
        
        return this.lines;
    }
    
    /**
     * 在边缘上获取随机点
     * @param {string|number} edge - 边缘类型：'top'/'right'/'bottom'/'left' 或 0/1/2/3
     * @param {number} width - 画布宽度
     * @param {number} height - 画布高度
     * @returns {Object} 包含x和y坐标的点对象
     */
    getRandomPointOnEdge(edge, width, height) {
        // 处理数字边缘索引（兼容原始代码）
        if (typeof edge === 'number') {
            switch (edge) {
                case 0: return { x: randomInt(0, width), y: 0 }; // 上边缘
                case 1: return { x: width, y: randomInt(0, height) }; // 右边缘
                case 2: return { x: randomInt(0, width), y: height }; // 下边缘
                case 3: return { x: 0, y: randomInt(0, height) }; // 左边缘
                default: return { x: 0, y: 0 };
            }
        }
        
        // 处理字符串边缘标识符
        switch (edge) {
            case 'top':
                return { x: randomInt(0, width), y: 0 };
            case 'right':
                return { x: width, y: randomInt(0, height) };
            case 'bottom':
                return { x: randomInt(0, width), y: height };
            case 'left':
                return { x: 0, y: randomInt(0, height) };
            default:
                return { x: 0, y: 0 };
        }
    }
    
    /**
     * 获取当前生成的所有线条
     * @returns {Array} 线条数组
     */
    getLines() {
        return this.lines;
    }
    
    /**
     * 清除所有线条
     */
    clearLines() {
        this.lines = [];
        
        // 兼容原始代码
        if (this.canvas) {
            this.canvas.__lines = [];
        }
    }
    
    /**
     * 绘制所有线条到画布
     */
    drawAllLines() {
        for (const line of this.lines) {
            this.drawLine(line);
        }
    }
} 