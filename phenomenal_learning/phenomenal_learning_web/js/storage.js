// Local Storage Manager for Phenomenal Learning Platform
class StorageManager {
    constructor() {
        this.prefix = 'phenomenal_learning_';
        this.init();
    }

    init() {
        // Initialize default data if not exists
        if (!this.get('user')) {
            this.set('user', {
                id: this.generateId(),
                name: 'Learning Explorer',
                email: 'explorer@learning.com',
                createdAt: new Date().toISOString(),
                journeyIds: [],
                preferences: {
                    explorationVsClosure: 50,
                    learningStyles: {},
                    topicInterests: []
                }
            });
        }

        if (!this.get('journeys')) {
            this.set('journeys', {});
        }

        if (!this.get('nodes')) {
            this.set('nodes', {});
        }

        if (!this.get('insights')) {
            this.set('insights', {});
        }

        if (!this.get('sessions')) {
            this.set('sessions', {});
        }

        if (!this.get('community_insights')) {
            this.set('community_insights', {});
        }
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    get(key) {
        try {
            const item = localStorage.getItem(this.prefix + key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Error getting from storage:', error);
            return null;
        }
    }

    set(key, value) {
        try {
            localStorage.setItem(this.prefix + key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error setting to storage:', error);
            return false;
        }
    }

    remove(key) {
        try {
            localStorage.removeItem(this.prefix + key);
            return true;
        } catch (error) {
            console.error('Error removing from storage:', error);
            return false;
        }
    }

    // Journey-specific methods
    saveJourney(journey) {
        const journeys = this.get('journeys') || {};
        journeys[journey.id] = {
            ...journey,
            updatedAt: new Date().toISOString()
        };
        this.set('journeys', journeys);
        
        // Update user's journey list
        const user = this.get('user');
        if (user && !user.journeyIds.includes(journey.id)) {
            user.journeyIds.push(journey.id);
            this.set('user', user);
        }
        
        return true;
    }

    getJourney(journeyId) {
        const journeys = this.get('journeys') || {};
        return journeys[journeyId] || null;
    }

    getAllJourneys() {
        const journeys = this.get('journeys') || {};
        return Object.values(journeys);
    }

    deleteJourney(journeyId) {
        const journeys = this.get('journeys') || {};
        delete journeys[journeyId];
        this.set('journeys', journeys);

        // Remove from user's journey list
        const user = this.get('user');
        if (user) {
            user.journeyIds = user.journeyIds.filter(id => id !== journeyId);
            this.set('user', user);
        }

        // Clean up associated nodes
        const nodes = this.get('nodes') || {};
        Object.keys(nodes).forEach(nodeId => {
            if (nodes[nodeId].journeyId === journeyId) {
                delete nodes[nodeId];
            }
        });
        this.set('nodes', nodes);

        return true;
    }

    // Node-specific methods
    saveNode(node) {
        const nodes = this.get('nodes') || {};
        nodes[node.id] = {
            ...node,
            updatedAt: new Date().toISOString()
        };
        this.set('nodes', nodes);

        // Add node to journey
        const journey = this.getJourney(node.journeyId);
        if (journey) {
            if (!journey.nodeIds) journey.nodeIds = [];
            if (!journey.nodeIds.includes(node.id)) {
                journey.nodeIds.push(node.id);
                this.saveJourney(journey);
            }
        }

        return true;
    }

    getNode(nodeId) {
        const nodes = this.get('nodes') || {};
        return nodes[nodeId] || null;
    }

    getJourneyNodes(journeyId) {
        const nodes = this.get('nodes') || {};
        return Object.values(nodes).filter(node => node.journeyId === journeyId);
    }

    // Insight-specific methods
    saveInsight(insight) {
        const insights = this.get('insights') || {};
        insights[insight.id] = {
            ...insight,
            createdAt: insight.createdAt || new Date().toISOString()
        };
        this.set('insights', insights);

        // Add insight to node
        const node = this.getNode(insight.nodeId);
        if (node) {
            if (!node.insightIds) node.insightIds = [];
            if (!node.insightIds.includes(insight.id)) {
                node.insightIds.push(insight.id);
                this.saveNode(node);
            }
        }

        return true;
    }

    getInsight(insightId) {
        const insights = this.get('insights') || {};
        return insights[insightId] || null;
    }

    getNodeInsights(nodeId) {
        const insights = this.get('insights') || {};
        return Object.values(insights).filter(insight => insight.nodeId === nodeId);
    }

    // Session-specific methods
    saveSession(session) {
        const sessions = this.get('sessions') || {};
        sessions[session.id] = {
            ...session,
            updatedAt: new Date().toISOString()
        };
        this.set('sessions', sessions);
        return true;
    }

    getSession(sessionId) {
        const sessions = this.get('sessions') || {};
        return sessions[sessionId] || null;
    }

    getAllSessions() {
        const sessions = this.get('sessions') || {};
        return Object.values(sessions);
    }

    // Search and filter methods
    searchJourneys(query) {
        const journeys = this.getAllJourneys();
        const lowercaseQuery = query.toLowerCase();
        
        return journeys.filter(journey => 
            journey.title.toLowerCase().includes(lowercaseQuery) ||
            journey.coreQuestion.toLowerCase().includes(lowercaseQuery) ||
            journey.description.toLowerCase().includes(lowercaseQuery) ||
            (journey.tags && journey.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)))
        );
    }

    getRecentJourneys(limit = 5) {
        const journeys = this.getAllJourneys();
        return journeys
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .slice(0, limit);
    }

    // Analytics methods
    getJourneyStats() {
        const journeys = this.getAllJourneys();
        const nodes = this.get('nodes') || {};
        const insights = this.get('insights') || {};

        return {
            totalJourneys: journeys.length,
            totalNodes: Object.keys(nodes).length,
            totalInsights: Object.keys(insights).length,
            activeJourneys: journeys.filter(j => {
                const daysSinceUpdate = (Date.now() - new Date(j.updatedAt)) / (1000 * 60 * 60 * 24);
                return daysSinceUpdate <= 7;
            }).length
        };
    }

    // Export/Import methods
    exportData() {
        return {
            user: this.get('user'),
            journeys: this.get('journeys'),
            nodes: this.get('nodes'),
            insights: this.get('insights'),
            sessions: this.get('sessions'),
            community_insights: this.get('community_insights'),
            exportDate: new Date().toISOString()
        };
    }

    importData(data) {
        try {
            if (data.user) this.set('user', data.user);
            if (data.journeys) this.set('journeys', data.journeys);
            if (data.nodes) this.set('nodes', data.nodes);
            if (data.insights) this.set('insights', data.insights);
            if (data.sessions) this.set('sessions', data.sessions);
            if (data.community_insights) this.set('community_insights', data.community_insights);
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    // Clear all data
    clearAll() {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(this.prefix)) {
                localStorage.removeItem(key);
            }
        });
        this.init();
    }
}

// Create global storage instance
window.storage = new StorageManager();