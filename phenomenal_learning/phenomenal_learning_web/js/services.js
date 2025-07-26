// Services for Phenomenal Learning Platform

class LLMService {
    constructor() {
        this.isEnabled = false; // Set to true when backend is available
        this.apiUrl = '/api/llm'; // Backend API endpoint
    }

    async generateQuestions(coreQuestion) {
        if (!this.isEnabled) {
            // Return mock data for demo
            return this.getMockQuestions(coreQuestion);
        }

        try {
            const response = await fetch(`${this.apiUrl}/generate-questions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question: coreQuestion })
            });

            if (!response.ok) {
                throw new Error('Failed to generate questions');
            }

            return await response.json();
        } catch (error) {
            console.error('Error generating questions:', error);
            return this.getMockQuestions(coreQuestion);
        }
    }

    async chunkContent(content) {
        if (!this.isEnabled) {
            return this.getMockChunks(content);
        }

        try {
            const response = await fetch(`${this.apiUrl}/chunk`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content })
            });

            if (!response.ok) {
                throw new Error('Failed to chunk content');
            }

            return await response.json();
        } catch (error) {
            console.error('Error chunking content:', error);
            return this.getMockChunks(content);
        }
    }

    async generateDialogueSuggestions(context) {
        if (!this.isEnabled) {
            return this.getMockDialogueSuggestions();
        }

        try {
            const response = await fetch(`${this.apiUrl}/dialogue-suggestions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ context })
            });

            if (!response.ok) {
                throw new Error('Failed to generate dialogue suggestions');
            }

            return await response.json();
        } catch (error) {
            console.error('Error generating dialogue suggestions:', error);
            return this.getMockDialogueSuggestions();
        }
    }

    // Mock data for demo purposes
    getMockQuestions(coreQuestion) {
        const questions = [
            `What assumptions underlie your understanding of "${coreQuestion}"?`,
            `How might someone from a completely different background approach "${coreQuestion}"?`,
            `What would it mean if the opposite of your current belief about "${coreQuestion}" were true?`,
            `What questions does "${coreQuestion}" not ask that it should?`,
            `How has your perspective on "${coreQuestion}" changed over time?`
        ];
        return { questions: questions.slice(0, 3) };
    }

    getMockChunks(content) {
        const words = content.split(' ');
        const chunkSize = Math.max(10, Math.floor(words.length / 3));
        const chunks = [];
        
        for (let i = 0; i < words.length; i += chunkSize) {
            chunks.push(words.slice(i, i + chunkSize).join(' '));
        }
        
        return { chunks };
    }

    getMockDialogueSuggestions() {
        return {
            suggestions: [
                "What surprises you most about this perspective?",
                "How does this connect to your personal experience?",
                "What would someone who disagrees with this say?",
                "What questions does this raise for you?",
                "How might this apply in a different context?"
            ]
        };
    }
}

class JourneyService {
    constructor() {
        this.llmService = new LLMService();
    }

    async createJourney(data) {
        const journey = new LearningJourney({
            title: data.title,
            coreQuestion: data.coreQuestion,
            description: data.description,
            tags: data.tags || [],
            userId: data.userId
        });

        journey.save();

        // Generate initial learning path
        await this.generateInitialNodes(journey);

        return journey;
    }

    async generateInitialNodes(journey) {
        try {
            const questions = await this.llmService.generateQuestions(journey.coreQuestion);
            
            // Create initial exploration nodes based on generated questions
            questions.questions.forEach((question, index) => {
                const node = new LearningNode({
                    journeyId: journey.id,
                    title: `Exploration ${index + 1}`,
                    content: question,
                    type: 'exploration',
                    position: {
                        x: 200 + (index % 3) * 200,
                        y: 150 + Math.floor(index / 3) * 150
                    }
                });
                
                journey.addNode(node);
            });

            return true;
        } catch (error) {
            console.error('Error generating initial nodes:', error);
            return false;
        }
    }

