## Resources
- Install Ionic 
- [Enable Capacitor to be used](https://capacitor.ionicframework.com/docs/getting-started/with-ionic/?utm_source=cli&utm_medium=referral&utm_campaign=CLI)
- [Deploying to Mobile](https://ionicframework.com/docs/angular/your-first-app/6-deploying-mobile)

## How to run
- Install dependencies
```
npm install -g native-run
npm install
```
- Run
```
ionic capacitor run android --livereload 
// If you to access it from a different host other than localhost, add the flags 
ionic capacitor run android --livereload --external --public-host 192.168.1.86
```

## If there are any changes to the code
```
ionic cap update android 
ionic cap copy android // If only web code has changed
ionic cap sync android // If you made changes to plugins
```

