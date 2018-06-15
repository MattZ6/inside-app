import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import firebase from 'firebase';
import { FIREBASE_CONFIG } from './credentials';
import { HeaderColor } from '@ionic-native/header-color';


@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage: string;

  constructor(platform: Platform, splashScreen: SplashScreen, statusBar: StatusBar, screen: ScreenOrientation, headerColor: HeaderColor) {


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
      splashScreen.hide();
      statusBar.hide();
      headerColor.tint('#31ACFF');
      // screen.lock(screen.ORIENTATIONS.PORTRAIT);
    });
  }
}

