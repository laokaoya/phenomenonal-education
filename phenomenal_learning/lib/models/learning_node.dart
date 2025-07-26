import 'package:hive/hive.dart';
import 'insight.dart';

part 'learning_node.g.dart';

@HiveType(typeId: 2)
class LearningNode extends HiveObject {
  @HiveField(0)
  String id;
  
  @HiveField(1)
  String journeyId;
  
  @HiveField(2)
  String title;
  
  @HiveField(3)
  String content;
  
  @HiveField(4)
  NodeType type;
  
  @HiveField(5)
  List<Insight> insights;
  
  @HiveField(6)
  DateTime createdAt;
  
  @HiveField(7)
  DateTime updatedAt;
  
  @HiveField(8)
  Map<String, String> resources; // URL -> description
  
  @HiveField(9)
  List<String> reflectionQuestions;
  
  @HiveField(10)
  double? surpriseLevel; // 0.0 to 1.0
  
  @HiveField(11)
  double? emotionalIntensity; // 0.0 to 1.0
  
  @HiveField(12)
  String? connectionToCore; // How this node relates to the core question

  LearningNode({
    required this.id,
    required this.journeyId,
    required this.title,
    this.content = '',
    this.type = NodeType.exploration,
    this.insights = const [],
    required this.createdAt,
    required this.updatedAt,
    this.resources = const {},
    this.reflectionQuestions = const [],
    this.surpriseLevel,
    this.emotionalIntensity,
    this.connectionToCore,
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'journeyId': journeyId,
      'title': title,
      'content': content,
      'type': type.name,
      'insights': insights.map((insight) => insight.toJson()).toList(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'resources': resources,
      'reflectionQuestions': reflectionQuestions,
      'surpriseLevel': surpriseLevel,
      'emotionalIntensity': emotionalIntensity,
      'connectionToCore': connectionToCore,
    };
  }

  factory LearningNode.fromJson(Map<String, dynamic> json) {
    return LearningNode(
      id: json['id'],
      journeyId: json['journeyId'],
      title: json['title'],
      content: json['content'] ?? '',
      type: NodeType.values.firstWhere(
        (e) => e.name == json['type'],
        orElse: () => NodeType.exploration,
      ),
      insights: (json['insights'] as List?)
          ?.map((insightJson) => Insight.fromJson(insightJson))
          .toList() ?? [],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
      resources: Map<String, String>.from(json['resources'] ?? {}),
      reflectionQuestions: List<String>.from(json['reflectionQuestions'] ?? []),
      surpriseLevel: json['surpriseLevel']?.toDouble(),
      emotionalIntensity: json['emotionalIntensity']?.toDouble(),
      connectionToCore: json['connectionToCore'],
    );
  }
}

@HiveType(typeId: 3)
enum NodeType {
  @HiveField(0)
  exploration,
  
  @HiveField(1)
  reflection,
  
  @HiveField(2)
  insight,
  
  @HiveField(3)
  discovery,
  
  @HiveField(4)
  connection,
  
  @HiveField(5)
  synthesis
}