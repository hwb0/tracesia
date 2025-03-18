class LineGenerator {
    constructor() {
        this.canvas = document.getElementById('main-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.setupEventListeners();
        this.initializeCanvas();
    }

    initializeCanvas() {
        this.width = parseInt(document.getElementById('width').value);
        this.height = parseInt(document.getElementById('height').value);
        
        // 设置canvas的实际尺寸
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        // 计算缩放后的尺寸
        const zoom = parseFloat(document.getElementById('zoom').value);
        const displayWidth = this.width * zoom;
        const displayHeight = this.height * zoom;
        
        // 设置canvas的显示尺寸
        this.canvas.style.width = `${displayWidth}px`;
        this.canvas.style.height = `${displayHeight}px`;
        
        this.draw();
    }

    setupEventListeners() {
        // 尺寸控制
        document.getElementById('width').addEventListener('change', () => this.initializeCanvas());
        document.getElementById('height').addEventListener('change', () => this.initializeCanvas());
        document.getElementById('zoom').addEventListener('input', (e) => {
            document.getElementById('zoom-value').textContent = `${e.target.value}x`;
            this.initializeCanvas();
        });

        // 快捷尺寸按钮
        document.querySelectorAll('.size-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const width = btn.dataset.width;
                const height = btn.dataset.height;
                
                // 更新输入框的值
                document.getElementById('width').value = width;
                document.getElementById('height').value = height;
                
                // 重新初始化画布
                this.initializeCanvas();
            });
        });

        // 步进器按钮
        document.querySelectorAll('.stepper-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.dataset.target;
                const action = btn.dataset.action;
                const inputElement = document.getElementById(targetId);
                
                // 根据操作增加或减少值
                let value = parseFloat(inputElement.value);
                const step = parseFloat(inputElement.step) || 1;
                
                if (action === 'increase') {
                    value = Math.min(value + step, parseFloat(inputElement.max));
                } else {
                    value = Math.max(value - step, parseFloat(inputElement.min));
                }
                
                // 更新值并触发change事件
                inputElement.value = value;
                
                // 更新显示
                const displayElement = document.getElementById(`${targetId}-value`);
                if (displayElement) {
                    if (targetId === 'curve-strength') {
                        displayElement.textContent = `${value}%`;
                    } else {
                        displayElement.textContent = value;
                    }
                }
                
                // 触发重绘
                this.draw();
            });
        });

        // 线条参数
        document.getElementById('line-count').addEventListener('input', (e) => {
            document.getElementById('line-count-value').textContent = e.target.value;
            this.draw();
        });

        document.getElementById('curve-strength').addEventListener('input', (e) => {
            document.getElementById('curve-strength-value').textContent = `${e.target.value}%`;
            this.draw();
        });

        // 线条模式切换
        document.querySelectorAll('input[name="line-mode"]').forEach(radio => {
            radio.addEventListener('change', () => this.draw());
        });

        // 线条宽度变化监听
        document.getElementById('min-width').addEventListener('change', () => this.draw());
        document.getElementById('max-width').addEventListener('change', () => this.draw());

        // 背景控制
        document.getElementById('bg-color').addEventListener('input', () => this.draw());
        document.getElementById('bg-opacity').addEventListener('input', (e) => {
            document.getElementById('bg-opacity-value').textContent = `${e.target.value}%`;
            this.draw();
        });

        // 背景颜色重置
        document.getElementById('reset-bg-color').addEventListener('click', () => {
            document.getElementById('bg-color').value = '#ffffff';
            this.draw();
        });

        // 网格显示切换
        document.getElementById('show-grid').addEventListener('change', () => this.draw());

        // 重新生成按钮
        document.getElementById('regenerate-btn').addEventListener('click', () => this.draw());

        // 导出按钮
        document.getElementById('export-btn').addEventListener('click', () => this.exportImage());

        // 线条端点样式切换
        document.querySelectorAll('input[name="line-cap"]').forEach(radio => {
            radio.addEventListener('change', () => this.draw());
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

        return {
            start: { x: startX, y: startY },
            end: { x: endX, y: endY },
            control1: controlPoint1,
            control2: controlPoint2,
            width: width,
            cap: lineCap
        };
    }

    draw() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制背景
        const bgColor = document.getElementById('bg-color').value;
        const bgOpacity = document.getElementById('bg-opacity').value / 100;
        this.ctx.fillStyle = `${bgColor}${Math.round(bgOpacity * 255).toString(16).padStart(2, '0')}`;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制网格
        if (document.getElementById('show-grid').checked) {
            this.drawGrid();
        }

        // 绘制线条
        const lineCount = parseInt(document.getElementById('line-count').value);
        for (let i = 0; i < lineCount; i++) {
            const line = this.generateLine();
            this.drawLine(line);
        }

        // 更新状态栏
        document.getElementById('status-text').textContent = 
            `线迹数: ${lineCount} / 画布尺寸: ${this.width}x${this.height}`;
    }

    drawLine(line) {
        this.ctx.beginPath();
        this.ctx.moveTo(line.start.x, line.start.y);
        this.ctx.bezierCurveTo(
            line.control1.x, line.control1.y,
            line.control2.x, line.control2.y,
            line.end.x, line.end.y
        );
        this.ctx.lineWidth = line.width;
        this.ctx.strokeStyle = '#000000';
        
        // 使用线条对象中的端点样式
        this.ctx.lineCap = line.cap;
        
        this.ctx.stroke();
    }

    drawGrid() {
        const gridSize = 50;
        this.ctx.strokeStyle = '#e0e0e0';
        this.ctx.lineWidth = 0.5;

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
    }

    exportImage() {
        const resolution = parseInt(document.getElementById('export-resolution').value);
        const format = document.getElementById('export-format').value;
        
        // 创建临时画布用于导出
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.width * resolution;
        tempCanvas.height = this.height * resolution;
        const tempCtx = tempCanvas.getContext('2d');

        // 设置背景
        const bgColor = document.getElementById('bg-color').value;
        const bgOpacity = document.getElementById('bg-opacity').value / 100;
        tempCtx.fillStyle = `${bgColor}${Math.round(bgOpacity * 255).toString(16).padStart(2, '0')}`;
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

        // 重新绘制线条
        const lineCount = parseInt(document.getElementById('line-count').value);
        const lineSeed = Date.now(); // 使用时间戳作为随机种子，确保导出和预览一致
        Math.seedrandom && Math.seedrandom(lineSeed);
        
        for (let i = 0; i < lineCount; i++) {
            const line = this.generateLine();
            this.drawLineOnCanvas(line, tempCtx, resolution);
        }

        // 导出图片
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `线迹幻境_${timestamp}.${format}`;
        
        const link = document.createElement('a');
        link.download = filename;
        link.href = tempCanvas.toDataURL(`image/${format}`);
        link.click();
    }

    drawLineOnCanvas(line, ctx, resolution) {
        ctx.beginPath();
        ctx.moveTo(line.start.x * resolution, line.start.y * resolution);
        ctx.bezierCurveTo(
            line.control1.x * resolution, line.control1.y * resolution,
            line.control2.x * resolution, line.control2.y * resolution,
            line.end.x * resolution, line.end.y * resolution
        );
        ctx.lineWidth = line.width * resolution;
        ctx.strokeStyle = '#000000';
        
        // 使用线条对象中的端点样式
        ctx.lineCap = line.cap;
        
        ctx.stroke();
    }
}

// 初始化应用
window.addEventListener('DOMContentLoaded', () => {
    // 主应用初始化
    new LineGenerator();
    
    // 移动端菜单控制
    initializeMobileMenu();
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