import { Component } from '@angular/core';
import { IonicPage, NavController, LoadingController } from 'ionic-angular';
import { Profile } from './../../models/Profile';
import { ProfileProvider } from '../../providers/profile/profile';


@IonicPage()
@Component({
  selector: 'page-edit-profile',
  templateUrl: 'edit-profile.html',
})
export class EditProfilePage {

  userProfile = {} as Profile;
  genderIcon: string = 'ios-woman';

  constructor(private loadingCtrl: LoadingController, private profileProvider: ProfileProvider, public navCtrl: NavController) {
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

}
