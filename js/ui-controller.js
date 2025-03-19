/**
 * UI控制器模块
 * 管理用户界面交互和控制面板事件
 */
import { isMobileDevice, debounce } from './utils.js';

export class UIController {
    /**
     * 构造函数
     * @param {CanvasManager} canvasManager - 画布管理器实例
     * @param {LineGenerator} lineGenerator - 线条生成器实例
     * @param {ExportManager} exportManager - 导出管理器实例
     */
    constructor(canvasManager, lineGenerator, exportManager) {
        this.canvasManager = canvasManager;
        this.lineGenerator = lineGenerator;
        this.exportManager = exportManager;
        
        // 初始化是否完成标志
        this.initialized = false;
    }
    
    /**
     * 初始化UI控制器
     */
    initialize() {
        if (this.initialized) return;
        
        try {
            // 设置默认参数
            this.setupDefaultParams();
            
            // 设置事件监听
            this.setupEventListeners();
            
            // 设置窗口变化事件监听
            this.setupResizeEvents();
            
            // 如果是移动设备，初始化移动端菜单
            if (isMobileDevice()) {
                this.initializeMobileMenu();
            }
            
            // 更新元素说明
            this.updateLineModeDescription();
            this.updateColorModeDescription();
            
            // 标记初始化完成
            this.initialized = true;
            
            console.log('UI控制器初始化完成');
        } catch (e) {
            console.error('UI控制器初始化失败:', e);
        }
    }
    
    /**
     * 设置默认参数值
     */
    setupDefaultParams() {
        try {
            // 初始尺寸
            const widthInput = document.getElementById('width');
            const heightInput = document.getElementById('height');
            
            if (widthInput) widthInput.value = 500;
            if (heightInput) heightInput.value = 500;
            
            // 线条数量
            const lineCount = 8;
            const lineCountInput = document.getElementById('line-count');
            const lineCountValue = document.getElementById('line-count-value');
            
            if (lineCountInput) lineCountInput.value = lineCount;
            if (lineCountValue) lineCountValue.textContent = lineCount;
            
            // 线宽范围
            const minWidthInput = document.getElementById('min-width');
            const maxWidthInput = document.getElementById('max-width');
            const minWidthValue = document.getElementById('min-width-value');
            const maxWidthValue = document.getElementById('max-width-value');
            
            if (minWidthInput) minWidthInput.value = 0.5;
            if (maxWidthInput) maxWidthInput.value = 4;
            if (minWidthValue) minWidthValue.textContent = "0.5px";
            if (maxWidthValue) maxWidthValue.textContent = "4px";
            
            // 曲线强度
            const curveStrength = 30;
            const curveStrengthInput = document.getElementById('curve-strength');
            const curveStrengthValue = document.getElementById('curve-strength-value');
            
            if (curveStrengthInput) curveStrengthInput.value = curveStrength;
            if (curveStrengthValue) curveStrengthValue.textContent = `${curveStrength}%`;
            
            // 背景颜色与透明度
            const bgColorInput = document.getElementById('bg-color');
            const bgOpacityInput = document.getElementById('bg-opacity');
            const bgOpacityValue = document.getElementById('bg-opacity-value');
            
            if (bgColorInput) bgColorInput.value = "#ffffff";
            if (bgOpacityInput) bgOpacityInput.value = 100;
            if (bgOpacityValue) bgOpacityValue.textContent = "100%";
            
            // 更新描述文本
            this.updateLineModeDescription();
            this.updateColorModeDescription();
        } catch (e) {
            console.error('设置默认参数失败:', e);
        }
    }
    
