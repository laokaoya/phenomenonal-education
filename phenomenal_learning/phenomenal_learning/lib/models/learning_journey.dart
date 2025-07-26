import 'package:hive/hive.dart';
import 'learning_node.dart';

part 'learning_journey.g.dart';

@HiveType(typeId: 1)
class LearningJourney extends HiveObject {
  @HiveField(0)
  String id;
  
  @HiveField(1)
  String userId;
  
  @HiveField(2)
  String title;
  
  @HiveField(3)
  String coreQuestion;
  
  @HiveField(4)
  String description;
  
  @HiveField(5)
  List<LearningNode> nodes;
  
  @HiveField(6)
  DateTime createdAt;
  
  @HiveField(7)
  DateTime updatedAt;
  
  @HiveField(8)
  bool isPublic;
  
  @HiveField(9)
  List<String> tags;
  
  @HiveField(10)
  String? parentJourneyId; // For remix/fork functionality
  
  @HiveField(11)
  int resonanceScore;
  
  @HiveField(12)
  Map<String, dynamic> metadata;

  LearningJourney({
    required this.id,
    required this.userId,
    required this.title,
    required this.coreQuestion,
    this.description = '',
    this.nodes = const [],
    required this.createdAt,
    required this.updatedAt,
    this.isPublic = false,
    this.tags = const [],
    this.parentJourneyId,
    this.resonanceScore = 0,
    this.metadata = const {},
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'title': title,
      'coreQuestion': coreQuestion,
      'description': description,
      'nodes': nodes.map((node) => node.toJson()).toList(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'isPublic': isPublic,
      'tags': tags,
      'parentJourneyId': parentJourneyId,
      'resonanceScore': resonanceScore,
      'metadata': metadata,
    };
  }

  factory LearningJourney.fromJson(Map<String, dynamic> json) {
    return LearningJourney(
      id: json['id'],
      userId: json['userId'],
      title: json['title'],
      coreQuestion: json['coreQuestion'],
      description: json['description'] ?? '',
      nodes: (json['nodes'] as List?)
          ?.map((nodeJson) => LearningNode.fromJson(nodeJson))
          .toList() ?? [],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
      isPublic: json['isPublic'] ?? false,
      tags: List<String>.from(json['tags'] ?? []),
      parentJourneyId: json['parentJourneyId'],
      resonanceScore: json['resonanceScore'] ?? 0,
      metadata: Map<String, dynamic>.from(json['metadata'] ?? {}),
    );
  }
}