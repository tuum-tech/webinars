import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
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
              public router: Router,
              private appService: AppService) {
    
  }

  async doLogin(){
    var loginResponse = await this.appService.tryDoLogin();

    if (loginResponse) this.router.navigate(['home'],{ replaceUrl: true });
  }

  ionViewDidEnter() {
  }

}