    async remixJourney(originalJourneyId, newTitle, newPerspective) {
        const originalJourney = LearningJourney.load(originalJourneyId);
        if (!originalJourney) {
            throw new Error('Original journey not found');
        }

        const remixedJourney = new LearningJourney({
            title: newTitle,
            coreQuestion: originalJourney.coreQuestion,
            description: `Remixed from "${originalJourney.title}" with perspective: ${newPerspective}`,
            tags: [...originalJourney.tags, 'remix'],
            parentJourneyId: originalJourneyId,
            userId: storage.get('user')?.id
        });

        remixedJourney.save();

        // Copy and adapt original nodes
        const originalNodes = originalJourney.getNodes();
        originalNodes.forEach((originalNode, index) => {
            const adaptedNode = new LearningNode({
                journeyId: remixedJourney.id,
                title: `${originalNode.title} (Remixed)`,
                content: `Original: ${originalNode.content}\n\nNew Perspective: ${newPerspective}`,
                type: originalNode.type,
                position: {
                    x: originalNode.position.x + 50,
                    y: originalNode.position.y + 50
                }
            });
            
            remixedJourney.addNode(adaptedNode);
        });

        return remixedJourney;
    }

    calculateResonance(journey1, journey2) {
        let resonanceScore = 0;
        
        // Compare tags
        const commonTags = journey1.tags.filter(tag => journey2.tags.includes(tag));
        resonanceScore += commonTags.length * 0.3;

        // Compare core questions (simple word overlap)
        const words1 = journey1.coreQuestion.toLowerCase().split(' ');
        const words2 = journey2.coreQuestion.toLowerCase().split(' ');
        const commonWords = words1.filter(word => words2.includes(word) && word.length > 3);
        resonanceScore += commonWords.length * 0.2;

        // Compare node types
        const nodes1 = journey1.getNodes();
        const nodes2 = journey2.getNodes();
        const types1 = nodes1.map(n => n.type);
        const types2 = nodes2.map(n => n.type);
        const commonTypes = types1.filter(type => types2.includes(type));
        resonanceScore += (commonTypes.length / Math.max(types1.length, types2.length, 1)) * 0.5;

        return Math.min(1.0, resonanceScore);
    }

    findResonantJourneys(targetJourney, limit = 5) {
        const allJourneys = LearningJourney.loadAll()
            .filter(j => j.id !== targetJourney.id && j.isPublic);

        const resonances = allJourneys.map(journey => ({
            journey,
            resonance: this.calculateResonance(targetJourney, journey)
        }));

        return resonances
            .sort((a, b) => b.resonance - a.resonance)
            .slice(0, limit)
            .filter(r => r.resonance > 0.1);
    }
}

class ResonanceService {
    constructor() {
        this.journeyService = new JourneyService();
    }

    updateUserProfile(userId, journey) {
        const profile = ResonanceProfile.load(userId);
        profile.updateFromJourney(journey);
        return profile;
    }

    findResonantUsers(userId, limit = 10) {
        const userProfile = ResonanceProfile.load(userId);
        const allJourneys = LearningJourney.loadAll();
        
        // Group journeys by user
        const userJourneys = {};
        allJourneys.forEach(journey => {
            if (journey.userId !== userId) {
                if (!userJourneys[journey.userId]) {
                    userJourneys[journey.userId] = [];
                }
                userJourneys[journey.userId].push(journey);
            }
        });

        // Calculate resonance with each user
        const userResonances = Object.keys(userJourneys).map(otherUserId => {
            const otherProfile = ResonanceProfile.load(otherUserId);
            const resonance = this.calculateProfileResonance(userProfile, otherProfile);
            
            return {
                userId: otherUserId,
                resonance,
                journeys: userJourneys[otherUserId]
            };
        });

        return userResonances
            .sort((a, b) => b.resonance - a.resonance)
            .slice(0, limit)
            .filter(r => r.resonance > 0.2);
    }

    calculateProfileResonance(profile1, profile2) {
        let resonance = 0;
        
        // Compare topic weights
        const topics1 = Object.keys(profile1.topicWeights);
        const topics2 = Object.keys(profile2.topicWeights);
        const commonTopics = topics1.filter(topic => topics2.includes(topic));
        
        commonTopics.forEach(topic => {
            const weight1 = profile1.topicWeights[topic];
            const weight2 = profile2.topicWeights[topic];
            resonance += Math.min(weight1, weight2) / Math.max(weight1, weight2, 1) * 0.4;
        });

        // Compare learning styles
        const styles = ['reflective', 'active', 'theoretical', 'pragmatic'];
        styles.forEach(style => {
            const style1 = profile1.learningStyles[style] || 0.5;
            const style2 = profile2.learningStyles[style] || 0.5;
            resonance += (1 - Math.abs(style1 - style2)) * 0.1;
        });

        // Compare exploration vs closure preference
        const explorationDiff = Math.abs(profile1.explorationVsClosure - profile2.explorationVsClosure);
        resonance += (1 - explorationDiff) * 0.2;

        return Math.min(1.0, resonance);
    }

