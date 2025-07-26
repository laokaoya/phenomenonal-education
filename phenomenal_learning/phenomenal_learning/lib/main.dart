import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'app.dart';
import 'providers/journey_provider.dart';
import 'providers/user_provider.dart';
import 'providers/resonance_provider.dart';
import 'providers/session_provider.dart';
import 'providers/community_provider.dart';
import 'models/user.dart';
import 'models/learning_journey.dart';
import 'models/learning_node.dart';
import 'models/insight.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Hive
  await Hive.initFlutter();
  
  // Register Hive adapters
  Hive.registerAdapter(UserAdapter());
  Hive.registerAdapter(LearningJourneyAdapter());
  Hive.registerAdapter(LearningNodeAdapter());
  Hive.registerAdapter(InsightAdapter());
  
  // Open Hive boxes
  await Hive.openBox<User>('users');
  await Hive.openBox<LearningJourney>('journeys');
  await Hive.openBox<LearningNode>('nodes');
  await Hive.openBox<Insight>('insights');
  
  runApp(const PhenomenalLearningApp());
}

class PhenomenalLearningApp extends StatelessWidget {
  const PhenomenalLearningApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => UserProvider()),
        ChangeNotifierProvider(create: (_) => JourneyProvider()),
        ChangeNotifierProvider(create: (_) => ResonanceProvider()),
        ChangeNotifierProvider(create: (_) => SessionProvider()),
        ChangeNotifierProvider(create: (_) => CommunityProvider()),
      ],
      child: const App(),
    );
  }
}