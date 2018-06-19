import { Component } from '@angular/core';
import { StatusBar } from '@ionic-native/status-bar';
import { IonicPage, NavController, ToastController, Platform } from 'ionic-angular';
import firebase from 'firebase';
import { Profile } from './../../models/Profile';


@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  userProfile = {} as Profile;

  email: string;
  password: string;
  passwordUnlock: string;
  passwordLength: number = 8;
  buttonLabel: string;

  isPasswordCheck: boolean;
  isEmailCheck: boolean;
  isButtonDesabled: boolean;
  hideLabel: boolean;

  disableEmail: boolean = false;
  disablePassword: boolean = false;
  disableCreateAccount: boolean = false;

  isCreating: boolean;

  constructor(private toast: ToastController, private platform: Platform, private statusBar: StatusBar, public navCtrl: NavController) {

  }

  ionViewWillEnter() {

    this.platform.ready().then(() => {
      this.statusBar.hide();
    });

    this.buttonLabel = 'Entrar';
    this.passwordUnlock = 'lock';
    this.isEmailCheck = false;
    this.isPasswordCheck = false;
    this.isButtonDesabled = true;
    this.hideLabel = false;

    this.email = null;
    this.password = null;
    this.isCreating = false;

    this.enableForm();
  }

  isValidEmail() {
    if (this.email.indexOf('.com') > -1) {
      this.isEmailCheck = true;
    } else {
      this.isEmailCheck = false;
    }

    this.disableButton();
  }

  getPasswordLength() {
    if (this.password.length >= 8) {
      this.isPasswordCheck = true;
      this.passwordUnlock = 'unlock';
    } else {
      this.isPasswordCheck = false;
      this.passwordUnlock = 'lock';
    }

    this.passwordLength = 8 - this.password.length;

    this.disableButton();
  }

  disableButton() {
    if (this.isEmailCheck && this.isPasswordCheck) {
      this.isButtonDesabled = false;
    } else {
      this.isButtonDesabled = true;
    }
  }

  disableForm() {
    this.disableEmail = true;
    this.disablePassword = true;
    this.disableCreateAccount = true;
  }

  enableForm() {
    this.disableEmail = false;
    this.disablePassword = false;
    this.disableCreateAccount = false;
  }

  presentToast(message: string, duration: number, position: string, style: string) {
    this.toast.create({

      message: message,
      duration: duration,
      position: position,
      cssClass: style

    }).present();
  }

  signIn() {

    this.disableForm();

    this.isButtonDesabled = true;
    this.hideLabel = true;
    this.isCreating = true;

    const email = this.email;
    const password = this.password;

    firebase.auth().signInWithEmailAndPassword(email, password)
      .then(() => {

        this.buttonLabel = 'Ok';
        this.hideLabel = false;

        firebase.database().ref('/Profile/').child(firebase.auth().currentUser.uid).once('value', userProfile => {
          this.userProfile = userProfile.val();
        }).then(() => {
          if (this.userProfile.name != null) {
            this.navCtrl.setRoot('MainPage');
          } else {
            this.navCtrl.push('NewProfilePage');
          }
        });

      }, error => {
        this.enableForm();
        this.hideLabel = false;
        this.isButtonDesabled = false;
        this.isCreating = false;

        let errorMessage: string;

        switch (error.code) {

          case 'auth/network-request-failed':

            errorMessage = 'Ops! Parece que não há conexão com a internet';

            break;

          case 'auth/user-not-found':

            errorMessage = 'Parece que este e-mail ainda não foi cadastrado!';
            this.password = null;
            this.isPasswordCheck = false;
            this.isButtonDesabled = true;
            this.passwordUnlock = 'lock';

            break;

          case 'auth/wrong-password':

            errorMessage = 'Sua senha está incorreta';
            this.password = null;
            this.isPasswordCheck = false;
            this.isButtonDesabled = true;
            this.passwordUnlock = 'lock';

            break;
        }

        this.presentToast(errorMessage, 3000, 'bottom', 'error');
      })
  }

}