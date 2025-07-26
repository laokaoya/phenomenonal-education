// Main Application Logic for Phenomenal Learning Platform

class PhenomenalLearningApp {
    constructor() {
        this.currentUser = null;
        this.currentJourney = null;
        this.currentPage = 'home';
        this.constellationRenderer = null;
        this.journeyRenderer = null;
        this.whiteboard = null;
        this.currentExploration = null; // 当前选中的exploration
        
        this.init();
    }

    async init() {
        // Load user data
        this.currentUser = User.load();
        
        // Setup navigation
        this.setupNavigation();
        
        // Setup modals
        this.setupModals();
        
        // Load initial page
        this.loadPage('home');
        
        // Setup periodic updates
        this.setupPeriodicUpdates();
        
        console.log('Phenomenal Learning Platform initialized');
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                this.loadPage(page);
                
                // Update active nav state
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });

        // Mobile nav toggle
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        
        if (navToggle) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
            });
        }
    }

    setupModals() {
        // New journey form
        const newJourneyForm = document.getElementById('new-journey-form');
        if (newJourneyForm) {
            newJourneyForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.createNewJourney();
            });
        }

        // Edit profile form
        const editProfileForm = document.getElementById('edit-profile-form');
        if (editProfileForm) {
            editProfileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveProfile();
            });
        }

        // Edit profile button
        const editProfileBtn = document.getElementById('edit-profile-btn');
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', () => {
                this.showEditProfileModal();
            });
        }

        // Avatar upload functionality
        this.setupAvatarUpload();
        
        // Avatar delete functionality
        this.setupAvatarDelete();
        
        // Email edit functionality
        this.setupEmailEdit();

        // Tab switching in node editor
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.getAttribute('data-tab');
                this.switchTab(tabName);
                
                // Update active tab
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

    setupPeriodicUpdates() {
        // Update stats every 30 seconds
        setInterval(() => {
            this.updateStats();
        }, 30000);
    }

    loadPage(pageName) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // Show selected page
        const targetPage = document.getElementById(`${pageName}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = pageName;
            
            // Load page-specific content
            this.loadPageContent(pageName);
        }
    }

    async loadPageContent(pageName) {
        switch (pageName) {
            case 'home':
                await this.loadHomePage();
                break;
            case 'journey':
                await this.loadJourneyPage();
                break;
            case 'community':
                await this.loadCommunityPage();
                break;
            case 'sync':
                await this.loadSyncPage();
                break;
            case 'profile':
                await this.loadProfilePage();
                break;
        }
    }

    async loadHomePage() {
        // Update daily quote
        this.updateDailyQuote();
        
        // Load constellation preview
        if (!this.constellationRenderer) {
            this.constellationRenderer = new ConstellationRenderer('constellation-canvas');
        }
        
        // Update stats
        this.updateStats();
        
        // Load recent resonances
        this.loadRecentResonances();
        
        // Load community preview
        this.loadCommunityPreview();
    }

    async loadJourneyPage() {
        // Initialize journey canvas
        if (!this.journeyRenderer) {
            this.journeyRenderer = new ConstellationRenderer('journey-canvas');
        }
        
        // Load user journeys
        this.loadUserJourneys();
        
        // If there's a current journey, display it
        if (this.currentJourney) {
            this.journeyRenderer.setJourney(this.currentJourney);
            this.displayCurrentJourney();
        }
    }

    async loadCommunityPage() {
        // Load resonance feed
        this.loadResonanceFeed();
        
        // Load dialogue circles
        this.loadDialogueCircles();
    }

    async loadSyncPage() {
        // Load active sessions
        this.loadActiveSessions();
        
        // Initialize whiteboard if needed
        if (document.getElementById('lab-canvas') && !this.whiteboard) {
            this.whiteboard = new VirtualWhiteboard('lab-canvas');
            this.setupWhiteboardTools();
        }
    }

    async loadProfilePage() {
        // Update profile info
        this.updateProfileInfo();
        
        // Load preferences
        this.loadUserPreferences();
        
        // Update resonance profile
        this.updateResonanceProfile();
    }

    updateDailyQuote() {
        const quotes = [
            "What is the most profound question that emerges from your current understanding?",
            "How might your perspective shift if you approached this from a place of wonder rather than certainty?",
            "What assumptions are you carrying that you haven't questioned today?",
            "In what ways does your emotional state shape your perception of truth?",
            "What would you discover if you listened to the silence between your thoughts?"
        ];
        
        const today = new Date().toDateString();
        const quoteIndex = today.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % quotes.length;
        
        const quoteElement = document.getElementById('daily-quote');
        if (quoteElement) {
            quoteElement.textContent = quotes[quoteIndex];
        }
    }

    updateStats() {
        const stats = storage.getJourneyStats();
        
        const elements = {
            'active-journeys': stats.activeJourneys,
            'total-journeys': stats.totalJourneys,
            'total-insights': stats.totalInsights,
            'total-resonances': 0 // Would be calculated from resonance data
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }

    loadRecentResonances() {
        const container = document.getElementById('recent-resonances');
        if (!container) return;
        
        // Mock resonance data for demo
        const mockResonances = [
            { type: 'journey', title: 'Similar exploration on consciousness', score: 0.85 },
            { type: 'insight', title: 'Related insight about phenomenology', score: 0.72 },
            { type: 'question', title: 'Complementary question on perception', score: 0.68 }
        ];
        
        if (mockResonances.length === 0) {
            container.innerHTML = '<p class="empty-state">No resonances yet. Start exploring!</p>';
            return;
        }
        
        container.innerHTML = mockResonances.map(resonance => `
            <div class="resonance-item">
                <strong>${resonance.title}</strong>
                <span class="resonance-score">${(resonance.score * 100).toFixed(0)}%</span>
            </div>
        `).join('');
    }

    loadCommunityPreview() {
        const container = document.getElementById('community-preview');
        if (!container) return;
        
        const publicJourneys = LearningJourney.loadAll().filter(j => j.isPublic).slice(0, 3);
        
        if (publicJourneys.length === 0) {
            container.innerHTML = '<p class="empty-state">Discover journeys from other learners</p>';
            return;
        }
        
        container.innerHTML = publicJourneys.map(journey => `
            <div class="community-item" onclick="app.openJourneyDetail('${journey.id}')">
                <strong>${journey.title}</strong>
                <p>${journey.coreQuestion}</p>
            </div>
        `).join('');
    }

    loadUserJourneys() {
        const journeys = LearningJourney.loadAll();
        
        // Update current journey display
        if (journeys.length > 0 && !this.currentJourney) {
            this.currentJourney = journeys[0];
        }
        
        // Update journey sidebar
        this.displayCurrentJourney();
    }

    displayCurrentJourney() {
        const currentJourneyEl = document.getElementById('current-journey');
        const journeyNodesEl = document.getElementById('journey-nodes');
        
        if (!this.currentJourney) {
            if (currentJourneyEl) {
                currentJourneyEl.innerHTML = `
                    <h3>Select a Journey</h3>
                    <p>Create a new journey or select an existing one to explore</p>
                `;
            }
            if (journeyNodesEl) {
                journeyNodesEl.innerHTML = '';
            }
            return;
        }
        
        if (currentJourneyEl) {
            // 获取Home页输入和选项（假设保存在currentJourney.metadata.homeWord和homeOptions）
            const homeWord = this.currentJourney.metadata?.homeWord || this.currentJourney.title;
            const homeOptions = this.currentJourney.metadata?.homeOptions || [];
            let optionsHtml = '';
            if (Array.isArray(homeOptions) && homeOptions.length > 0) {
                optionsHtml = `<div class="journey-home-options">${homeOptions.map(opt => `<span class='home-option-badge'>${opt}</span>`).join('')}</div>`;
            }
            // 获取当前探索的angle
            let currentExplorationText = this.currentJourney.coreQuestion;
            if (this.currentExploration && this.currentExploration.content) {
                if (this.currentExploration.content.startsWith('Q: ')) {
                    currentExplorationText = this.currentExploration.content.substring(3);
                } else {
                    currentExplorationText = this.currentExploration.content;
                }
            }
            
            currentJourneyEl.innerHTML = `
                <div class="journey-home-header">
                  <div class="home-word-title">${homeWord}</div>
                  ${optionsHtml}
                </div>
                <div class="journey-meta">
                  <span class="meta-label">当前探索：</span>${currentExplorationText}
                </div>
            `;
        }
        
        if (journeyNodesEl) {
            journeyNodesEl.innerHTML = '';
            const nodes = this.currentJourney.getNodes();
            
            if (nodes.length > 0) {
                // 获取当前可见的节点数量
                const visibleCount = this.journeyRenderer ? this.journeyRenderer.getVisibleNodesCount() : 1;
                
                // 只显示当前可见的节点
                for (let i = 0; i < Math.min(visibleCount, nodes.length); i++) {
                    const node = nodes[i];
                    const card = document.createElement('div');
                    card.className = 'node-card';
                    if (i === 0) card.classList.add('highlight');
                    card.innerHTML = `
                        <h5>${node.title}</h5>
                        <p>${node.content.substring(0, 100)}${node.content.length > 100 ? '...' : ''}</p>
                        <span class="node-type-badge">start</span>
                        <div class="node-index">${i + 1}</div>
                    `;
                    card.addEventListener('click', () => {
                        this.showExplorationDialog(node);
                    });
                    journeyNodesEl.appendChild(card);
                }
                
                // 如果还有更多节点未显示，显示"继续探索"提示
                if (visibleCount < nodes.length) {
                    const continuePrompt = document.createElement('div');
                    continuePrompt.className = 'continue-prompt';
                    continuePrompt.innerHTML = `
                        <div class="prompt-content">
                            <i class="fas fa-arrow-right"></i>
                            <span>完成当前探索后，下一个探索将自动出现</span>
                        </div>
                    `;
                    journeyNodesEl.appendChild(continuePrompt);
                }
                
                // 删除创建新 Exploration 按钮
            }
        }
    }

    // 新增：创建新的 Exploration
    createNewExploration() {
        console.log('createNewExploration函数被调用');
        console.log('当前journey:', this.currentJourney);
        console.log('创建新exploration前的计数:', this.currentJourney?.metadata?.explorationCount);
        
        // 先增加exploration计数
        incrementExplorationCount(this.currentJourney);
        
        console.log('创建新exploration后的计数:', this.currentJourney?.metadata?.explorationCount);
        
        // 获取下一个exploration的角度
        const nextAngle = getNextExplorationAngle(this.currentJourney);
        const question = prompt(`请输入新的探索问题（建议角度：${nextAngle}）：`);
        if (!question) return;
        
        // 记录已使用的角度
        if (this.currentJourney && this.currentJourney.metadata) {
            const explorationCount = this.currentJourney.metadata.explorationCount || 0;
            if (explorationCount > 1) { // 从第二个exploration开始记录
                recordUsedAngle(this.currentJourney, nextAngle);
            }
        }
        
        let difyAnswer = '';
        // 调用 Dify API 获取回答
        window.callDifyWorkflow(question).then(answer => {
            difyAnswer = answer;
            
            // 创建新的 exploration 节点
            const node = new LearningNode({
                journeyId: this.currentJourney.id,
                title: `探索 ${this.currentJourney.getNodes().length + 1}`,
                content: `Q: ${question}\nA: ${difyAnswer}`,
                type: 'exploration',
                position: {
                    x: 100 + Math.random() * 400,
                    y: 100 + Math.random() * 300
                }
            });
            
            this.currentJourney.addNode(node);
            
            // 更新显示
            this.displayCurrentJourney();
            if (this.journeyRenderer) {
                this.journeyRenderer.setJourney(this.currentJourney);
            }
            
            // 自动打开新创建的 exploration 对话
            setTimeout(() => {
                this.showExplorationDialog(node);
            }, 100);
            
        }).catch(err => {
            alert('创建新 Exploration 失败: ' + err.message);
        });
    }

    // 新增：弹出 exploration 对话/分享弹窗
    showExplorationDialog(node) {
        console.log('showExplorationDialog被调用，node:', node);
        console.log('node.mode:', node?.mode);
        
        // 更新当前选中的exploration
        this.currentExploration = node;
        this.displayCurrentJourney(); // 刷新右上角显示
        
        // 检查是否已存在弹窗
        let dialog = document.getElementById('exploration-dialog-modal');
        if (!dialog) {
            dialog = document.createElement('div');
            dialog.id = 'exploration-dialog-modal';
            dialog.className = 'modal show';
            document.body.appendChild(dialog);
        }
        
        const mode = node.mode || '探索互动';
        console.log('设置dialog标题为:', mode);
        
        // 获取exploration的angle
        let explorationAngle = '继续探索当前主题';
        if (node && node.content) {
            if (node.content.startsWith('Q: ')) {
                explorationAngle = node.content.substring(3); // 去掉"Q: "前缀
            } else {
                explorationAngle = node.content;
            }
        }
        
        dialog.innerHTML = `
            <div class="modal-content material-design">
                <div class="modal-header material-header">
                    <div class="header-content">
                        <div class="header-icon">
                            <i class="fas fa-lightbulb"></i>
                        </div>
                        <div class="header-text">
                            <h3>${mode}</h3>
                            <p>${explorationAngle}</p>
                        </div>
                    </div>
                    <button class="modal-close material-close" id="close-exploration-dialog">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body material-body">
                    <div id="exploration-dialog-history" class="chat-history"></div>
                    <div id="exploration-dialog-input-section" class="input-section">
                        <div class="input-container">
                            <textarea id="exploration-dialog-input" class="material-input" placeholder="输入你的问题..."></textarea>
                            <div class="input-actions">
                                <button class="btn-material primary" id="exploration-dialog-ask">
                                    <i class="fas fa-question-circle"></i>
                                    <span>提问</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div id="exploration-dialog-reflection-section" class="input-section" style="display:none;">
                        <div class="input-container">
                            <textarea id="exploration-dialog-reflection-input" class="material-input" placeholder="输入你的感悟或反思..."></textarea>
                            <div class="input-actions">
                                <button class="btn-material secondary" id="exploration-dialog-share">
                                    <i class="fas fa-heart"></i>
                                    <span>分享感悟</span>
                                </button>
                                <button class="btn-material reflection" id="exploration-dialog-reflection">
                                    <i class="fas fa-brain"></i>
                                    <span>深度反思</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div id="exploration-dialog-explored" class="explored-status" style="display:none;">
                        <div class="status-content">
                            <i class="fas fa-check-circle"></i>
                            <span>已探索</span>
                        </div>
                    </div>
                    <div id="exploration-dialog-status" class="status-message"></div>
                </div>
            </div>
        `;
        
        dialog.classList.add('show');

        // 为每个节点维护独立的对话状态
        if (!this.nodeDialogStates) {
            this.nodeDialogStates = new Map();
        }
        
        // 获取或创建节点的对话状态
        let nodeState = this.nodeDialogStates.get(node.id);
        if (!nodeState) {
            nodeState = {
                hasAskedQuestion: false,
                history: []
            };
            this.nodeDialogStates.set(node.id, nodeState);
        }

        // 初始化对话状态
        const statusDiv = document.getElementById('exploration-dialog-status');
        const askBtn = document.getElementById('exploration-dialog-ask');
        const inputSection = document.getElementById('exploration-dialog-input-section');
        const reflectionSection = document.getElementById('exploration-dialog-reflection-section');
        const exploredDiv = document.getElementById('exploration-dialog-explored');
        
        // 根据节点状态设置界面
        if (nodeState.hasAskedQuestion) {
            // 如果已经提问过，显示反思界面
            inputSection.style.display = 'none';
            reflectionSection.style.display = 'block';
            exploredDiv.style.display = 'flex';
            statusDiv.innerHTML = '<span class="success-text">✓ 探索完成，可以继续反思</span>';
        } else {
            // 如果还没提问，只显示提问界面
            inputSection.style.display = 'block';
            reflectionSection.style.display = 'none';
            exploredDiv.style.display = 'none';
            statusDiv.innerHTML = '';
        }
        
        // 初始化历史
        const historyDiv = document.getElementById('exploration-dialog-history');
        
        // 如果有保存的历史记录，使用它；否则显示初始问答
        if (nodeState.history.length > 0) {
            historyDiv.innerHTML = nodeState.history.join('');
        } else {
            // 显示加载状态
            historyDiv.innerHTML = `
                <div class="message ai-message">
                    <div class="message-avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="message-content">
                        <div class="message-header">
                            <span class="message-author">AI 助手</span>
                            <span class="message-time">${new Date().toLocaleTimeString()}</span>
                        </div>
                        <div class="message-text">
                            <i class="fas fa-spinner fa-spin"></i> 正在准备探索...
                        </div>
                    </div>
                </div>
            `;
            
            // 异步获取Dify的回答
            this.getInitialDifyResponse(node, historyDiv, nodeState);
        }
        
        // 关闭按钮
        document.getElementById('close-exploration-dialog').onclick = () => {
            dialog.classList.remove('show');
        };
        
        // 提问按钮 - 根据模式决定是否允许多轮对话
        askBtn.onclick = async () => {
            const isMultiTurnMode = node.mode === '提问模式' || node.mode === '游戏模式';
            
            if (!isMultiTurnMode && nodeState.hasAskedQuestion) {
                this.showMaterialToast('每个 exploration 只能提问一次。请创建新的 exploration 来继续提问。', 'warning');
                return;
            }
            
            const input = document.getElementById('exploration-dialog-input').value.trim();
            if (!input) return;
            
            // 添加用户消息
            const userMessage = `
                <div class="message user-message">
                    <div class="message-content">
                        <div class="message-header">
                            <span class="message-author">你</span>
                            <span class="message-time">${new Date().toLocaleTimeString()}</span>
                        </div>
                        <div class="message-text">${input}</div>
                    </div>
                    <div class="message-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                </div>
            `;
            historyDiv.innerHTML += userMessage;
            nodeState.history.push(userMessage);
            document.getElementById('exploration-dialog-input').value = '';
            
            // 显示加载状态
            const loadingMessage = `
                <div class="message ai-message loading">
                    <div class="message-avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="message-content">
                        <div class="message-text">
                            <div class="loading-dots">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            historyDiv.innerHTML += loadingMessage;
            historyDiv.scrollTop = historyDiv.scrollHeight;
            
            // 调用新的Exploration Dify API
            let answer = '';
            try {
                // 从节点内容中提取角度
                let angle = '继续探索当前主题';
                if (node && node.content) {
                    if (node.content.startsWith('Q: ')) {
                        angle = node.content.substring(3); // 去掉"Q: "前缀
                    }
                }
                
                const mode = node.mode || '解释模式';
                console.log('调用Exploration Dify，参数:', { angle, mode, userInput: input });
                
                answer = await window.callDifyExploration(angle, mode, input);
            } catch (err) {
                answer = 'Exploration Dify API 调用失败: ' + err.message;
            }
            
            // 移除加载状态，添加 AI 回复
            const loadingElement = historyDiv.querySelector('.loading');
            if (loadingElement) {
                loadingElement.remove();
            }
            
            const aiMessage = `
                <div class="message ai-message">
                    <div class="message-avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="message-content">
                        <div class="message-header">
                            <span class="message-author">AI 助手</span>
                            <span class="message-time">${new Date().toLocaleTimeString()}</span>
                        </div>
                        <div class="message-text">${answer}</div>
                    </div>
                </div>
            `;
            historyDiv.innerHTML += aiMessage;
            nodeState.history.push(aiMessage);
            historyDiv.scrollTop = historyDiv.scrollHeight;
            
            // 根据模式决定后续行为
            
            if (isMultiTurnMode) {
                // 多轮对话模式：保持输入界面，添加"开启下一轮探索"按钮
                inputSection.style.display = 'block';
                reflectionSection.style.display = 'none';
                exploredDiv.style.display = 'none';
                
                // 移除已存在的"开启下一轮探索"按钮
                const existingNextRoundBtn = document.querySelector('.next-round-btn');
                if (existingNextRoundBtn) {
                    existingNextRoundBtn.remove();
                }
                
                // 添加"开启下一轮探索"按钮
                const nextRoundBtn = document.createElement('button');
                nextRoundBtn.className = 'btn-material primary next-round-btn';
                nextRoundBtn.innerHTML = '<i class="fas fa-arrow-right"></i><span>开启下一轮探索</span>';
                nextRoundBtn.onclick = () => {
                    // 关闭当前对话窗口
                    const dialog = document.getElementById('exploration-dialog');
                    if (dialog) {
                        dialog.style.display = 'none';
                    }
                    
                    // 显示下一个exploration节点
                    this.showNextExploration();
                    
                    // 显示成功提示
                    this.showMaterialToast('已开启下一轮探索', 'success');
                };
                
                // 将按钮插入到输入区域
                const inputActions = document.querySelector('#exploration-dialog-input-section .input-actions');
                inputActions.appendChild(nextRoundBtn);
                
                statusDiv.innerHTML = '<span class="info-text">💬 可以继续对话或开启下一轮探索</span>';
            } else {
                // 单轮对话模式：切换到反思界面
                nodeState.hasAskedQuestion = true;
                inputSection.style.display = 'none';
                reflectionSection.style.display = 'block';
                exploredDiv.style.display = 'flex';
                statusDiv.innerHTML = '<span class="success-text">✓ 探索完成，可以继续反思</span>';
                
                // 延迟显示下一个节点
                setTimeout(() => {
                    this.showNextExploration();
                }, 2000); // 2秒后显示下一个
            }
        };
        
        // 分享感悟按钮 - 无限制
        document.getElementById('exploration-dialog-share').onclick = () => {
            const input = document.getElementById('exploration-dialog-reflection-input').value.trim();
            if (!input) return;
            
            const shareMessage = `
                <div class="message user-message">
                    <div class="message-content">
                        <div class="message-header">
                            <span class="message-author">你</span>
                            <span class="message-time">${new Date().toLocaleTimeString()}</span>
                        </div>
                        <div class="message-text">
                            <strong>我的感悟:</strong> ${input}
                        </div>
                    </div>
                    <div class="message-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                </div>
            `;
            historyDiv.innerHTML += shareMessage;
            nodeState.history.push(shareMessage);
            document.getElementById('exploration-dialog-reflection-input').value = '';
            historyDiv.scrollTop = historyDiv.scrollHeight;
        };
        
        // 反思按钮 - 弹出新输入界面
        document.getElementById('exploration-dialog-reflection').onclick = () => {
            this.showReflectionInput(node, historyDiv, nodeState);
        };
    }

    // 新增：显示反思输入界面
    showReflectionInput(node, historyDiv, nodeState) {
        // 创建反思输入弹窗
        let reflectionDialog = document.getElementById('reflection-input-modal');
        if (!reflectionDialog) {
            reflectionDialog = document.createElement('div');
            reflectionDialog.id = 'reflection-input-modal';
            reflectionDialog.className = 'modal show';
            reflectionDialog.innerHTML = `
                <div class="modal-content material-design">
                    <div class="modal-header material-header">
                        <div class="header-content">
                            <div class="header-icon">
                                <i class="fas fa-mirror"></i>
                            </div>
                            <div class="header-text">
                                <h3>记录反思</h3>
                                <p>记录你的反思、感悟或新的发现</p>
                            </div>
                        </div>
                        <button class="modal-close material-close" id="close-reflection-input">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body material-body">
                        <div class="form-group">
                            <label class="material-label">反思内容</label>
                            <textarea id="reflection-content" class="material-textarea" rows="6" placeholder="记录你的反思、感悟或新的发现..."></textarea>
                        </div>
                        <div class="form-actions">
                            <button class="btn-material outline" id="cancel-reflection">取消</button>
                            <button class="btn-material primary" id="save-reflection">保存反思</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(reflectionDialog);
        } else {
            reflectionDialog.classList.add('show');
        }

        // 关闭按钮
        document.getElementById('close-reflection-input').onclick = () => {
            reflectionDialog.classList.remove('show');
        };
        
        // 取消按钮
        document.getElementById('cancel-reflection').onclick = () => {
            reflectionDialog.classList.remove('show');
        };
        
        // 保存反思按钮
        document.getElementById('save-reflection').onclick = () => {
            const reflectionContent = document.getElementById('reflection-content').value.trim();
            if (!reflectionContent) {
                this.showMaterialToast('请输入反思内容', 'warning');
                return;
            }
            
            // 添加到历史记录
            const reflectionMessage = `
                <div class="message user-message reflection">
                    <div class="message-content">
                        <div class="message-header">
                            <span class="message-author">你</span>
                            <span class="message-time">${new Date().toLocaleTimeString()}</span>
                        </div>
                        <div class="message-text">
                            <strong>我的反思:</strong> ${reflectionContent}
                        </div>
                    </div>
                    <div class="message-avatar">
                        <i class="fas fa-mirror"></i>
                    </div>
                </div>
            `;
            historyDiv.innerHTML += reflectionMessage;
            if (nodeState) {
                nodeState.history.push(reflectionMessage);
            }
            historyDiv.scrollTop = historyDiv.scrollHeight;
            
            // 清空输入框并关闭弹窗
            document.getElementById('reflection-content').value = '';
            reflectionDialog.classList.remove('show');
            
            this.showMaterialToast('反思已保存', 'success');
        };
    }

    // 新增：Material Design Toast 提示
    showMaterialToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `material-toast ${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        document.body.appendChild(toast);
        
        // 显示动画
        setTimeout(() => toast.classList.add('show'), 100);
        
        // 自动隐藏
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    loadResonanceFeed() {
        const container = document.getElementById('resonance-feed');
        if (!container) return;
        
        if (!this.currentJourney) {
            container.innerHTML = '<p class="empty-state">Create a journey to see resonances</p>';
            return;
        }
        
        // Find resonant journeys
        const resonances = journeyService.findResonantJourneys(this.currentJourney);
        
        container.innerHTML = '';
        resonances.forEach(({ journey, resonance }) => {
            new ResonanceCard(container, journey, resonance);
        });
        
        if (resonances.length === 0) {
            container.innerHTML = '<p class="empty-state">No resonances found yet</p>';
        }
    }

    loadDialogueCircles() {
        const container = document.getElementById('dialogue-list');
        if (!container) return;
        
        // Mock dialogue data
        container.innerHTML = '<p class="empty-state">No active dialogues. Start one!</p>';
    }

    loadActiveSessions() {
        const container = document.getElementById('session-list');
        if (!container) return;
        
        const sessions = sessionService.getActiveSessions();
        
        container.innerHTML = '';
        sessions.forEach(session => {
            new SessionCard(container, session);
        });
        
        if (sessions.length === 0) {
            container.innerHTML = '<p class="empty-state">No active sessions</p>';
        }
    }

    setupWhiteboardTools() {
        const toolBtns = document.querySelectorAll('.tool-btn');
        toolBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tool = btn.getAttribute('data-tool');
                this.whiteboard.setTool(tool);
                
                // Update active tool
                toolBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

    setupAvatarUpload() {
        const avatarEditBtn = document.getElementById('avatar-edit-btn');
        const avatarUpload = document.getElementById('avatar-upload');
        
        if (avatarEditBtn && avatarUpload) {
            avatarEditBtn.addEventListener('click', () => {
                avatarUpload.click();
            });
            
            avatarUpload.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.handleAvatarUpload(file);
                }
            });
        }
    }

    setupAvatarDelete() {
        const avatarDeleteBtn = document.getElementById('avatar-delete-btn');
        
        if (avatarDeleteBtn) {
            avatarDeleteBtn.addEventListener('click', () => {
                if (confirm('确定要删除当前头像吗？')) {
                    this.deleteAvatar();
                }
            });
        }
    }

    setupEmailEdit() {
        const emailEditBtn = document.getElementById('email-edit-btn');
        const emailSpan = document.getElementById('profile-email');
        
        if (emailEditBtn && emailSpan) {
            emailEditBtn.addEventListener('click', () => {
                this.showEmailEditInput(emailSpan);
            });
        }
    }

    showEmailEditInput(emailSpan) {
        const currentEmail = emailSpan.textContent;
        const input = document.createElement('input');
        input.type = 'email';
        input.value = currentEmail;
        input.className = 'email-edit-input';
        input.style.cssText = `
            border: 2px solid #667eea;
            border-radius: 4px;
            padding: 4px 8px;
            font-size: 14px;
            outline: none;
            background: white;
        `;
        
        // 替换span为input
        emailSpan.style.display = 'none';
        emailSpan.parentNode.insertBefore(input, emailSpan);
        input.focus();
        input.select();
        
        // 处理保存
        const saveEmail = () => {
            const newEmail = input.value.trim();
            if (newEmail && newEmail !== currentEmail) {
                if (this.validateEmail(newEmail)) {
                    this.currentUser.email = newEmail;
                    this.currentUser.save();
                    emailSpan.textContent = newEmail;
                    this.showMaterialToast('邮箱已更新', 'success');
                } else {
                    this.showMaterialToast('请输入有效的邮箱地址', 'warning');
                    input.focus();
                    return;
                }
            }
            emailSpan.style.display = 'inline';
            input.remove();
        };
        
        // 处理取消
        const cancelEdit = () => {
            emailSpan.style.display = 'inline';
            input.remove();
        };
        
        // 事件监听
        input.addEventListener('blur', saveEmail);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                saveEmail();
            } else if (e.key === 'Escape') {
                cancelEdit();
            }
        });
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    handleAvatarUpload(file) {
        // 验证文件类型
        if (!file.type.startsWith('image/')) {
            this.showMaterialToast('请选择图片文件', 'warning');
            return;
        }
        
        // 验证文件大小（限制为5MB）
        if (file.size > 5 * 1024 * 1024) {
            this.showMaterialToast('图片大小不能超过5MB', 'warning');
            return;
        }
        
        // 显示加载状态
        const avatarContainer = document.querySelector('.profile-avatar');
        if (avatarContainer) {
            avatarContainer.classList.add('uploading');
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                try {
                    // 创建canvas来压缩图片
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    // 设置canvas尺寸（200x200像素）
                    const size = 200;
                    canvas.width = size;
                    canvas.height = size;
                    
                    // 计算裁剪区域（保持正方形）
                    const minDimension = Math.min(img.width, img.height);
                    const sourceX = (img.width - minDimension) / 2;
                    const sourceY = (img.height - minDimension) / 2;
                    
                    // 绘制压缩后的图片
                    ctx.drawImage(img, sourceX, sourceY, minDimension, minDimension, 0, 0, size, size);
                    
                    // 转换为base64
                    const compressedImageData = canvas.toDataURL('image/jpeg', 0.8);
                    
                    // 更新头像显示
                    this.updateAvatarDisplay(compressedImageData);
                    
                    // 保存到用户数据
                    this.saveAvatarData(compressedImageData);
                    
                    this.showMaterialToast('头像上传成功', 'success');
                } catch (error) {
                    console.error('头像处理失败:', error);
                    this.showMaterialToast('头像处理失败，请重试', 'warning');
                } finally {
                    // 移除加载状态
                    if (avatarContainer) {
                        avatarContainer.classList.remove('uploading');
                    }
                }
            };
            
            img.onerror = () => {
                this.showMaterialToast('图片加载失败，请重试', 'warning');
                if (avatarContainer) {
                    avatarContainer.classList.remove('uploading');
                }
            };
            
            img.src = e.target.result;
        };
        
        reader.onerror = () => {
            this.showMaterialToast('文件读取失败，请重试', 'warning');
            if (avatarContainer) {
                avatarContainer.classList.remove('uploading');
            }
        };
        
        reader.readAsDataURL(file);
    }

    updateAvatarDisplay(imageData) {
        const avatarImg = document.getElementById('profile-avatar-img');
        const avatarIcon = document.getElementById('profile-avatar-icon');
        
        if (avatarImg && avatarIcon) {
            avatarImg.src = imageData;
            avatarImg.style.display = 'block';
            avatarIcon.style.display = 'none';
        }
    }

    saveAvatarData(imageData) {
        if (!this.currentUser.profile) {
            this.currentUser.profile = {};
        }
        this.currentUser.profile.avatar = imageData;
        this.currentUser.save();
    }

    loadAvatar() {
        const avatarImg = document.getElementById('profile-avatar-img');
        const avatarIcon = document.getElementById('profile-avatar-icon');
        const avatarDeleteBtn = document.getElementById('avatar-delete-btn');
        
        if (avatarImg && avatarIcon) {
            const profile = this.currentUser.profile || {};
            if (profile.avatar) {
                avatarImg.src = profile.avatar;
                avatarImg.style.display = 'block';
                avatarIcon.style.display = 'none';
                if (avatarDeleteBtn) {
                    avatarDeleteBtn.style.display = 'flex';
                }
            } else {
                avatarImg.style.display = 'none';
                avatarIcon.style.display = 'block';
                if (avatarDeleteBtn) {
                    avatarDeleteBtn.style.display = 'none';
                }
            }
        }
    }

    deleteAvatar() {
        // 清除头像数据
        if (this.currentUser.profile) {
            delete this.currentUser.profile.avatar;
            this.currentUser.save();
        }
        
        // 更新显示
        this.loadAvatar();
        
        // 清除文件输入
        const avatarUpload = document.getElementById('avatar-upload');
        if (avatarUpload) {
            avatarUpload.value = '';
        }
        
        this.showMaterialToast('头像已删除', 'success');
    }

    updateProfileInfo() {
        const nameEl = document.getElementById('profile-name');
        const emailEl = document.getElementById('profile-email');
        
        // 获取昵称，优先使用profile中的昵称，否则使用用户名称
        const profile = this.currentUser.profile || {};
        const displayName = profile.nickname || this.currentUser.name || '游客000000';
        
        if (nameEl) nameEl.textContent = displayName;
        if (emailEl) emailEl.textContent = this.currentUser.email || 'explorer@learning.com';
        
        // 加载头像
        this.loadAvatar();
        
        // 更新基本信息
        this.updateBasicInfo();
        
        // 更新兴趣爱好
        this.updateHobbies();
        
        // 更新学习统计
        this.updateLearningStats();
    }

    updateBasicInfo() {
        const nicknameEl = document.getElementById('profile-nickname');
        const genderEl = document.getElementById('profile-gender');
        const ageEl = document.getElementById('profile-age');
        const occupationEl = document.getElementById('profile-occupation');
        const locationEl = document.getElementById('profile-location');
        
        const profile = this.currentUser.profile || {};
        
        if (nicknameEl) nicknameEl.textContent = profile.nickname || '未设置';
        if (genderEl) genderEl.textContent = this.getGenderText(profile.gender);
        if (ageEl) ageEl.textContent = profile.age ? `${profile.age}岁` : '未设置';
        if (occupationEl) occupationEl.textContent = profile.occupation || '未设置';
        if (locationEl) locationEl.textContent = profile.location || '未设置';
    }

    getGenderText(gender) {
        const genderMap = {
            'male': '男',
            'female': '女',
            'other': '其他'
        };
        return genderMap[gender] || '未设置';
    }

    updateHobbies() {
        const hobbiesContainer = document.getElementById('profile-hobbies');
        if (!hobbiesContainer) return;
        
        const profile = this.currentUser.profile || {};
        const hobbies = profile.hobbies || [];
        
        if (hobbies.length === 0) {
            hobbiesContainer.innerHTML = '<p class="empty-state">暂无兴趣爱好</p>';
            return;
        }
        
        hobbiesContainer.innerHTML = hobbies.map(hobby => 
            `<span class="hobby-tag">${hobby.trim()}</span>`
        ).join('');
    }

    updateLearningStats() {
        const stats = storage.getJourneyStats();
        
        const elements = {
            'active-journeys-count': stats.activeJourneys,
            'total-insights-count': stats.totalInsights,
            'community-connections': 0 // 暂时设为0，后续可以从社区数据获取
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }

    loadUserPreferences() {
        const explorationRange = document.getElementById('exploration-range');
        if (explorationRange) {
            explorationRange.value = this.currentUser.preferences?.explorationVsClosure || 50;
            
            explorationRange.addEventListener('input', (e) => {
                if (!this.currentUser.preferences) {
                    this.currentUser.preferences = {};
                }
                this.currentUser.preferences.explorationVsClosure = parseInt(e.target.value);
                this.currentUser.save();
            });
        }
    }

    showEditProfileModal() {
        const modal = document.getElementById('edit-profile-modal');
        if (!modal) return;
        
        // 填充现有数据
        const profile = this.currentUser.profile || {};
        
        const nicknameInput = document.getElementById('edit-nickname');
        const genderSelect = document.getElementById('edit-gender');
        const ageInput = document.getElementById('edit-age');
        const occupationInput = document.getElementById('edit-occupation');
        const locationInput = document.getElementById('edit-location');
        const hobbiesTextarea = document.getElementById('edit-hobbies');
        
        if (nicknameInput) nicknameInput.value = profile.nickname || this.currentUser.name || '';
        if (genderSelect) genderSelect.value = profile.gender || '';
        if (ageInput) ageInput.value = profile.age || '';
        if (occupationInput) occupationInput.value = profile.occupation || '';
        if (locationInput) locationInput.value = profile.location || '';
        if (hobbiesTextarea) hobbiesTextarea.value = (profile.hobbies || []).join(', ');
        
        modal.classList.add('show');
    }

    saveProfile() {
        const nickname = document.getElementById('edit-nickname').value.trim();
        const gender = document.getElementById('edit-gender').value;
        const age = parseInt(document.getElementById('edit-age').value) || null;
        const occupation = document.getElementById('edit-occupation').value.trim();
        const location = document.getElementById('edit-location').value.trim();
        const hobbiesText = document.getElementById('edit-hobbies').value.trim();
        
        // 解析兴趣爱好
        const hobbies = hobbiesText ? hobbiesText.split(',').map(h => h.trim()).filter(h => h) : [];
        
        // 保存到用户数据
        if (!this.currentUser.profile) {
            this.currentUser.profile = {};
        }
        
        this.currentUser.profile = {
            ...this.currentUser.profile,
            nickname,
            gender,
            age,
            occupation,
            location,
            hobbies
        };
        
        this.currentUser.save();
        
        // 更新界面
        this.updateProfileInfo();
        
        // 关闭模态框
        this.closeModal('edit-profile-modal');
        
        // 显示成功消息
        this.showMaterialToast('个人资料已保存', 'success');
    }

    updateResonanceProfile() {
        const container = document.getElementById('resonance-profile');
        if (!container) return;
        
        const profile = ResonanceProfile.load(this.currentUser.id);
        
        if (Object.keys(profile.topicWeights).length === 0) {
            container.innerHTML = '<p>Your resonance profile will develop as you engage more with the platform</p>';
            return;
        }
        
        const topTopics = Object.entries(profile.topicWeights)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);
        
        container.innerHTML = `
            <h4>Your Top Interests</h4>
            <div class="topic-weights">
                ${topTopics.map(([topic, weight]) => `
                    <div class="topic-item">
                        <span>${topic}</span>
                        <div class="weight-bar">
                            <div class="weight-fill" style="width: ${(weight / Math.max(...Object.values(profile.topicWeights))) * 100}%"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    async createNewJourney() {
        const title = document.getElementById('journey-title').value.trim();
        const coreQuestion = document.getElementById('core-question').value.trim();
        const tags = document.getElementById('journey-tags').value.split(',').map(t => t.trim()).filter(t => t);
        
        if (!title || !coreQuestion) {
            alert('Please fill in all required fields');
            return;
        }
        
        let difyAnswer = '';
        try {
            // 调用 Dify workflow API 获取回答
            difyAnswer = await window.callDifyWorkflow(coreQuestion);
        } catch (err) {
            alert('Dify API 调用失败: ' + err.message);
            return;
        }
        
        try {
            const journey = await journeyService.createJourney({
                userId: this.currentUser.id,
                title,
                coreQuestion,
                tags
            });
            this.currentJourney = journey;

            // 新增：将提问和 Dify 回答作为 exploration node 添加到 journey
            const node = new LearningNode({
                journeyId: journey.id,
                title: '首次探索',
                content: `Q: ${coreQuestion}\nA: ${difyAnswer}`,
                type: 'exploration',
                position: {
                    x: 100 + Math.random() * 400,
                    y: 100 + Math.random() * 300
                }
            });
            journey.addNode(node);

            // Update resonance profile
            const profile = ResonanceProfile.load(this.currentUser.id);
            profile.updateFromJourney(journey);
            
            // Close modal and redirect to journey page
            this.closeModal('new-question-modal');
            this.loadPage('journey');
            
            // Update navigation
            document.querySelector('[data-page="journey"]').classList.add('active');
            document.querySelector('[data-page="home"]').classList.remove('active');
            
        } catch (error) {
            console.error('Error creating journey:', error);
            alert('Failed to create journey. Please try again.');
        }
    }

    showNodeEditor(node = null) {
        const modal = document.getElementById('node-editor-modal');
        if (modal) {
            modal.classList.add('show');
            
            if (node) {
                // Edit existing node
                document.getElementById('node-title').value = node.title;
                document.getElementById('node-content').value = node.content;
            } else {
                // Create new node
                document.getElementById('node-title').value = '';
                document.getElementById('node-content').value = '';
            }
        }
    }

    switchTab(tabName) {
        // Hide all tab panes
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        
        // Show selected tab pane
        const targetPane = document.getElementById(`${tabName}-tab`);
        if (targetPane) {
            targetPane.classList.add('active');
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
        }
    }

    saveNode() {
        const title = document.getElementById('node-title').value.trim();
        const content = document.getElementById('node-content').value.trim();
        
        if (!title || !content) {
            alert('Please fill in all required fields');
            return;
        }
        
        if (!this.currentJourney) {
            alert('Please create a journey first');
            return;
        }
        
        const node = new LearningNode({
            journeyId: this.currentJourney.id,
            title,
            content,
            type: 'exploration',
            position: {
                x: 100 + Math.random() * 400,
                y: 100 + Math.random() * 300
            }
        });
        
        this.currentJourney.addNode(node);
        
        // Update displays
        this.displayCurrentJourney();
        if (this.journeyRenderer) {
            this.journeyRenderer.setJourney(this.currentJourney);
        }
        
        // Close modal
        this.closeModal('node-editor-modal');
    }

    openJourneyDetail(journeyId) {
        const journey = LearningJourney.load(journeyId);
        if (journey) {
            this.currentJourney = journey;
            this.loadPage('journey');
            
            // Update navigation
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            document.querySelector('[data-page="journey"]').classList.add('active');
        }
    }

    createSyncSession() {
        const title = prompt('Session Title:');
        const description = prompt('Session Description:');
        
        if (title && description) {
            const session = sessionService.createSession({
                title,
                description,
                topic: 'General Discussion'
            });
            
            this.loadActiveSessions();
            alert('Session created successfully!');
        }
    }

    joinSession(sessionId) {
        const session = sessionService.joinSession(sessionId);
        if (session) {
            // Show virtual lab
            document.getElementById('session-lobby').style.display = 'none';
            document.getElementById('virtual-lab').style.display = 'block';
            
            alert('Joined session successfully!');
        } else {
            alert('Failed to join session');
        }
    }

    addInsight() {
        const content = prompt('What insight would you like to capture?');
        if (content) {
            // This would typically work with a current node
            alert('Insight captured! (Full implementation would save to current node)');
        }
    }

    // 新增：获取初始Dify回答
    async getInitialDifyResponse(node, historyDiv, nodeState) {
        try {
            // 获取当前exploration的角度和模式
            let angle = '继续探索当前主题';
            if (node && node.content) {
                if (node.content.startsWith('Q: ')) {
                    angle = node.content.substring(3); // 去掉"Q: "前缀
                }
            }
            const mode = node.mode || '解释模式';
            
            console.log('调用初始Dify，参数:', { angle, mode, userInput: '1' });
            
            // 调用Dify API
            const answer = await window.callDifyExploration(angle, mode, '1');
            
            // 更新历史记录
            const aiMessage = `
                <div class="message ai-message">
                    <div class="message-avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="message-content">
                        <div class="message-header">
                            <span class="message-author">AI 助手</span>
                            <span class="message-time">${new Date().toLocaleTimeString()}</span>
                        </div>
                        <div class="message-text">
                            ${answer}
                        </div>
                    </div>
                </div>
            `;
            
            historyDiv.innerHTML = aiMessage;
            nodeState.history.push(aiMessage);
            
        } catch (error) {
            console.error('获取初始Dify回答失败:', error);
            
            // 显示错误信息
            const errorMessage = `
                <div class="message ai-message">
                    <div class="message-avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="message-content">
                        <div class="message-header">
                            <span class="message-author">AI 助手</span>
                            <span class="message-time">${new Date().toLocaleTimeString()}</span>
                        </div>
                        <div class="message-text">
                            抱歉，暂时无法获取回答。请稍后重试。
                        </div>
                    </div>
                </div>
            `;
            
            historyDiv.innerHTML = errorMessage;
            nodeState.history.push(errorMessage);
        }
    }

    // 新增：显示下一个 exploration
    showNextExploration() {
        if (this.journeyRenderer) {
            this.journeyRenderer.showNextNode();
            this.displayCurrentJourney(); // 刷新右侧显示
            
            // 显示提示消息
            const nextNodeIndex = this.journeyRenderer.getVisibleNodesCount();
            if (nextNodeIndex <= this.currentJourney.getNodes().length) {
                this.showMaterialToast('新的探索已解锁！', 'success');
            }
        }
    }
}

