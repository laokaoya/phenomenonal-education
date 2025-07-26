import 'package:hive/hive.dart';

part 'community_insight.g.dart';

@HiveType(typeId: 7)
class CommunityInsight extends HiveObject {
  @HiveField(0)
  String id;
  
  @HiveField(1)
  String title;
  
  @HiveField(2)
  String description;
  
  @HiveField(3)
  List<String> contributingInsightIds; // Individual insights that formed this
  
  @HiveField(4)
  List<String> contributorUserIds;
  
  @HiveField(5)
  DateTime emergenceDate;
  
  @HiveField(6)
  Map<String, int> resonanceVotes; // userId -> vote (-1, 0, 1)
  
  @HiveField(7)
  List<String> tags;
  
  @HiveField(8)
  String synthesisMethod; // How this collective wisdom was formed
  
  @HiveField(9)
  double confidenceScore; // Community confidence in this insight
  
  @HiveField(10)
  List<String> alternativePerspectives; // Different viewpoints on same topic

  CommunityInsight({
    required this.id,
    required this.title,
    required this.description,
    this.contributingInsightIds = const [],
    this.contributorUserIds = const [],
    required this.emergenceDate,
    this.resonanceVotes = const {},
    this.tags = const [],
    this.synthesisMethod = 'organic',
    this.confidenceScore = 0.5,
    this.alternativePerspectives = const [],
  });

  int get totalResonance {
    return resonanceVotes.values.fold(0, (sum, vote) => sum + vote);
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'contributingInsightIds': contributingInsightIds,
      'contributorUserIds': contributorUserIds,
      'emergenceDate': emergenceDate.toIso8601String(),
      'resonanceVotes': resonanceVotes,
      'tags': tags,
      'synthesisMethod': synthesisMethod,
      'confidenceScore': confidenceScore,
      'alternativePerspectives': alternativePerspectives,
    };
  }

  factory CommunityInsight.fromJson(Map<String, dynamic> json) {
    return CommunityInsight(
      id: json['id'],
      title: json['title'],
      description: json['description'],
      contributingInsightIds: List<String>.from(json['contributingInsightIds'] ?? []),
      contributorUserIds: List<String>.from(json['contributorUserIds'] ?? []),
      emergenceDate: DateTime.parse(json['emergenceDate']),
      resonanceVotes: Map<String, int>.from(json['resonanceVotes'] ?? {}),
      tags: List<String>.from(json['tags'] ?? []),
      synthesisMethod: json['synthesisMethod'] ?? 'organic',
      confidenceScore: json['confidenceScore']?.toDouble() ?? 0.5,
      alternativePerspectives: List<String>.from(json['alternativePerspectives'] ?? []),
    );
  }
}