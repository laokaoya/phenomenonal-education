// Data Models for Phenomenal Learning Platform

class User {
    constructor(data = {}) {
        this.id = data.id || storage.generateId();
        this.name = data.name || this.generateDefaultName();
        this.email = data.email || 'explorer@learning.com';
        this.avatarUrl = data.avatarUrl || null;
        this.createdAt = data.createdAt || new Date().toISOString();
        this.journeyIds = data.journeyIds || [];
        this.preferences = data.preferences || {
            explorationVsClosure: 50,
            learningStyles: {},
            topicInterests: []
        };
        this.profile = data.profile || {};
    }

    generateDefaultName() {
        // 生成6位随机编码
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `游客${code}`;
    }

    save() {
        return storage.set('user', this);
    }

    static load() {
        const userData = storage.get('user');
        return userData ? new User(userData) : new User();
    }
}

class LearningJourney {
    constructor(data = {}) {
        this.id = data.id || storage.generateId();
        this.userId = data.userId || storage.get('user')?.id;
        this.title = data.title || '';
        this.coreQuestion = data.coreQuestion || '';
        this.description = data.description || '';
        this.nodeIds = data.nodeIds || [];
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
        this.isPublic = data.isPublic || false;
        this.tags = data.tags || [];
        this.parentJourneyId = data.parentJourneyId || null;
        this.resonanceScore = data.resonanceScore || 0;
        this.metadata = data.metadata || {};
    }

    save() {
        return storage.saveJourney(this);
    }

    delete() {
        return storage.deleteJourney(this.id);
    }

    getNodes() {
        return storage.getJourneyNodes(this.id);
    }

    addNode(node) {
        node.journeyId = this.id;
        const saved = node.save();
        if (saved && !this.nodeIds.includes(node.id)) {
            this.nodeIds.push(node.id);
            this.save();
        }
        return saved;
    }

    static load(journeyId) {
        const data = storage.getJourney(journeyId);
        return data ? new LearningJourney(data) : null;
    }

    static loadAll() {
        return storage.getAllJourneys().map(data => new LearningJourney(data));
    }

    static search(query) {
        return storage.searchJourneys(query).map(data => new LearningJourney(data));
    }
}

class LearningNode {
    constructor(data = {}) {
        this.id = data.id || storage.generateId();
        this.journeyId = data.journeyId || '';
        this.title = data.title || '';
        this.content = data.content || '';
        this.type = data.type || 'exploration';
        this.mode = data.mode || '解释模式'; // 添加mode属性
        this.insightIds = data.insightIds || [];
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
        this.resources = data.resources || {};
        this.reflectionQuestions = data.reflectionQuestions || [];
        this.surpriseLevel = data.surpriseLevel || null;
        this.emotionalIntensity = data.emotionalIntensity || null;
        this.connectionToCore = data.connectionToCore || '';
        this.position = data.position || { x: 0, y: 0 }; // For visualization
    }

    save() {
        return storage.saveNode(this);
    }

    getInsights() {
        return storage.getNodeInsights(this.id);
    }

    addInsight(insight) {
        insight.nodeId = this.id;
        const saved = insight.save();
        if (saved && !this.insightIds.includes(insight.id)) {
            this.insightIds.push(insight.id);
            this.save();
        }
        return saved;
    }

    static load(nodeId) {
        const data = storage.getNode(nodeId);
        return data ? new LearningNode(data) : null;
    }

    static getTypeColor(type, mode) {
        console.log('getTypeColor被调用:', { type, mode });
        
        // 如果提供了mode参数，根据mode返回颜色
        if (mode) {
            const modeColors = {
                '解释模式': '#3B82F6', // 蓝色
                '提问模式': '#F59E0B', // 橙色
                '游戏模式': '#10B981'  // 绿色
            };
            const color = modeColors[mode] || modeColors['解释模式'];
            console.log('使用mode颜色:', color);
            return color;
        }
        
        // 如果没有mode参数，使用原来的type颜色
        const colors = {
            exploration: '#3B82F6',
            reflection: '#8B5CF6',
            insight: '#10B981',
            discovery: '#F59E0B',
            connection: '#EF4444',
            synthesis: '#6366F1'
        };
        const color = colors[type] || colors.exploration;
        console.log('使用type颜色:', color);
        return color;
    }

    static getTypeIcon(type) {
        const icons = {
            exploration: 'fas fa-search',
            reflection: 'fas fa-mirror',
            insight: 'fas fa-lightbulb',
            discovery: 'fas fa-gem',
            connection: 'fas fa-link',
            synthesis: 'fas fa-puzzle-piece'
        };
        return icons[type] || icons.exploration;
    }
}

class Insight {
    constructor(data = {}) {
        this.id = data.id || storage.generateId();
        this.nodeId = data.nodeId || '';
        this.userId = data.userId || storage.get('user')?.id;
        this.content = data.content || '';
        this.type = data.type || 'observation';
        this.createdAt = data.createdAt || new Date().toISOString();
        this.tags = data.tags || [];
        this.confidenceLevel = data.confidenceLevel || 0.5;
        this.triggerContext = data.triggerContext || '';
        this.emotionalContext = data.emotionalContext || {};
    }

    save() {
        return storage.saveInsight(this);
    }