    /**
     * 设置事件监听
     */
    setupEventListeners() {
        try {
            // 获取导出和重绘按钮元素
            const exportBtn = document.getElementById('export-btn');
            const regenerateBtn = document.getElementById('regenerate-btn');

            // 导出按钮点击事件
            if (exportBtn) {
                exportBtn.addEventListener('click', () => {
                    this.exportManager.exportImage();
                });
            }
            
            // 重绘按钮点击事件
            if (regenerateBtn) {
                regenerateBtn.addEventListener('click', () => {
                    this.regenerateLines();
                });
            }
            
            // 事件委托
            document.addEventListener('click', (e) => {
                // 关闭模态框按钮
                if (e.target.closest('#modal-close-btn')) {
                    const exportModal = document.getElementById('export-modal');
                    if (exportModal) exportModal.classList.remove('active');
                }
                
                // 重置背景颜色按钮
                if (e.target.closest('#reset-bg-color')) {
                    const bgColorInput = document.getElementById('bg-color');
                    const bgOpacityInput = document.getElementById('bg-opacity');
                    
                    if (bgColorInput) bgColorInput.value = '#ffffff';
                    if (bgOpacityInput) bgOpacityInput.value = 100;
                    
                    this.updateBackgroundColor();
                }
            });
            
            // 快捷尺寸选择
            const quickSizeSelector = document.getElementById('quick-size-selector');
            if (quickSizeSelector) {
                quickSizeSelector.addEventListener('change', (e) => {
                    const value = e.target.value;
                    if (value !== 'custom') {
                        const [width, height] = value.split('x').map(Number);
                        const widthInput = document.getElementById('width');
                        const heightInput = document.getElementById('height');
                        
                        if (widthInput) widthInput.value = width;
                        if (heightInput) heightInput.value = height;
                        
                        this.canvasManager.initializeCanvas(width, height);
                        this.regenerateLines();
                    }
                });
            }
            
            // 快捷曲线选择
            const quickCurveSelector = document.getElementById('quick-curve-selector');
            if (quickCurveSelector) {
                quickCurveSelector.addEventListener('change', (e) => {
                    const value = e.target.value;
                    if (value !== 'custom') {
                        const curveStrengthInput = document.getElementById('curve-strength');
                        const curveStrengthValue = document.getElementById('curve-strength-value');
                        
                        if (curveStrengthInput) curveStrengthInput.value = value;
                        // 更新显示值
                        if (curveStrengthValue) curveStrengthValue.textContent = `${value}%`;
                        
                        // 重绘线条
                        this.regenerateLines();
                    }
                });
            }
            
            // 宽高输入改变
            const sizeInputs = document.querySelectorAll('#width, #height');
            sizeInputs.forEach(input => {
                input.addEventListener('change', debounce((e) => {
                    const widthInput = document.getElementById('width');
                    const heightInput = document.getElementById('height');
                    
                    const width = widthInput ? parseInt(widthInput.value) : 500;
                    const height = heightInput ? parseInt(heightInput.value) : 500;
                    
                    // 重置自定义尺寸选择器
                    const quickSizeSelector = document.getElementById('quick-size-selector');
                    if (quickSizeSelector) quickSizeSelector.value = 'custom';
                    
                    // 初始化新画布
                    this.canvasManager.initializeCanvas(width, height);
                    this.regenerateLines();
                }, 300));
            });
            
            // 背景颜色改变
            document.getElementById('bg-color').addEventListener('input', () => {
                this.updateBackgroundColor();
            });
            
            // 背景透明度改变
            document.getElementById('bg-opacity').addEventListener('input', (e) => {
                // 更新显示值
                document.getElementById('bg-opacity-value').textContent = `${e.target.value}%`;
                this.updateBackgroundColor();
            });
            
            // 显示网格改变
            document.getElementById('show-grid').addEventListener('change', () => {
                this.drawCurrentScene();
            });
            
            // 显示模式改变
            document.getElementById('display-mode').addEventListener('change', () => {
                this.canvasManager.initializeCanvas();
                this.drawCurrentScene();
            });
            
            // 高质量模式改变
            document.getElementById('high-quality').addEventListener('change', () => {
                this.canvasManager.initializeCanvas();
                this.drawCurrentScene();
            });
            
            // 曲线强度改变
            document.getElementById('curve-strength').addEventListener('input', (e) => {
                // 更新显示值
                document.getElementById('curve-strength-value').textContent = `${e.target.value}%`;
                
                // 将选择器设置为自定义
                document.getElementById('quick-curve-selector').value = 'custom';
                
                // 重新生成线条
                this.regenerateLines();
            });
            
            // 线条数量改变
            document.getElementById('line-count').addEventListener('input', (e) => {
                // 更新显示值
                document.getElementById('line-count-value').textContent = e.target.value;
                this.updateStatusbar();
                
                // 重新生成线条
                this.regenerateLines();
            });
            
            // 线宽改变
            document.querySelectorAll('#min-width, #max-width').forEach(input => {
                input.addEventListener('input', (e) => {
                    // 更新值显示
                    const id = e.target.id;
                    const value = e.target.value;
                    if (id === 'min-width') {
                        document.getElementById('min-width-value').textContent = `${value}px`;
                    } else {
                        document.getElementById('max-width-value').textContent = `${value}px`;
                    }
                    
                    // 重新生成线条
                    this.regenerateLines();
                });
            });
            
            // 线条模式改变
            document.querySelectorAll('input[name="line-mode"]').forEach(radio => {
                radio.addEventListener('change', () => {
                    this.updateLineModeDescription();
                    // 重新生成线条
                    this.regenerateLines();
                });
            });
            
            // 颜色模式改变
            document.querySelectorAll('input[name="color-mode"]').forEach(radio => {
                radio.addEventListener('change', () => {
                    this.updateColorModeDescription();
                    // 重新生成线条
                    this.regenerateLines();
                });
            });
            
            // 线帽样式改变
            document.querySelectorAll('input[name="line-cap"]').forEach(radio => {
                radio.addEventListener('change', () => {
                    // 重新生成线条
                    this.regenerateLines();
                });
            });
            
            // 步进器按钮
            const stepperBtns = document.querySelectorAll('.stepper-btn');
            stepperBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const target = btn.dataset.target;
                    const action = btn.dataset.action;
                    const input = document.getElementById(target);
                    
                    if (input) {
                        let value = parseInt(input.value);
                        const step = input.step ? parseFloat(input.step) : 1;
                        const min = input.min ? parseFloat(input.min) : 0;
                        const max = input.max ? parseFloat(input.max) : 1000;
                        
                        if (action === 'increase') {
                            value = Math.min(value + step, max);
                        } else {
                            value = Math.max(value - step, min);
                        }
                        
                        input.value = value;
                        
                        // 触发change事件
                        const event = new Event('input');
                        input.dispatchEvent(event);
                    }
                });
            });
        } catch (e) {
            console.error('设置事件监听失败:', e);
        }
    }
    
    /**
     * 设置窗口变化事件监听
     */
    setupResizeEvents() {
        // 监听窗口尺寸变化
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                // 仅在非移动设备上触发（移动设备由TouchHandler处理）
                if (!isMobileDevice()) {
                    this.canvasManager.initializeCanvas();
                    this.drawCurrentScene();
                }
            }, 300);
        });
    }
    
    /**
     * 初始化移动设备菜单
     */
    initializeMobileMenu() {
        const menuToggle = document.getElementById('menu-toggle');
        const closePanel = document.getElementById('close-panel');
        const controlPanel = document.getElementById('control-panel');
        const overlay = document.getElementById('overlay');
        const body = document.body;
        
        function toggleMenu() {
            menuToggle.classList.toggle('active');
            controlPanel.classList.toggle('active');
            overlay.classList.toggle('active');
            body.classList.toggle('menu-open');
        }
        
        // 菜单按钮点击
        if (menuToggle) {
            menuToggle.addEventListener('click', toggleMenu);
        }
        
        // 关闭面板按钮点击
        if (closePanel) {
            closePanel.addEventListener('click', toggleMenu);
        }
        
        // 遮罩层点击
        if (overlay) {
            overlay.addEventListener('click', toggleMenu);
        }
        
        // 窗口大小改变时重置菜单状态
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                menuToggle.classList.remove('active');
                controlPanel.classList.remove('active');
                overlay.classList.remove('active');
                body.classList.remove('menu-open');
            }
        });
        
        // 为所有控制元素添加点击事件，移动设备上点击后自动关闭菜单
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
    
    /**
     * 重新生成线条
     */
    regenerateLines() {
        try {
            console.log('= 开始重新生成线条 =');
            
            // 获取线条数量
            const lineCountInput = document.getElementById('line-count');
            let lineCount = lineCountInput ? parseInt(lineCountInput.value) : 8;
            console.log('要生成的线条数量:', lineCount);
            
            // 获取当前的线条模式
            const lineModeElement = document.querySelector('input[name="line-mode"]:checked');
            const lineMode = lineModeElement ? lineModeElement.value : 'mixed';
            console.log('当前线条模式:', lineMode);
            
            // 获取当前的曲线强度
            const curveStrengthInput = document.getElementById('curve-strength');
            const curveStrength = curveStrengthInput ? parseInt(curveStrengthInput.value) : 50;
            console.log('当前曲线强度:', curveStrength);
            
            // 获取其他必要的参数
            const minWidthInput = document.getElementById('min-width');
            const maxWidthInput = document.getElementById('max-width');
            const minWidth = minWidthInput ? parseFloat(minWidthInput.value) : 1;
            const maxWidth = maxWidthInput ? parseFloat(maxWidthInput.value) : 5;
            console.log('线条宽度范围:', minWidth, '至', maxWidth);
            
            // 获取颜色模式
            const colorModeElement = document.querySelector('input[name="color-mode"]:checked');
            const colorMode = colorModeElement ? colorModeElement.value : 'theme';
            console.log('当前颜色模式:', colorMode);
            
            // 获取线帽样式
            const lineCapElement = document.querySelector('input[name="line-cap"]:checked');
            const lineCap = lineCapElement ? lineCapElement.value : 'butt';
            console.log('当前线帽样式:', lineCap);
            
            // 检查lineGenerator是否存在
            if (!this.lineGenerator) {
                console.error('lineGenerator未初始化!');
                return;
            }
            
            // 清除现有线条
            this.lineGenerator.clearLines();
            
            // 更新线条生成器的参数
            this.lineGenerator.setParams({
                lineMode,
                colorMode,
                minWidth,
                maxWidth,
                curveStrength,
                lineCap
            });
            console.log('已更新线条生成器参数');
            
            // 生成新线条
            for (let i = 0; i < lineCount; i++) {
                try {
                    const line = this.lineGenerator.generateLine();
                    // 将生成的线条添加到数组中
                    this.lineGenerator.lines.push(line);
                    if (i === 0 || i === lineCount - 1) {
                        console.log(`生成线条 #${i}:`, JSON.stringify(line));
                    }
                } catch (error) {
                    console.error(`生成第${i}条线时出错:`, error);
                }
            }
            
            // 绘制当前场景
            this.drawCurrentScene();
            console.log('场景已重新绘制');
            
            try {
                // 更新状态栏
                this.updateStatusbar();
                console.log('状态栏已更新');
            } catch (statusError) {
                console.error('更新状态栏时出错:', statusError);
            }
            
            try {
                // 保存设置
                this.saveSettings();
                console.log('设置已保存');
            } catch (saveError) {
                console.error('保存设置时出错:', saveError);
            }
            
            console.log('= 线条重新生成完成 =');
        } catch (error) {
            console.error('重新生成线条时出错:', error);
        }
    }
    
    /**
     * 绘制当前场景（背景、网格、线条）
     */
    drawCurrentScene() {
        try {
            // 清空画布
            this.canvasManager.clear();
            
            // 绘制背景
            const bgColor = document.getElementById('bg-color')?.value || '#ffffff';
            const bgOpacity = parseInt(document.getElementById('bg-opacity')?.value || '100');
            this.canvasManager.setBackground(bgColor, bgOpacity);
            
            // 如果设置了显示网格，绘制网格
            if (document.getElementById('show-grid')?.checked) {
                this.canvasManager.drawGrid();
            }
            
            // 绘制所有线条
            this.lineGenerator.drawAllLines();
        } catch (e) {
            console.error('绘制场景失败:', e);
        }
    }
    
    /**
     * 更新背景颜色
     */
    updateBackgroundColor() {
        const bgColor = document.getElementById('bg-color').value;
        const bgOpacity = parseInt(document.getElementById('bg-opacity').value);
        
        // 应用背景
        this.drawCurrentScene();
        
        // 保存设置
        this.saveSettings();
    }
    
    /**
     * 更新状态栏
     */
    updateStatusbar() {
        try {
            // 获取线条数量
            const lineCountInput = document.getElementById('line-count');
            const lineCount = lineCountInput ? parseInt(lineCountInput.value) : 0;
            
            // 获取画布尺寸
            const canvasSize = this.canvasManager.getSize();
            
            // 获取当前显示模式
            const displayModeSelect = document.getElementById('display-mode');
            let displayModeText = '自适应';
            
            if (displayModeSelect) {
                const displayMode = displayModeSelect.value;
                if (displayMode === 'auto') {
                    displayModeText = '自适应';
                } else if (displayMode === 'original') {
                    displayModeText = '原始尺寸';
                } else if (displayMode === 'fit-width') {
                    displayModeText = '适应宽度';
                } else if (displayMode === 'fit-height') {
                    displayModeText = '适应高度';
                } else if (displayMode === 'mixed') {
                    displayModeText = '混合模式';
                }
            }
            
            // 构建状态文本
            const statusText = `线条数: ${lineCount} / 画布尺寸: ${canvasSize.width}x${canvasSize.height} / 显示模式: ${displayModeText}`;
            
            // 更新移动端状态栏文本
            const statusTextElement = document.getElementById('status-text');
            if (statusTextElement) {
                statusTextElement.textContent = statusText;
            }
            
            // 更新PC端状态栏文本
            const pcStatusTextElement = document.getElementById('pc-status-text');
            if (pcStatusTextElement) {
                pcStatusTextElement.textContent = statusText;
            }
            
            // 更新线条模式描述
            this.updateLineModeDescription();
            
            console.log(`[UIController] 状态栏已更新: ${statusText}`);
        } catch (error) {
            console.error('[UIController] 更新状态栏失败:', error);
        }
    }
    
    /**
     * 更新线条模式描述
     */
    updateLineModeDescription() {
        try {
            const lineMode = document.querySelector('input[name="line-mode"]:checked');
            if (!lineMode) return;
            
            const mode = lineMode.value;
            const lineModeDisplay = document.getElementById('line-mode-display');
            const pcLineModeDisplay = document.getElementById('pc-line-mode');
            
            let description;
            
            switch (mode) {
                case 'straight':
                    description = '直线模式';
                    break;
                case 'curved':
                    description = '曲线模式';
                    break;
                case 'mixed':
                    description = '混合模式';
                    break;
                case 'through':
                    description = '贯穿模式';
                    break;
                case 'random':
                    description = '随机模式';
                    break;
                default:
                    description = '随机模式';
            }
            
            // 更新移动端显示
            if (lineModeDisplay) {
                lineModeDisplay.textContent = description;
            }
            
            // 更新PC端显示
            if (pcLineModeDisplay) {
                pcLineModeDisplay.textContent = description;
            }
            
            console.log(`[UIController] 线条模式描述已更新: ${description}`);
        } catch (error) {
            console.error('[UIController] 更新线条模式描述失败:', error);
        }
    }
    
    /**
     * 更新颜色模式描述
     */
    updateColorModeDescription() {
        try {
            const mode = document.querySelector('input[name="color-mode"]:checked')?.value || 'black';
            let description = '';
            
            switch (mode) {
                case 'black':
                    description = '使用统一的黑色线条';
                    break;
                case 'theme':
                    description = '使用蓝色、绿色或紫红色系的主题颜色';
                    break;
                case 'random':
                    description = '为每条线使用随机颜色';
                    break;
            }
            
            const tipElement = document.getElementById('color-tip');
            if (tipElement) {
                tipElement.textContent = description;
            }
        } catch (e) {
            console.error('更新颜色模式描述失败:', e);
        }
    }
    
    /**
     * 保存设置到localStorage
     */
    saveSettings() {
        try {
            console.log('= 开始保存设置 =');
            
            // 创建设置对象
            const settings = {};
            
            // 收集设置
            const widthInput = document.getElementById('width');
            const heightInput = document.getElementById('height');
            const lineCountInput = document.getElementById('line-count');
            const minWidthInput = document.getElementById('min-width');
            const maxWidthInput = document.getElementById('max-width');
            const curveStrengthInput = document.getElementById('curve-strength');
            
            // 获取当前的线条模式
            const lineModeElement = document.querySelector('input[name="line-mode"]:checked');
            console.log('当前线条模式元素:', lineModeElement);
            
            // 获取当前的颜色模式
            const colorModeElement = document.querySelector('input[name="color-mode"]:checked');
            console.log('当前颜色模式元素:', colorModeElement);
            
            // 获取当前的线帽样式
            const lineCapElement = document.querySelector('input[name="line-cap"]:checked');
            console.log('当前线帽样式元素:', lineCapElement);
            
            // 获取背景设置
            const bgColorInput = document.getElementById('bg-color');
            const bgOpacityInput = document.getElementById('bg-opacity');
            
            // 获取显示网格设置
            const showGridCheckbox = document.getElementById('show-grid');
            
            // 获取交互动画设置
            const interactiveCheckbox = document.getElementById('interactive');
            
            // 设置值
            if (widthInput) settings.width = parseInt(widthInput.value);
            if (heightInput) settings.height = parseInt(heightInput.value);
            if (lineCountInput) settings.lineCount = parseInt(lineCountInput.value);
            if (minWidthInput) settings.minWidth = parseFloat(minWidthInput.value);
            if (maxWidthInput) settings.maxWidth = parseFloat(maxWidthInput.value);
            if (curveStrengthInput) settings.curveStrength = parseInt(curveStrengthInput.value);
            if (lineModeElement) settings.lineMode = lineModeElement.value;
            if (colorModeElement) settings.colorMode = colorModeElement.value;
            if (lineCapElement) settings.lineCap = lineCapElement.value;
            if (bgColorInput) settings.bgColor = bgColorInput.value;
            if (bgOpacityInput) settings.bgOpacity = parseInt(bgOpacityInput.value);
            if (showGridCheckbox) settings.showGrid = showGridCheckbox.checked;
            if (interactiveCheckbox) settings.interactive = interactiveCheckbox.checked;
            
            console.log('要保存的设置:', settings);
            localStorage.setItem('line-art-settings', JSON.stringify(settings));
            console.log('= 设置保存完成 =');
        } catch (error) {
            console.error('保存设置时出错:', error);
        }
    }
    
    /**
     * 从localStorage加载设置
     */
    loadSettings() {
        try {
            console.log('= 开始加载设置 =');
            const savedSettings = localStorage.getItem('line-art-settings');
            if (!savedSettings) {
                console.log('没有找到保存的设置');
                return;
            }
            
            const settings = JSON.parse(savedSettings);
            console.log('已加载设置:', settings);
            
            // 加载宽高设置
            const widthInput = document.getElementById('width');
            const heightInput = document.getElementById('height');
            
            if (settings.width && widthInput) widthInput.value = settings.width;
            if (settings.height && heightInput) heightInput.value = settings.height;
            
            // 加载线条数量
            const lineCountInput = document.getElementById('line-count');
            const lineCountValue = document.getElementById('line-count-value');
            
            if (settings.lineCount && lineCountInput) {
                lineCountInput.value = settings.lineCount;
                if (lineCountValue) lineCountValue.textContent = settings.lineCount;
            }
            
            // 加载线条模式
            if (settings.lineMode) {
                console.log('设置线迹模式:', settings.lineMode);
                const modeRadio = document.querySelector(`input[name="line-mode"][value="${settings.lineMode}"]`);
                if (modeRadio) {
                    console.log('找到线迹模式按钮，设置选中状态');
                    modeRadio.checked = true;
                    // 触发change事件以更新描述
                    const event = new Event('change');
                    modeRadio.dispatchEvent(event);
                } else {
                    console.warn('未找到线迹模式按钮:', settings.lineMode);
                }
            }
            
            // 加载曲线强度
            const curveStrengthInput = document.getElementById('curve-strength');
            const curveStrengthValue = document.getElementById('curve-strength-value');
            
            if (settings.curveStrength && curveStrengthInput) {
                curveStrengthInput.value = settings.curveStrength;
                if (curveStrengthValue) curveStrengthValue.textContent = `${settings.curveStrength}%`;
            }
            
            // 加载颜色模式
            if (settings.colorMode) {
                console.log('设置颜色模式:', settings.colorMode);
                const colorRadio = document.querySelector(`input[name="color-mode"][value="${settings.colorMode}"]`);
                if (colorRadio) {
                    console.log('找到颜色模式按钮，设置选中状态');
                    colorRadio.checked = true;
                    // 触发change事件以更新描述
                    const event = new Event('change');
                    colorRadio.dispatchEvent(event);
                } else {
                    console.warn('未找到颜色模式按钮:', settings.colorMode);
                }
            }
            
            // 加载线宽设置
            const minWidthInput = document.getElementById('min-width');
            const maxWidthInput = document.getElementById('max-width');
            const minWidthValue = document.getElementById('min-width-value');
            const maxWidthValue = document.getElementById('max-width-value');
            
            if (settings.minWidth && minWidthInput) {
                minWidthInput.value = settings.minWidth;
                if (minWidthValue) minWidthValue.textContent = `${settings.minWidth}px`;
            }
            
            if (settings.maxWidth && maxWidthInput) {
                maxWidthInput.value = settings.maxWidth;
                if (maxWidthValue) maxWidthValue.textContent = `${settings.maxWidth}px`;
            }
            
            // 加载线帽样式
            if (settings.lineCap) {
                const lineCapRadio = document.querySelector(`input[name="line-cap"][value="${settings.lineCap}"]`);
                if (lineCapRadio) {
                    lineCapRadio.checked = true;
                }
            }
            
            // 加载背景设置
            const bgColorInput = document.getElementById('bg-color');
            const bgOpacityInput = document.getElementById('bg-opacity');
            const bgOpacityValue = document.getElementById('bg-opacity-value');
            
            if (settings.bgColor && bgColorInput) bgColorInput.value = settings.bgColor;
            if (settings.bgOpacity !== undefined && bgOpacityInput) {
                bgOpacityInput.value = settings.bgOpacity;
                if (bgOpacityValue) bgOpacityValue.textContent = `${settings.bgOpacity}%`;
            }
            
            // 加载显示网格设置
            const showGridCheckbox = document.getElementById('show-grid');
            if (settings.showGrid !== undefined && showGridCheckbox) {
                showGridCheckbox.checked = settings.showGrid;
            }
            
            // 加载高质量设置
            const highQualityCheckbox = document.getElementById('high-quality');
            if (settings.highQuality !== undefined && highQualityCheckbox) {
                highQualityCheckbox.checked = settings.highQuality;
            }
            
            // 加载显示模式
            if (settings.displayMode) {
                const displayModeSelect = document.getElementById('display-mode');
                if (displayModeSelect) {
                    displayModeSelect.value = settings.displayMode;
                    // 触发change事件
                    const event = new Event('change');
                    displayModeSelect.dispatchEvent(event);
                }
            }
            
            // 更新UI显示
            this.updateLineModeDescription();
            this.updateColorModeDescription();
            this.updateBackgroundColor();
            
            console.log('设置加载完成');
        } catch (e) {
            console.error('加载设置失败:', e);
        }
    }
} 