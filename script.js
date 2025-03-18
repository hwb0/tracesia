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
        
        // SVG格式特殊处理
        if (format === 'svg') {
            this.exportSVG();
            return;
        }
        
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
        
        try {
            // 检测设备类型
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            
            // 生成数据URL
            const imgData = tempCanvas.toDataURL(`image/${format}`, format === 'jpg' ? 0.95 : undefined);
            
            // 使用不同的方法处理不同的设备
            if (isIOS) {
                // iOS设备特殊处理 - 在新窗口显示图片供用户长按保存
                const newTab = window.open();
                if (newTab) {
                    newTab.document.write(`
                        <html>
                            <head>
                                <title>保存图片</title>
                                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
                                <style>
                                    body {
                                        margin: 0;
                                        padding: 20px;
                                        display: flex;
                                        flex-direction: column;
                                        align-items: center;
                                        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                                        text-align: center;
                                        background-color: #f7f7f7;
                                        color: #333;
                                    }
                                    .container {
                                        max-width: 100%;
                                        width: 100%;
                                        padding: 16px;
                                        box-sizing: border-box;
                                        display: flex;
                                        flex-direction: column;
                                        align-items: center;
                                    }
                                    img {
                                        max-width: 100%;
                                        height: auto;
                                        border: 1px solid #eee;
                                        margin-bottom: 20px;
                                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                                        border-radius: 4px;
                                        background-color: white;
                                    }
                                    h3 {
                                        margin-bottom: 15px;
                                        color: #2196f3;
                                    }
                                    p {
                                        color: #666;
                                        line-height: 1.5;
                                        margin-bottom: 20px;
                                    }
                                    .tips {
                                        background-color: #e3f2fd;
                                        border-radius: 8px;
                                        padding: 12px;
                                        margin-bottom: 15px;
                                        width: 100%;
                                        box-sizing: border-box;
                                        text-align: left;
                                    }
                                    .tips p {
                                        margin: 5px 0;
                                    }
                                </style>
                            </head>
                            <body>
                                <div class="container">
                                    <h3>长按图片保存到相册</h3>
                                    <div class="tips">
                                        <p>• 点击并按住图片</p>
                                        <p>• 选择"存储图像"或"添加到照片"</p>
                                        <p>• 如果保存失败，请尝试截屏保存</p>
                                    </div>
                                    <img src="${imgData}" alt="${filename}">
                                </div>
                            </body>
                        </html>
                    `);
                    newTab.document.close();
                } else {
                    // 如果无法打开新窗口，则显示模态框
                    this.showExportModal('无法打开新窗口，请长按下方图片保存', imgData);
                }
            } else if (isMobile) {
                // 其他移动设备 - 尝试使用a标签下载，如果失败则显示模态框
                try {
                    const link = document.createElement('a');
                    link.href = imgData;
                    link.download = filename;
                    link.style.display = 'none';
                    document.body.appendChild(link);
                    link.click();
                    setTimeout(() => {
                        document.body.removeChild(link);
                        
                        // 提示用户检查下载
                        setTimeout(() => {
                            this.showExportModal('图片已准备下载，如果没有自动保存，请长按下方图片并选择"保存图片"', imgData);
                        }, 1000);
                    }, 100);
                } catch (e) {
                    // 回退到显示模态框
                    this.showExportModal('自动下载失败，请长按下方图片保存', imgData);
                }
            } else {
                // 桌面设备 - 使用标准下载方式
                const link = document.createElement('a');
                link.download = filename;
                link.href = imgData;
                link.click();
            }
        } catch (e) {
            console.error('导出图片失败:', e);
            
            // 通用错误处理方式
            this.showExportModal('导出图片失败，正在尝试备用方法...', null);
            
            // 备用方法：创建Blob对象
            try {
                tempCanvas.toBlob((blob) => {
                    if (blob) {
                        const blobUrl = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.download = filename;
                        link.href = blobUrl;
                        link.click();
                        
                        // 更新模态框
                        this.updateExportModal('图片已准备下载，请检查您的下载文件夹', null);
                        
                        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
                    } else {
                        this.updateExportModal('图片生成失败，请尝试降低分辨率或使用其他浏览器', null);
                    }
                }, `image/${format}`, format === 'jpg' ? 0.95 : undefined);
            } catch (e2) {
                console.error('备用导出方法失败:', e2);
                this.updateExportModal('图片导出失败，请尝试以下方法：<br>1. 降低分辨率<br>2. 使用其他浏览器<br>3. 截取屏幕保存', null);
            }
        }
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
            imageContainer.appendChild(img);
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
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `线迹幻境_${timestamp}.svg`;
        
        // 检测设备类型
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // 创建SVG
        const bg = document.getElementById('bg-color').value;
        const bgOpacity = document.getElementById('bg-opacity').value / 100;
        const lineCount = parseInt(document.getElementById('line-count').value);
        
        // 创建SVG元素
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("width", this.width);
        svg.setAttribute("height", this.height);
        svg.setAttribute("xmlns", svgNS);
        svg.setAttribute("viewBox", `0 0 ${this.width} ${this.height}`);
        
        // 添加背景矩形
        const rect = document.createElementNS(svgNS, "rect");
        rect.setAttribute("width", "100%");
        rect.setAttribute("height", "100%");
        rect.setAttribute("fill", bg);
        rect.setAttribute("opacity", bgOpacity);
        svg.appendChild(rect);
        
        // 设置随机种子
        const lineSeed = Date.now();
        Math.seedrandom && Math.seedrandom(lineSeed);
        
        // 生成线条
        for (let i = 0; i < lineCount; i++) {
            const line = this.generateLine();
            
            // 创建路径元素
            const path = document.createElementNS(svgNS, "path");
            path.setAttribute("d", `M${line.start.x},${line.start.y} C${line.control1.x},${line.control1.y} ${line.control2.x},${line.control2.y} ${line.end.x},${line.end.y}`);
            path.setAttribute("stroke", "#000000");
            path.setAttribute("stroke-width", line.width);
            path.setAttribute("fill", "none");
            path.setAttribute("stroke-linecap", line.cap);
            
            svg.appendChild(path);
        }
        
        // 转换为SVG字符串
        const svgData = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
        const svgUrl = URL.createObjectURL(svgBlob);
        
        try {
            if (isIOS) {
                // iOS设备无法直接下载SVG，提供查看和复制选项
                this.showExportModal(`
                    <strong>SVG格式在iOS上不支持直接保存</strong><br>
                    请选择以下方法之一：<br>
                    1. 截屏并编辑保存图片<br>
                    2. 使用PNG或JPG格式重新导出<br>
                    3. 在电脑上使用这个功能
                `, null);
                
                // 创建一个查看SVG的链接
                const viewLink = document.createElement('a');
                viewLink.href = svgUrl;
                viewLink.target = '_blank';
                viewLink.textContent = '在新窗口查看SVG';
                viewLink.className = 'btn';
                viewLink.style.marginRight = '10px';
                viewLink.style.display = 'inline-block';
                viewLink.style.textDecoration = 'none';
                
                // 添加到模态框
                document.getElementById('export-image-container').appendChild(viewLink);
            } else if (isMobile) {
                // 其他移动设备 - 尝试直接保存
                const link = document.createElement('a');
                link.href = svgUrl;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                setTimeout(() => {
                    document.body.removeChild(link);
                    URL.revokeObjectURL(svgUrl);
                    
                    this.showExportModal(`
                        <strong>SVG文件已准备下载</strong><br>
                        如果下载失败，您可以：<br>
                        1. 尝试使用PNG或JPG格式<br>
                        2. 在电脑上使用SVG格式
                    `, null);
                }, 100);
            } else {
                // 桌面设备 - 标准下载
                const link = document.createElement('a');
                link.href = svgUrl;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                setTimeout(() => {
                    document.body.removeChild(link);
                    URL.revokeObjectURL(svgUrl);
                }, 100);
            }
        } catch (e) {
            console.error('SVG导出失败:', e);
            this.showExportModal('SVG导出失败，请尝试使用PNG或JPG格式', null);
        }
    }
}

// 初始化应用
window.addEventListener('DOMContentLoaded', () => {
    // 主应用初始化
    new LineGenerator();
    
    // 移动端菜单控制
    initializeMobileMenu();
    
    // 初始化模态框关闭事件
    document.getElementById('modal-close-btn').addEventListener('click', () => {
        document.getElementById('export-modal').classList.remove('active');
    });
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