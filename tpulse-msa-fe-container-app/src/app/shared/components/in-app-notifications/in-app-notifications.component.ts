import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'container-in-app-notifications',
  templateUrl: './in-app-notifications.component.html',
  styleUrls: ['./in-app-notifications.component.scss'],
  animations: [
    trigger('slideInOut', [
      state('in', style({
        opacity: 1,
        transform: 'translateX(0)'
      })),
      transition('void => *', [
        style({
          opacity: 0,
          transform: 'translateX(100%)'
        }),
        animate('300ms ease-in')
      ]),
      transition('* => void', [
        animate('300ms ease-out', style({
          opacity: 0,
          transform: 'translateX(100%)'
        }))
      ])
    ])
  ]
})
export class InAppNotificationsComponent implements OnInit {
  riskRatingLevels: any;

  notifications: any[] = [
  ]
  notificationsStack: any[] = []
  notificationSound: HTMLAudioElement;

  hsseWebSocket: WebSocket;
  cdWebSocket: WebSocket;
  lsWebSocket: WebSocket;
  mappedNotificationObject: any;
  selectedPlantDetails:any;
  constructor(private router: Router) { 
    let riskRatingLevels = JSON.parse(sessionStorage.getItem('safety-and-surveillance-configurations'))['module_configurations']['risk_rating_levels']
    this.riskRatingLevels = riskRatingLevels;
    let plantDetails = JSON.parse(sessionStorage.getItem('plantDetails'))
    let accessiblePlants = JSON.parse(sessionStorage.getItem('accessible-plants'))
    this.selectedPlantDetails = accessiblePlants?.filter((val,ind) => val?.id == plantDetails?.id)
    // window.addEventListener("plant-selected", (ev) => {
    //   // Initialize WebSocket connection
    //   if(sessionStorage.getItem("selectedPlant")){
    //     this.closeConnection()
    //     let hsseUrl = JSON.parse(sessionStorage.getItem("application-configuration"))["websocketUrl"] + sessionStorage.getItem("company-id") + "/" + sessionStorage.getItem('selectedPlant') + "/" +'safety_and_surveillance/notification/?token=' + sessionStorage.getItem('access-token')
    //     let cdUrl = JSON.parse(sessionStorage.getItem("application-configuration"))["websocketUrl"] + sessionStorage.getItem("company-id") + "/" + sessionStorage.getItem('selectedPlant') + "/" +'central_dashboard/notification/?token=' + sessionStorage.getItem('access-token')
    //     let lsurl = JSON.parse(sessionStorage.getItem("application-configuration"))["websocketUrl"] + sessionStorage.getItem("company-id") + "/" + sessionStorage.getItem('selectedPlant') + "/" +'live_streaming/notification/?token=' + sessionStorage.getItem('access-token')
    //     this.hsseWebSocket = new WebSocket(hsseUrl);
    //     this.cdWebSocket = new WebSocket(cdUrl);
    //     this.lsWebSocket = new WebSocket(lsurl);
  
    //     this.initializeWebSocket();
    //     this.intitializeStartStopWS();
    //     this.initializeDeviceStatusWS();
    //   }
    // })

    window.addEventListener('triggerWebsocket', (ev) => {
      this.closeConnection()
      let accessiblePlants = JSON.parse(sessionStorage.getItem("accessible-plants"));
      accessiblePlants.forEach((plant)=>{
        // Initialize WebSocket connection
        let hsseUrl = JSON.parse(sessionStorage.getItem("application-configuration"))["websocketUrl"] + sessionStorage.getItem("company-id") + "/" + plant.id + "/" +'safety_and_surveillance/notification/?token=' + sessionStorage.getItem('access-token')
        let cdUrl = JSON.parse(sessionStorage.getItem("application-configuration"))["websocketUrl"] + sessionStorage.getItem("company-id") + "/" + plant.id + "/" +'central_dashboard/notification/?token=' + sessionStorage.getItem('access-token')
        let lsurl = JSON.parse(sessionStorage.getItem("application-configuration"))["websocketUrl"] + sessionStorage.getItem("company-id") + "/" + plant.id + "/" +'live_streaming/notification/?token=' + sessionStorage.getItem('access-token')
  
        this.hsseWebSocket = new WebSocket(hsseUrl);
        this.cdWebSocket = new WebSocket(cdUrl);
        this.lsWebSocket = new WebSocket(lsurl);

        this.initializeWebSocket();
        this.intitializeStartStopWS();
        this.initializeDeviceStatusWS();
      })
    })

    window.addEventListener("applicationWebSocket", (ev) => {
      // Initialize WebSocket connection
      if(sessionStorage.getItem("selectedPlant")){
        this.closeConnection()
        let hsseUrl = JSON.parse(sessionStorage.getItem("application-configuration"))["websocketUrl"] + sessionStorage.getItem("company-id") + "/" + sessionStorage.getItem('selectedPlant') + "/" +'safety_and_surveillance/notification/?token=' + sessionStorage.getItem('access-token')
        let cdUrl = JSON.parse(sessionStorage.getItem("application-configuration"))["websocketUrl"] + sessionStorage.getItem("company-id") + "/" + sessionStorage.getItem('selectedPlant') + "/" +'central_dashboard/notification/?token=' + sessionStorage.getItem('access-token')
        let lsurl = JSON.parse(sessionStorage.getItem("application-configuration"))["websocketUrl"] + sessionStorage.getItem("company-id") + "/" + sessionStorage.getItem('selectedPlant') + "/" +'live_streaming/notification/?token=' + sessionStorage.getItem('access-token')
        
        this.hsseWebSocket = new WebSocket(hsseUrl);
        this.cdWebSocket = new WebSocket(cdUrl);
        this.lsWebSocket = new WebSocket(lsurl);
  
        this.initializeWebSocket();
        this.intitializeStartStopWS();
        this.initializeDeviceStatusWS();
      }
    })
  }


