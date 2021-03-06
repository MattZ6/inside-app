import { Camera, CameraOptions } from '@ionic-native/camera';
import { Component } from '@angular/core';
import { IonicPage, NavController, LoadingController, AlertController, ToastController } from 'ionic-angular';
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
    private camera: Camera, private toast: ToastController, private alertCtrl: AlertController, public navCtrl: NavController) {

  }

  ionViewDidLoad() {  

    let load = this.loadingCtrl.create({
      content: 'Carregando seu perfil...'
    });

    load.present();

    this.profileProvider.getUserProfile().on('value', userProfileSnapshot => {
      this.userProfile = userProfileSnapshot.val();

      this.genderIcon = this.userProfile.gender == 'man' ? 'ios-man' : 'ios-woman';

      if (this.userProfile.photoUrl) {
        const pathReference = firebase.storage().ref(`/pictures/${firebase.auth().currentUser.uid}/profilePicture.jpeg`);
        pathReference.getDownloadURL().then(profilePicture => {
          this.userPicture = profilePicture;
          load.dismiss();
        })
      } else {
        load.dismiss();
      }
    })
  }

  async  takePicture() {

    let load = this.loadingCtrl.create({
      content: 'Alterando foto de perfil...'
    });

    try {

      load.present();


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

            load.dismiss();
          })


        }).catch(function (error) {

          switch (error.code) {

            case 'storage/object_not_found':
              console.log('Este arquivo não existe');

              break;

            case 'storage/unauthorized':
              console.log('O usuário não tem permissão para acessar este arquivo');

              break;

            case 'storage/canceled':
              console.log('O usuário cancelou o upload do arquivo');

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