// 添加词云数据管理功能
function addWordToTable(word, frequency = 50, category = 'custom') {
    WORDCLOUD_DATA_TABLE.push({
        word: word,
        frequency: Math.max(1, Math.min(100, frequency)),
        category: category
    });
}

function removeWordFromTable(word) {
    const index = WORDCLOUD_DATA_TABLE.findIndex(item => item.word === word);
    if (index > -1) {
        WORDCLOUD_DATA_TABLE.splice(index, 1);
    }
}

function updateWordFrequency(word, newFrequency) {
    const item = WORDCLOUD_DATA_TABLE.find(item => item.word === word);
    if (item) {
        item.frequency = Math.max(1, Math.min(100, newFrequency));
    }
}

function getWordCloudTableData() {
    return [...WORDCLOUD_DATA_TABLE];
}

// 词云数据表格 - 名词和词频
const WORDCLOUD_DATA_TABLE = [
    // 学习核心概念 (高频)
    { word: '知识', frequency: 95, category: 'learning' },
    { word: '思考', frequency: 88, category: 'learning' },
    { word: '理解', frequency: 85, category: 'learning' },
    { word: '探索', frequency: 82, category: 'learning' },
    { word: '智慧', frequency: 80, category: 'learning' },
    
    // 学科领域 (中高频)
    { word: '数学', frequency: 75, category: 'subject' },
    { word: '物理', frequency: 72, category: 'subject' },
    { word: '哲学', frequency: 70, category: 'subject' },
    { word: '艺术', frequency: 68, category: 'subject' },
    { word: '历史', frequency: 65, category: 'subject' },
    { word: '文学', frequency: 63, category: 'subject' },
    { word: '化学', frequency: 60, category: 'subject' },
    { word: '生物', frequency: 58, category: 'subject' },
    { word: '心理学', frequency: 55, category: 'subject' },
    { word: '计算机', frequency: 52, category: 'subject' },
    
    // 思维方法 (中频)
    { word: '分析', frequency: 48, category: 'method' },
    { word: '逻辑', frequency: 45, category: 'method' },
    { word: '推理', frequency: 42, category: 'method' },
    { word: '创新', frequency: 40, category: 'method' },
    { word: '创造', frequency: 38, category: 'method' },
    { word: '综合', frequency: 35, category: 'method' },
    { word: '归纳', frequency: 32, category: 'method' },
    { word: '演绎', frequency: 30, category: 'method' },
    
    // 抽象概念 (中频)
    { word: '真理', frequency: 45, category: 'concept' },
    { word: '美', frequency: 42, category: 'concept' },
    { word: '善', frequency: 40, category: 'concept' },
    { word: '自由', frequency: 38, category: 'concept' },
    { word: '正义', frequency: 35, category: 'concept' },
    { word: '和谐', frequency: 32, category: 'concept' },
    { word: '平衡', frequency: 30, category: 'concept' },
    
    // 学习目标 (中频)
    { word: '目标', frequency: 42, category: 'goal' },
    { word: '计划', frequency: 40, category: 'goal' },
    { word: '方向', frequency: 38, category: 'goal' },
    { word: '未来', frequency: 35, category: 'goal' },
    { word: '梦想', frequency: 32, category: 'goal' },
    { word: '愿景', frequency: 30, category: 'goal' },
    
    // 能力技能 (中低频)
    { word: '技能', frequency: 28, category: 'skill' },
    { word: '能力', frequency: 25, category: 'skill' },
    { word: '天赋', frequency: 22, category: 'skill' },
    { word: '潜力', frequency: 20, category: 'skill' },
    { word: '经验', frequency: 18, category: 'skill' },
    
    // 过程状态 (低频)
    { word: '过程', frequency: 15, category: 'process' },
    { word: '状态', frequency: 12, category: 'process' },
    { word: '关系', frequency: 10, category: 'process' },
    { word: '结构', frequency: 8, category: 'process' },
    { word: '系统', frequency: 5, category: 'process' }
];