  ngOnInit(): void {
    // this.initializeWebSocket();
    // this.intitializeStartStopWS();
    // this.initializeDeviceStatusWS();
  }

  initializeWebSocket() {
    if(!window.location.href.split("/").includes('central-dashboard') && !window.location.href.split("/").includes("cognito-auth")) {
      // Initialize WebSocket connection
      let url = JSON.parse(sessionStorage.getItem("application-configuration"))["websocketUrl"] + sessionStorage.getItem("company-id") + "/" + sessionStorage.getItem('selectedPlant') + "/" +'safety_and_surveillance/notification/?token=' + sessionStorage.getItem('access-token')
      // this.hsseWebSocket = new WebSocket(url);
      var categories: any[] = JSON.parse(sessionStorage.getItem("safety-and-surveillance-configurations"))["module_configurations"]["iogp_categories"]

      this.hsseWebSocket.onopen = (event) => {
      //When websocket is opened.
      console.info("HSSE websocket conneted.")
      }
      this.hsseWebSocket.onmessage = (event: any) => {
        if(JSON.parse(event.data).Status == "Connected") {
          // On web socket connected message recieve.
        } else {  
          // If data is received in the response
          // Load notification sound
          this.notificationSound = new Audio();
          this.notificationSound.src = 'assets/notifications-icons/wrong-answer-126515.mp3';
          this.notificationSound.load();

          this.mappedNotificationObject = {};
          this.getNotificationMessage(JSON.parse(event.data).message)
          if(!window.location.href.split("/").includes('central-dashboard')) {
           
            // Find the object with matching acronym
           if(this.mappedNotificationObject.type == 'obs_upload') {
            this.mappedNotificationObject.category = this.mappedNotificationObject.category == "OTH" ? "OTH1" : this.mappedNotificationObject.category;
            
            const categoryObject = categories.find(obj => obj.acronym === this.mappedNotificationObject.category);
            var extension = (this.mappedNotificationObject.category == "OTH") ? ".svg" : ".png"
            this.mappedNotificationObject.iconClass = "assets/notifications-icons/" + this.mappedNotificationObject.category.toLowerCase() + extension;
            this.mappedNotificationObject.categoryName = categoryObject.name;
          
          const date = new Date(this.mappedNotificationObject.date);
          const formattedDate = `${date.getDate()} - ${this.getMonthAbbreviation(date)} - ${String(date.getFullYear()).slice(-2)}`;
          this.mappedNotificationObject.displayDate = formattedDate

            this.notifications.push(this.mappedNotificationObject);

            setTimeout(() => {
              this.pushIntoNotifications()
            }, 2000)
           }
          }
        }        
      }
      this.hsseWebSocket.onclose = (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason);
      };
  }
  }

  intitializeStartStopWS() {
    if(!window.location.href.split("/").includes('central-dashboard') && !window.location.href.split("/").includes("cognito-auth")) {
      // Initialize WebSocket connection
      let url = JSON.parse(sessionStorage.getItem("application-configuration"))["websocketUrl"] + sessionStorage.getItem("company-id") + "/" + sessionStorage.getItem('selectedPlant') + "/" +'central_dashboard/notification/?token=' + sessionStorage.getItem('access-token')
      // this.lsWebSocket = new WebSocket(url);

      this.lsWebSocket.onopen = (event) => {
      //When websocket is opened.
      console.info("LS websocket conneted.")
      }
      this.lsWebSocket.onmessage = (event: any) => {
        if(JSON.parse(event.data).Status == "Connected") {
          // On web socket connected message recieve.
        } else {
          if(JSON.parse(event.data).message) {
          // If data is received in the response
          // Load notification sound
          this.notificationSound = new Audio();
          this.notificationSound.src = 'assets/notifications-icons/wrong-answer-126515.mp3';
          this.notificationSound.load();

          this.mappedNotificationObject = {};
          this.getNotificationMessage(JSON.parse(event.data).message)
          if(!window.location.href.split("/").includes('central-dashboard')) {
            if(this.mappedNotificationObject.type == "start_stream") {
              this.mappedNotificationObject.iconClass = "assets/notifications-icons/start_stream.svg"
              const date = new Date(this.mappedNotificationObject.date);
              const formattedDate = `${date.getDate()} - ${this.getMonthAbbreviation(date)} - ${String(date.getFullYear()).slice(-2)}`;
              this.mappedNotificationObject.displayDate = formattedDate

              var userID = JSON.parse(sessionStorage.getItem("logged_in_user")) //logged in user's ID
              var hasAccessToStopStart: any[] = this.mappedNotificationObject.userList //list of user-IDs who have enabled sound for this notification. 
              if(hasAccessToStopStart.includes(userID)) {
                this.notifications.push(this.mappedNotificationObject);

                setTimeout(() => {
                  this.pushIntoNotifications()
                }, 2000)
              }
            } else if(this.mappedNotificationObject.type == "stop_stream") {
              this.mappedNotificationObject.iconClass = "assets/notifications-icons/stop_stream.svg"
              const date = new Date(this.mappedNotificationObject.date);
              const formattedDate = `${date.getDate()} - ${this.getMonthAbbreviation(date)} - ${String(date.getFullYear()).slice(-2)}`;
              this.mappedNotificationObject.displayDate = formattedDate

              var userID = JSON.parse(sessionStorage.getItem("logged_in_user")) //logged in user's ID
              var hasAccessToStopStart: any[] = this.mappedNotificationObject.userList //list of user-IDs who have enabled sound for this notification. 
              if(hasAccessToStopStart.includes(userID)) {
                this.notifications.push(this.mappedNotificationObject);

                setTimeout(() => {
                  this.pushIntoNotifications()
                }, 2000)
              }
            } else if(this.mappedNotificationObject.type == "battery_low") {
              this.mappedNotificationObject.iconClass = "assets/notifications-icons/battery_low.svg"
              const date = new Date(this.mappedNotificationObject.date);
              const formattedDate = `${date.getDate()} - ${this.getMonthAbbreviation(date)} - ${String(date.getFullYear()).slice(-2)}`;
              this.mappedNotificationObject.date = formattedDate

              var userID = JSON.parse(sessionStorage.getItem("logged_in_user")) //logged in user's ID
              var hasAccessToStopStart: any[] = this.mappedNotificationObject.userList //list of user-IDs who have enabled sound for this notification. 
              if(hasAccessToStopStart.includes(userID)) {
                this.notifications.push(this.mappedNotificationObject);

                setTimeout(() => {
                  this.pushIntoNotifications()
                }, 2000)
              }

              // this.notifications.push(this.mappedNotificationObject);

              // setTimeout(() => {
              //   this.pushIntoNotifications()
              // }, 2000)

             } else if(this.mappedNotificationObject.type == "device_offline") {
              this.mappedNotificationObject.iconClass = "assets/notifications-icons/device_offline.svg"
              const date = new Date(this.mappedNotificationObject.date);
              const formattedDate = `${date.getDate()} - ${this.getMonthAbbreviation(date)} - ${String(date.getFullYear()).slice(-2)}`;
              this.mappedNotificationObject.date = formattedDate
               
              var userID = JSON.parse(sessionStorage.getItem("logged_in_user")) //logged in user's ID
              var hasAccessToStopStart: any[] = this.mappedNotificationObject.userList //list of user-IDs who have enabled sound for this notification. 
              if(hasAccessToStopStart?.includes(userID)) {
                this.notifications.push(this.mappedNotificationObject);

                setTimeout(() => {
                  this.pushIntoNotifications()
                }, 2000)
              }

              // this.notifications.push(this.mappedNotificationObject);

              // setTimeout(() => {
              //   this.pushIntoNotifications()
              // }, 2000)
             }
            }
          }
        }        
      }
      this.lsWebSocket.onclose = (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason);
      };
  }
   
  }

  initializeDeviceStatusWS() {
    if(!window.location.href.split("/").includes('central-dashboard') && !window.location.href.split("/").includes("cognito-auth")) {
      // Initialize WebSocket connection
      let url = JSON.parse(sessionStorage.getItem("application-configuration"))["websocketUrl"] + sessionStorage.getItem("company-id") + "/" + sessionStorage.getItem('selectedPlant') + "/" +'live_streaming/notification/?token=' + sessionStorage.getItem('access-token')
      // this.cdWebSocket = new WebSocket(url);
      this.cdWebSocket.onopen = (event) => {
      //When websocket is opened.
      console.info("CD websocket conneted.")
      }
      this.cdWebSocket.onmessage = (event: any) => {
        
        if(JSON.parse(event.data).Status == "Connected") {
          // On web socket connected message recieve.
        } else {
          // If data is received in the response
          // Load notification sound
          this.notificationSound = new Audio();
          this.notificationSound.src = 'assets/notifications-icons/wrong-answer-126515.mp3';
          this.notificationSound.load();

          this.mappedNotificationObject = {};
          this.getNotificationMessage(JSON.parse(event.data).message)
          if(!window.location.href.split("/").includes('central-dashboard')) {
            if(this.mappedNotificationObject.type == "device_offline") {
              this.mappedNotificationObject.iconClass = "assets/notifications-icons/device_offline.svg"
              const date = new Date(this.mappedNotificationObject.date);
              const formattedDate = `${date.getDate()} - ${this.getMonthAbbreviation(date)} - ${String(date.getFullYear()).slice(-2)}`;
              this.mappedNotificationObject.date = formattedDate
              var userID = JSON.parse(sessionStorage.getItem("logged_in_user")) //logged in user's ID
              var hasAccessToStopStart: any[] = this.mappedNotificationObject.userList //list of user-IDs who have enabled sound for this notification. 
              if(hasAccessToStopStart.includes(userID)) {
                this.notifications.push(this.mappedNotificationObject);

                setTimeout(() => {
                  this.pushIntoNotifications()
                }, 2000)
              }
              // this.notifications.push(this.mappedNotificationObject);

              // setTimeout(() => {
              //   this.pushIntoNotifications()
              // }, 2000)
            } else if(this.mappedNotificationObject.type == "battery_low") {
              this.mappedNotificationObject.iconClass = "assets/notifications-icons/battery_low.svg"
              const date = new Date(this.mappedNotificationObject.date);
              const formattedDate = `${date.getDate()} - ${this.getMonthAbbreviation(date)} - ${String(date.getFullYear()).slice(-2)}`;
              this.mappedNotificationObject.date = formattedDate

              var userID = JSON.parse(sessionStorage.getItem("logged_in_user")) //logged in user's ID
              var hasAccessToStopStart: any[] = this.mappedNotificationObject.userList //list of user-IDs who have enabled sound for this notification. 
              if(hasAccessToStopStart.includes(userID)) {
                this.notifications.push(this.mappedNotificationObject);

                setTimeout(() => {
                  this.pushIntoNotifications()
                }, 2000)
              }
              // this.notifications.push(this.mappedNotificationObject);

              // setTimeout(() => {
              //   this.pushIntoNotifications()
              // }, 2000)
            }
          }
        }        
      }
      this.cdWebSocket.onclose = (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason);
      };
  }

  }

  getNotificationMessage(notification: any) {
    const uniqueId = this.generateUniqueId();

    for (const key in notification) {
      if (notification.hasOwnProperty(key)) {
        const camelCaseKey = this.toCamelCase(key);
        this.mappedNotificationObject[camelCaseKey] = notification[key];
      }
    }

    // Add the unique ID key to the mapped notification object
    this.mappedNotificationObject['id'] = uniqueId;
  }

  generateUniqueId() {
    // Generate a unique ID
    return Math.random().toString(36).substr(2, 9);
  }

  //add the received notification to the stack which will be disabled.
  pushIntoNotifications(notificationType?) {
      if (this.notifications.length > 0) {
        const notification = this.notifications.shift();
        if(!notificationType){
        this.notificationsStack.push(notification);
        }
        else if(this.selectedPlantDetails?.[0]?.access_type.includes(notificationType)){
          this.notificationsStack.push(notification);
        }

        //simulate a click so that the DOMException doesnt occur. 
        // IMPORTANT : Not a solution, just a work around.
        this.simulateClick();

        if(notification.type === "obs_upload") {
          var userID = JSON.parse(sessionStorage.getItem("logged_in_user")) //logged in user's ID
          var webPopupSoundGroup: any[] = notification.webPopupSoundGroupUserIdsList //list of user-IDs who have enabled sound for this notification.
  
          //check if the user has the enabled sounds for the received notification.
          if(webPopupSoundGroup.includes(userID)) {
            setTimeout(() => {
              this.playNotificationSound(notification);          
            }, 200);
          }
  
        }
        if(notification.type === "battery_low"){
          setTimeout(() => {
            this.playNotificationSound(notification);          
          }, 200);
        }

        // Automatically close notification after 10 seconds
        this.scheduleNotificationClose(notification);
      }
  }

  //to add sounds to the notifications.
  playNotificationSound(notification: any) {
    // Load notification sound
    this.notificationSound = new Audio();
    if(notification.type === "obs_upload"){
      if(notification.rating >= 4) {
        this.notificationSound.src = 'assets/notifications-icons/beep-warning-6387.mp3';
        } else {
          this.notificationSound.src = 'assets/notifications-icons/wrong-answer-126515.mp3';
        }
    }
    if(notification.type === "battery_low"){
        this.notificationSound.src = 'assets/notifications-icons/Low-battery-sound.mp3';
    }
    
    this.notificationSound.load();


    // Check if the audio element is loaded before playing
    if (this.notificationSound.readyState === HTMLMediaElement.HAVE_ENOUGH_DATA) {
      this.notificationSound.play();          
    } else {
      // If not loaded, wait for it to load and then play
      this.notificationSound.oncanplaythrough = () => {
        this.notificationSound.play().then(() => console.log('Audio playback started successfully.'))
        .catch(error => console.error('Error starting audio playback:', error));;          
      };
    }
  }

  //on click of the cross button of the notification.
  closeNotification(notification: any) {
    const index = this.notificationsStack.findIndex(notificationObj => notificationObj.id === notification.id);
    if (index !== -1) {
      this.notificationsStack.splice(index, 1);
    }
  }

  // Close after 10 seconds
  scheduleNotificationClose(notification: any) {
    setTimeout(() => {
      this.closeNotification(notification);
    }, 10000); 
  }

  getMonthAbbreviation(date) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[date.getMonth()];
  }

  toCamelCase(str) {
    return str.replace(/_([a-z])/g, function (g) { return g[1].toUpperCase(); });
  }

  navigateFromNotification(notification: any) {
    var globalSearchObject: any = {}
    
    if(notification.type === "obs_upload") {
      globalSearchObject.category = notification.category
      globalSearchObject.date = notification.date
      globalSearchObject.end_date = notification.unitEndDate
      globalSearchObject.start_date = notification.unitStartDate
      globalSearchObject.fault_status = "Open"
      globalSearchObject.id = notification.entityId
      globalSearchObject.is_highlight = false
      globalSearchObject.unit = notification.unitName
      globalSearchObject.unit_id = notification.unitId
      globalSearchObject.type = notification.type
      globalSearchObject.zone = notification.zoneId
      globalSearchObject.module_id = notification.applicationId
      globalSearchObject.plant_id = notification.plantId

      var searchObservation = {
        category: globalSearchObject.category,
        date: globalSearchObject.date,
        fault_status: globalSearchObject.fault_status,
        id: globalSearchObject.id,
        is_highlight: false,
        unit: globalSearchObject.unit
      }
      sessionStorage.setItem("searchObservation", JSON.stringify(searchObservation))
      sessionStorage.setItem('notification-data', JSON.stringify(notification))
      sessionStorage.setItem('navigatedObservation', JSON.stringify(true));
    } else {
      globalSearchObject = notification
    }

    if(notification.type === "obs_upload" || notification.type === "start_stream") {
      if(notification.type === "start_stream"){
        sessionStorage.setItem('mode',JSON.stringify(null))
      }
      let accessible_plants = JSON.parse(
        sessionStorage.getItem('accessible-plants')
      );
      accessible_plants?.forEach((ele) => {
        if (ele?.id == globalSearchObject?.plantId) {
          if(ele?.application?.length > 1){
            sessionStorage.setItem('navigated-to-application', JSON.stringify(true));
          }
        }
      });
      sessionStorage.setItem("global-search-notification", JSON.stringify(globalSearchObject))
      sessionStorage.setItem('manually-selected-units', JSON.stringify([notification?.unitId]))
      sessionStorage.setItem("selectedPlant", notification.plantId);
      if(!JSON.parse(sessionStorage.getItem('navigated-to-application'))){
        sessionStorage.setItem("selectedPlant", notification.plantId);
      }
      window.dispatchEvent(new CustomEvent('navigate-from-notification', {detail: globalSearchObject})) 
      if(this.checkModulesAccess()){
        sessionStorage.setItem('navigated-to-application',JSON.stringify(true));
        window.dispatchEvent(new CustomEvent('navigated-from-admin', {detail: notification.plantId}))
      } 
    }
    this.closeNotification(notification)
  }

  checkModulesAccess() {
    var applicationValues = JSON.parse(sessionStorage.getItem('permitPlantMap'))
    var hasModules = applicationValues.map(plant => plant.modulesAccess).some(value => value)
    if(hasModules) {
      return true;
    } else {
      return false;
    }
  }

  simulateClick() {
    /*
    simulating a click event to interact with the dom, inorder to override the DOMException error.
    */  
    const targetElement = document.getElementById('headerTitle');
    console.log(targetElement)
    // Create a new click event
    const clickEvent = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true
    });

    // Dispatch the click event on the target element
    targetElement.dispatchEvent(clickEvent); 
  }

  public closeConnection(): void {
    console.log('triggering')
    if (this.hsseWebSocket) {
      this.hsseWebSocket.close(1000, 'Normal closure'); // 1000 is a standard code for normal closure
    } 
    if (this.cdWebSocket) {
      this.cdWebSocket.close(1000, 'Normal closure'); // 1000 is a standard code for normal closure
    }
    if (this.lsWebSocket) {
      this.lsWebSocket.close(1000, 'Normal closure'); // 1000 is a standard code for normal closure
    }
  }
}
