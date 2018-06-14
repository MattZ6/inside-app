import { Component } from '@angular/core';
import { IonicPage, NavController, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';


@IonicPage()
@Component({
  selector: 'page-welcome',
  templateUrl: 'welcome.html',
})
export class WelcomePage {

  constructor(private platform: Platform, private statusBar: StatusBar, public navCtrl: NavController) {
  }

  ionViewDidEnter() {
    this.platform.ready().then(() => {
      this.statusBar.hide();
    });
  }

}