// 根据表格数据获取随机词云数据
function getRandomWordCloudDataFromTable() {
    console.log('开始生成词云数据，当前数据表长度:', WORDCLOUD_DATA_TABLE.length);
    
    if (WORDCLOUD_DATA_TABLE.length === 0) {
        console.warn('数据表为空，使用默认数据');
        loadWordCloudFromCSV(DEFAULT_CSV_DATA);
    }
    
    // 随机打乱表格数据
    const shuffled = [...WORDCLOUD_DATA_TABLE].sort(() => 0.5 - Math.random());
    
    // 根据词频权重选择词条
    const selectedWords = [];
    const count = 25 + Math.floor(Math.random() * 10); // 25-35个词
    
    for (let i = 0; i < Math.min(count, shuffled.length); i++) {
        const item = shuffled[i];
        // 根据词频计算被选中的概率
        const selectionProbability = item.frequency / 100;
        if (Math.random() < selectionProbability) {
            selectedWords.push(item);
        }
    }
    
    // 如果选中的词不够，补充一些
    while (selectedWords.length < count && shuffled.length > selectedWords.length) {
        const remainingWords = shuffled.filter(word => !selectedWords.includes(word));
        if (remainingWords.length > 0) {
            selectedWords.push(remainingWords[0]);
        }
    }
    
    console.log('选中的词汇:', selectedWords.map(item => item.word));
    
    // 转换为词云格式 [word, size]，直接使用CSV中的词频数据
    const result = selectedWords.map(item => [
        item.word, 
        Math.max(20, Math.min(100, item.frequency)) // 使用CSV词频，范围20-100
    ]);
    
    console.log('生成的词云数据:', result);
    return result;
}



