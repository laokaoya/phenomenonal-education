import 'package:hive/hive.dart';

part 'user.g.dart';

@HiveType(typeId: 0)
class User extends HiveObject {
  @HiveField(0)
  String id;
  
  @HiveField(1)
  String name;
  
  @HiveField(2)
  String email;
  
  @HiveField(3)
  String? avatarUrl;
  
  @HiveField(4)
  DateTime createdAt;
  
  @HiveField(5)
  List<String> journeyIds;
  
  @HiveField(6)
  List<String> resonanceProfiles;
  
  @HiveField(7)
  Map<String, dynamic> preferences;

  User({
    required this.id,
    required this.name,
    required this.email,
    this.avatarUrl,
    required this.createdAt,
    this.journeyIds = const [],
    this.resonanceProfiles = const [],
    this.preferences = const {},
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'avatarUrl': avatarUrl,
      'createdAt': createdAt.toIso8601String(),
      'journeyIds': journeyIds,
      'resonanceProfiles': resonanceProfiles,
      'preferences': preferences,
    };
  }

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      name: json['name'],
      email: json['email'],
      avatarUrl: json['avatarUrl'],
      createdAt: DateTime.parse(json['createdAt']),
      journeyIds: List<String>.from(json['journeyIds'] ?? []),
      resonanceProfiles: List<String>.from(json['resonanceProfiles'] ?? []),
      preferences: Map<String, dynamic>.from(json['preferences'] ?? {}),
    );
  }
}