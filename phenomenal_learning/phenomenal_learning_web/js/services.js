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
            userId: data.userId,
            metadata: data.metadata || {}
        });

        journey.save();

        // Generate initial learning path
        await this.generateInitialNodes(journey);

        return journey;
    }

    async generateInitialNodes(journey) {
        try {
            // 获取journey的metadata中的角度信息
            const metadata = journey.metadata || {};
            const availableAngles = metadata.availableAngles || [];
            const selectedOption = metadata.selectedOption || '';
            
            console.log('generateInitialNodes - availableAngles:', availableAngles);
            console.log('generateInitialNodes - selectedOption:', selectedOption);
            
            // 创建初始exploration节点，每个使用不同的角度
            const anglesToUse = [selectedOption, ...availableAngles.slice(0, 2)]; // 使用selectedOption + 前2个availableAngles
            
            anglesToUse.forEach((angle, index) => {
                if (angle) {
                    // 随机生成mode
                    const random = Math.random();
                    let mode;
                    if (random < 0.7) {
                        mode = '解释模式';
                    } else if (random < 0.9) {
                        mode = '提问模式';
                    } else {
                        mode = '游戏模式';
                    }
                    
                    const node = new LearningNode({
                        journeyId: journey.id,
                        title: `Exploration ${index + 1}`,
                        content: `Q: ${angle}`,
                        type: 'exploration',
                        mode: mode, // 添加mode属性
                        position: {
                            x: 200 + (index % 3) * 200,
                            y: 150 + Math.floor(index / 3) * 150
                        }
                    });
                    
                    journey.addNode(node);
                    console.log(`创建exploration节点 ${index + 1}，使用角度: ${angle}，模式: ${mode}`);
                }
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

// 通用 Dify API 调用工具
async function callDifyApi({ query, apiKey, inputs = {} }) {
    const apiUrl = 'http://dify.myia.fun/v1/chat-messages';
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                inputs: inputs,
                query: query,
                response_mode: 'blocking',
                conversation_id: '',
                user: 'phenomenal-learning-user'
            })
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Dify API 错误: ${response.status} - ${errorText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Dify API 调用异常:', error);
        throw error;
    }
}

// Dify workflow API 调用
async function callDifyWorkflow(question) {
    console.log('开始调用 Dify API，问题:', question);
    const apiKey = 'app-SCmEMYmTLvhOoXCkOt4ff9DN';
    try {
        const data = await callDifyApi({ query: question, apiKey });
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
    } catch (error) {
        // 网络错误或异常时返回模拟回复
        return `模拟 Dify 回复：关于"${question}"，这是一个很有趣的问题。由于网络连接问题，暂时无法获取 AI 回复，但你可以继续探索这个主题。`;
    }
}

// 获取学习起点选项
async function callDifyGetOptions(word) {
    const apiKey = 'app-pfiGTmo7pH8PrIhpA89sUgo4';
    const query = `基于词汇"${word}"，请提供三个不同的学习起点选项，每个选项用换行符分隔，格式简洁明了`;
    try {
        const data = await callDifyApi({ query, apiKey });
        let result = '';
        if (data.answer) {
            result = data.answer;
        } else if (data.message) {
            result = data.message;
        } else if (data.data && data.data.answer) {
            result = data.data.answer;
        } else {
            console.warn('未知的响应格式:', data);
            return [];
        }
        let options = result.split(/\r?\n|\n|\r|；|;|,|，/)
            .map(s => s.trim().replace(/^\[|\]$/g, '').replace(/^['"]|['"]$/g, ''))
            .filter(s => s);
        console.log('Dify分割后的选项:', options);
        return options.slice(0, 3);
    } catch (error) {
        return [];
    }
}

// 词汇违禁检查
async function callDifyCheck(word) {
    const apiKey = 'app-pfiGTmo7pH8PrIhpA89sUgo4';
    const query = `请检查词汇"${word}"是否违禁，只返回"违禁"或"正常"`;
    try {
        const data = await callDifyApi({ query, apiKey });
        let result = '';
        if (data.answer) {
            result = data.answer;
        } else if (data.message) {
            result = data.message;
        } else if (data.data && data.data.answer) {
            result = data.data.answer;
        } else {
            console.warn('未知的响应格式:', data);
            return '正常';
        }
        if (result.includes('违禁')) {
            return '违禁';
        } else {
            return '正常';
        }
    } catch (error) {
        return '正常';
    }
}

// 存储用户输入内容到Dify
async function callDifyStore(word) {
    const apiKey = 'app-SCmEMYmTLvhOoXCkOt4ff9DN';
    const query = `用户输入了词汇"${word}"，请分析并存储这个学习兴趣点`;
    try {
        const data = await callDifyApi({ query, apiKey });
        let result = '';
        if (data.answer) {
            result = data.answer;
        } else if (data.message) {
            result = data.message;
        } else if (data.data && data.data.answer) {
            result = data.data.answer;
        } else {
            console.warn('未知的响应格式:', data);
            return '存储失败';
        }
        console.log('Dify存储结果:', result);
        return result;
    } catch (error) {
        console.error('Dify存储调用失败:', error);
        return '存储失败';
    }
}

// Exploration聊天专用的Dify调用
async function callDifyExploration(angle, mode, userInput = '1') {
    const apiKey = 'app-fJXMTR0YNr9GCgsGPbiNCZpm';
    
    // 构建输入参数
    const inputs = {
        angle: angle,
        mode: mode,
        user_input: userInput
    };
    
    try {
        const data = await callDifyApi({ 
            query: userInput, 
            apiKey,
            inputs: inputs
        });
        let result = '';
        if (data.answer) {
            result = data.answer;
        } else if (data.message) {
            result = data.message;
        } else if (data.data && data.data.answer) {
            result = data.data.answer;
        } else {
            console.warn('未知的响应格式:', data);
            return 'Exploration Dify调用失败';
        }
        console.log('Exploration Dify结果:', result);
        return result;
    } catch (error) {
        console.error('Exploration Dify调用失败:', error);
        return 'Exploration Dify调用失败';
    }
}

// Create global service instances
window.llmService = new LLMService();
window.journeyService = new JourneyService();
window.resonanceService = new ResonanceService();
window.sessionService = new SessionService();
window.callDifyWorkflow = callDifyWorkflow;
window.callDifyCheck = callDifyCheck;
window.callDifyGetOptions = callDifyGetOptions;
window.callDifyStore = callDifyStore;
window.callDifyExploration = callDifyExploration;