function renderWordCloud() {
    const canvas = document.getElementById('wordcloud-canvas');
    if (!canvas) {
        console.warn('词云canvas元素未找到');
        return;
    }
    if (typeof WordCloud !== 'function') {
        console.warn('WordCloud函数未加载');
        return;
    }
    
    const data = getRandomWordCloudDataFromTable();
    console.log('词云数据:', data);
    
    if (!data || data.length === 0) {
        console.warn('词云数据为空');
        return;
    }
    
    // 检查数据格式
    const validData = data.filter(item => item && item[0] && typeof item[1] === 'number' && item[1] > 0);
    if (validData.length === 0) {
        console.warn('没有有效的词云数据');
        return;
    }
    
    console.log('有效词云数据:', validData);
    
    WordCloud(canvas, {
        list: validData,
        gridSize: 20, // 进一步减小网格大小，让词更密集
        weightFactor: function (size) { 
            // 字体整体再缩小2号
            return Math.max(12, Math.min(40, size * 0.8)); 
        },
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: function() {
            // Google Material Design 色彩
            const colors = [
                '#1976d2', '#2196f3', '#03a9f4', '#00bcd4', // 蓝色系
                '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', // 绿色系
                '#ff9800', '#ff5722', '#f44336', '#e91e63', // 橙色系
                '#9c27b0', '#673ab7', '#3f51b5', '#2196f3'  // 紫色系
            ];
            return colors[Math.floor(Math.random() * colors.length)];
        },
        backgroundColor: 'rgba(0,0,0,0)',
        rotateRatio: 0.1, // 减少旋转，让文字更易读
        rotationSteps: 2,
        drawOutOfBound: false,
        ellipticity: 0.2, // 更扁平，接近水平椭圆
        hover: function(item, dimension, evt) {
            canvas.style.cursor = item ? 'pointer' : 'default';
            // 添加悬停效果
            if (item) {
                canvas.style.filter = 'drop-shadow(0 4px 12px rgba(25, 118, 210, 0.3))';
            } else {
                canvas.style.filter = 'none';
            }
        },
        click: function(item) {
            const input = document.getElementById('inspiration-input');
            if (input && item[0]) {
                input.value = item[0];
                input.focus();
                
                // 添加点击动画效果
                input.style.transform = 'scale(1.02)';
                input.style.boxShadow = '0 0 0 4px rgba(25, 118, 210, 0.2)';
                setTimeout(() => {
                    input.style.transform = 'scale(1)';
                    input.style.boxShadow = '';
                }, 200);
            }
        }
    });
}

