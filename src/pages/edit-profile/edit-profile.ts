import { Component } from '@angular/core';
import { IonicPage, NavController, LoadingController, ToastController } from 'ionic-angular';
import { Profile } from './../../models/Profile';
import { ProfileProvider } from '../../providers/profile/profile';


@IonicPage()
@Component({
  selector: 'page-edit-profile',
  templateUrl: 'edit-profile.html',
})
export class EditProfilePage {

  userProfile = {} as Profile;
  maxYear: number;

  isButtonDisabled: boolean = false;

  isCreating = false;
  buttonLabel = 'Salvar';
  hideLabel = false;

  constructor(private loadingCtrl: LoadingController, private toast: ToastController, private profileProvider: ProfileProvider, public navCtrl: NavController) {
  }

  ionViewDidLoad() {

    this.setValidYear();

    let load = this.loadingCtrl.create({
      content: 'Carregando seu perfil...'
    });

    load.present();

    this.profileProvider.getUserProfile().on('value', userProfileSnapshot => {
      this.userProfile = userProfileSnapshot.val();
      load.dismiss();
    })
  }

  verifyName() {

    this.userProfile.firstName = this.userProfile.name.indexOf(' ') > -1 ? this.userProfile.name.substring(0, this.userProfile.name.indexOf(' ')) : this.userProfile.firstName = this.userProfile.name;

    if ((this.userProfile.name != null) && (this.userProfile.name.length >= 3)) {
      this.isButtonDisabled = false;
    } else {
      this.isButtonDisabled = true;
    }

  }

  setGender(gender) {
    this.userProfile.gender = gender;
  }

  setValidYear() {
    let d = new Date();
    this.maxYear = d.getFullYear() - 6;
  }

  setAge() {

    let ano = this.userProfile.dateOfBirth.substring(0, 4);
    let mes = this.userProfile.dateOfBirth.substring(5, 7);
    let dia = this.userProfile.dateOfBirth.substring(8, 10);

    let data = new Date();
    let anoAtual = data.getFullYear();
    let mesAtual = data.getMonth() + 1;
    let diaAtual = data.getDate();

    this.userProfile.yearsOld = anoAtual - ano;

    if (mesAtual < mes || mesAtual == mes && diaAtual < dia) {
      this.userProfile.yearsOld--;
    }

  }

  ionViewCanLeave() {
    return !this.isCreating;
  }

  saveUserProfile() {
    this.isCreating = true;
    this.hideLabel = true;
    this.isButtonDisabled = true;

    this.profileProvider.createAndUpdateUserProfile(this.userProfile).then(() => {

      this.hideLabel = false;
      this.isButtonDisabled = false;
      this.isCreating = false;

      this.navCtrl.pop().then(() => {
        this.toast.create({
          cssClass: 'valid',
          message: 'Perfil alterado com sucesso!',
          duration: 1800,
          position: 'top'
        }).present();
      });

    })
  }
}
