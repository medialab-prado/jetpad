import { NgModule, ApplicationRef } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { removeNgStyles, createNewHosts } from '@angularclass/hmr';

import { ENV_PROVIDERS } from './environment';
import { ROUTES } from './app.routes';

import { App } from './app.component';

import { HeaderComponent } from "./components/header";
import { LoginComponent } from "./components/login";
import { ProfileComponent } from "./components/profile";
import { RegisterComponent } from "./components/register";
import { AuthenticationComponent } from "./components/authentication";
import { UserPanelComponent } from "./components/user-panel";
import { LandingComponent } from './components/landing';
import { EditorComponent } from './components/editor';
import { FooterComponent } from "./components/footer";
import { TermsComponent } from "./components/terms";
import { NoContent } from './components/no-content';
import { UnauthorizedComponent } from "./components/unauthorized";

import { DocumentService, ListenerService, UserService } from "./services";
import { LoggedUserGuard } from "./guards";
import {SessionResolver} from "./resolver";
import {SearchPipe} from "./pipes";

import { AppState } from "./app.service";

import { DROPDOWN_DIRECTIVES } from "ng2-dropdown";
import {ShareSettingsComponent} from "./components/share-settings/share-settings.component";
import {BootstrapModalModule} from "angular2-modal/plugins/bootstrap";
import {ModalModule} from "angular2-modal";

const APP_PROVIDERS = [
  AppState,
  DocumentService,
  ListenerService,
  UserService,
  SessionResolver,
  LoggedUserGuard
];

@NgModule({
  bootstrap: [ App ],
  declarations: [
    App,
    HeaderComponent,
    LoginComponent,
    ProfileComponent,
    RegisterComponent,
    AuthenticationComponent,
    UserPanelComponent,
    LandingComponent,
    EditorComponent,
    FooterComponent,
    TermsComponent,
    ShareSettingsComponent,
    NoContent,
    UnauthorizedComponent,
    SearchPipe,
    DROPDOWN_DIRECTIVES
  ],
  imports: [ // import Angular's modules
    BrowserModule,
    FormsModule,
    HttpModule,
    ModalModule.forRoot(),
    BootstrapModalModule,
    RouterModule.forRoot(ROUTES, { useHash: true })
  ],
  providers: [ // expose our Services and Providers into Angular's dependency injection
    ENV_PROVIDERS,
    APP_PROVIDERS
  ]
})

export class AppModule {
  constructor(public appRef: ApplicationRef, public appState: AppState) {}
  hmrOnInit(store) {
    if (!store || !store.state) return;
    console.log('HMR store', store);
    this.appState.state = store.state;
    delete store.state;
  }
  hmrOnDestroy(store) {
    var cmpLocation = this.appRef.components.map(cmp => cmp.location.nativeElement);
    // recreate elements
    store.state = this.appState.state;
    store.disposeOldHosts = createNewHosts(cmpLocation);
    // remove styles
    removeNgStyles();
  }
  hmrAfterDestroy(store) {
    // display new elements
    store.disposeOldHosts();
    delete store.disposeOldHosts;
  }
}