let wordCloudTimer = null;
function setupWordCloudAutoRefresh() {
    renderWordCloud();
    if (window.wordCloudTimer) clearInterval(window.wordCloudTimer);
    window.wordCloudTimer = setInterval(renderWordCloud, 60000); // 每分钟刷新
}

// 强制渲染词云的测试函数
function forceRenderWordCloud() {
    console.log('强制渲染词云...');
    console.log('当前数据表长度:', WORDCLOUD_DATA_TABLE.length);
    
    if (WORDCLOUD_DATA_TABLE.length === 0) {
        console.log('数据表为空，使用默认数据...');
        loadWordCloudFromCSV(DEFAULT_CSV_DATA);
    }
    
    renderWordCloud();
}

// Home页面加载时渲染词云
function setupHomeInspiration() {
    console.log('设置Home页面词云...');
    setTimeout(async () => {
        if (WORDCLOUD_DATA_TABLE.length === 0) {
            console.log('数据未加载，重新初始化...');
            await initializeWordCloudData();
        }
        renderWordCloud();
        setupWordCloudAutoRefresh();
        setTimeout(() => {
            if (document.getElementById('wordcloud-canvas') && 
                !document.getElementById('wordcloud-canvas').getContext('2d').getImageData(0, 0, 1, 1).data.some(pixel => pixel !== 0)) {
                console.log('词云可能未渲染，再次尝试...');
                forceRenderWordCloud();
            }
        }, 1000);
    }, 200);
    
    // 输入框提交逻辑增强
    const input = document.getElementById('inspiration-input');
    const btn = document.getElementById('inspiration-submit-btn');
    if (input && btn) {
        btn.onclick = async () => {
            const word = input.value.trim();
            if (!word) return;
            
            // 显示加载状态
            btn.disabled = true;
            btn.textContent = '处理中...';
            
            try {
                // 先Dify校验
                const result = await callDifyCheck(word);
                if (result === '违禁') {
                    showForbiddenModal();
                    return;
                }
                
                // 调用新的Dify存储用户输入
                const storeResult = await callDifyStore(word);
                console.log('用户输入存储结果:', storeResult);
                
                // 解析Dify存储结果，提取角度列表、语气列表、难度
                console.log('开始解析Dify存储结果，原始结果:', storeResult);
                try {
                    const parsedResult = JSON.parse(storeResult);
                    console.log('解析后的JSON对象:', parsedResult);
                    
                    if (parsedResult.angles && Array.isArray(parsedResult.angles)) {
                        window.availableAngles = parsedResult.angles;
                        console.log('解析出的角度列表:', window.availableAngles);
                    } else {
                        console.warn('未找到angles字段或不是数组:', parsedResult.angles);
                        window.availableAngles = [];
                    }
                    
                    if (parsedResult.styles && Array.isArray(parsedResult.styles)) {
                        window.availableStyles = parsedResult.styles;
                        console.log('解析出的语气列表:', window.availableStyles);
                    } else {
                        console.warn('未找到styles字段或不是数组:', parsedResult.styles);
                        window.availableStyles = [];
                    }
                    
                    if (parsedResult.difficulty) {
                        window.currentDifficulty = parsedResult.difficulty;
                        console.log('解析出的难度:', window.currentDifficulty);
                    } else {
                        console.warn('未找到difficulty字段:', parsedResult.difficulty);
                        window.currentDifficulty = '中等';
                    }
                } catch (parseError) {
                    console.error('解析Dify存储结果失败:', parseError);
                    console.error('原始结果内容:', storeResult);
                    // 如果解析失败，设置默认值
                    window.availableAngles = [];
                    window.availableStyles = [];
                    window.currentDifficulty = '中等';
                }
                
                // 保存存储结果到全局变量，供后续使用
                window.lastDifyStoreResult = storeResult;
                
                // 获取Dify学习起点选项
                const options = await callDifyGetOptions(word);
                
                // ① CSV表里更新词频
                let found = false;
                for (let i = 0; i < WORDCLOUD_DATA_TABLE.length; i++) {
                    if (WORDCLOUD_DATA_TABLE[i].word === word) {
                        WORDCLOUD_DATA_TABLE[i].frequency = Math.min(WORDCLOUD_DATA_TABLE[i].frequency + 1, 999);
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    WORDCLOUD_DATA_TABLE.push({ word, frequency: 1, category: 'custom' });
                }
                renderWordCloud();
                input.value = '';
                
                // ② 弹窗交互，使用Dify返回的选项，传递当前输入的词
                showJourneyStartModal(options, word);
            } catch (error) {
                console.error('处理输入时出错:', error);
                // 出错时使用默认选项
                showJourneyStartModal(['探索基础概念', '深入研究应用', '联系实际案例'], word);
            } finally {
                // 恢复按钮状态
                btn.disabled = false;
                btn.textContent = '发送';
            }
        };
        input.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                btn.click();
            }
        });
    }
    // 新增：点击今日灵感备选词填入输入框
    document.querySelectorAll('.inspiration-suggest-item').forEach(item => {
        item.onclick = () => {
            input.value = item.textContent;
            input.focus();
        };
    });
}

