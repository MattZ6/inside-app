import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, Slides, ToastController, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import firebase from 'firebase';


@IonicPage()
@Component({
  selector: 'page-create-auth',
  templateUrl: 'create-auth.html',
})
export class CreateAuthPage {

  @ViewChild(Slides) slides: Slides;

  email: string;
  password: string;
  confirmPassword: string;
  passwordLength: number = 8;
  labelButton: string = 'Criar';

  canLeave: boolean = true;

  showLoad: boolean = false;
  isCreating: boolean = false;
  enableButton: boolean = false;
  isPasswordCheck: boolean = false;
  isConfirmPasswordCheck: boolean = false;

  constructor(private toast: ToastController, private platform: Platform, private statusBar: StatusBar, public navCtrl: NavController) {
  }


  ionViewDidEnter() {
    this.platform.ready().then(() => {
      this.statusBar.styleLightContent();
      this.statusBar.backgroundColorByHexString('#03A9F4');
    });
  }

  ionViewDidLoad() {
    this.slides.lockSwipes(true);
  }

  slideNext() {
    this.slides.lockSwipes(false);
    this.slides.slideNext();
    this.slides.lockSwipes(true);
  }

  slideBack() {
    this.confirmPassword = null;
    this.slides.lockSwipes(false);
    this.slides.slidePrev();
    this.slides.lockSwipes(true);
  }

  getPasswordLength() {
    if (this.password.length >= 8) {
      this.isPasswordCheck = true;
    } else {
      this.isPasswordCheck = false;
    }
    this.passwordLength = 8 - this.password.length;
  }

  validatePassword() {

    if (this.password === this.confirmPassword) {
      this.isConfirmPasswordCheck = true;
      this.enableButton = true;

    } else {
      this.isConfirmPasswordCheck = false;
      this.enableButton = false;

    }

  }

  presentToast(message: string, duration: number, position: string, style: string) {
    this.toast.create({

      message: message,
      duration: duration,
      position: position,
      cssClass: style

    }).present();
  }

  createUser() {

    this.canLeave = false;

    this.enableButton = false;
    this.showLoad = true;
    this.isCreating = true;

    const email = this.email;
    const password = this.password;

    firebase.auth().createUserWithEmailAndPassword(email, password).then(() => {

      let userId = firebase.auth().currentUser.uid;

      if (userId) {
        firebase.database().ref(`/Profile/${userId}/email`).set(email).then(() => {

          this.labelButton = 'Ok';
          this.showLoad = false;

          this.presentToast('Conta criada com sucesso!', 1500, 'top', 'valid');

          this.canLeave = true;

          this.navCtrl.push('CreateProfilePage');
        });

      }

    },
      error => {
        let errorMessage: string;

        switch (error.code) {

          case 'auth/network-request-failed':

            errorMessage = 'Ops! Parece que não há conexão com a internet';

            this.enableButton = true;
            this.showLoad = false;
            this.isCreating = false;

            break;

          case 'auth/email-already-in-use':

            errorMessage = 'Este e-mail já foi cadastrado';
            this.email = null;

            this.slides.lockSwipes(false);
            this.slides.slideTo(0, 500);
            this.slides.lockSwipes(true);

            this.password = null;
            this.confirmPassword = null;
            this.isPasswordCheck = false;
            this.isConfirmPasswordCheck = false;

            this.showLoad = false;
            this.passwordLength = 8;
            this.isCreating = false;

            break;

          case 'auth/invalid-email':

            errorMessage = 'Este não é um e-mail válido';
            this.email = null;

            this.slides.lockSwipes(false);
            this.slides.slideTo(0, 500);
            this.slides.lockSwipes(true);

            this.password = null;
            this.confirmPassword = null;
            this.isPasswordCheck = false;
            this.isConfirmPasswordCheck = false;

            this.showLoad = false;
            this.passwordLength = 8;
            this.isCreating = false;

            break;

        }

        this.canLeave = true;
        this.presentToast(errorMessage, 3000, 'bottom', 'error');
      });
  }

  ionViewCanLeave(): boolean {
    return this.canLeave;
  }
}