    generateCommunityInsight(insights) {
        if (insights.length < 2) return null;

        // Find common themes
        const allTags = insights.flatMap(insight => insight.tags);
        const tagCounts = {};
        allTags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });

        const commonTags = Object.keys(tagCounts)
            .filter(tag => tagCounts[tag] >= 2)
            .sort((a, b) => tagCounts[b] - tagCounts[a]);

        if (commonTags.length === 0) return null;

        const communityInsight = new CommunityInsight({
            title: `Community Pattern: ${commonTags[0]}`,
            description: `A pattern has emerged around the theme of "${commonTags[0]}" from ${insights.length} different perspectives.`,
            contributingInsightIds: insights.map(i => i.id),
            contributorUserIds: [...new Set(insights.map(i => i.userId))],
            tags: commonTags.slice(0, 5),
            synthesisMethod: 'automatic',
            confidenceScore: Math.min(0.9, insights.length / 10)
        });

        communityInsight.save();
        return communityInsight;
    }
}

class SessionService {
    constructor() {
        this.activeSession = null;
    }

    createSession(data) {
        const session = new SyncSession({
            title: data.title,
            description: data.description,
            topic: data.topic,
            maxParticipants: data.maxParticipants || 8,
            hostId: storage.get('user')?.id
        });

        session.save();
        return session;
    }

    joinSession(sessionId) {
        const session = SyncSession.load(sessionId);
        const userId = storage.get('user')?.id;
        
        if (session && session.join(userId)) {
            this.activeSession = session;
            return session;
        }
        return null;
    }

    leaveSession(sessionId) {
        const session = SyncSession.load(sessionId);
        const userId = storage.get('user')?.id;
        
        if (session) {
            session.leave(userId);
            if (this.activeSession && this.activeSession.id === sessionId) {
                this.activeSession = null;
            }
            return true;
        }
        return false;
    }

    startSession(sessionId) {
        const session = SyncSession.load(sessionId);
        if (session && session.hostId === storage.get('user')?.id) {
            session.start();
            return session;
        }
        return null;
    }

    getActiveSessions() {
        return SyncSession.getActive();
    }
}

// Dify workflow API 调用
async function callDifyWorkflow(question) {
    console.log('开始调用 Dify API，问题:', question);

    const apiUrl = 'http://dify.myia.fun/v1/chat-messages';
    const apiKey = 'app-SCmEMYmTLvhOoXCkOt4ff9DN'; // 使用正确的 API key

    try {
        console.log('发送请求到:', apiUrl);
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                inputs: {},
                query: question,
                response_mode: 'blocking',
                conversation_id: '',
                user: 'phenomenal-learning-user'
            })
        });

        console.log('响应状态:', response.status, response.statusText);

        if (response.ok) {
            const data = await response.json();
            console.log('成功获取响应:', data);
            
            // 根据 Dify API 响应格式提取答案
            if (data.answer) {
                return data.answer;
            } else if (data.message) {
                return data.message;
            } else if (data.data && data.data.answer) {
                return data.data.answer;
            } else {
                console.warn('未知的响应格式:', data);
                return JSON.stringify(data);
            }
        } else {
            const errorText = await response.text();
            console.error('API 错误响应:', errorText);
            throw new Error(`Dify API 调用失败: ${response.status} - ${errorText}`);
        }
    } catch (error) {
        console.error('Dify API 调用异常:', error);
        
        // 如果是网络错误，返回模拟回复
        if (error.name === 'TypeError' || error.message.includes('Failed to fetch')) {
            console.log('网络错误，使用模拟回复');
            return `模拟 Dify 回复：关于"${question}"，这是一个很有趣的问题。由于网络连接问题，暂时无法获取 AI 回复，但你可以继续探索这个主题。`;
        }
        
        throw error;
    }
}

// Create global service instances
window.llmService = new LLMService();
window.journeyService = new JourneyService();
window.resonanceService = new ResonanceService();
window.sessionService = new SessionService();
window.callDifyWorkflow = callDifyWorkflow;