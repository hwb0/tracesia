/**
 * 导出管理器模块
 * 管理图像导出相关功能
 */
import { isMobileDevice } from './utils.js';

export class ExportManager {
    /**
     * 构造函数
     * @param {CanvasManager} canvasManager - 画布管理器实例
     * @param {LineGenerator} lineGenerator - 线条生成器实例
     */
    constructor(canvasManager, lineGenerator) {
        this.canvasManager = canvasManager;
        this.lineGenerator = lineGenerator;
        this.modalElement = document.getElementById('export-modal');
    }

    /**
     * 导出图像
     */
    exportImage() {
        const format = document.getElementById('export-format').value;
        const resolution = parseFloat(document.getElementById('export-resolution').value);
        
        // 根据格式选择不同的导出方法
        switch (format) {
            case 'png':
            case 'jpg':
                this.exportRasterImage(format, resolution);
                break;
            case 'svg':
                this.exportSVG();
                break;
        }
    }
    
    /**
     * 导出光栅图像（PNG/JPG）
     * @param {string} format - 导出格式 (png/jpg)
     * @param {number} resolution - 导出分辨率倍数
     */
    exportRasterImage(format, resolution) {
        // 获取原始画布尺寸
        const canvasSize = this.canvasManager.getSize();
        const width = canvasSize.width;
        const height = canvasSize.height;
        
        // 创建临时画布用于导出
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = width * resolution;
        exportCanvas.height = height * resolution;
        
        const exportCtx = exportCanvas.getContext('2d');
        
        // 绘制背景
        const bgColor = document.getElementById('bg-color').value;
        const bgOpacity = parseInt(document.getElementById('bg-opacity').value);
        
        // 使用RGB颜色和透明度设置
        const opacityValue = bgOpacity / 100;
        
        // 绘制背景（如果不是PNG格式或透明度不是0）
        if (format !== 'png' || opacityValue > 0) {
            exportCtx.fillStyle = bgColor;
            exportCtx.globalAlpha = opacityValue;
            exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
            exportCtx.globalAlpha = 1.0;
        }
        
        // 绘制网格（如果设置了显示网格）
        if (document.getElementById('show-grid').checked) {
            this.drawGridOnCanvas(exportCtx, width, height, resolution);
        }
        
        // 绘制所有线条
        const lines = this.lineGenerator.getLines();
        for (const line of lines) {
            this.lineGenerator.drawLineOnCanvas(line, exportCtx, resolution);
        }
        
        // 导出图像
        try {
            let mimeType = (format === 'png') ? 'image/png' : 'image/jpeg';
            let quality = (format === 'jpg') ? 0.9 : undefined;
            
            // 获取图像数据URL
            const imgData = exportCanvas.toDataURL(mimeType, quality);
            
            // 生成文件名
            const timestamp = new Date().toISOString().replace(/:/g, '-').substring(0, 19);
            const filename = `线迹幻境-${width}x${height}-${timestamp}.${format}`;
            
            // 根据设备类型处理下载
            if (isMobileDevice()) {
                this.showExportModal(`图片已生成，点击或长按图片保存到您的设备。`, imgData, filename);
            } else {
                // 桌面设备直接下载
                this.tryDownloadOrShow(imgData, filename, false);
            }
        } catch (error) {
            console.error('导出图像失败:', error);
            this.showExportModal(`导出图像失败: ${error.message}`);
        }
    }
    
    /**
     * 在导出画布上绘制网格
     * @param {CanvasRenderingContext2D} ctx - 绘图上下文
     * @param {number} width - 原始宽度
     * @param {number} height - 原始高度
     * @param {number} resolution - 分辨率倍数
     */
    drawGridOnCanvas(ctx, width, height, resolution) {
        // 网格间距（像素）
        const gridSize = 20 * resolution;
        
        // 保存当前绘图状态
        ctx.save();
        
        // 设置网格样式
        ctx.strokeStyle = '#cccccc';
        ctx.lineWidth = 0.5 * resolution;
        ctx.globalAlpha = 0.5;
        
        // 绘制垂直线
        for (let x = 0; x <= width * resolution; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height * resolution);
            ctx.stroke();
        }
        
