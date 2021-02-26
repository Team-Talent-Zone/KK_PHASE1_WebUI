import { NewServiceAdapter } from './adapters/newserviceadapter';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FooterComponent } from './footer/footer.component';
import { LoginComponent } from './login/login.component';
import { HomepriceComponent } from './homepricesection/homeprice.component';
import { HomecbasectionComponent } from './homecbasection/homecbasection.component';
import { HomefusectionComponent } from './homefusection/homefusection.component';
import { HeaderComponent } from './header/header.component';
import { HomewhatwedoComponent } from './homewhatwedosection/homewhatwedo.component';
import { HomeComponent } from './home/home.component';
import { SignupComponent } from './signup/signup.component';
import { ModalModule, BsModalRef } from 'ngx-bootstrap/modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ReferenceAdapter } from './adapters/referenceadapter';
import { AlertComponent } from './alert/alert.component';
import { AlertsService } from './AppRestCall/alerts/alerts.service';
import { UserService } from './AppRestCall/user/user.service';
import { ReferenceService } from './AppRestCall/reference/reference.service';
import { UserAdapter } from './adapters/useradapter';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ReferenceLookUpTemplateAdapter } from './adapters/referencelookuptemplateadapter';
import { Ng4LoadingSpinnerModule } from 'ng4-loading-spinner';
import { AuthgaurdService } from './AppRestCall/authgaurd/authgaurd.service';
import { BasicAuthHtppInterceptorService } from './AppRestCall/authgaurd/basicauthhttpinterceptor/basicauthhttpinterceptor.service';
import { ManageuserComponent } from './manageuser/manageuser.component';
import { EditprofileComponent } from './editprofile/editprofile.component';
import { ViewaccountdetailsComponent } from './viewaccountdetails/viewaccountdetails.component';
import { DashboardmapbyuseroleComponent } from './dashboardmapbyuserole/dashboardmapbyuserole.component';
import { ProcessbgverificationComponent } from './processbgverification/processbgverification.component';
import { SignupadminComponent } from './signupadmin/signupadmin.component';
import { NewserviceComponent } from './newservice/newservice.component';
import { ManageserviceComponent } from './manageservice/manageservice.component';
import { ApiService } from './adapters/api.service';
import { ProcessnewserviceComponent } from './processnewservice/processnewservice.component';
import { ViewnewsevicedetailsComponent } from './viewnewsevicedetails/viewnewsevicedetails.component';
import { DashboardofcbaComponent } from './dashboardofcba/dashboardofcba.component';
import { DashboardoffuComponent } from './dashboardoffu/dashboardoffu.component';
import { DashboardofadminComponent } from './dashboardofadmin/dashboardofadmin.component';
import { DashboardsearchbyfilterComponent } from './dashboardsearchbyfilter/dashboardsearchbyfilter.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { UsersrvdetailsService } from './AppRestCall/userservice/usersrvdetails.service';
import { UserServicedetailsAdapter } from './adapters/userserviceadapter';
import { UserservicecartComponent } from './userservicecart/userservicecart.component';
import { AgmCoreModule } from '@agm/core';
import { config } from './appconstants/config';
import { PaymentComponent } from './payment/payment.component';
import { Error504pageComponent } from './error504page/error504page.component';
import { PaymenthistComponent } from './paymenthist/paymenthist.component';
import { ViewuserservicedetailsComponent } from './viewuserservicedetails/viewuserservicedetails.component';
import { ViewfujobdetailsComponent } from './viewfujobdetails/viewfujobdetails.component';
import { UsersubscribeservicesComponent } from './usersubscribeservices/usersubscribeservices.component';
import { ManagejobsComponent } from './managejobs/managejobs.component';
import { CreateoreditwidgetComponent } from './createoreditwidget/createoreditwidget.component';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { ToastNotificationsModule } from 'ngx-toast-notifications';
import { HometestimonialsComponent } from './hometestimonials/hometestimonials.component';
import { HomeclienttestimonalsComponent } from './homeclienttestimonals/homeclienttestimonals.component';
import { ViewfureviewsComponent } from './viewfureviews/viewfureviews.component';
import { MatomoModule } from 'ngx-matomo';
import { ReadMoreComponent } from './read-more/read-more.component';
import { ReadMorePopupComponent } from './read-more-popup/read-more-popup.component';
import { DatePipe } from '@angular/common';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { ConfirmationDialogService } from './AppRestCall/confirmation/confirmation-dialog.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DashboardofadminanalyticsComponent } from './dashboardofadminanalytics/dashboardofadminanalytics.component';
import { ViewjobbyjobidPopupComponent } from './viewjobbyjobid-popup/viewjobbyjobid-popup.component';
import { ChartsModule, ThemeService } from 'ng2-charts';
import { LiveTrackingComponent } from './live-tracking/live-tracking.component';
import { CommonUtility } from './adapters/commonutility';

export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient);
}

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    FooterComponent,
    LoginComponent,
    HomepriceComponent,
    HomecbasectionComponent,
    HomefusectionComponent,
    HeaderComponent,
    HomewhatwedoComponent,
    SignupComponent,
    AlertComponent,
    DashboardComponent,
    ManageuserComponent,
    EditprofileComponent,
    ViewaccountdetailsComponent,
    DashboardmapbyuseroleComponent,
    ProcessbgverificationComponent,
    SignupadminComponent,
    NewserviceComponent,
    ManageserviceComponent,
    ProcessnewserviceComponent,
    ViewnewsevicedetailsComponent,
    DashboardofcbaComponent,
    DashboardoffuComponent,
    DashboardofadminComponent,
    DashboardsearchbyfilterComponent,
    UserservicecartComponent,
    PaymentComponent,
    Error504pageComponent,
    PaymenthistComponent,
    ViewuserservicedetailsComponent,
    ViewfujobdetailsComponent,
    UsersubscribeservicesComponent,
    ManagejobsComponent,
    CreateoreditwidgetComponent,
    HometestimonialsComponent,
    HomeclienttestimonalsComponent,
    ViewfureviewsComponent,
    ReadMoreComponent,
    ReadMorePopupComponent,
    ConfirmationDialogComponent,
    DashboardofadminanalyticsComponent,
    ViewjobbyjobidPopupComponent,
    LiveTrackingComponent,
  ],
  imports: [
    ToastNotificationsModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    ModalModule.forRoot(),
    HttpClientModule,
    AgmCoreModule.forRoot({
      apiKey: config.GOOGLE_MAPS_API_KEY
    }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    NgbModule,
    Ng4LoadingSpinnerModule.forRoot(),
    MatomoModule,
    ChartsModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    BsModalRef,
    ReferenceAdapter,
    UserAdapter,
    ReferenceLookUpTemplateAdapter,
    AlertsService,
    UserService,
    NewServiceAdapter,
    ReferenceService,
    AuthgaurdService,
    SignupComponent,
    ApiService,
    DashboardofcbaComponent,
    ManageserviceComponent,
    ManageuserComponent,
    HeaderComponent,
    UsersrvdetailsService,
    UserServicedetailsAdapter,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: BasicAuthHtppInterceptorService,
      multi: true
    },
    DatePipe,
    ConfirmationDialogService,
    ThemeService,
    CommonUtility
  ],
  entryComponents: [
    ViewaccountdetailsComponent,
    ProcessbgverificationComponent,
    ProcessnewserviceComponent,
    ViewnewsevicedetailsComponent,
    UserservicecartComponent,
    PaymentComponent,
    ReadMorePopupComponent,
    ConfirmationDialogComponent,
    ViewjobbyjobidPopupComponent,
    LoginComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
