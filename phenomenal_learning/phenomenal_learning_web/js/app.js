// Main Application Logic for Phenomenal Learning Platform

class PhenomenalLearningApp {
    constructor() {
        this.currentUser = null;
        this.currentJourney = null;
        this.currentPage = 'home';
        this.constellationRenderer = null;
        this.journeyRenderer = null;
        this.whiteboard = null;
        
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
            currentJourneyEl.innerHTML = `
                <h3>${this.currentJourney.title}</h3>
                <p><strong>Core Question:</strong> ${this.currentJourney.coreQuestion}</p>
                <p>${this.currentJourney.description}</p>
                <div class="journey-tags">
                    ${this.currentJourney.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
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
                        <span class="node-type-badge">${node.type}</span>
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
                
                // 添加创建新 Exploration 按钮
                const newExplorationBtn = document.createElement('button');
                newExplorationBtn.className = 'btn btn-primary w-100 mt-3';
                newExplorationBtn.innerHTML = '<i class="fas fa-plus"></i> 创建新 Exploration';
                newExplorationBtn.onclick = () => this.createNewExploration();
                journeyNodesEl.appendChild(newExplorationBtn);
            }
        }
    }

    // 新增：创建新的 Exploration
    createNewExploration() {
        const question = prompt('请输入新的探索问题：');
        if (!question) return;
        
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
        // 检查是否已存在弹窗
        let dialog = document.getElementById('exploration-dialog-modal');
        if (!dialog) {
            dialog = document.createElement('div');
            dialog.id = 'exploration-dialog-modal';
            dialog.className = 'modal show';
            dialog.innerHTML = `
                <div class="modal-content material-design">
                    <div class="modal-header material-header">
                        <div class="header-content">
                            <div class="header-icon">
                                <i class="fas fa-lightbulb"></i>
                            </div>
                            <div class="header-text">
                                <h3>探索互动</h3>
                                <p>与 AI 对话，记录你的思考</p>
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
                                <textarea id="exploration-dialog-input" class="material-input" placeholder="输入你的问题或感悟..."></textarea>
                                <div class="input-actions">
                                    <button class="btn-material primary" id="exploration-dialog-ask">
                                        <i class="fas fa-question-circle"></i>
                                        <span>提问</span>
                                    </button>
                                    <button class="btn-material secondary" id="exploration-dialog-share">
                                        <i class="fas fa-heart"></i>
                                        <span>分享感悟</span>
                                    </button>
                                    <button class="btn-material outline" id="exploration-dialog-reflection">
                                        <i class="fas fa-mirror"></i>
                                        <span>反思</span>
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
            document.body.appendChild(dialog);
        } else {
            dialog.classList.add('show');
        }

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
        const exploredDiv = document.getElementById('exploration-dialog-explored');
        
        // 根据节点状态设置界面
        if (nodeState.hasAskedQuestion) {
            // 如果已经提问过，显示已探索状态
            inputSection.style.display = 'none';
            exploredDiv.style.display = 'flex';
            statusDiv.innerHTML = '<span class="success-text">✓ 探索完成，可以继续反思</span>';
        } else {
            // 如果还没提问，显示输入界面
            inputSection.style.display = 'block';
            exploredDiv.style.display = 'none';
            statusDiv.innerHTML = '';
        }
        
        // 初始化历史
        const historyDiv = document.getElementById('exploration-dialog-history');
        
        // 如果有保存的历史记录，使用它；否则显示初始问答
        if (nodeState.history.length > 0) {
            historyDiv.innerHTML = nodeState.history.join('');
        } else {
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
                            <strong>Q:</strong> ${node.content.split('\nA:')[0].replace('Q:','').trim()}
                        </div>
                    </div>
                </div>
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
                            <strong>A:</strong> ${node.content.split('\nA:')[1] ? node.content.split('\nA:')[1].trim() : ''}
                        </div>
                    </div>
                </div>
            `;
        }
        
        // 关闭按钮
        document.getElementById('close-exploration-dialog').onclick = () => {
            dialog.classList.remove('show');
        };
        
        // 提问按钮 - 只允许一次提问
        askBtn.onclick = async () => {
            if (nodeState.hasAskedQuestion) {
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
            
            // 调用 Dify
            let answer = '';
            try {
                answer = await window.callDifyWorkflow(input);
            } catch (err) {
                answer = 'Dify API 调用失败: ' + err.message;
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
            
            // 标记已提问，隐藏输入框，显示"已探索"
            nodeState.hasAskedQuestion = true;
            inputSection.style.display = 'none';
            exploredDiv.style.display = 'flex';
            statusDiv.innerHTML = '<span class="success-text">✓ 探索完成，可以继续反思</span>';
            
            // 延迟显示下一个节点
            setTimeout(() => {
                this.showNextExploration();
            }, 2000); // 2秒后显示下一个
        };
        
        // 分享感悟按钮 - 无限制
        document.getElementById('exploration-dialog-share').onclick = () => {
            const input = document.getElementById('exploration-dialog-input').value.trim();
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
            document.getElementById('exploration-dialog-input').value = '';
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

    updateProfileInfo() {
        const nameEl = document.getElementById('profile-name');
        const emailEl = document.getElementById('profile-email');
        
        if (nameEl) nameEl.textContent = this.currentUser.name;
        if (emailEl) emailEl.textContent = this.currentUser.email;
    }

    loadUserPreferences() {
        const explorationRange = document.getElementById('exploration-range');
        if (explorationRange) {
            explorationRange.value = this.currentUser.preferences.explorationVsClosure || 50;
            
            explorationRange.addEventListener('input', (e) => {
                this.currentUser.preferences.explorationVsClosure = parseInt(e.target.value);
                this.currentUser.save();
            });
        }
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

    // 新增：显示下一个 exploration
    showNextExploration() {
        if (this.journeyRenderer) {
            this.journeyRenderer.showNextNode();
            this.displayCurrentJourney(); // 刷新右侧显示
            
            // 显示提示消息
            const nextNodeIndex = this.journeyRenderer.getVisibleNodesCount();
            if (nextNodeIndex <= this.currentJourney.getNodes().length) {
                this.showMaterialToast(`新的探索已解锁！点击第 ${nextNodeIndex} 个探索开始。`, 'success');
            }
        }
    }
}

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

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new PhenomenalLearningApp();
});