// 弹窗显示/关闭逻辑
function showJourneyStartModal(options = ['探索基础概念', '深入研究应用', '联系实际案例'], currentWord = '') {
    const modal = document.getElementById('journey-start-modal');
    if (!modal) return;
    
    // 动态更新选项内容，只显示Dify返回的数量
    const optionBtns = modal.querySelectorAll('.journey-option-btn');
    optionBtns.forEach((btn, index) => {
        if (options[index]) {
            const text = options[index];
            btn.textContent = text;
            btn.style.display = '';
            
            // 移除文本长度属性，确保字体大小一致
            btn.removeAttribute('data-text-length');
        } else {
            btn.textContent = '';
            btn.style.display = 'none';
            btn.removeAttribute('data-text-length');
        }
    });
    
    modal.classList.add('show');
    
    // 选项点击动效
    const btns = modal.querySelectorAll('.journey-option-btn');
    btns.forEach((btn, index) => {
        btn.onclick = async () => {
            btn.classList.add('selected');
            
            // 创建新的journey，保存Home页输入和选项
            console.log('创建journey时的参数:', { currentWord, options, index, selectedOption: options[index] });
            console.log('全局变量状态:', {
                lastDifyStoreResult: window.lastDifyStoreResult,
                availableAngles: window.availableAngles,
                availableStyles: window.availableStyles,
                currentDifficulty: window.currentDifficulty
            });
            
            if (app && currentWord && options[index]) {
                try {
                    const journey = await journeyService.createJourney({
                        userId: app.currentUser.id,
                        title: currentWord,
                        coreQuestion: options[index],
                        description: `基于"${currentWord}"的学习探索：${options[index]}`,
                        tags: [currentWord, 'home-exploration'],
                        metadata: {
                            homeWord: currentWord,
                            homeOptions: options,
                            selectedOption: options[index],
                            difyStoreResult: window.lastDifyStoreResult || '',
                            availableAngles: window.availableAngles || [],
                            availableStyles: window.availableStyles || [],
                            currentDifficulty: window.currentDifficulty || '中等',
                            explorationCount: 0 // 记录exploration次数
                        }
                    });
                    
                    console.log('创建的journey metadata:', journey.metadata);
                    console.log('保存的availableAngles:', journey.metadata.availableAngles);
                    
                    // 设置为当前journey
                    app.currentJourney = journey;
                    
                    // 立即更新journey页面显示
                    app.displayCurrentJourney();
                    
                    // 跳转到journey页面
                    app.loadPage('journey');
                    document.querySelector('[data-page="journey"]').classList.add('active');
                    document.querySelector('[data-page="home"]').classList.remove('active');
                    
                } catch (error) {
                    console.error('创建journey失败:', error);
                }
            }
            
            setTimeout(() => {
                modal.classList.remove('show');
                btn.classList.remove('selected');
            }, 350);
        };
    });
    
    // 点击遮罩关闭
    const mask = modal.querySelector('.modal-mask');
    if (mask) {
        mask.onclick = () => modal.classList.remove('show');
    }
}

