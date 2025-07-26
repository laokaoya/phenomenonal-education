import 'package:hive/hive.dart';

part 'resonance_profile.g.dart';

@HiveType(typeId: 6)
class ResonanceProfile extends HiveObject {
  @HiveField(0)
  String id;
  
  @HiveField(1)
  String userId;
  
  @HiveField(2)
  Map<String, double> topicWeights; // Topic -> weight
  
  @HiveField(3)
  Map<String, double> learningStyles; // Learning style -> preference
  
  @HiveField(4)
  List<String> preferredQuestionTypes;
  
  @HiveField(5)
  Map<String, double> emotionalPreferences; // Emotional context -> preference
  
  @HiveField(6)
  DateTime lastUpdated;
  
  @HiveField(7)
  List<String> similarUserIds;
  
  @HiveField(8)
  double explorationVsClosure; // 0.0 = loves closure, 1.0 = loves open exploration

  ResonanceProfile({
    required this.id,
    required this.userId,
    this.topicWeights = const {},
    this.learningStyles = const {},
    this.preferredQuestionTypes = const [],
    this.emotionalPreferences = const {},
    required this.lastUpdated,
    this.similarUserIds = const [],
    this.explorationVsClosure = 0.5,
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'topicWeights': topicWeights,
      'learningStyles': learningStyles,
      'preferredQuestionTypes': preferredQuestionTypes,
      'emotionalPreferences': emotionalPreferences,
      'lastUpdated': lastUpdated.toIso8601String(),
      'similarUserIds': similarUserIds,
      'explorationVsClosure': explorationVsClosure,
    };
  }

  factory ResonanceProfile.fromJson(Map<String, dynamic> json) {
    return ResonanceProfile(
      id: json['id'],
      userId: json['userId'],
      topicWeights: Map<String, double>.from(json['topicWeights'] ?? {}),
      learningStyles: Map<String, double>.from(json['learningStyles'] ?? {}),
      preferredQuestionTypes: List<String>.from(json['preferredQuestionTypes'] ?? []),
      emotionalPreferences: Map<String, double>.from(json['emotionalPreferences'] ?? {}),
      lastUpdated: DateTime.parse(json['lastUpdated']),
      similarUserIds: List<String>.from(json['similarUserIds'] ?? []),
      explorationVsClosure: json['explorationVsClosure']?.toDouble() ?? 0.5,
    );
  }
}