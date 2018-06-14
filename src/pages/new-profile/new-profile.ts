import { Component } from '@angular/core';
import { IonicPage, NavController, ToastController, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import firebase from 'firebase';
import { Profile } from '../../models/Profile';
import { ProfileProvider } from '../../providers/profile/profile';


@IonicPage()
@Component({
  selector: 'page-new-profile',
  templateUrl: 'new-profile.html',
})
export class NewProfilePage {

  profile = {} as Profile;
  maxYear: number;

  isValidGender: boolean = false;
  isValidName: boolean = false;
  isValidAge: boolean = false;

  isButtonDisabled: boolean = true;

  isCreating = false;
  buttonLabel = 'Criar perfil';
  hideLabel = false;

  constructor(private profileProvider: ProfileProvider, private platform: Platform, private statusBar: StatusBar, private toast: ToastController, public navCtrl: NavController) {

    this.platform.ready().then(() => {
      this.statusBar.styleLightContent();
      this.statusBar.backgroundColorByHexString('#03A9F4');
    });

  }

  ionViewDidLoad() {
    this.profile.firstName = '';
    this.setValidYear();
  }

  verifyName() {

    this.profile.firstName = this.profile.name.indexOf(' ') > -1 ? this.profile.name.substring(0, this.profile.name.indexOf(' ')) : this.profile.firstName = this.profile.name;

    if ((this.profile.name != null) && (this.profile.name.length >= 3)) {
      this.isValidName = true;
    } else {
      this.isValidName = false;
    }

    this.enableButton();

  }

  setGender(gender) {
    this.profile.gender = gender;
    this.isValidGender = true;

    this.enableButton();

  }

  setValidYear() {
    let d = new Date();
    this.maxYear = d.getFullYear() - 6;
  }

  setAge() {

    let ano = this.profile.dateOfBirth.substring(0, 4);
    let mes = this.profile.dateOfBirth.substring(5, 7);
    let dia = this.profile.dateOfBirth.substring(8, 10);

    let data = new Date();
    let anoAtual = data.getFullYear();
    let mesAtual = data.getMonth() + 1;
    let diaAtual = data.getDate();

    this.profile.yearsOld = anoAtual - ano;

    if (mesAtual < mes || mesAtual == mes && diaAtual < dia) {
      this.profile.yearsOld--;
    }

    this.isValidAge = true;

    this.enableButton();
  }

  enableButton() {
    if (this.isValidName && this.isValidGender && this.isValidAge) {
      this.isButtonDisabled = false;
    } else {
      this.isButtonDisabled = true;
    }
  }

  createUserProfile() {

    this.isCreating = true;
    this.hideLabel = true;
    this.isButtonDisabled = true;

    this.profileProvider.createUserProfile(this.profile).then(() => {

      this.toast.create({
        message: 'Perfil criado com sucesso!',
        cssClass: 'valid',
        duration: 1800,
        position: 'top'
      }).present();

      this.navCtrl.setRoot('MainPage');

    }).catch(e => {
      console.log(e);

    })
  }

  backLogout(): Promise<any> {
    const userId: string = firebase.auth().currentUser.uid;
    firebase.database().ref(`/Profile/${userId}`).off();
    return firebase.auth().signOut().then(() => {
      this.navCtrl.pop();
    });
  }

}
