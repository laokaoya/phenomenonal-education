// UI Components for Phenomenal Learning Platform

class ConstellationRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.nodes = [];
        this.connections = [];
        this.animationId = null;
        this.mousePos = { x: 0, y: 0 };
        this.gridSize = 10; // 10x10 网格
        this.cellSize = 0; // 将在 setJourney 中计算
        this.visibleNodes = 0; // 当前可见的节点数量
        
        this.setupEventListeners();
        this.startAnimation();
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mousePos.x = e.clientX - rect.left;
            this.mousePos.y = e.clientY - rect.top;
        });

        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;
            
            // Check if clicked on a node
            this.nodes.forEach(node => {
                const distance = Math.sqrt(
                    Math.pow(clickX - node.x, 2) +
                    Math.pow(clickY - node.y, 2)
                );
                
                if (distance <= node.radius + 5) {
                    this.onNodeClick(node);
                }
            });
        });
    }

    setJourney(journey) {
        this.journey = journey;
        this.loadNodesFromJourney();
    }

    loadNodesFromJourney() {
        if (!this.journey) return;
        
        this.nodes = [];
        this.connections = [];
        
        const journeyNodes = this.journey.getNodes();
        
        // 计算单元格大小
        this.cellSize = Math.min(this.canvas.width, this.canvas.height) / this.gridSize;
        
        // 生成已使用的格子位置，避免重复
        const usedPositions = new Set();
        
        // 为每个节点分配随机格子位置
        journeyNodes.forEach((node, index) => {
            let gridX, gridY;
            let attempts = 0;
            
            // 尝试找到未使用的位置
            do {
                gridX = Math.floor(Math.random() * this.gridSize);
                gridY = Math.floor(Math.random() * this.gridSize);
                attempts++;
            } while (usedPositions.has(`${gridX},${gridY}`) && attempts < 100);
            
            usedPositions.add(`${gridX},${gridY}`);
            
            // 计算格子中心坐标
            const x = gridX * this.cellSize + this.cellSize / 2;
            const y = gridY * this.cellSize + this.cellSize / 2;
            
            const canvasNode = {
                id: node.id,
                x: x,
                y: y,
                radius: 8 + Math.min(node.content.length / 50, 12),
                color: LearningNode.getTypeColor(node.type),
                title: node.title,
                type: node.type,
                data: node,
                pulse: false,
                index: index,
                gridX: gridX,
                gridY: gridY,
                visible: false // 初始不可见
            };
            
            this.nodes.push(canvasNode);
        });

        // 创建箭头连接
        this.generateArrowConnections();
        
        // 初始只显示第一个节点
        this.visibleNodes = 0;
        if (this.nodes.length > 0) {
            this.showNextNode();
        }
    }

    // 显示下一个节点
    showNextNode() {
        if (this.visibleNodes < this.nodes.length) {
            this.nodes[this.visibleNodes].visible = true;
            this.visibleNodes++;
        }
    }

    // 获取当前可见的节点数量
    getVisibleNodesCount() {
        return this.visibleNodes;
    }

    generateArrowConnections() {
        // 按顺序连接节点
        for (let i = 0; i < this.nodes.length - 1; i++) {
            const fromNode = this.nodes[i];
            const toNode = this.nodes[i + 1];
            
            this.connections.push({
                from: fromNode,
                to: toNode,
                type: 'arrow',
                color: 'rgba(255, 255, 255, 0.6)',
                width: 2
            });
        }
    }

    generateConnections() {
        // Simple connection logic - could be enhanced based on node relationships
        for (let i = 0; i < this.nodes.length - 1; i++) {
            for (let j = i + 1; j < this.nodes.length; j++) {
                const node1 = this.nodes[i];
                const node2 = this.nodes[j];
                
                // Connect nodes if they share similar content or are sequential
                const shouldConnect = this.shouldNodesConnect(node1, node2);
                
                if (shouldConnect) {
                    this.connections.push({
                        from: node1,
                        to: node2,
                        strength: 0.3,
                        color: 'rgba(255, 215, 0, 0.3)'
                    });
                }
            }
        }
    }

    shouldNodesConnect(node1, node2) {
        // Connect nodes of complementary types
        const complementaryTypes = {
            'exploration': ['reflection', 'insight'],
            'reflection': ['exploration', 'synthesis'],
            'insight': ['exploration', 'connection'],
            'discovery': ['synthesis', 'connection'],
            'connection': ['insight', 'discovery'],
            'synthesis': ['reflection', 'discovery']
        };
        
        return complementaryTypes[node1.type]?.includes(node2.type) ||
               complementaryTypes[node2.type]?.includes(node1.type);
    }

    startAnimation() {
        const animate = () => {
            this.update();
            this.render();
            this.animationId = requestAnimationFrame(animate);
        };
        animate();
    }

    update() {
        // Add floating animation to nodes
        const time = Date.now() * 0.001;
        this.nodes.forEach((node, index) => {
            if (node.visible) {
                node.offsetY = Math.sin(time + index * 0.5) * 2;
                
                // Check if mouse is near node
                const distance = Math.sqrt(
                    Math.pow(this.mousePos.x - node.x, 2) +
                    Math.pow(this.mousePos.y - node.y, 2)
                );
                
                node.isHovered = distance <= node.radius + 10;
            }
        });
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background gradient
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, '#0f1419');
        gradient.addColorStop(1, '#1a1a2e');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        this.drawGrid();
        
        // Draw connections first (behind nodes)
        this.connections.forEach((connection, index) => {
            // 只绘制到当前可见节点的连接
            if (index < this.visibleNodes - 1) {
                if (connection.type === 'arrow') {
                    this.drawArrow(connection);
                } else {
                    this.drawConnection(connection);
                }
            }
        });
        
        // Draw nodes
        this.nodes.forEach(node => {
            if (node.visible) {
                const x = node.x;
                const y = node.y + (node.offsetY || 0);
                const radius = node.radius + (node.isHovered ? 3 : 0);
                
                // Draw outer glow
                if (node.isHovered) {
                    const glowGradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius + 10);
                    glowGradient.addColorStop(0, node.color + '80');
                    glowGradient.addColorStop(1, 'transparent');
                    this.ctx.fillStyle = glowGradient;
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, radius + 10, 0, Math.PI * 2);
                    this.ctx.fill();
                }
                
                // Draw node
                this.ctx.fillStyle = node.color;
                this.ctx.beginPath();
                this.ctx.arc(x, y, radius, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Draw node border
                this.ctx.strokeStyle = '#ffffff';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
                
                // Draw node number
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = '12px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(node.index + 1, x, y + 4);
                
                // Draw title if hovered
                if (node.isHovered) {
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.font = '12px Arial';
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText(node.title, x, y - radius - 15);
                }
            }
        });
    }

    drawGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        // Draw vertical lines
        for (let i = 0; i <= this.gridSize; i++) {
            const x = i * this.cellSize;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Draw horizontal lines
        for (let i = 0; i <= this.gridSize; i++) {
            const y = i * this.cellSize;
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    drawArrow(connection) {
        const from = connection.from;
        const to = connection.to;
        
        // 只绘制可见节点之间的连接
        if (!from.visible || !to.visible) return;
        
        const fromX = from.x;
        const fromY = from.y + (from.offsetY || 0);
        const toX = to.x;
        const toY = to.y + (to.offsetY || 0);
        
        // Calculate arrow direction
        const dx = toX - fromX;
        const dy = toY - fromY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance === 0) return;
        
        // Normalize direction
        const unitX = dx / distance;
        const unitY = dy / distance;
        
        // Adjust start and end points to node edges
        const fromRadius = from.radius + 2;
        const toRadius = to.radius + 2;
        const startX = fromX + unitX * fromRadius;
        const startY = fromY + unitY * fromRadius;
        const endX = toX - unitX * toRadius;
        const endY = toY - unitY * toRadius;
        
        // Draw arrow line
        this.ctx.strokeStyle = connection.color;
        this.ctx.lineWidth = connection.width;
        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();
        
        // Draw arrow head
        const arrowLength = 12;
        const arrowAngle = Math.PI / 6; // 30 degrees
        
        const angle1 = Math.atan2(unitY, unitX) + arrowAngle;
        const angle2 = Math.atan2(unitY, unitX) - arrowAngle;
        
        this.ctx.fillStyle = connection.color;
        this.ctx.beginPath();
        this.ctx.moveTo(endX, endY);
        this.ctx.lineTo(
            endX - arrowLength * Math.cos(angle1),
            endY - arrowLength * Math.sin(angle1)
        );
        this.ctx.lineTo(
            endX - arrowLength * Math.cos(angle2),
            endY - arrowLength * Math.sin(angle2)
        );
        this.ctx.closePath();
        this.ctx.fill();
    }

    drawConnection(connection) {
        const from = connection.from;
        const to = connection.to;
        
        // 只绘制可见节点之间的连接
        if (!from.visible || !to.visible) return;
        
        const fromX = from.x;
        const fromY = from.y + (from.offsetY || 0);
        const toX = to.x;
        const toY = to.y + (to.offsetY || 0);
        
        // Calculate connection direction
        const dx = toX - fromX;
        const dy = toY - fromY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance === 0) return;
        
        // Normalize direction
        const unitX = dx / distance;
        const unitY = dy / distance;
        
        // Adjust start and end points to node edges
        const fromRadius = from.radius + 2;
        const toRadius = to.radius + 2;
        const startX = fromX + unitX * fromRadius;
        const startY = fromY + unitY * fromRadius;
        const endX = toX - unitX * toRadius;
        const endY = toY - unitY * toRadius;
        
        // Draw connection line
        this.ctx.strokeStyle = connection.color;
        this.ctx.lineWidth = connection.width || 1;
        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();
    }

    onNodeClick(node) {
        // 直接调用对话界面，而不是编辑器
        if (window.app && typeof window.app.showExplorationDialog === 'function') {
            window.app.showExplorationDialog(node.data);
        }
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}

