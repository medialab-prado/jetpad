import { Injectable } from 'angular2/core';
import { User } from '../data/user';
import { CObject } from '../data/cobject';
import { OnInit } from 'angular2/core';

declare var jQuery;
const DEFAULT_AVATAR_URL = 'images/user.jpeg';
const DEFAULT_USERNAME = '_anonymous_';
const DEFAULT_PASSWORD = '';
const DEFAULT_SNACK_TIMEOUT = 3000;

@Injectable()
export class SwellRTService implements OnInit {

  state: string;
  kastSnack: any;

  listener: Function;

  session: any;
  user: Promise<User>;
  object: Promise<CObject>;

  constructor() {
  }

  ngOnInit() {
    this.object = new Promise<CObject>(function(resolve, reject){
      reject();
    });

    this.user = this.resume(true);
  }

  bindListeners() {

    console.log("SwellRT listeners bound");

    SwellRT.on(SwellRT.events.NETWORK_CONNECTED, function() {
      if (this.lastSnack)
        this.lastSnack.hide();


      jQuery.snackbar({ content: "Connected to server", timeout: DEFAULT_SNACK_TIMEOUT  });

      this.state = "CONNECTED";

      if (this.listener)
        this.listener(SwellRT.events.NETWORK_CONNECTED);
    });

    SwellRT.on(SwellRT.events.NETWORK_DISCONNECTED, function() {
      this.lastSnack = jQuery.snackbar({ content: "Connection lost trying to reconnect...", timeout: 0  });

      this.state = "DISCONNECTED";

      if (this.listener)
        this.listener(SwellRT.events.NETWORK_DISCONNECTED);
    });

    SwellRT.on(SwellRT.events.FATAL_EXCEPTION, function() {

      if (this.lastSnack)
        this.lastSnack.hide();

      this.lastSnack = jQuery.snackbar({ content: "Oops! an fatal error has ocurred. Please <a href='/'>refresh.</a>", timeout: 0, htmlAllowed: true  });

      this.state = "EXCEPTION";
      if (this.listener)
        this.listener(SwellRT.events.FATAL_EXCEPTION);
    });

  }

  getState() {
    return this.state;
  }

  setListener(_listener: Function) {
    this.listener = _listener;
  }

  resume(_loginIfError: boolean) {
    let adaptSessionToUser = (session: any) => { return this.adaptSessionToUser(session) };
    let resumedUser = new Promise<User>(function(resolve, reject) {

        SwellRT.resumeSession(
          function(session) {
            let user:User = adaptSessionToUser(session);
            if (!user.anonymous)
              jQuery.snackbar({ content: "Welcome "+ user.name, timeout: DEFAULT_SNACK_TIMEOUT  });
            resolve(user);
          },
          function(error) {
            reject(error);
          });

    });

    if (_loginIfError) {

       this.user = new Promise<User>(function(resolve, reject) {
         resumedUser.then(user => {
           console.log("Resuming session... ");
           resolve(user);
         })
         .catch(error => {
           console.log("Login with anonymous user...");
           this.login(DEFAULT_USERNAME, DEFAULT_PASSWORD)
            .then(user => resolve(user))
            .catch(error => reject(error));
         });

       });

    } else {
      this.user = resumedUser;
    }

    return this.user;
  }


  login(_name: string, _password: string) {
    let adaptSessionToUser = (session: any) => { return this.adaptSessionToUser(session) };
    this.user = new Promise<User>(function(resolve, reject) {

      SwellRT.startSession("http://local.net:9898", _name, _password,

        function(session) {
          let user:User = adaptSessionToUser(session);
          if (!user.anonymous)
            jQuery.snackbar({ content: "Welcome "+ user.name, timeout: DEFAULT_SNACK_TIMEOUT  });
          resolve(user);
        },

        function(e) {
          reject(e);
        }
      );

    });

    return this.user;
  }


  logout(_loginAsAnonymous: boolean) {
    this.session = undefined;
    try {
      SwellRT.stopSession();
    } catch(e) {
      console.log(e);
    }

    if (_loginAsAnonymous) {
      return this.login(DEFAULT_USERNAME, DEFAULT_PASSWORD);
    }

    this.user = new Promise<User>(function(resolve, reject) {
      resolve(null);
    });

    return this.user;
  }

  getUser() {
    return this.user;
  }


  private adaptSessionToUser(_session: any) {
    this.session = _session;
    let n;
    // Remove this condition block when
    // SwellRT returns same data in both resume() and startSession()
    if (this.session.data)
      n = this.session.data.id;
    else
      n = this.session.address;

    n = n.slice(0, n.indexOf("@"));

    let isAnonymous = false;
    let regExpAnonymous = /_anonymous_/;
    if (regExpAnonymous.test(n)) {
      n = "Anonymous";
      isAnonymous = true;
    }

    return  { name: n,
              anonymous: isAnonymous,
              avatarUrl: DEFAULT_AVATAR_URL };

  }



  open(_id: string) {

    // Add the domain part to the Id
    if (_id.indexOf("/") == -1) {
        _id = SwellRT.domain()+"/"+_id;
    }

    this.object = new Promise<CObject>(function(resolve, reject){
      try {
        SwellRT.openModel(_id, function(object){
          resolve(object);
        });
      } catch (e) {
        reject(e);
      }
    });

    return this.object;
  }

  get() {
    return this.object;
  }

  close() {

    this.object.then(object => {
      SwellRT.closeModel(object.id());
    });

    this.object = new Promise<CObject>(function(resolve, reject){
      reject();
    });

    return this.object;
  }

  editor(parentElementId) {
    return SwellRT.editor(parentElementId);
  }




}
