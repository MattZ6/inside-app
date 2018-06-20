import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ToastController } from 'ionic-angular';
import { ProfileProvider } from './../../providers/profile/profile';
import { Profile } from './../../models/profile';
import { Camera, CameraOptions } from '@ionic-native/camera';
import firebase from 'firebase';

@IonicPage()
@Component({
  selector: 'page-confirm-profile',
  templateUrl: 'confirm-profile.html',
})
export class ConfirmProfilePage {

  profile = {} as Profile;
  profilePicture: string = 'assets/imgs/user.png';

  isCreating: boolean = false;

  genderLabel: string;
  genderColor: string;
  genderIcon: string;

  constructor(private camera: Camera, private profileProvider: ProfileProvider, private toast: ToastController, private loading: LoadingController, public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    if (this.navParams.get('profile') != null) {
      this.profile = this.navParams.get('profile');
      this.setColorLabelAndGenderIcon();
    } else {
      this.navCtrl.pop();
    }
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

    this.profileProvider.createAndUpdateUserProfile(this.profile).then(() => {

      this.toast.create({
        message: 'Perfil criado com sucesso!',
        cssClass: 'valid',
        duration: 1800,
        position: 'top',
      }).present();

      this.navCtrl.setRoot('MainPage');

    }).catch(e => {
      console.log(e);

    })
  }


  async  takePicture() {

    let load = this.loading.create({
      content: 'Carregando sua foto...'
    })

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

        load.present();

        const pathReference = pictures;

        pathReference.getDownloadURL().then(url => {

          this.profileProvider.setUserProfilePicture(url).then(() => {
            this.profilePicture = url;

            load.dismiss();

          })


        })
      });

    } catch (e) {
      console.log(e);
    }
  }


  updateProfile() {
    this.navCtrl.getPrevious().data.isUpdating = true;
    this.navCtrl.pop();
  }

}