class ResonanceCard {
    constructor(container, journey, resonanceScore) {
        this.container = container;
        this.journey = journey;
        this.resonanceScore = resonanceScore;
        this.render();
    }

    render() {
        const card = document.createElement('div');
        card.className = 'resonance-card';
        card.innerHTML = `
            <h4>${this.journey.title}</h4>
            <p>${this.journey.description || this.journey.coreQuestion}</p>
            <div class="resonance-meta">
                <span class="tags">
                    ${this.journey.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </span>
                <span class="resonance-score">${(this.resonanceScore * 100).toFixed(0)}% resonance</span>
            </div>
        `;
        
        card.addEventListener('click', () => {
            this.onClick();
        });
        
        this.container.appendChild(card);
        this.element = card;
    }

    onClick() {
        if (typeof openJourneyDetail === 'function') {
            openJourneyDetail(this.journey);
        }
    }
}

class NodeCard {
    constructor(container, node) {
        this.container = container;
        this.node = node;
        this.render();
    }

    render() {
        const card = document.createElement('div');
        card.className = 'node-card';
        card.innerHTML = `
            <h5>${this.node.title}</h5>
            <p>${this.node.content.substring(0, 100)}${this.node.content.length > 100 ? '...' : ''}</p>
            <span class="node-type-badge">${this.node.type}</span>
        `;
        
        card.addEventListener('click', () => {
            this.onClick();
        });
        
        this.container.appendChild(card);
        this.element = card;
    }