// 在页面切换到Home时自动渲染词云
const originalLoadHomePage = PhenomenalLearningApp.prototype.loadHomePage;
PhenomenalLearningApp.prototype.loadHomePage = async function() {
    if (typeof originalLoadHomePage === 'function') {
        await originalLoadHomePage.apply(this, arguments);
    }
    // 延迟调用，确保页面内容已加载
    setTimeout(() => {
        setupHomeInspiration();
    }, 100);
};

// Global functions for HTML onclick handlers
function startNewJourney() {
    app.showModal('new-question-modal');
}

function showNewQuestionModal() {
    app.showModal('new-question-modal');
}

function closeModal(modalId) {
    app.closeModal(modalId);
}

function saveNode() {
    app.saveNode();
}

function addInsight() {
    app.addInsight();
}

function createSyncSession() {
    app.createSyncSession();
}

function joinSession(sessionId) {
    app.joinSession(sessionId);
}

function openNodeEditor(node) {
    app.showNodeEditor(node);
}

PhenomenalLearningApp.prototype.showModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
    }
};

// CSV表格支持
const DEFAULT_CSV_DATA = `word,frequency,category
知识,95,learning
思考,88,learning
理解,85,learning
探索,82,learning
智慧,80,learning
数学,75,subject
物理,72,subject
哲学,70,subject
艺术,68,subject
历史,65,subject
文学,63,subject
化学,60,subject
生物,58,subject
心理学,55,subject
计算机,52,subject
分析,48,method
逻辑,45,method
推理,42,method
创新,40,method
创造,38,method
综合,35,method
归纳,32,method
演绎,30,method
真理,45,concept
美,42,concept
善,40,concept
自由,38,concept
正义,35,concept
和谐,32,concept
平衡,30,concept
目标,42,goal
计划,40,goal
方向,38,goal
未来,35,goal
梦想,32,goal
愿景,30,goal
技能,28,skill
能力,25,skill
天赋,22,skill
潜力,20,skill
经验,18,skill
过程,15,process
状态,12,process
关系,10,process
结构,8,process
系统,5,process`;

// 从CSV字符串解析数据
function parseCSVData(csvString) {
    const lines = csvString.trim().split('\n');
    const headers = lines[0].split(',');
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length >= 3) {
            data.push({
                word: values[0].trim(),
                frequency: parseInt(values[1].trim()) || 50,
                category: values[2].trim()
            });
        }
    }
    
    return data;
}

// 将数据转换为CSV字符串
function convertToCSV(data) {
    const headers = ['word', 'frequency', 'category'];
    const csvLines = [headers.join(',')];
    
    data.forEach(item => {
        csvLines.push(`${item.word},${item.frequency},${item.category}`);
    });
    
    return csvLines.join('\n');
}

