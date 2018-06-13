import { Component } from '@angular/core';
import { IonicPage, NavController, LoadingController, AlertController } from 'ionic-angular';
import firebase from 'firebase';
import { Profile } from './../../models/Profile';
import { ProfileProvider } from './../../providers/profile/profile';


@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {

  userProfile = {} as Profile;
  genderIcon: string = 'ios-man';

  constructor(private profileProvider: ProfileProvider, private loadingCtrl: LoadingController, private alertCtrl: AlertController, public navCtrl: NavController) {
  }

  ionViewDidLoad() {
    let load = this.loadingCtrl.create({
      content: 'Carregando seu perfil...'
    });

    load.present();

    this.profileProvider.getUserProfile().on('value', userProfileSnapshot => {
      this.userProfile = userProfileSnapshot.val();

      if (this.userProfile != null) {
        this.genderIcon = this.userProfile.gender == 'man' ? 'ios-man' : 'ios-woman';
      }

      load.dismiss();
    })
  }

  logoutUser() {

    let alert = this.alertCtrl.create({
      title: 'Sair',
      message: 'Você realmente deseja se desconectar?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Sim',
          handler: () => {

            let load = this.loadingCtrl.create({
              content: 'Saindo...'
            });

            load.present();

            const userId: string = firebase.auth().currentUser.uid;
            firebase.database().ref(`/Profile/${userId}`).off();
            firebase.auth().signOut().then(() => {

              load.dismiss().then(() => { this.navCtrl.setRoot('WelcomePage') });

            });

          }
        }
      ]
    });

    alert.present();
  }
}
