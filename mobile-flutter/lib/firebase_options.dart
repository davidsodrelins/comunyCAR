import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'dart:io' show Platform;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (Platform.isIOS) {
      return ios;
    }
    if (Platform.isAndroid) {
      return android;
    }
    throw UnsupportedError(
      'DefaultFirebaseOptions are not supported for this platform.',
    );
  }

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyDummyIOSApiKey',
    appId: '1:123456789:ios:abcdef1234567890',
    messagingSenderId: '123456789',
    projectId: 'comunycar-firebase',
    databaseURL: 'https://comunycar-firebase.firebaseio.com',
    storageBucket: 'comunycar-firebase.appspot.com',
    iosBundleId: 'com.comunycar.comunycarMobile',
  );

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyDummyAndroidApiKey',
    appId: '1:123456789:android:abcdef1234567890',
    messagingSenderId: '123456789',
    projectId: 'comunycar-firebase',
    databaseURL: 'https://comunycar-firebase.firebaseio.com',
    storageBucket: 'comunycar-firebase.appspot.com',
  );
}
