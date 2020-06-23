import { Component, NgZone  } from '@angular/core';
import { NavController, Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { AppService } from '../../services/app.service'

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
  styleUrls: ['./login.scss'],
})
export class LoginPage {
  
  page: number = 1;

  constructor(public navCtrl: NavController,
              public router: Router, public zone: NgZone,
              private appService: AppService
  ){
  }

  async doLogin(){
    //this.navigate("www.google.com/");
   // var loginResponse = await this.appService.tryDoLogin();

    this.zone.run(() => {
      this.appService.login()
    });

    //if (loginResponse) this.router.navigate(['home'],{ replaceUrl: true });
  }

  ionViewDidEnter() {
  }

}