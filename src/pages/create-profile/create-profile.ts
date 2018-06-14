import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, Slides } from 'ionic-angular';
import { Profile } from '../../models/Profile';
import firebase from 'firebase';

@IonicPage()
@Component({
  selector: 'page-create-profile',
  templateUrl: 'create-profile.html',
})
export class CreateProfilePage {

  @ViewChild(Slides) slides: Slides;

  profile = {} as Profile;
  maxYear: number;

  isValidGender: boolean = false;
  isValidName: boolean = false;

  constructor(public navCtrl: NavController) {

    this.profile.firstName = '';
    this.setValidYear();

  }


  ionViewDidEnter() {

    this.slides.lockSwipes(false);
    this.slides.slideTo(0);
    this.slides.lockSwipes(true);

  }

  ionViewDidLoad() {
    this.slides.lockSwipes(true);
  }

  setValidYear() {
    let d = new Date();
    this.maxYear = d.getFullYear() - 6;
  }

  verifyName() {

    this.profile.firstName = this.profile.name.indexOf(' ') > -1 ? this.profile.name.substring(0, this.profile.name.indexOf(' ')) : this.profile.firstName = this.profile.name;

    if ((this.profile.name != null) && (this.profile.name.length >= 3)) {
      this.isValidName = true;
    } else {
      this.isValidName = false;
    }


  }

  slideNext() {
    this.slides.lockSwipes(false);
    this.slides.slideNext();
    this.slides.lockSwipes(true);
  }

  setGender(gender) {
    this.profile.gender = gender;
    this.isValidGender = true;
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
  }

  iniciateSlides() {
    this.slides.lockSwipes(false);
    this.slides.slideTo(0);
    this.slides.lockSwipes(true);
  }

  goToConfirmPage() {

    this.navCtrl.push('ConfirmProfilePage', {
      profile: this.profile
    });

  }

  backLogout() {
    const userId: string = firebase.auth().currentUser.uid;
    firebase.database().ref(`/Profile/${userId}`).off();
    return firebase.auth().signOut().then(() => {
      this.navCtrl.popToRoot();
    });
  }
}