        // 绘制水平线
        for (let y = 0; y <= height * resolution; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width * resolution, y);
            ctx.stroke();
        }
        
        // 恢复绘图状态
        ctx.restore();
    }
    
    /**
     * 导出SVG格式
     */
    exportSVG() {
        try {
            // 获取原始画布尺寸
            const canvasSize = this.canvasManager.getSize();
            const width = canvasSize.width;
            const height = canvasSize.height;
            
            // 获取背景颜色和透明度
            const bgColor = document.getElementById('bg-color').value;
            const bgOpacity = parseInt(document.getElementById('bg-opacity').value) / 100;
            
            // 获取是否显示网格
            const showGrid = document.getElementById('show-grid').checked;
            
            // 创建SVG头
            let svgContent = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" 
     xmlns="http://www.w3.org/2000/svg" version="1.1">
<title>线迹幻境</title>
<desc>Generated by 线迹幻境</desc>`;
            
            // 添加背景（如果不是完全透明）
            if (bgOpacity > 0) {
                svgContent += `\n<rect x="0" y="0" width="${width}" height="${height}" fill="${bgColor}" fill-opacity="${bgOpacity}"/>`;
            }
            
            // 添加网格（如果设置了显示网格）
            if (showGrid) {
                svgContent += `\n<g id="grid" stroke="#cccccc" stroke-width="0.5" stroke-opacity="0.5">`;
                
                // 网格间距（像素）
                const gridSize = 20;
                
                // 垂直线
                for (let x = 0; x <= width; x += gridSize) {
                    svgContent += `\n  <line x1="${x}" y1="0" x2="${x}" y2="${height}" />`;
                }
                
                // 水平线
                for (let y = 0; y <= height; y += gridSize) {
                    svgContent += `\n  <line x1="0" y1="${y}" x2="${width}" y2="${y}" />`;
                }
                
                svgContent += `\n</g>`;
            }
            
            // 获取所有线条
            const lines = this.lineGenerator.getLines();
            
            // 添加线条组
            svgContent += `\n<g id="lines">`;
            
            // 遍历所有线条，将其转换为SVG路径
            for (const line of lines) {
                svgContent += `\n  <path d="M ${line.startPoint.x} ${line.startPoint.y} C ${line.controlPoint1.x} ${line.controlPoint1.y}, ${line.controlPoint2.x} ${line.controlPoint2.y}, ${line.endPoint.x} ${line.endPoint.y}" 
      stroke="${line.color}" stroke-width="${line.width}" stroke-linecap="${line.lineCap}" fill="none" />`;
            }
            
            // 结束线条组和SVG
            svgContent += `\n</g>\n</svg>`;
            
            // 创建Blob和URL
            const blob = new Blob([svgContent], {type: 'image/svg+xml'});
            const svgUrl = URL.createObjectURL(blob);
            
            // 生成文件名
            const timestamp = new Date().toISOString().replace(/:/g, '-').substring(0, 19);
            const filename = `线迹幻境-${width}x${height}-${timestamp}.svg`;
            
            // 根据设备类型处理下载
            if (isMobileDevice()) {
                this.showExportModal(`SVG文件已生成。由于移动设备限制，您可能需要点击下方按钮查看，然后保存。`, svgUrl, filename, true);
            } else {
                // 桌面设备直接下载
                this.tryDownloadOrShow(svgUrl, filename, true);
            }
        } catch (error) {
            console.error('导出SVG失败:', error);
            this.showExportModal(`导出SVG失败: ${error.message}`);
        }
    }
    
    /**
     * 尝试下载或显示图像
     * @param {string|Blob} imgData - 图像数据
     * @param {string} filename - 文件名
     * @param {boolean} isBlob - 是否为Blob类型
     */
    tryDownloadOrShow(imgData, filename, isBlob = false) {
        try {
            // 检测是否为移动设备
            if (isMobileDevice()) {
                // 在移动设备上优先使用全屏预览
                this.showImageInFullscreen(imgData, filename, isBlob);
                return;
            }
            
            // 创建下载链接
            const link = document.createElement('a');
            link.download = filename;
            
            if (isBlob) {
                if (imgData instanceof Blob) {
                    link.href = URL.createObjectURL(imgData);
                } else {
                    link.href = imgData;
                }
            } else {
                link.href = imgData;
            }
            
            // 模拟点击下载
            document.body.appendChild(link);
            link.click();
            
            // 清理
            setTimeout(() => {
                document.body.removeChild(link);
                if (isBlob && imgData instanceof Blob) {
                    URL.revokeObjectURL(link.href);
                }
            }, 100);
        } catch (e) {
            console.error('下载图像失败:', e);
            // 如果下载失败，使用全屏预览作为备选方案
            this.showImageInFullscreen(imgData, filename, isBlob);
        }
    }
    
    /**
     * 显示导出模态框
     * @param {string} message - 显示消息
     * @param {string} imgData - 图像数据URL
     * @param {string} filename - 文件名
     * @param {boolean} isBlob - 是否为Blob URL
     */
    showExportModal(message, imgData, filename, isBlob = false) {
        const exportModal = this.modalElement;
        const messageElement = document.getElementById('export-message');
        const imageContainer = document.getElementById('export-image-container');
        
        // 清空容器
        while (imageContainer.firstChild) {
            imageContainer.removeChild(imageContainer.firstChild);
        }
        
        // 设置消息
        messageElement.textContent = message;
        
        // 如果有图像数据，创建图像元素
        if (imgData) {
            // 创建图像或链接
            if (imgData.startsWith('data:image/svg')) {
                // SVG需要特殊处理
                const viewButton = document.createElement('a');
                viewButton.href = imgData;
                viewButton.textContent = '在新窗口查看SVG';
                viewButton.className = 'btn';
                viewButton.target = '_blank';
                viewButton.rel = 'noopener noreferrer';
                imageContainer.appendChild(viewButton);
            } else {
                // 常规图像
                const img = document.createElement('img');
                img.src = imgData;
                img.alt = filename;
                imageContainer.appendChild(img);
            }
        }
        
        // 显示模态框
        exportModal.classList.add('active');
        
        // 设置关闭按钮事件
        const closeBtn = document.getElementById('modal-close-btn');
        closeBtn.onclick = () => {
            exportModal.classList.remove('active');
            if (isBlob && imgData) {
                URL.revokeObjectURL(imgData);
            }
        };
    }
    
    /**
     * 更新导出模态框
     * @param {string} message - 显示消息
     * @param {string} imgData - 图像数据URL
     */
    updateExportModal(message, imgData) {
        const messageElement = document.getElementById('export-message');
        const imageContainer = document.getElementById('export-image-container');
        
        // 更新消息
        if (message) {
            messageElement.textContent = message;
        }
        
        // 更新图像
        if (imgData) {
            const img = imageContainer.querySelector('img');
            if (img) {
                img.src = imgData;
            } else {
                const newImg = document.createElement('img');
                newImg.src = imgData;
                imageContainer.appendChild(newImg);
            }
        }
    }
    
    /**
     * 在全屏模式下显示图像
     * @param {Blob|String} imgData - 图像数据
     * @param {String} filename - 文件名
     * @param {Boolean} isBlob - 是否为Blob对象
     */
    showImageInFullscreen(imgData, filename, isBlob = false) {
        try {
            // 创建全屏预览模态框
            let fullscreenModal = document.getElementById('fullscreen-modal');
            
            if (!fullscreenModal) {
                fullscreenModal = document.createElement('div');
                fullscreenModal.id = 'fullscreen-modal';
                fullscreenModal.className = 'fullscreen-modal';
                document.body.appendChild(fullscreenModal);
                
                // 添加关闭按钮
                const closeBtn = document.createElement('button');
                closeBtn.className = 'fullscreen-close-btn';
                closeBtn.innerHTML = '&times;';
                closeBtn.addEventListener('click', () => {
                    fullscreenModal.classList.remove('active');
                    setTimeout(() => {
                        if (fullscreenModal.parentNode) {
                            fullscreenModal.parentNode.removeChild(fullscreenModal);
                        }
                    }, 300);
                });
                fullscreenModal.appendChild(closeBtn);
                
                // 添加下载按钮
                const downloadBtn = document.createElement('button');
                downloadBtn.className = 'fullscreen-download-btn';
                downloadBtn.innerHTML = '下载';
                downloadBtn.addEventListener('click', () => {
                    this.downloadImage(imgData, filename, isBlob);
                });
                fullscreenModal.appendChild(downloadBtn);
                
                // 添加图像容器
                const imgContainer = document.createElement('div');
                imgContainer.className = 'fullscreen-img-container';
                fullscreenModal.appendChild(imgContainer);
                
                // 添加图像
                const img = document.createElement('img');
                img.className = 'fullscreen-img';
                
                if (isBlob) {
                    if (imgData instanceof Blob) {
                        img.src = URL.createObjectURL(imgData);
                    } else {
                        img.src = imgData;
                    }
                } else {
                    img.src = imgData;
                }
                
                imgContainer.appendChild(img);
            }
            
            // 显示模态框
            setTimeout(() => {
                fullscreenModal.classList.add('active');
            }, 10);
        } catch (e) {
            console.error('在全屏显示图像时出错:', e);
            alert('无法显示全屏预览，请尝试直接下载图像。');
        }
    }
    
    /**
     * 下载图像
     * @param {string|Blob} imgData - 图像数据
     * @param {string} filename - 文件名
     * @param {boolean} isBlob - 是否为Blob类型
     */
    downloadImage(imgData, filename, isBlob = false) {
        try {
            // 创建下载链接
            const link = document.createElement('a');
            link.download = filename;
            
            if (isBlob) {
                if (imgData instanceof Blob) {
                    link.href = URL.createObjectURL(imgData);
                } else {
                    link.href = imgData;
                }
            } else {
                link.href = imgData;
            }
            
            // 模拟点击下载
            document.body.appendChild(link);
            link.click();
            
            // 清理
            setTimeout(() => {
                document.body.removeChild(link);
                if (isBlob && imgData instanceof Blob) {
                    URL.revokeObjectURL(link.href);
                }
            }, 100);
        } catch (e) {
            console.error('下载图像失败:', e);
            alert('下载图像失败，请稍后重试。');
        }
    }
} 