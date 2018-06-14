import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { ProfileProvider } from './../../providers/profile/profile';
import { Profile } from './../../models/profile';


@IonicPage()
@Component({
  selector: 'page-confirm-profile',
  templateUrl: 'confirm-profile.html',
})
export class ConfirmProfilePage {

  profile = {} as Profile;

  isCreating: boolean = false;

  genderLabel: string;
  genderColor: string;
  genderIcon: string;

  constructor(private profileProvider: ProfileProvider, private toast: ToastController, public navCtrl: NavController, public navParams: NavParams) {

  }

  ionViewDidLoad() {
    // if (this.navParams.get('profile') != null) {
    //   this.profile = this.navParams.get('profile');
    //   this.setColorLabelAndGenderIcon();
    // } else {
    //   this.navCtrl.pop();
    // }
  }

  setColorLabelAndGenderIcon() {
    if (this.profile.gender === 'woman') {
      this.genderLabel = 'Mulher';
      this.genderColor = 'woman';
      this.genderIcon = 'ios-woman';
    } else {
      this.genderLabel = 'Homem';
      this.genderColor = 'man';
      this.genderIcon = 'ios-man';
    }
  }

  createUserProfile() {

    this.isCreating = true;

    this.profileProvider.createUserProfile(this.profile).then(() => {

      this.toast.create({
        message: 'Perfil criado com sucesso!',
        cssClass: 'valid',
        duration: 1800,
        position: 'top',
        showCloseButton: true,
        closeButtonText: '=D'
      }).present();

      this.navCtrl.setRoot('MainPage');

    }).catch(e => {
      console.log(e);

    })
  }

  updateProfile() {
    this.navCtrl.getPrevious().data.isUpdating = true;
    this.navCtrl.pop();
  }

}
