import { Injectable } from "@angular/core";
import { Native } from './Native';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { LocalStorageService } from "./localstorage.service";
let myService = null;


@Injectable({
    providedIn: 'root'
})
export class AppService {

    static intentConfig: any;
    static login = null;
    static email = '';
    private isReceiveIntentReady = false;


    constructor(public native: Native, private http: HttpClient, private localStorage : LocalStorageService) {

        myService = this;
    }

    init() {
    }

    tryDoLogin(): Promise<boolean> {
        var self = this;

        return new Promise(async (resolve, reject) => {
           
            let profile =  await this.localStorage.getProfile();
            console.log("profile: ", profile);
            if (profile)
            {
                AppService.login = profile[0];
                AppService.email = profile[1];
                resolve(true);
                return;
            }

            AppService.login = {
                didString: "did-string",
                name: "name-string"
            }
            AppService.email = "email-string";
            this.localStorage.setProfile(AppService.login,  AppService.email);
            
            //did:elastos:iWm3fwhsVbXJ1ecSi7n7Q9L6qNmH14FsuN
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