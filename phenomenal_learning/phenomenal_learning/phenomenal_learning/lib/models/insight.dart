import 'package:hive/hive.dart';

part 'insight.g.dart';

@HiveType(typeId: 4)
class Insight extends HiveObject {
  @HiveField(0)
  String id;
  
  @HiveField(1)
  String nodeId;
  
  @HiveField(2)
  String userId;
  
  @HiveField(3)
  String content;
  
  @HiveField(4)
  InsightType type;
  
  @HiveField(5)
  DateTime createdAt;
  
  @HiveField(6)
  List<String> tags;
  
  @HiveField(7)
  double confidenceLevel; // 0.0 to 1.0
  
  @HiveField(8)
  String? triggerContext; // What sparked this insight
  
  @HiveField(9)
  Map<String, dynamic> emotionalContext;

  Insight({
    required this.id,
    required this.nodeId,
    required this.userId,
    required this.content,
    this.type = InsightType.observation,
    required this.createdAt,
    this.tags = const [],
    this.confidenceLevel = 0.5,
    this.triggerContext,
    this.emotionalContext = const {},
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'nodeId': nodeId,
      'userId': userId,
      'content': content,
      'type': type.name,
      'createdAt': createdAt.toIso8601String(),
      'tags': tags,
      'confidenceLevel': confidenceLevel,
      'triggerContext': triggerContext,
      'emotionalContext': emotionalContext,
    };
  }

  factory Insight.fromJson(Map<String, dynamic> json) {
    return Insight(
      id: json['id'],
      nodeId: json['nodeId'],
      userId: json['userId'],
      content: json['content'],
      type: InsightType.values.firstWhere(
        (e) => e.name == json['type'],
        orElse: () => InsightType.observation,
      ),
      createdAt: DateTime.parse(json['createdAt']),
      tags: List<String>.from(json['tags'] ?? []),
      confidenceLevel: json['confidenceLevel']?.toDouble() ?? 0.5,
      triggerContext: json['triggerContext'],
      emotionalContext: Map<String, dynamic>.from(json['emotionalContext'] ?? {}),
    );
  }
}

@HiveType(typeId: 5)
enum InsightType {
  @HiveField(0)
  observation,
  
  @HiveField(1)
  connection,
  
  @HiveField(2)
  pattern,
  
  @HiveField(3)
  question,
  
  @HiveField(4)
  synthesis,
  
  @HiveField(5)
  breakthrough
}