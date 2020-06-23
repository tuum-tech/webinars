import { WebIntent } from '@ionic-native/web-intent/ngx';
import { Injectable } from "@angular/core";
import { Native } from './Native';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { JwtHelperService } from "@auth0/angular-jwt";
import { LocalStorageService } from "./localstorage.service";
import { Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { Plugins, AppUrlOpen } from '@capacitor/core';
import * as jwt from 'jsonwebtoken';
let myService = null;

const helper = new JwtHelperService();

@Injectable({
    providedIn: 'root'
})
export class AppService {

    static intentConfig: any;
    static login = null;
    static email = '';
    private isReceiveIntentReady = false;


    constructor(public native: Native, private http: HttpClient, private localStorage : LocalStorageService, private platform: Platform, public router: Router, private webIntent: WebIntent) {
        myService = this;
    }

    init() {
        this.platform.ready().then(() => {
            if (this.platform.is('capacitor')) {
              Plugins.SplashScreen.hide();
      
              // THIS WILL BE USED IF THE APP IS ALREADY OPEN:
              Plugins.App.addListener('appUrlOpen', (urlOpen: AppUrlOpen) => {
                console.log('App URL Open', urlOpen);
               // this.navigate(urlOpen.url);
              });

              Plugins.App.addListener('appRestoredResult', (data: any) => {
                console.log('App Restored Result', data);
               // this.navigate(urlOpen.url);
              });
            }
      
            // THIS WILL BE USED IF THE APP HAS BEEN KILLED AND RE-OPENED:
            this.getLaunchUrl();
          });
    }

    async getLaunchUrl() {
        const urlOpen = await Plugins.App.getLaunchUrl();
        if(!urlOpen || !urlOpen.url) return;
        console.log('Launch URL', urlOpen);
        this.navigate(urlOpen.url);
    }

    navigate(uri: string) {
        // THIS MUST EQUAL THE 'custom_url_scheme' from your Android intent:
        //if (!uri.startsWith('net.exampleapp.app:/')) return;
        // Strip off the custom scheme:
        //uri = uri.substring(19);
        console.log("navigate: uri: ", uri);
        this.router.navigateByUrl(uri);
    }

    login(){


            //did:elastos:iWm3fwhsVbXJ1ecSi7n7Q9L6qNmH14FsuN
            // Create jwt token
            let jwt_claims = {
                'exp': 300,
                'redirecturl': 'ionic://tech.tuum.demoapp/',
                'claims': {
                    'name': true,
                    'email': true
                }
            }
            let jwt_token = jwt.sign(jwt_claims, "demo-ionic-app");
            console.log("jwt_token:", jwt_token);
            let urlToOpen = "elastos://credaccess/" + jwt_token;
            // window.open(urlToOpen,"_system","location=yes");
            
            console.log("Test s")


            const options = {
                action: this.webIntent.ACTION_VIEW,
                url: urlToOpen,
                requestCode: 2
              }
              
              this.webIntent.startActivityForResult(options).then(response =>{
                console.log("intent response", response)
              }).catch(err =>{
                console.log("Intent error", err)
              })

    }

    tryDoLogin(): Promise<boolean> {
        var self = this;

        return new Promise(async (resolve, reject) => {
           
            // let profile =  await this.localStorage.getProfile();
            // console.log("profile: ", profile);
            // if (profile)
            // {
            //     AppService.login = profile[0];
            //     AppService.email = profile[1];
            //     resolve(true);
            //     return;
            // }

            // AppService.login = {
            //     didString: "did-string",
            //     name: "name-string"
            // }
            // AppService.email = "email-string";
            // this.localStorage.setProfile(AppService.login,  AppService.email);
            
            console.log("uri", this.webIntent.getUri())


            //did:elastos:iWm3fwhsVbXJ1ecSi7n7Q9L6qNmH14FsuN
            // Create jwt token
            let jwt_claims = {
                'exp': 300,
                'redirecturl': this.webIntent.getUri(),
                'claims': {
                    'name': true,
                    'email': true
                }
            }
            let jwt_token = jwt.sign(jwt_claims, "demo-ionic-app");
            console.log("jwt_token:", jwt_token);
            let urlToOpen = "elastos://credaccess/" + jwt_token;
            // window.open(urlToOpen,"_system","location=yes");
            
            console.log("Test s")


            const options = {
                action: this.webIntent.ACTION_VIEW,
                url: urlToOpen,
                requestCode: 2
              }
              
              this.webIntent.startActivityForResult(options).then(response =>{
                console.log("intent response", response)
              }).catch(err =>{
                console.log("Intent error", err)
              })

            // this.navigate(urlToOpen);
            // let decoded = helper.decodeToken(jwt_token);
            // console.log("decoded: ", decoded);

            //url = 'elastos://credaccess/' + jwt_token.decode()
            /*
            appManager.sendIntent("credaccess", {
                claims: 
                    { 
                        name: true,
                        email: true
                    }
                },
                {},
                (response) => {
                    var nameSubject = self.getSubject(response.result.presentation, "name");
                    var emailSubject = self.getSubject(response.result.presentation, "email");
                    AppService.signedIdentity = {
                                didString: response.result.did,
                                didStoreId: response.result.did,
                                name:  nameSubject || "Not Set",
                            };
                    AppService.email = emailSubject || "Not Set";
                    this.localStorage.setProfile(AppService.signedIdentity,  AppService.email);
                    resolve(true);
                },
                function(err){
                    console.log(err);
                    resolve(false);
                })
                */
        });

    }

    logout(): Promise<any> {
        var self = this;
        return self.localStorage.clear();
    }

    private getSubject(presentation, fragment): any {
        var subject = null;
        presentation.verifiableCredential.forEach(vc => {
            let element = vc.credentialSubject[fragment]
            if (element != null) {
                subject = element;
            }
        });
        return subject;
    }
}