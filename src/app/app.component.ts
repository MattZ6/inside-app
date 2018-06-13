import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import firebase from 'firebase';
import { FIREBASE_CONFIG } from './credentials';


@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage: string;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, screen: ScreenOrientation) {

    screen.lock(screen.ORIENTATIONS.PORTRAIT);

    firebase.initializeApp(FIREBASE_CONFIG);

    const unsubscribe = firebase.auth().onAuthStateChanged(user => {

      if (!user) {
        this.rootPage = 'WelcomePage';
        unsubscribe();
      } else {
        this.rootPage = 'MainPage';
        unsubscribe();
      }

    });

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
    });
  }
}