    static load(insightId) {
        const data = storage.getInsight(insightId);
        return data ? new Insight(data) : null;
    }

    static getTypeColor(type) {
        const colors = {
            observation: '#6B7280',
            connection: '#3B82F6',
            pattern: '#8B5CF6',
            question: '#F59E0B',
            synthesis: '#10B981',
            breakthrough: '#EF4444'
        };
        return colors[type] || colors.observation;
    }
}

class SyncSession {
    constructor(data = {}) {
        this.id = data.id || storage.generateId();
        this.title = data.title || '';
        this.description = data.description || '';
        this.hostId = data.hostId || storage.get('user')?.id;
        this.participantIds = data.participantIds || [];
        this.maxParticipants = data.maxParticipants || 8;
        this.status = data.status || 'waiting'; // waiting, active, ended
        this.createdAt = data.createdAt || new Date().toISOString();
        this.startedAt = data.startedAt || null;
        this.endedAt = data.endedAt || null;
        this.topic = data.topic || '';
        this.tools = data.tools || ['whiteboard', 'chat'];
        this.isPublic = data.isPublic || true;
    }

    save() {
        return storage.saveSession(this);
    }

    join(userId) {
        if (this.participantIds.length < this.maxParticipants && !this.participantIds.includes(userId)) {
            this.participantIds.push(userId);
            this.save();
            return true;
        }
        return false;
    }

    leave(userId) {
        this.participantIds = this.participantIds.filter(id => id !== userId);
        this.save();
        return true;
    }

    start() {
        this.status = 'active';
        this.startedAt = new Date().toISOString();
        this.save();
    }

    end() {
        this.status = 'ended';
        this.endedAt = new Date().toISOString();
        this.save();
    }

    static load(sessionId) {
        const data = storage.getSession(sessionId);
        return data ? new SyncSession(data) : null;
    }

    static loadAll() {
        return storage.getAllSessions().map(data => new SyncSession(data));
    }
    
    static getActive() {
        return this.loadAll().filter(session => session.status === 'active' || session.status === 'waiting');
    }
}

class ResonanceProfile {
    constructor(data = {}) {
        this.id = data.id || storage.generateId();
        this.userId = data.userId || storage.get('user')?.id;
        this.topicWeights = data.topicWeights || {};
        this.learningStyles = data.learningStyles || {};
        this.preferredQuestionTypes = data.preferredQuestionTypes || [];
        this.emotionalPreferences = data.emotionalPreferences || {};
        this.lastUpdated = data.lastUpdated || new Date().toISOString();
        this.similarUserIds = data.similarUserIds || [];
        this.explorationVsClosure = data.explorationVsClosure || 0.5;
    }

    updateFromJourney(journey) {
        // Extract topics from journey
        if (journey.tags) {
            journey.tags.forEach(tag => {
                this.topicWeights[tag] = (this.topicWeights[tag] || 0) + 1;
            });
        }

        // Update learning style based on journey characteristics
        const nodes = journey.getNodes();
        const reflectionRatio = nodes.filter(n => n.type === 'reflection').length / Math.max(nodes.length, 1);
        this.learningStyles.reflective = (this.learningStyles.reflective || 0.5) + (reflectionRatio - 0.5) * 0.1;

        this.lastUpdated = new Date().toISOString();
        this.save();
    }

    save() {
        const profiles = storage.get('resonance_profiles') || {};
        profiles[this.userId] = this;
        return storage.set('resonance_profiles', profiles);
    }

    static load(userId) {
        const profiles = storage.get('resonance_profiles') || {};
        const data = profiles[userId];
        return data ? new ResonanceProfile(data) : new ResonanceProfile({ userId });
    }
}

class CommunityInsight {
    constructor(data = {}) {
        this.id = data.id || storage.generateId();
        this.title = data.title || '';
        this.description = data.description || '';
        this.contributingInsightIds = data.contributingInsightIds || [];
        this.contributorUserIds = data.contributorUserIds || [];
        this.emergenceDate = data.emergenceDate || new Date().toISOString();
        this.resonanceVotes = data.resonanceVotes || {};
        this.tags = data.tags || [];
        this.synthesisMethod = data.synthesisMethod || 'organic';
        this.confidenceScore = data.confidenceScore || 0.5;
        this.alternativePerspectives = data.alternativePerspectives || [];
    }

    get totalResonance() {
        return Object.values(this.resonanceVotes).reduce((sum, vote) => sum + vote, 0);
    }

    vote(userId, vote) {
        this.resonanceVotes[userId] = vote;
        this.save();
    }

    save() {
        const insights = storage.get('community_insights') || {};
        insights[this.id] = this;
        return storage.set('community_insights', insights);
    }

    static load(insightId) {
        const insights = storage.get('community_insights') || {};
        const data = insights[insightId];
        return data ? new CommunityInsight(data) : null;
    }

    static loadAll() {
        const insights = storage.get('community_insights') || {};
        return Object.values(insights).map(data => new CommunityInsight(data));
    }
}

// Export models to global scope
window.User = User;
window.LearningJourney = LearningJourney;
window.LearningNode = LearningNode;
window.Insight = Insight;
window.SyncSession = SyncSession;
window.ResonanceProfile = ResonanceProfile;
window.CommunityInsight = CommunityInsight;