    onClick() {
        if (typeof openNodeEditor === 'function') {
            openNodeEditor(this.node);
        }
    }
}

class SessionCard {
    constructor(container, session) {
        this.container = container;
        this.session = session;
        this.render();
    }

    render() {
        const card = document.createElement('div');
        card.className = 'session-card';
        card.innerHTML = `
            <h4>${this.session.title}</h4>
            <p>${this.session.description}</p>
            <div class="session-participants">
                <i class="fas fa-users"></i>
                <span>${this.session.participantIds.length}/${this.session.maxParticipants} participants</span>
                <span class="session-status ${this.session.status}">${this.session.status}</span>
            </div>
        `;
        
        card.addEventListener('click', () => {
            this.onClick();
        });
        
        this.container.appendChild(card);
        this.element = card;
    }

    onClick() {
        if (typeof joinSession === 'function') {
            joinSession(this.session.id);
        }
    }
}

class VirtualWhiteboard {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = false;
        this.currentTool = 'pen';
        this.currentColor = '#000000';
        this.currentSize = 2;
        this.paths = [];
        this.currentPath = [];
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => {
            if (this.currentTool === 'pen') {
                this.startDrawing(e);
            }
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isDrawing && this.currentTool === 'pen') {
                this.draw(e);
            }
        });

        this.canvas.addEventListener('mouseup', () => {
            this.stopDrawing();
        });

        this.canvas.addEventListener('mouseout', () => {
            this.stopDrawing();
        });
    }

    startDrawing(e) {
        this.isDrawing = true;
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.currentPath = [{
            x, y,
            color: this.currentColor,
            size: this.currentSize
        }];
    }

    draw(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.currentPath.push({ x, y });
        this.redraw();
    }

    stopDrawing() {
        if (this.isDrawing && this.currentPath.length > 0) {
            this.paths.push([...this.currentPath]);
            this.currentPath = [];
        }
        this.isDrawing = false;
    }

    redraw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw all paths
        [...this.paths, this.currentPath].forEach(path => {
            if (path.length < 2) return;
            
            this.ctx.strokeStyle = path[0].color || this.currentColor;
            this.ctx.lineWidth = path[0].size || this.currentSize;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            
            this.ctx.beginPath();
            this.ctx.moveTo(path[0].x, path[0].y);
            
            for (let i = 1; i < path.length; i++) {
                this.ctx.lineTo(path[i].x, path[i].y);
            }
            
            this.ctx.stroke();
        });
    }

    setTool(tool) {
        this.currentTool = tool;
    }

    setColor(color) {
        this.currentColor = color;
    }

    setSize(size) {
        this.currentSize = size;
    }

    clear() {
        this.paths = [];
        this.currentPath = [];
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

// Export components to global scope
window.ConstellationRenderer = ConstellationRenderer;
window.ResonanceCard = ResonanceCard;
window.NodeCard = NodeCard;
window.SessionCard = SessionCard;
window.VirtualWhiteboard = VirtualWhiteboard;