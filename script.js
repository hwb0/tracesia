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
        
        // 检测设备类型 - 更精确的检测
        const ua = navigator.userAgent.toLowerCase();
        const isIOS = /iphone|ipad|ipod/.test(ua);
        const isAndroid = /android/.test(ua);
        const isMobile = isIOS || isAndroid || /mobile|phone/.test(ua);
        const isWechat = /micromessenger/.test(ua);
        const isQQ = /qq\//.test(ua);
        
        try {
            // 生成数据URL
            const imgData = tempCanvas.toDataURL(`image/${format}`, format === 'jpg' ? 0.9 : undefined);
            
            // 针对不同环境使用不同的保存策略
            if (isWechat || isQQ) {
                // 微信/QQ内置浏览器中打开新页面显示图片
                this.showImageInFullscreen(imgData, filename);
            } else if (isIOS) {
                // 在iOS上使用全屏显示方法
                this.showImageInFullscreen(imgData, filename);
            } else if (isAndroid) {
                // 尝试直接下载，如果失败则显示图片
                this.tryDownloadOrShow(imgData, filename);
            } else {
                // 桌面设备 - 使用标准下载方式
                const link = document.createElement('a');
                link.download = filename;
                link.href = imgData;
                link.click();
            }
        } catch (e) {
            console.error('导出图片失败:', e);
            // 回退到模态框显示
            this.showExportModal('生成图片失败，正在尝试备用方法...', null);
            
            try {
                // 尝试使用blob方式
                tempCanvas.toBlob((blob) => {
                    if (blob) {
                        // 尝试使用Blob URL
                        const blobUrl = URL.createObjectURL(blob);
                        
                        if (isMobile) {
                            // 在移动设备上显示图片
                            this.showImageInFullscreen(blobUrl, filename, true);
                        } else {
                            // 桌面设备 - 使用标准下载方式
                            const link = document.createElement('a');
                            link.download = filename;
                            link.href = blobUrl;
                            link.click();
                            setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
                        }
                    } else {
                        this.updateExportModal('图片生成失败，请尝试降低分辨率或使用其他浏览器', null);
                    }
                }, `image/${format}`, format === 'jpg' ? 0.9 : undefined);
            } catch (e2) {
                console.error('备用导出方法失败:', e2);
                this.updateExportModal('无法处理图片，请尝试截屏保存或使用其他浏览器', null);
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

    // 尝试下载，如果失败则显示
    tryDownloadOrShow(imgData, filename) {
        try {
            // 尝试使用a标签下载
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
                
                // 显示提示和备用选项
                this.showExportModal('图片已准备下载，如未自动保存，请长按图片手动保存', imgData);
            }, 100);
        } catch (e) {
            console.error('下载尝试失败:', e);
            // 回退到直接显示
            this.showImageInFullscreen(imgData, filename);
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
                        padding: 20px;
                        text-align: center;
                    }
                    
                    .header {
                        padding: 15px 0;
                        margin-bottom: 10px;
                    }
                    
                    h1 {
                        font-size: 20px;
                        font-weight: 600;
                        margin-bottom: 10px;
                        color: #2196f3;
                    }
                    
                    .tips {
                        background-color: rgba(33, 150, 243, 0.15);
                        border-radius: 12px;
                        padding: 15px;
                        margin-bottom: 20px;
                        line-height: 1.5;
                        text-align: left;
                        font-size: 14px;
                    }
                    
                    .tips li {
                        margin-bottom: 8px;
                        list-style-position: inside;
                    }
                    
                    .img-container {
                        flex: 1;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        position: relative;
                        overflow: auto;
                        -webkit-overflow-scrolling: touch;
                        margin-bottom: 15px;
                    }
                    
                    .img-container img {
                        max-width: 100%;
                        max-height: 100%;
                        object-fit: contain;
                        user-select: none;
                        -webkit-user-drag: none;
                        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                        background-color: #fff;
                        border-radius: 4px;
                    }
                    
                    .footer {
                        padding: 10px 0;
                        font-size: 13px;
                        color: #aaa;
                    }
                    
                    .touch-hint {
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        background-color: rgba(0, 0, 0, 0.7);
                        color: white;
                        padding: 15px 25px;
                        border-radius: 30px;
                        font-size: 16px;
                        pointer-events: none;
                        opacity: 0;
                        transition: opacity 0.3s;
                    }
                    
                    .touch-hint.show {
                        opacity: 1;
                        animation: pulse 2s infinite;
                    }
                    
                    @keyframes pulse {
                        0% { transform: translate(-50%, -50%) scale(1); }
                        50% { transform: translate(-50%, -50%) scale(1.05); }
                        100% { transform: translate(-50%, -50%) scale(1); }
                    }
                    
                    .actions {
                        display: flex;
                        justify-content: center;
                        gap: 10px;
                        margin-bottom: 20px;
                    }
                    
                    .btn {
                        background-color: #2196f3;
                        color: white;
                        border: none;
                        padding: 10px 16px;
                        border-radius: 20px;
                        font-size: 14px;
                        font-weight: 500;
                        cursor: pointer;
                        transition: background-color 0.2s;
                    }
                    
                    .btn:active {
                        background-color: #1976d2;
                        transform: scale(0.98);
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>图片预览</h1>
                        <div class="tips">
                            <ul>
                                <li><strong>长按图片</strong>选择"存储图像"或"添加到照片"</li>
                                <li>如果长按无效，请尝试<strong>截屏</strong>保存</li>
                                <li>某些浏览器可能需要点击图片后再保存</li>
                            </ul>
                        </div>
                    </div>
                    <div class="actions">
                        <button class="btn" id="fullscreen-btn">全屏查看</button>
                        <button class="btn" id="hint-btn">显示提示</button>
                    </div>
                    <div class="img-container">
                        <img src="${imgData}" alt="预览图片" id="preview-img">
                        <div class="touch-hint" id="touch-hint">长按图片保存</div>
                    </div>
                    <div class="footer">
                        线迹幻境 - 长按图片保存 - ${new Date().toLocaleString()}
                    </div>
                </div>
                <script>
                    // 检测图片加载状态
                    document.getElementById('preview-img').onload = function() {
                        console.log('图片加载成功');
                    };
                    
                    document.getElementById('preview-img').onerror = function() {
                        console.error('图片加载失败');
                        alert('图片加载失败，请返回重试');
                    };
                    
                    // 添加图片点击事件，某些移动浏览器需要先点击才能保存
                    document.getElementById('preview-img').addEventListener('click', function(e) {
                        const hint = document.getElementById('touch-hint');
                        hint.classList.add('show');
                        setTimeout(() => {
                            hint.classList.remove('show');
                        }, 3000);
                    });
                    
                    // 全屏查看按钮
                    document.getElementById('fullscreen-btn').addEventListener('click', function() {
                        if (document.documentElement.requestFullscreen) {
                            document.documentElement.requestFullscreen();
                        } else if (document.documentElement.webkitRequestFullscreen) {
                            document.documentElement.webkitRequestFullscreen();
                        } else if (document.documentElement.msRequestFullscreen) {
                            document.documentElement.msRequestFullscreen();
                        }
                    });
                    
                    // 显示提示按钮
                    document.getElementById('hint-btn').addEventListener('click', function() {
                        const hint = document.getElementById('touch-hint');
                        hint.classList.add('show');
                        setTimeout(() => {
                            hint.classList.remove('show');
                        }, 3000);
                    });
                    
                    // 检测是否为iOS设备
                    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
                    
                    // 对iOS设备特别提示
                    if (isIOS) {
                        setTimeout(() => {
                            const hint = document.getElementById('touch-hint');
                            hint.classList.add('show');
                            setTimeout(() => {
                                hint.classList.remove('show');
                            }, 3000);
                        }, 1000);
                    }
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