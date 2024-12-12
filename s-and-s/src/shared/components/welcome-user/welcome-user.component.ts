import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-welcome-user',
  templateUrl: './welcome-user.component.html',
  styleUrls: ['./welcome-user.component.scss']
})
export class WelcomeUserComponent implements OnInit {

  welcomeMessage: string = '';

  constructor() {

    // window.addEventListener('show-welcome-message', (ev) => {
    //   let name = sessionStorage.getItem('user-email').split('@')[0].split('.');
    // this.welcomeMessage = (JSON.parse(sessionStorage.getItem('firstLogin'))) ? 'Welcome ' + name[0] + " " + (name[1] ? name[1] : '') + ' !' : 'Welcome back ' + name[0] + " " + (name[1] ? name[1] : '') + ' !';
    // setTimeout(() => {
    //   this.showNotification();
    // }, 500);
    // })
   }

  ngOnInit() {
    let name = sessionStorage.getItem('user-email').split('@')[0].split('.');
    this.welcomeMessage = (JSON.parse(sessionStorage.getItem('firstLogin'))) ? 'Welcome ' + name[0] + " " + (name[1] ? name[1] : '') + ' !' : 'Welcome back ' + name[0] + " " + (name[1] ? name[1] : '') + ' !';
    setTimeout(() => {
      this.showNotification();
    }, 500);
  }

  showNotification() {
    let target_class = ['notify_box_wrapper', 'notify_box', 'text'];
    for (let c of target_class) {
      let elem: any = document.getElementsByClassName(c)[0];
      elem.classList.remove('animated');
      void elem.offsetWidth;
      elem.classList.add('animated');
    }
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('hide-banner'))
    }, 5000);
    // sessionStorage.setItem('welcomeMsgShown', 'true')
  }

}
