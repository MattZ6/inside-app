import { Camera, CameraOptions } from '@ionic-native/camera';
import { Component } from '@angular/core';
import { StatusBar } from '@ionic-native/status-bar';
import { IonicPage, NavController, LoadingController, AlertController, Platform, ToastController } from 'ionic-angular';
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
  userPicture: string = 'assets/imgs/user.png';

  constructor(private profileProvider: ProfileProvider, private loadingCtrl: LoadingController,
    private camera: Camera, private toast: ToastController, private alertCtrl: AlertController, private platform: Platform, private statusBar: StatusBar, public navCtrl: NavController) {

  }

  ionViewDidLoad() {

    this.platform.ready().then(() => {
      this.statusBar.styleLightContent();
      this.statusBar.backgroundColorByHexString('#03A9F4');
    });

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

  ionViewWillEnter() {
    if (this.userProfile.photoUrl) {
      const pathReference = firebase.storage().ref(`/pictures/${firebase.auth().currentUser.uid}/profilePicture.jpeg`);
      pathReference.getDownloadURL().then(profilePicture => {
        this.userPicture = profilePicture;
      })
    }
  }

  async  takePicture() {

    try {

      const options: CameraOptions = {
        quality: 100,
        destinationType: this.camera.DestinationType.DATA_URL,
        sourceType: this.camera.PictureSourceType.CAMERA,
        correctOrientation: true,
        allowEdit: true,
        encodingType: this.camera.EncodingType.JPEG,
        targetWidth: 749,
        targetHeight: 720,
        saveToPhotoAlbum: true
      }

      const result = await this.camera.getPicture(options);
      const image = `data:image/jpeg;base64,${result}`;
      const pictures = firebase.storage().ref(`/pictures/${firebase.auth().currentUser.uid}/profilePicture.jpeg`);
      pictures.putString(image, 'data_url').then(() => {

        const pathReference = pictures;

        pathReference.getDownloadURL().then(url => {

          this.profileProvider.setUserProfilePicture(url).then(() => {
            this.userPicture = url;
          })


        }).catch(function (error) {

          switch (error.code) {

            case 'storage/object_not_found':
              // File doesn't exist
              break;

            case 'storage/unauthorized':
              // User doesn't have permission to access the object
              break;

            case 'storage/canceled':
              // User canceled the upload
              break;

            case 'storage/unknown':
              // Unknown error occurred, inspect the server response
              break;
          }

        })

      });

    } catch (e) {
      console.log(e);
    }
  }

  logoutUser() {

    let name = this.userProfile.firstName;

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

              load.dismiss().then(() => {
                this.navCtrl.setRoot('WelcomePage').then(() => {
                  this.toast.create({
                    message: 'Até logo, ' + name + '! :)',
                    duration: 2000,
                    position: 'top',
                    cssClass: 'valid'
                  }).present();
                })
              });

            });

          }
        }
      ]
    });

    alert.present();
  }
}