// 从CSV加载词云数据
function loadWordCloudFromCSV(csvString) {
    try {
        const data = parseCSVData(csvString);
        WORDCLOUD_DATA_TABLE.length = 0; // 清空现有数据
        WORDCLOUD_DATA_TABLE.push(...data);
        console.log(`成功加载 ${data.length} 个词汇`);
        return true;
    } catch (error) {
        console.error('CSV解析失败:', error);
        return false;
    }
}

// 重置为默认CSV数据
function resetToDefaultCSV() {
    loadWordCloudFromCSV(DEFAULT_CSV_DATA);
}

// 初始化时加载默认CSV数据
function initializeWordCloudData() {
    // 尝试从localStorage加载保存的数据
    const savedData = localStorage.getItem('wordcloud_csv_data');
    if (savedData) {
        loadWordCloudFromCSV(savedData);
    } else {
        // 使用默认数据
        loadWordCloudFromCSV(DEFAULT_CSV_DATA);
    }
}

// 更新词云数据表格时自动保存
// const originalAddWordToTable = addWordToTable;
// addWordToTable = function(word, frequency = 50, category = 'custom') {
//     originalAddWordToTable(word, frequency, category);
//     saveWordCloudData();
// };

// const originalRemoveWordFromTable = removeWordFromTable;
// removeWordFromTable = function(word) {
//     originalRemoveWordFromTable(word);
//     saveWordCloudData();
// };

// const originalUpdateWordFrequency = updateWordFrequency;
// updateWordFrequency = function(word, newFrequency) {
//     originalUpdateWordFrequency(word, newFrequency);
//     saveWordCloudData();
// };

// 在应用初始化时加载CSV数据
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM加载完成，开始初始化应用...');
    await initializeWordCloudData();
    window.app = new PhenomenalLearningApp();
    console.log('应用初始化完成');
});





// 从CSV文件加载词云数据
async function loadWordCloudFromCSVFile() {
    try {
        console.log('尝试加载CSV文件...');
        const response = await fetch('wordcloud_data.csv');
        if (!response.ok) {
            throw new Error(`HTTP错误: ${response.status}`);
        }
        const csvString = await response.text();
        console.log('CSV文件内容长度:', csvString.length);
        const success = loadWordCloudFromCSV(csvString);
        console.log('CSV解析结果:', success);
        return success;
    } catch (error) {
        console.error('加载CSV文件失败:', error);
        // 如果文件加载失败，使用默认数据
        console.log('使用默认数据作为备用...');
        loadWordCloudFromCSV(DEFAULT_CSV_DATA);
        return false;
    }
}

// 初始化时从CSV文件加载数据
async function initializeWordCloudData() {
    console.log('开始初始化词云数据...');
    // 直接从CSV文件加载
    const success = await loadWordCloudFromCSVFile();
    console.log('词云数据初始化完成，成功:', success, '数据条数:', WORDCLOUD_DATA_TABLE.length);
    return success;
}

// 全局测试函数，方便在控制台调试
window.testWordCloud = function() {
    console.log('=== 词云测试 ===');
    console.log('数据表长度:', WORDCLOUD_DATA_TABLE.length);
    console.log('Canvas元素:', document.getElementById('wordcloud-canvas'));
    console.log('WordCloud函数:', typeof WordCloud);
    console.log('数据样本:', WORDCLOUD_DATA_TABLE.slice(0, 5));
    
    // 尝试使用测试数据渲染
    const testData = getTestWordCloudData();
    console.log('使用测试数据:', testData);
    renderWordCloudWithData(testData);
};

window.forceRenderWordCloud = forceRenderWordCloud;
window.renderWordCloudWithData = renderWordCloudWithData;
window.getTestWordCloudData = getTestWordCloudData;

// 简单的测试词云数据
function getTestWordCloudData() {
    return [
        ['知识', 80],
        ['思考', 70],
        ['理解', 65],
        ['探索', 60],
        ['智慧', 55],
        ['数学', 50],
        ['物理', 45],
        ['哲学', 40],
        ['艺术', 35],
        ['历史', 30]
    ];
}

// 强制渲染词云的测试函数
function forceRenderWordCloud() {
    console.log('强制渲染词云...');
    console.log('当前数据表长度:', WORDCLOUD_DATA_TABLE.length);
    
    if (WORDCLOUD_DATA_TABLE.length === 0) {
        console.log('数据表为空，使用测试数据...');
        const testData = getTestWordCloudData();
        renderWordCloudWithData(testData);
        return;
    }
    
    renderWordCloud();
}

// 使用指定数据渲染词云
function renderWordCloudWithData(data) {
    const canvas = document.getElementById('wordcloud-canvas');
    if (!canvas) {
        console.warn('词云canvas元素未找到');
        return;
    }
    if (typeof WordCloud !== 'function') {
        console.warn('WordCloud函数未加载');
        return;
    }
    
    console.log('使用指定数据渲染词云:', data);
    
    WordCloud(canvas, {
        list: data,
        gridSize: 25,
        weightFactor: function (size) { 
            return Math.max(30, Math.min(200, size * 2.5)); 
        },
        fontFamily: 'inherit',
        color: function() {
            const colors = ['#6366f1', '#7c3aed', '#a5b4fc', '#3730a3', '#818cf8', '#f59e42', '#f43f5e', '#10b981', '#fbbf24', '#3b82f6'];
            return colors[Math.floor(Math.random() * colors.length)];
        },
        backgroundColor: 'rgba(0,0,0,0)',
        rotateRatio: 0.15,
        rotationSteps: 2,
        drawOutOfBound: false,
        ellipticity: 0.3,
        hover: function(item, dimension, evt) {
            canvas.style.cursor = item ? 'pointer' : 'default';
        },
        click: function(item) {
            const input = document.getElementById('inspiration-input');
            if (input && item[0]) {
                input.value = item[0];
                input.focus();
            }
        }
    });
}

// Dify API 调用现在通过 services.js 中的 callDifyCheck 函数

// 违禁弹窗显示/关闭
function showForbiddenModal() {
    const modal = document.getElementById('forbidden-modal');
    if (!modal) return;
    
    modal.classList.add('show');
    
    // 点击遮罩关闭
    const mask = modal.querySelector('.modal-mask');
    if (mask) {
        mask.onclick = () => modal.classList.remove('show');
    }
}

// 获取下一个exploration的角度
function getNextExplorationAngle(journey) {
    console.log('getNextExplorationAngle被调用，journey:', journey);
    
    if (!journey || !journey.metadata) {
        console.warn('journey或metadata不存在');
        return '继续探索当前主题';
    }
    
    const metadata = journey.metadata;
    console.log('journey metadata:', metadata);
    
    const explorationCount = metadata.explorationCount || 0;
    const availableAngles = metadata.availableAngles || [];
    const selectedOption = metadata.selectedOption || '';
    const usedAngles = metadata.usedAngles || [];
    
    console.log('explorationCount:', explorationCount);
    console.log('availableAngles:', availableAngles);
    console.log('selectedOption:', selectedOption);
    console.log('usedAngles:', usedAngles);
    
    // 第一次exploration使用用户选择的选项
    if (explorationCount === 0) {
        console.log('第一次exploration，使用selectedOption:', selectedOption);
        return selectedOption;
    }
    
    // 后续exploration从角度列表中选择未使用的角度
    if (availableAngles.length > 0) {
        // 过滤出未使用的角度
        const unusedAngles = availableAngles.filter(angle => !usedAngles.includes(angle));
        console.log('未使用的角度:', unusedAngles);
        
        if (unusedAngles.length > 0) {
            // 随机选择一个未使用的角度
            const randomIndex = Math.floor(Math.random() * unusedAngles.length);
            const selectedAngle = unusedAngles[randomIndex];
            console.log('选择的未使用角度:', selectedAngle);
            return selectedAngle;
        } else {
            // 如果所有角度都用过了，重新开始
            console.log('所有角度都已使用，重新开始');
            metadata.usedAngles = [];
            journey.save();
            const randomIndex = Math.floor(Math.random() * availableAngles.length);
            return availableAngles[randomIndex];
        }
    }
    
    // 如果没有可用角度，返回默认值
    console.warn('没有可用角度，返回默认值');
    return '继续探索当前主题';
}

// 更新journey的exploration计数
function incrementExplorationCount(journey) {
    console.log('incrementExplorationCount被调用，journey:', journey);
    if (journey && journey.metadata) {
        const oldCount = journey.metadata.explorationCount || 0;
        journey.metadata.explorationCount = oldCount + 1;
        console.log('explorationCount从', oldCount, '增加到', journey.metadata.explorationCount);
        journey.save();
        console.log('journey已保存');
    } else {
        console.warn('journey或metadata不存在，无法增加计数');
    }
}

// 记录已使用的角度
function recordUsedAngle(journey, angle) {
    if (journey && journey.metadata && angle) {
        if (!journey.metadata.usedAngles) {
            journey.metadata.usedAngles = [];
        }
        if (!journey.metadata.usedAngles.includes(angle)) {
            journey.metadata.usedAngles.push(angle);
            console.log('记录已使用的角度:', angle);
            console.log('已使用的角度列表:', journey.metadata.usedAngles);
            journey.save();
        }
    }
}