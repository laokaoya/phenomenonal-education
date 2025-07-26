import 'package:flutter/material.dart';
import 'config/app_routes.dart';
import 'config/theme.dart';
import 'ui/home/home_page.dart';
import 'ui/journey/my_journey_page.dart';
import 'ui/journey/new_question_page.dart';
import 'ui/journey/node_editor.dart';
import 'ui/community/resonance_feed.dart';
import 'ui/profile/profile_page.dart';

class App extends StatelessWidget {
  const App({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Phenomenal Learning',
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.system,
      initialRoute: AppRoutes.home,
      routes: {
        AppRoutes.home: (context) => const HomePage(),
        AppRoutes.myJourney: (context) => const MyJourneyPage(),
        AppRoutes.newQuestion: (context) => const NewQuestionPage(),
        AppRoutes.nodeEditor: (context) => const NodeEditor(),
        AppRoutes.resonanceFeed: (context) => const ResonanceFeed(),
        AppRoutes.profile: (context) => const ProfilePage(),
      },
    );
  }
}