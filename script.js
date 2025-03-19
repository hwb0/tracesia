class LineGenerator {
    constructor() {
        this.canvas = document.getElementById('main-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // 初始化基本属性
        this.width = 500;  // 默认宽度
        this.height = 500; // 默认高度
        this.currentScaleFactor = 1; // 默认缩放比例
        this.resizeTimeout = null;   // 用于resize节流
        
        // 设置事件监听
        this.setupEventListeners();
        
        // 初始化画布
        this.initializeCanvas();
        
        // 初始化移动设备触摸事件支持
        if (this.isMobileDevice()) {
            this.setupMobileTouchSupport();
        }
    }

    initializeCanvas() {
        this.width = parseInt(document.getElementById('width').value);
        this.height = parseInt(document.getElementById('height').value);
        
        // 获取显示模式
        const displayMode = document.getElementById('display-mode').value;
        
        // 获取容器元素
        const container = document.querySelector('.canvas-container');
        
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
    }
    
    // 辅助方法：设置Canvas尺寸并应用高质量渲染
    setCanvasSize(displayWidth, displayHeight, scaleFactor, modeName) {
        // 设置Canvas的实际尺寸（画布的实际分辨率）
        // 检查是否需要使用高DPI渲染以避免模糊
        const useHighDPI = document.getElementById('high-quality').checked;
        
        // 获取设备像素比
        const devicePixelRatio = window.devicePixelRatio || 1;
        
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
        
        // 在更改尺寸后重绘Canvas
        this.draw();
    }

    setupEventListeners() {
        // 事件委托
        document.addEventListener('click', (e) => {
            const target = e.target;

        // 快捷尺寸按钮
            if (target.closest('.size-btn')) {
                const sizeBtn = target.closest('.size-btn');
                const size = sizeBtn.getAttribute('data-size');
                document.getElementById('width').value = size;
                document.getElementById('height').value = size;
                this.initializeCanvas();
            }
            
            // 重绘按钮
            if (target.closest('#regenerate-btn')) {
                this.generateLine();
                this.draw();
            }
            
            // 导出按钮
            if (target.closest('#export-btn')) {
                this.exportImage();
            }
            
            // 模态框关闭按钮
            if (target.closest('#modal-close-btn')) {
                document.getElementById('export-modal').classList.remove('active');
            }
        });
        
        // 宽度和高度输入框
        document.getElementById('width').addEventListener('change', () => this.initializeCanvas());
        document.getElementById('height').addEventListener('change', () => this.initializeCanvas());
        
        // 显示模式和高质量选择
        document.getElementById('display-mode').addEventListener('change', () => this.initializeCanvas());
        document.getElementById('high-quality').addEventListener('change', () => this.initializeCanvas());
        
        // 快捷尺寸选择器
        document.getElementById('quick-size-selector').addEventListener('change', (e) => {
            const value = e.target.value;
            if (value !== 'custom') {
                const [width, height] = value.split('x');
                document.getElementById('width').value = width;
                document.getElementById('height').value = height;
                this.initializeCanvas();
            }
        });
        
        // 快捷曲线选择器
        document.getElementById('quick-curve-selector').addEventListener('change', (e) => {
            const value = e.target.value;
            if (value !== 'custom') {
                document.getElementById('curve-strength').value = value;
                document.getElementById('curve-strength-value').textContent = `${value}%`;
                this.draw();
            }
        });

        // 线条数量滑块
        document.getElementById('line-count').addEventListener('input', (e) => {
            document.getElementById('line-count-value').textContent = e.target.value;
            this.draw();
        });

        // 曲线强度滑块
        document.getElementById('curve-strength').addEventListener('input', (e) => {
            document.getElementById('curve-strength-value').textContent = `${e.target.value}%`;
            this.draw();
        });

        // 背景透明度滑块
        document.getElementById('bg-opacity').addEventListener('input', (e) => {
            document.getElementById('bg-opacity-value').textContent = `${e.target.value}%`;
            this.draw();
        });
        
        // 线条模式单选框
        document.querySelectorAll('input[name="line-mode"]').forEach(radio => {
            radio.addEventListener('change', () => this.draw());
        });

        // 端点样式单选框
        document.querySelectorAll('input[name="line-cap"]').forEach(radio => {
            radio.addEventListener('change', () => this.draw());
        });
        
        // 颜色模式单选框
        document.querySelectorAll('input[name="color-mode"]').forEach(radio => {
            radio.addEventListener('change', () => {
                // 更新提示文本
                const colorTip = document.getElementById('color-tip');
                if (colorTip) {
                    switch(radio.value) {
                        case 'theme':
                            colorTip.textContent = '使用三种主题色系随机生成线条';
                            break;
                        case 'black':
                            colorTip.textContent = '使用统一的黑色线条';
                            break;
                        case 'random':
                        default:
                            colorTip.textContent = '使用完全随机的彩色生成线条';
                            break;
                    }
                }
                // 重绘
            this.draw();
            });
        });
        
        // 线条宽度输入框
        document.getElementById('min-width').addEventListener('change', () => this.draw());
        document.getElementById('max-width').addEventListener('change', () => this.draw());
        
        // 背景颜色输入框
        document.getElementById('bg-color').addEventListener('change', () => this.draw());
        document.getElementById('reset-bg-color').addEventListener('click', () => {
            document.getElementById('bg-color').value = '#ffffff';
            document.getElementById('bg-opacity').value = 100;
            document.getElementById('bg-opacity-value').textContent = '100%';
            this.draw();
        });

        // 显示网格复选框
        document.getElementById('show-grid').addEventListener('change', () => this.draw());

        // 增减按钮的事件处理
        document.querySelectorAll('.stepper-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.getAttribute('data-action');
                const target = btn.getAttribute('data-target');
                const input = document.getElementById(target);
                const step = parseFloat(input.step || 1);
                const min = parseFloat(input.min);
                const max = parseFloat(input.max);
                let value = parseFloat(input.value);
                
                if (action === 'increase') {
                    value = Math.min(max, value + step);
                } else {
                    value = Math.max(min, value - step);
                }
                
                input.value = value;
                
                // 更新显示值
                if (target === 'line-count') {
                    document.getElementById('line-count-value').textContent = value;
                } else if (target === 'curve-strength') {
                    document.getElementById('curve-strength-value').textContent = `${value}%`;
                    document.getElementById('quick-curve-selector').value = 'custom';
                }
                
                // 触发更新
                const event = new Event('input');
                input.dispatchEvent(event);
                
                // 特殊处理：如果是宽度或高度，需要重新初始化画布
                if (target === 'width' || target === 'height') {
                    this.initializeCanvas();
                } else {
                    this.draw();
                }
            });
        });
        
        // 导出选项更改
        document.getElementById('export-resolution').addEventListener('change', () => {
            this.updateStatusbar();
        });
        
        // 监听窗口尺寸改变事件
        window.addEventListener('resize', () => {
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(() => {
                this.initializeCanvas();
            }, 250);
        });
        
        // 监听设备方向改变事件
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.initializeCanvas();
            }, 300);
        });
    }

    generateLine() {
        const lineMode = document.querySelector('input[name="line-mode"]:checked').value;
        const curveStrength = parseInt(document.getElementById('curve-strength').value) / 100;
        const minWidth = parseFloat(document.getElementById('min-width').value);
        const maxWidth = parseFloat(document.getElementById('max-width').value);
        const width = minWidth + Math.random() * (maxWidth - minWidth);
        
        // 获取端点样式
        const capMode = document.querySelector('input[name="line-cap"]:checked').value;
        let lineCap;
        
        // 处理混合模式或单一模式
        if (capMode === 'mixed') {
            // 在所有模式中随机选择（包括混合）
            const capOptions = ['butt', 'round'];
            lineCap = capOptions[Math.floor(Math.random() * capOptions.length)];
        } else {
            lineCap = capMode;
        }

        let startX, startY, endX, endY;
        
        // 线条模式逻辑
        if (lineMode === 'mixed') {
            // 混合模式：可以随机选择所有模式，包括贯穿和随机
            const modes = ['through', 'random'];
            const selectedMode = modes[Math.floor(Math.random() * modes.length)];
            
            if (selectedMode === 'through') {
                // 贯穿模式逻辑
                const isHorizontal = Math.random() > 0.5;
                
                if (isHorizontal) {
                    startX = 0;
                    startY = Math.random() * this.height;
                    endX = this.width;
                    endY = Math.random() * this.height;
                } else {
                    startX = Math.random() * this.width;
                    startY = 0;
                    endX = Math.random() * this.width;
                    endY = this.height;
                }
            } else {
                // 随机模式逻辑
                startX = Math.random() * this.width;
                startY = Math.random() * this.height;
                endX = Math.random() * this.width;
                endY = Math.random() * this.height;
            }
        } else if (lineMode === 'through') {
            // 贯穿模式逻辑
            const isHorizontal = Math.random() > 0.5;
            
            if (isHorizontal) {
                startX = 0;
                startY = Math.random() * this.height;
                endX = this.width;
                endY = Math.random() * this.height;
            } else {
                startX = Math.random() * this.width;
                startY = 0;
                endX = Math.random() * this.width;
                endY = this.height;
            }
        } else if (lineMode === 'random') {
            // 随机模式逻辑
            startX = Math.random() * this.width;
            startY = Math.random() * this.height;
            endX = Math.random() * this.width;
            endY = Math.random() * this.height;
        }

        // 生成控制点
        const controlPoint1 = {
            x: startX + (endX - startX) * 0.25 + (Math.random() - 0.5) * this.width * curveStrength,
            y: startY + (endY - startY) * 0.25 + (Math.random() - 0.5) * this.height * curveStrength
        };

        const controlPoint2 = {
            x: startX + (endX - startX) * 0.75 + (Math.random() - 0.5) * this.width * curveStrength,
            y: startY + (endY - startY) * 0.75 + (Math.random() - 0.5) * this.height * curveStrength
        };

        // 获取当前选择的颜色模式并生成颜色
        let colorMode = '';
        document.querySelectorAll('input[name="color-mode"]').forEach(radio => {
            if (radio.checked) {
                colorMode = radio.value;
            }
        });
        
        let color;
        switch(colorMode) {
            case 'theme':
                // 主题配色 - 三种预设颜色之一
                const themes = [
                    // 蓝色系
                    { hue: 200 + Math.floor(Math.random() * 40), saturation: 70 + Math.floor(Math.random() * 20), lightness: 45 + Math.floor(Math.random() * 15) },
                    // 绿色系
                    { hue: 100 + Math.floor(Math.random() * 40), saturation: 70 + Math.floor(Math.random() * 20), lightness: 40 + Math.floor(Math.random() * 15) },
                    // 紫红色系
                    { hue: 280 + Math.floor(Math.random() * 40), saturation: 70 + Math.floor(Math.random() * 20), lightness: 45 + Math.floor(Math.random() * 15) }
                ];
                const theme = themes[Math.floor(Math.random() * themes.length)];
                color = `hsl(${theme.hue}, ${theme.saturation}%, ${theme.lightness}%)`;
                break;
                
            case 'black':
                // 纯黑色
                color = '#000000';
                break;
                
            case 'random':
            default:
                // 完全随机（默认行为）
                const hue = Math.floor(Math.random() * 360);
                const saturation = 80 + Math.floor(Math.random() * 20);
                const lightness = 40 + Math.floor(Math.random() * 30);
                color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
                break;
        }

        return {
            start: { x: startX, y: startY },
            end: { x: endX, y: endY },
            control1: controlPoint1,
            control2: controlPoint2,
            width: width,
            cap: lineCap,
            color: color
        };
    }

    draw() {
        // 清除画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 获取背景颜色和透明度
        const bgColor = document.getElementById('bg-color').value;
        const opacity = document.getElementById('bg-opacity').value / 100;
        
        // 设置背景
        if (opacity > 0) {
            // 解析背景颜色
            const r = parseInt(bgColor.slice(1, 3), 16);
            const g = parseInt(bgColor.slice(3, 5), 16);
            const b = parseInt(bgColor.slice(5, 7), 16);
            
            // 应用透明度
            this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        // 如果启用网格，绘制网格
        if (document.getElementById('show-grid').checked) {
            this.drawGrid();
        }

        // 获取当前活动的线条模式
        let lineMode = '';
        document.querySelectorAll('input[name="line-mode"]').forEach(radio => {
            if (radio.checked) {
                lineMode = radio.value;
            }
        });
        
        // 获取当前活动的端点样式
        let lineCap = '';
        document.querySelectorAll('input[name="line-cap"]').forEach(radio => {
            if (radio.checked) {
                lineCap = radio.value;
            }
        });
        
        // 获取线条数量
        const lineCount = parseInt(document.getElementById('line-count').value);
        
        // 获取曲线强度
        const curveStrength = parseFloat(document.getElementById('curve-strength').value) / 100;
        
        // 获取线条宽度范围
        const minWidth = parseFloat(document.getElementById('min-width').value);
        const maxWidth = parseFloat(document.getElementById('max-width').value);
        
        // 生成线条
        const lines = [];
        
        for (let i = 0; i < lineCount; i++) {
            // 基于模式随机位置
            let startX, startY, endX, endY;
            
            if (lineMode === 'through' || (lineMode === 'mixed' && Math.random() < 0.5)) {
                // 贯穿模式：从边缘到边缘
                const edge1 = Math.floor(Math.random() * 4); // 0: 上, 1: 右, 2: 下, 3: 左
                const edge2 = (edge1 + 2) % 4; // 对面的边
                
                [startX, startY] = this.getRandomPointOnEdge(edge1);
                [endX, endY] = this.getRandomPointOnEdge(edge2);
            } else {
                // 随机模式：任意两点
                startX = Math.random() * this.canvas.width;
                startY = Math.random() * this.canvas.height;
                endX = Math.random() * this.canvas.width;
                endY = Math.random() * this.canvas.height;
            }
            
            // 随机线条颜色
            let color;
            // 获取当前选择的颜色模式
            let colorMode = '';
            document.querySelectorAll('input[name="color-mode"]').forEach(radio => {
                if (radio.checked) {
                    colorMode = radio.value;
                }
            });
            
            switch(colorMode) {
                case 'theme':
                    // 主题配色 - 三种预设颜色之一
                    const themes = [
                        // 蓝色系
                        { hue: 200 + Math.floor(Math.random() * 40), saturation: 70 + Math.floor(Math.random() * 20), lightness: 45 + Math.floor(Math.random() * 15) },
                        // 绿色系
                        { hue: 100 + Math.floor(Math.random() * 40), saturation: 70 + Math.floor(Math.random() * 20), lightness: 40 + Math.floor(Math.random() * 15) },
                        // 紫红色系
                        { hue: 280 + Math.floor(Math.random() * 40), saturation: 70 + Math.floor(Math.random() * 20), lightness: 45 + Math.floor(Math.random() * 15) }
                    ];
                    const theme = themes[Math.floor(Math.random() * themes.length)];
                    color = `hsl(${theme.hue}, ${theme.saturation}%, ${theme.lightness}%)`;
                    break;
                    
                case 'black':
                    // 纯黑色
                    color = '#000000';
                    break;
                    
                case 'random':
                default:
                    // 完全随机（默认行为）
                    const hue = Math.floor(Math.random() * 360);
                    const saturation = 80 + Math.floor(Math.random() * 20);
                    const lightness = 40 + Math.floor(Math.random() * 30);
                    color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
                    break;
            }
            
            // 随机线条宽度
            const width = minWidth + Math.random() * (maxWidth - minWidth);
            
            // 随机端点样式
            let cap = lineCap;
            if (cap === 'mixed') {
                cap = Math.random() < 0.5 ? 'butt' : 'round';
            }
            
            // 创建控制点（用于贝塞尔曲线）
            let controlPoints = [];
            if (curveStrength > 0) {
                const dx = endX - startX;
                const dy = endY - startY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // 控制点数量与距离和曲线强度相关
                const numPoints = Math.max(1, Math.floor(distance / 200) + 1);
                
                for (let j = 0; j < numPoints; j++) {
                    const t = (j + 1) / (numPoints + 1);
                    const pointX = startX + dx * t;
                    const pointY = startY + dy * t;
                    
                    // 垂直于线段方向的偏移
                    const perpX = -dy;
                    const perpY = dx;
                    
                    // 归一化
                    const perpLength = Math.sqrt(perpX * perpX + perpY * perpY);
                    const perpNormX = perpX / perpLength;
                    const perpNormY = perpY / perpLength;
                    
                    // 随机偏移量，受曲线强度影响
                    const maxOffset = distance * 0.3 * curveStrength;
                    const offset = (Math.random() * 2 - 1) * maxOffset;
                    
                    const ctrlX = pointX + perpNormX * offset;
                    const ctrlY = pointY + perpNormY * offset;
                    
                    controlPoints.push({ x: ctrlX, y: ctrlY });
                }
            }
            
            // 创建线条对象
            const line = {
                start: { x: startX, y: startY },
                end: { x: endX, y: endY },
                color: color,
                width: width,
                cap: cap,
                controlPoints: controlPoints
            };
            
            lines.push(line);
        }
        
        // 绘制所有线条
        lines.forEach(line => {
            this.drawLine(line);
        });
        
        // 保存线条数据到canvas实例，用于导出
        this.canvas.__lines = lines;

        // 更新状态栏
        this.updateStatusbar();
    }

    drawLine(line) {
        // 保存当前绘图状态
        this.ctx.save();
        
        // 设置线条平滑相关属性
        this.ctx.lineWidth = line.width;
        this.ctx.strokeStyle = line.color;
        
        // 使用线条对象中的端点样式
        this.ctx.lineCap = line.cap || 'round'; // 默认使用圆形端点
        this.ctx.lineJoin = 'round'; // 添加连接点样式为圆形
        
        // 启用抗锯齿
        if (typeof this.ctx.imageSmoothingEnabled !== 'undefined') {
            this.ctx.imageSmoothingEnabled = true;
            this.ctx.imageSmoothingQuality = 'high';
        }
        
        // 像素精确对齐 - 使用0.5偏移避免模糊
        const offset = 0.5;
        
        // 开始绘制路径
        this.ctx.beginPath();
        this.ctx.moveTo(Math.floor(line.start.x) + offset, Math.floor(line.start.y) + offset);
        
        // 判断线条对象的格式，适应不同类型的控制点结构
        if (line.controlPoints && line.controlPoints.length > 0) {
            // 使用controlPoints数组
            if (line.controlPoints.length === 1) {
                // 只有一个控制点，使用二次贝塞尔曲线
                const cp = line.controlPoints[0];
                this.ctx.quadraticCurveTo(
                    Math.floor(cp.x) + offset, 
                    Math.floor(cp.y) + offset,
                    Math.floor(line.end.x) + offset, 
                    Math.floor(line.end.y) + offset
                );
            } else {
                // 多个控制点，使用多段贝塞尔曲线
                let currentPoint = line.start;
                
                for (let i = 0; i < line.controlPoints.length; i++) {
                    const cp = line.controlPoints[i];
                    
                    if (i === line.controlPoints.length - 1) {
                        // 最后一个控制点连接到终点
                        this.ctx.quadraticCurveTo(
                            Math.floor(cp.x) + offset, 
                            Math.floor(cp.y) + offset,
                            Math.floor(line.end.x) + offset, 
                            Math.floor(line.end.y) + offset
                        );
                    } else {
                        // 中间控制点连接到下一个控制点的中点
                        const nextCp = line.controlPoints[i + 1];
                        const midX = (cp.x + nextCp.x) / 2;
                        const midY = (cp.y + nextCp.y) / 2;
                        
                        this.ctx.quadraticCurveTo(
                            Math.floor(cp.x) + offset, 
                            Math.floor(cp.y) + offset,
                            Math.floor(midX) + offset, 
                            Math.floor(midY) + offset
                        );
                    }
                }
            }
        } else if (line.control1 && line.control2) {
            // 使用传统的control1和control2格式
            this.ctx.bezierCurveTo(
                Math.floor(line.control1.x) + offset, 
                Math.floor(line.control1.y) + offset,
                Math.floor(line.control2.x) + offset, 
                Math.floor(line.control2.y) + offset,
                Math.floor(line.end.x) + offset, 
                Math.floor(line.end.y) + offset
            );
        } else {
            // 没有控制点，绘制直线
            this.ctx.lineTo(
                Math.floor(line.end.x) + offset, 
                Math.floor(line.end.y) + offset
            );
        }
        
        // 进行描边
        this.ctx.stroke();
        
        // 恢复之前的绘图状态
        this.ctx.restore();
    }

    drawGrid() {
        // 保存当前绘图状态
        this.ctx.save();
        
        // 设置网格样式
        this.ctx.strokeStyle = '#e0e0e0';
        this.ctx.lineWidth = 0.5;
        
        // 设置抗锯齿
        if (typeof this.ctx.imageSmoothingEnabled !== 'undefined') {
            this.ctx.imageSmoothingEnabled = true;
        }
        
        // 计算网格大小
        const gridSize = 50;
        const offset = 0.5; // 0.5像素偏移，防止模糊

        // 绘制垂直线
        for (let x = 0; x <= this.width; x += gridSize) {
            const alignedX = Math.floor(x) + offset;
            
            this.ctx.beginPath();
            this.ctx.moveTo(alignedX, 0);
            this.ctx.lineTo(alignedX, this.height);
            this.ctx.stroke();
        }

        // 绘制水平线
        for (let y = 0; y <= this.height; y += gridSize) {
            const alignedY = Math.floor(y) + offset;
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, alignedY);
            this.ctx.lineTo(this.width, alignedY);
            this.ctx.stroke();
        }
        
        // 恢复绘图状态
        this.ctx.restore();
    }

    exportImage() {
        // 获取导出格式和分辨率
        const format = document.getElementById('export-format').value;
        const resolution = parseInt(document.getElementById('export-resolution').value);
        
        // SVG格式单独处理
        if (format === 'svg') {
            this.exportSVG();
            return;
        }
        
        // 创建临时Canvas用于导出
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        // 设置临时Canvas尺寸
        tempCanvas.width = this.width * resolution;
        tempCanvas.height = this.height * resolution;

        // 获取背景颜色和透明度
        const bgColor = document.getElementById('bg-color').value;
        const opacity = document.getElementById('bg-opacity').value / 100;
        
        // 设置背景
        if (opacity > 0) {
            // 解析背景颜色
            const r = parseInt(bgColor.slice(1, 3), 16);
            const g = parseInt(bgColor.slice(3, 5), 16);
            const b = parseInt(bgColor.slice(5, 7), 16);
            
            // 填充背景
            tempCtx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        }
        
        // 如果启用网格，绘制网格
        if (document.getElementById('show-grid').checked) {
            // 导出时网格尺寸需要按分辨率缩放
            this.drawGrid(tempCtx, resolution);
        }
        
        // 获取当前画布的所有线条数据
        const lines = [];
        
        // 获取当前活动的线条模式（用于状态信息）
        let lineMode = '';
        document.querySelectorAll('input[name="line-mode"]').forEach(radio => {
            if (radio.checked) {
                lineMode = radio.value;
            }
        });
        
        // 获取线条数量
        const lineCount = parseInt(document.getElementById('line-count').value);
        
        // 获取曲线强度
        const curveStrength = parseFloat(document.getElementById('curve-strength').value) / 100;
        
        // 从主canvas重新绘制到临时canvas
        // 通过缩放确保线条在高分辨率下正确渲染
        if (this.canvas.__lines && this.canvas.__lines.length > 0) {
            for (let i = 0; i < this.canvas.__lines.length; i++) {
                const line = Object.assign({}, this.canvas.__lines[i]);
                
                // 缩放所有坐标
                line.start.x *= resolution;
                line.start.y *= resolution;
                line.end.x *= resolution;
                line.end.y *= resolution;
                line.width *= resolution;
                
                // 缩放控制点
                if (line.controlPoints && line.controlPoints.length > 0) {
                    line.controlPoints = line.controlPoints.map(pt => ({
                        x: pt.x * resolution,
                        y: pt.y * resolution
                    }));
                }
                
                // 绘制线条
                this.drawLineOnCanvas(line, tempCtx, resolution);
            }
        } else {
            // 如果没有保存的线条数据，重新生成
        for (let i = 0; i < lineCount; i++) {
            const line = this.generateLine();
            this.drawLineOnCanvas(line, tempCtx, resolution);
            }
        }
        
        // 根据格式导出
        let mimeType = 'image/png';
        let quality = 1;
        
        if (format === 'jpg') {
            mimeType = 'image/jpeg';
            quality = 0.95;
        }
        
        try {
            // 生成图片数据
            const imgData = tempCanvas.toDataURL(mimeType, quality);
            
            // 创建文件名
            const date = new Date();
            const timestamp = `${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}_${date.getHours().toString().padStart(2, '0')}${date.getMinutes().toString().padStart(2, '0')}${date.getSeconds().toString().padStart(2, '0')}`;
            const filename = `tracesia_${this.width}x${this.height}_${timestamp}.${format}`;
            
            // 使用辅助函数尝试下载或显示
                this.tryDownloadOrShow(imgData, filename);
        } catch (error) {
            this.showExportModal('导出失败：' + error.message);
        }
    }

    drawLineOnCanvas(line, ctx, resolution) {
        ctx.beginPath();
        ctx.moveTo(line.start.x, line.start.y);
        
        // 适应不同格式的线条对象
        if (line.controlPoints && line.controlPoints.length > 0) {
            // 使用控制点数组绘制贝塞尔曲线
            if (line.controlPoints.length === 1) {
                // 二次贝塞尔曲线
                const cp = line.controlPoints[0];
                ctx.quadraticCurveTo(cp.x, cp.y, line.end.x, line.end.y);
                        } else {
                // 三次或多点贝塞尔曲线
                let currentPoint = line.start;
                
                for (let i = 0; i < line.controlPoints.length; i++) {
                    const cp = line.controlPoints[i];
                    
                    if (i === line.controlPoints.length - 1) {
                        // 最后一个控制点连接到终点
                        const dx = line.end.x - cp.x;
                        const dy = line.end.y - cp.y;
                        const ratio = 0.5;
                        const cp2x = cp.x + dx * ratio;
                        const cp2y = cp.y + dy * ratio;
                        
                        ctx.bezierCurveTo(cp.x, cp.y, cp2x, cp2y, line.end.x, line.end.y);
                    } else {
                        // 中间控制点
                        const nextCp = line.controlPoints[i + 1];
                        const midX = (cp.x + nextCp.x) / 2;
                        const midY = (cp.y + nextCp.y) / 2;
                        
                        ctx.quadraticCurveTo(cp.x, cp.y, midX, midY);
                        currentPoint = { x: midX, y: midY };
                    }
                }
            }
        } else if (line.control1 && line.control2) {
            // 使用两个控制点的三次贝塞尔曲线
        ctx.bezierCurveTo(
                line.control1.x, line.control1.y,
                line.control2.x, line.control2.y,
                line.end.x, line.end.y
            );
        } else {
            // 直线
            ctx.lineTo(line.end.x, line.end.y);
        }
        
        ctx.lineWidth = line.width;
        ctx.strokeStyle = line.color || '#000000';
        
        // 使用线条对象中的端点样式
        ctx.lineCap = line.cap || 'round';
        
        ctx.stroke();
    }

    // 显示导出模态框
    showExportModal(message, imgData) {
        const modal = document.getElementById('export-modal');
        const messageEl = document.getElementById('export-message');
        const imageContainer = document.getElementById('export-image-container');
        const closeBtn = document.getElementById('modal-close-btn');
        
        // 清空之前的内容
        messageEl.innerHTML = '';
        imageContainer.innerHTML = '';
        
        // 设置消息
        messageEl.innerHTML = message;
        
        // 如果有图片数据，添加图片
        if (imgData) {
            const img = document.createElement('img');
            img.src = imgData;
            img.alt = '导出图片';
            
            // 添加图片点击提示
            img.addEventListener('click', (e) => {
                e.preventDefault();
                // 创建提示元素
                const toast = document.createElement('div');
                toast.textContent = '请长按图片并选择"保存图片"选项';
                toast.style.position = 'fixed';
                toast.style.bottom = '20%';
                toast.style.left = '50%';
                toast.style.transform = 'translateX(-50%)';
                toast.style.backgroundColor = 'rgba(0,0,0,0.7)';
                toast.style.color = 'white';
                toast.style.padding = '10px 20px';
                toast.style.borderRadius = '20px';
                toast.style.fontSize = '14px';
                toast.style.zIndex = '3000';
                document.body.appendChild(toast);
                
                // 3秒后移除提示
                setTimeout(() => {
                    document.body.removeChild(toast);
                }, 3000);
            });
            
            imageContainer.appendChild(img);
            
            // 添加备用按钮，对于某些设备可能更容易保存
            const btnContainer = document.createElement('div');
            btnContainer.style.marginTop = '15px';
            btnContainer.style.display = 'flex';
            btnContainer.style.justifyContent = 'center';
            btnContainer.style.gap = '10px';
            
            // 打开新窗口按钮
            const openBtn = document.createElement('button');
            openBtn.textContent = '在新窗口打开';
            openBtn.className = 'btn btn-secondary';
            openBtn.style.fontSize = '0.9em';
            openBtn.addEventListener('click', () => {
                this.showImageInFullscreen(imgData, 'export_image');
            });
            btnContainer.appendChild(openBtn);
            
            imageContainer.appendChild(btnContainer);
        }
        
        // 显示模态框
        modal.classList.add('active');
        
        // 关闭按钮事件
        closeBtn.onclick = function() {
            modal.classList.remove('active');
        };
        
        // 点击模态框背景关闭
        modal.onclick = function(e) {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        };
    }

    // 更新导出模态框
    updateExportModal(message, imgData) {
        const messageEl = document.getElementById('export-message');
        const imageContainer = document.getElementById('export-image-container');
        
        // 更新消息
        if (message) {
            messageEl.innerHTML = message;
        }
        
        // 更新图片(如果有)
        if (imgData) {
            imageContainer.innerHTML = '';
            const img = document.createElement('img');
            img.src = imgData;
            img.alt = '导出图片';
            imageContainer.appendChild(img);
        }
    }

    // 导出SVG格式
    exportSVG() {
        try {
            // 获取当前尺寸
            const width = this.width;
            const height = this.height;
            
            // 获取背景颜色和透明度
            const bgColor = document.getElementById('bg-color').value;
            const opacity = document.getElementById('bg-opacity').value / 100;
            
            // 创建SVG文档
            let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
            
            // 添加背景
            if (opacity > 0) {
                // 解析背景颜色
                const r = parseInt(bgColor.slice(1, 3), 16);
                const g = parseInt(bgColor.slice(3, 5), 16);
                const b = parseInt(bgColor.slice(5, 7), 16);
                
                // 填充背景
                svgContent += `<rect width="${width}" height="${height}" fill="rgba(${r}, ${g}, ${b}, ${opacity})" />`;
            }
            
            // 添加网格（如果启用）
            if (document.getElementById('show-grid').checked) {
                const gridSize = 50;
                const gridColor = 'rgba(0, 0, 0, 0.1)';
                
                // 横线
                for (let y = gridSize; y < height; y += gridSize) {
                    svgContent += `<line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="${gridColor}" stroke-width="1" />`;
                }
                
                // 竖线
                for (let x = gridSize; x < width; x += gridSize) {
                    svgContent += `<line x1="${x}" y1="0" x2="${x}" y2="${height}" stroke="${gridColor}" stroke-width="1" />`;
                }
            }
            
            // 添加所有线条
            if (this.canvas.__lines && this.canvas.__lines.length > 0) {
                for (const line of this.canvas.__lines) {
                    // 添加路径
                    svgContent += `<path d="M${line.start.x},${line.start.y}`;
                    
                    if (line.controlPoints && line.controlPoints.length > 0) {
                        // 贝塞尔曲线
                        const controlPoints = line.controlPoints;
                        
                        if (controlPoints.length === 1) {
                            // 二次贝塞尔曲线
                            const cp = controlPoints[0];
                            svgContent += ` Q${cp.x},${cp.y} ${line.end.x},${line.end.y}`;
                        } else {
                            // 多点曲线，使用C命令（三次贝塞尔曲线）
                            let currentPoint = line.start;
                            
                            for (let i = 0; i < controlPoints.length; i++) {
                                const cp = controlPoints[i];
                                
                                // 如果是最后一个控制点，连接到终点
                                if (i === controlPoints.length - 1) {
                                    // 计算另一个控制点（从控制点向终点方向的点）
                                    const dx = line.end.x - cp.x;
                                    const dy = line.end.y - cp.y;
                                    const dist = Math.sqrt(dx * dx + dy * dy);
                                    const ratio = 0.5; // 控制点到终点距离的比例
                                    
                                    const cp2x = cp.x + dx * ratio;
                                    const cp2y = cp.y + dy * ratio;
                                    
                                    svgContent += ` C${cp.x},${cp.y} ${cp2x},${cp2y} ${line.end.x},${line.end.y}`;
            } else {
                                    // 连接到下一个控制点
                                    const nextCp = controlPoints[i + 1];
                                    const midX = (cp.x + nextCp.x) / 2;
                                    const midY = (cp.y + nextCp.y) / 2;
                                    
                                    svgContent += ` Q${cp.x},${cp.y} ${midX},${midY}`;
                                    currentPoint = { x: midX, y: midY };
                                }
                            }
                        }
                    } else {
                        // 直线
                        svgContent += ` L${line.end.x},${line.end.y}`;
                    }
                    
                    // 线条样式
                    svgContent += `" stroke="${line.color}" stroke-width="${line.width}" fill="none" stroke-linecap="${line.cap}" />`;
                }
            } else {
                // 如果没有保存的线条数据，重新生成
                const lineCount = parseInt(document.getElementById('line-count').value);
                for (let i = 0; i < lineCount; i++) {
                    const line = this.generateLine();
                    // 添加路径
                    svgContent += `<path d="M${line.start.x},${line.start.y}`;
                    
                    if (line.control1 && line.control2) {
                        // 三次贝塞尔曲线
                        svgContent += ` C${line.control1.x},${line.control1.y} ${line.control2.x},${line.control2.y} ${line.end.x},${line.end.y}`;
                    } else {
                        // 直线
                        svgContent += ` L${line.end.x},${line.end.y}`;
                    }
                    
                    // 线条样式
                    svgContent += `" stroke="#000000" stroke-width="${line.width}" fill="none" stroke-linecap="${line.cap}" />`;
                }
            }
            
            // 结束SVG
            svgContent += '</svg>';
            
            // 创建Blob
            const blob = new Blob([svgContent], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            
            // 创建文件名
            const date = new Date();
            const timestamp = `${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}_${date.getHours().toString().padStart(2, '0')}${date.getMinutes().toString().padStart(2, '0')}${date.getSeconds().toString().padStart(2, '0')}`;
            const filename = `tracesia_${width}x${height}_${timestamp}.svg`;
            
            // 使用辅助函数尝试下载或显示
            this.tryDownloadOrShow(url, filename, true);
        } catch (error) {
            this.showExportModal('SVG导出失败：' + error.message);
        }
    }

    // 尝试下载，如果失败则显示
    tryDownloadOrShow(imgData, filename, isBlob = false) {
        // 判断是否为移动设备
        const isMobile = this.isMobileDevice();
        
        if (isMobile) {
            // 移动端：直接跳转到新页面进行保存
            this.showImageInFullscreen(imgData, filename, isBlob);
            return;
        }
        
        try {
            // 创建下载链接
            const link = document.createElement('a');
            link.href = imgData;
            link.download = filename;
            link.style.display = 'none';
            document.body.appendChild(link);
            
            // 模拟点击事件
            const event = document.createEvent('MouseEvents');
            event.initEvent('click', true, false);
            link.dispatchEvent(event);
            
            setTimeout(() => {
                document.body.removeChild(link);
                
                // PC端：直接下载，无需弹窗
                console.log('图片下载已开始，文件名：' + filename);
            }, 100);
        } catch (e) {
            console.error('下载尝试失败:', e);
            
            // PC端：如果直接下载失败，则回退到弹窗
            this.showExportModal('图片下载失败，请右键点击图片选择"图片另存为"', imgData);
        }
    }

    // 在全屏页面中显示图片
    showImageInFullscreen(imgData, filename, isBlob = false) {
        // 使用全屏页显示图片
        const pageCode = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
                <meta name="format-detection" content="telephone=no">
                <meta name="msapplication-tap-highlight" content="no">
                <meta name="apple-mobile-web-app-capable" content="yes">
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
                <title>保存图片</title>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    html, body {
                        height: 100%;
                        width: 100%;
                        background-color: #1a1a1a;
                        color: #fff;
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                        overflow: hidden;
                        position: fixed;
                        touch-action: manipulation;
                    }
                    
                    .container {
                        display: flex;
                        flex-direction: column;
                        height: 100%;
                        padding: 16px;
                        text-align: center;
                    }
                    
                    .header {
                        padding: 12px 0;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    
                    h1 {
                        font-size: 18px;
                        font-weight: 500;
                        color: #fff;
                        flex: 1;
                        text-align: center;
                    }
                    
                    .back-btn {
                        background: none;
                        border: none;
                        color: #2196f3;
                        font-size: 16px;
                        padding: 8px;
                        cursor: pointer;
                        font-weight: 500;
                    }
                    
                    .img-container {
                        flex: 1;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        position: relative;
                        overflow: auto;
                        -webkit-overflow-scrolling: touch;
                        margin: 10px 0;
                    }
                    
                    .img-container img {
                        max-width: 100%;
                        max-height: 100%;
                        object-fit: contain;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                        background-color: #fff;
                    }
                    
                    .hint-text {
                        position: fixed;
                        bottom: 20px;
                        left: 0;
                        right: 0;
                        text-align: center;
                        background-color: rgba(0,0,0,0.6);
                        padding: 10px;
                        font-size: 14px;
                        color: white;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <button class="back-btn" onclick="window.close()">返回</button>
                        <h1>长按图片保存</h1>
                    </div>
                    <div class="img-container">
                        <img src="${imgData}" alt="保存图片">
                    </div>
                    <div class="hint-text">长按图片选择"保存图像"选项</div>
                </div>
                <script>
                    // 图片加载完成后隐藏提示，3秒后显示
                    document.querySelector('img').onload = function() {
                        const hint = document.querySelector('.hint-text');
                        setTimeout(() => {
                            hint.style.opacity = '1';
                        setTimeout(() => {
                                hint.style.opacity = '0.7';
                            }, 2000);
                        }, 1000);
                    };
                </script>
            </body>
            </html>
        `;

        // 打开新窗口显示图片
        const newWindow = window.open();
        if (newWindow) {
            newWindow.document.write(pageCode);
            newWindow.document.close();
            
            // 如果是blob URL，添加释放资源
            if (isBlob) {
                newWindow.onbeforeunload = function() {
                    URL.revokeObjectURL(imgData);
                };
            }
        } else {
            // 如果无法打开新窗口，则使用模态框
            this.showExportModal('无法打开新窗口，可能是被浏览器阻止。请长按下方图片保存：', imgData);
        }
    }

    // 判断是否为移动设备
    isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // 为移动设备设置触摸支持
    setupMobileTouchSupport() {
        const container = document.querySelector('.canvas-container');
        const canvas = this.canvas;
        const touchHint = document.querySelector('.canvas-touch-hint');
        
        // 初始化触摸参数
        let initialScale = 1;
        let currentScale = 1;
        let lastScale = 1;
        let startX = 0;
        let startY = 0;
        let lastX = 0;
        let lastY = 0;
        let translateX = 0;
        let translateY = 0;
        
        // 初始显示触摸提示，3秒后自动隐藏
        if (touchHint) {
            touchHint.classList.add('active');
            setTimeout(() => {
                touchHint.classList.remove('active');
            }, 3000);
        }
        
        // 监听屏幕方向变化，重新适配Canvas
        window.addEventListener('orientationchange', () => {
            // 延迟执行，等待浏览器完成方向变化
            setTimeout(() => {
                // 重置所有变换参数
                translateX = 0;
                translateY = 0;
                currentScale = 1;
                initialScale = 1;
                
                // 重新初始化Canvas
                this.initializeCanvas();
                
                // 显示短暂提示
                if (touchHint) {
                    touchHint.classList.add('active');
                    setTimeout(() => {
                        touchHint.classList.remove('active');
                    }, 1500);
                }
            }, 300);
        });
        
        // 防止iOS Safari的橡皮筋效果
        container.addEventListener('touchmove', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault(); // 防止多指缩放时的页面缩放
            }
        }, { passive: false });
        
        // 处理触摸开始事件
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            
            if (e.touches.length === 1) {
                // 单指触摸，准备拖动
                container.classList.add('panning');
                container.classList.remove('zooming');
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
                lastX = translateX || 0;
                lastY = translateY || 0;
            } else if (e.touches.length === 2) {
                // 双指触摸，准备缩放
                container.classList.add('zooming');
                container.classList.remove('panning');
                initialScale = currentScale;
                const dist = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                lastScale = dist;
            }
        });
        
        // 处理触摸移动事件
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            
            if (e.touches.length === 1) {
                // 单指拖动
                const x = e.touches[0].clientX;
                const y = e.touches[0].clientY;
                translateX = lastX + (x - startX);
                translateY = lastY + (y - startY);
                
                // 限制拖动范围，不允许Canvas完全拖出可视区域
                const canvasRect = canvas.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();
                
                // 计算最大允许的拖动距离
                const displayMode = document.getElementById('display-mode').value;
                let maxTranslateX, maxTranslateY;
                
                if (displayMode === 'original') {
                    // 原始模式下，允许更大范围拖动
                    maxTranslateX = Math.max(canvasRect.width, containerRect.width) / 2;
                    maxTranslateY = Math.max(canvasRect.height, containerRect.height) / 2;
                } else {
                    // 其他模式下，限制拖动范围
                    maxTranslateX = (canvasRect.width / 2) + (containerRect.width / 2) - 20;
                    maxTranslateY = (canvasRect.height / 2) + (containerRect.height / 2) - 20;
                }
                
                // 限制拖动范围
                translateX = Math.max(-maxTranslateX, Math.min(translateX, maxTranslateX));
                translateY = Math.max(-maxTranslateY, Math.min(translateY, maxTranslateY));
                
                // 应用变换
                canvas.style.transform = `translate(-50%, -50%) translate3d(${translateX}px, ${translateY}px, 0) scale(${currentScale})`;
            } else if (e.touches.length === 2) {
                // 双指缩放
                const dist = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                
                // 计算新的缩放比例
                currentScale = initialScale * (dist / lastScale);
                
                // 获取基础缩放比例和高质量渲染设置
                const baseScale = this.currentScaleFactor || 1;
                const useHighDPI = document.getElementById('high-quality').checked;
                
                // 限制缩放范围，提高移动端的缩放体验
                const minScale = useHighDPI ? baseScale * 0.6 : baseScale * 0.7;  // 缩小限制更严格，防止过度缩小
                const maxScale = baseScale * 2;    // 限制放大倍数，防止过度放大
                
                currentScale = Math.max(minScale, Math.min(currentScale, maxScale));
                
                // 更新缩放信息显示
                const scaleInfo = document.getElementById('zoom-value');
                if (scaleInfo) {
                    scaleInfo.textContent = `${currentScale.toFixed(2)}x (拖动中)`;
                }
                
                // 应用变换
                canvas.style.transform = `translate(-50%, -50%) translate3d(${translateX}px, ${translateY}px, 0) scale(${currentScale})`;
            }
        });
        
        // 处理触摸结束事件
        canvas.addEventListener('touchend', (e) => {
            if (e.touches.length === 0) {
                // 所有手指都离开了屏幕
                container.classList.remove('panning');
                container.classList.remove('zooming');
                lastX = translateX;
                lastY = translateY;
                
                // 更新缩放信息显示
                const displayMode = document.getElementById('display-mode').value;
                const displayModeText = displayMode === 'auto' ? '自适应' : 
                                       displayMode === 'original' ? '原始' : 
                                       displayMode === 'fit-width' ? '适宽' : '适高';
                
                const scaleInfo = document.getElementById('zoom-value');
                if (scaleInfo) {
                    scaleInfo.textContent = `${currentScale.toFixed(2)}x (${displayModeText}+手势)`;
                }
            } else if (e.touches.length === 1) {
                // 一个手指离开，一个手指仍在屏幕上
                container.classList.add('panning');
                container.classList.remove('zooming');
                initialScale = currentScale;
            }
        });
        
        // 双击重置变换
        canvas.addEventListener('dblclick', resetTransform.bind(this));
        
        // 添加对内容区域的双击监听
        container.addEventListener('dblclick', resetTransform.bind(this));
        
        // 重置变换的函数
        function resetTransform() {
            translateX = 0;
            translateY = 0;
            currentScale = 1;
            initialScale = 1;
            
            // 重置为自适应状态
            canvas.style.transform = 'translate(-50%, -50%)';
            
            // 重置整个Canvas
            setTimeout(() => {
                this.initializeCanvas();
            }, 50);
            
            container.classList.remove('panning');
            container.classList.remove('zooming');
            
            // 短暂显示触摸提示
            if (touchHint) {
                touchHint.classList.add('active');
                setTimeout(() => {
                    touchHint.classList.remove('active');
                }, 1500);
            }
        }
        
        // 监听窗口大小变化
        let lastWindowWidth = window.innerWidth;
        let lastWindowHeight = window.innerHeight;
        
        // 使用定时器监测屏幕尺寸变化
        setInterval(() => {
            const currentWidth = window.innerWidth;
            const currentHeight = window.innerHeight;
            
            if (lastWindowWidth !== currentWidth || lastWindowHeight !== currentHeight) {
                // 屏幕尺寸变化，重新适配Canvas
                lastWindowWidth = currentWidth;
                lastWindowHeight = currentHeight;
                
                // 重置变换参数
                translateX = 0;
                translateY = 0;
                currentScale = 1;
                initialScale = 1;
                
                // 重新初始化画布
                this.initializeCanvas();
                
                container.classList.remove('panning');
                container.classList.remove('zooming');
            }
        }, 300);
    }

    // 更新状态栏
    updateStatusbar() {
        // 获取显示模式
        const displayMode = document.getElementById('display-mode').value;
        const displayModeText = displayMode === 'auto' ? '自适应' : 
                               displayMode === 'original' ? '原始尺寸' : 
                               displayMode === 'fit-width' ? '适应宽度' : '适应高度';
        
        // 获取线条数量
        const lineCount = parseInt(document.getElementById('line-count').value || '8');
        
        // 更新状态栏
        const statusText = document.getElementById('status-text');
        if (statusText) {
            statusText.textContent = `线迹数: ${lineCount} / 画布尺寸: ${this.width}x${this.height} / 显示模式: ${displayModeText}`;
        }
    }

    // 获取边缘上的随机点
    getRandomPointOnEdge(edge) {
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        switch (edge) {
            case 0: // 上边缘
                return [Math.random() * width, 0];
            case 1: // 右边缘
                return [width, Math.random() * height];
            case 2: // 下边缘
                return [Math.random() * width, height];
            case 3: // 左边缘
                return [0, Math.random() * height];
            default:
                return [0, 0]; // 默认返回左上角
        }
    }
}

// 初始化应用
window.addEventListener('DOMContentLoaded', () => {
    // 主应用初始化
    const lineGenerator = new LineGenerator();
    
    // 在页面加载后立即执行一次初始化，确保正确计算尺寸
    setTimeout(() => {
        lineGenerator.initializeCanvas();
    }, 100);
    
    // 移动端菜单控制
    initializeMobileMenu();
    
    // 初始化模态框关闭事件
    document.getElementById('modal-close-btn').addEventListener('click', () => {
        document.getElementById('export-modal').classList.remove('active');
    });
    
    // Safari和iOS兼容性处理
    if (/iPhone|iPad|iPod|Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)) {
        // 解决Safari的渲染问题
        const canvas = document.getElementById('main-canvas');
        
        // 强制重新计算
        function forceReflow() {
            canvas.style.display = 'none';
            canvas.offsetHeight; // 触发重排
            canvas.style.display = '';
        }
        
        // 在方向变化和尺寸变化时应用
        window.addEventListener('orientationchange', forceReflow);
        window.addEventListener('resize', forceReflow);
    }
});

// 移动端菜单初始化
function initializeMobileMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const controlPanel = document.getElementById('control-panel');
    const overlay = document.getElementById('overlay');
    const closePanel = document.getElementById('close-panel');
    
    // 确保初始状态正确
    controlPanel.classList.remove('active');
    overlay.classList.remove('active');
    menuToggle.classList.remove('active');
    document.body.classList.remove('menu-open');
    
    // 菜单切换函数
    function toggleMenu() {
        controlPanel.classList.toggle('active');
        overlay.classList.toggle('active');
        menuToggle.classList.toggle('active');
        document.body.classList.toggle('menu-open');
    }
    
    // 移除可能存在的旧事件监听器
    menuToggle.removeEventListener('click', toggleMenu);
    overlay.removeEventListener('click', toggleMenu);
    
    // 重新添加事件监听器
    menuToggle.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', toggleMenu);
    
    // 关闭按钮事件
    closePanel.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (controlPanel.classList.contains('active')) {
            toggleMenu();
        }
    });
    
    // 窗口大小改变时重置菜单状态
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            controlPanel.classList.remove('active');
            overlay.classList.remove('active');
            menuToggle.classList.remove('active');
            document.body.classList.remove('menu-open');
        }
    });
    
    // 为所有控制元素添加点击事件，自动关闭菜单
    const panelButtons = document.querySelectorAll('.panel-sections-container input[type="radio"], .panel-sections-container input[type="checkbox"], .panel-sections-container button');
    panelButtons.forEach(button => {
        if (button !== closePanel) {
            button.addEventListener('click', (event) => {
                event.stopPropagation();
                if (window.innerWidth <= 768) {
                    toggleMenu();
                }
            });
        }
    });
} 