import { DashboardofadminanalyticsComponent } from './dashboardofadminanalytics/dashboardofadminanalytics.component';
import { ViewfureviewsComponent } from './viewfureviews/viewfureviews.component';
import { CreateoreditwidgetComponent } from './createoreditwidget/createoreditwidget.component';
import { UsersubscribeservicesComponent } from './usersubscribeservices/usersubscribeservices.component';
import { ViewuserservicedetailsComponent } from './viewuserservicedetails/viewuserservicedetails.component';
import { PaymenthistComponent } from './paymenthist/paymenthist.component';
import { DashboardsearchbyfilterComponent } from './dashboardsearchbyfilter/dashboardsearchbyfilter.component';
import { HomepriceComponent } from './homepricesection/homeprice.component';
import { NewserviceComponent } from './newservice/newservice.component';
import { SignupadminComponent } from './signupadmin/signupadmin.component';
import { DashboardmapbyuseroleComponent } from './dashboardmapbyuserole/dashboardmapbyuserole.component';
import { EditprofileComponent } from './editprofile/editprofile.component';
import { ManageuserComponent } from './manageuser/manageuser.component';
import { SignupComponent } from './signup/signup.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthgaurdService } from './AppRestCall/authgaurd/authgaurd.service';
import { ManageserviceComponent } from './manageservice/manageservice.component';
import { Error504pageComponent } from './error504page/error504page.component';
import { ViewfujobdetailsComponent } from './viewfujobdetails/viewfujobdetails.component';
import { ManagejobsComponent } from './managejobs/managejobs.component';
import { LiveTrackingComponent } from './live-tracking/live-tracking.component';

const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent,
  },
  {
    path: 'home/:name/:id',
    component: HomeComponent
  },
  {
    path: '_region',
    component: HomeComponent,
    children: [
      {
        path: '.',
        component: HomepriceComponent
      }
    ]
  },
  {
    path: 'signup/:id',
    component: HomeComponent,
    children: [
      {
        path: '',
        component: SignupComponent
      }
    ]
  },
  {
    path: '_dashboard',
    component: DashboardComponent,
    canActivate: [AuthgaurdService],
    children: [
      {
        path: '',
        component: DashboardmapbyuseroleComponent
      }
    ]
  },
  {
    path: '_manageuser',
    component: DashboardComponent,
    canActivate: [AuthgaurdService],
    children: [
      {
        path: '',
        component: ManageuserComponent
      }
    ]
  },
  {
    path: '_createnewservice',
    component: DashboardComponent,
    canActivate: [AuthgaurdService],
    children: [
      {
        path: '',
        component: NewserviceComponent
      }
    ]
  },
  {
    path: '_analyticsreporting',
    component: DashboardComponent,
    canActivate: [AuthgaurdService],
    children: [
      {
        path: '',
        component: DashboardofadminanalyticsComponent
      }
    ]
  },
  {
    path: '_editorviewnewservice/:id',
    component: DashboardComponent,
    canActivate: [AuthgaurdService],
    children: [
      {
        path: '',
        component: NewserviceComponent
      }
    ]
  },
  {
    path: '_dashboard/:code/:name',
    component: DashboardComponent,
    canActivate: [AuthgaurdService],
    children: [
      {
        path: '',
        component: DashboardsearchbyfilterComponent
      }
    ]
  },
  {
    path: '_job',
    component: DashboardComponent,
    canActivate: [AuthgaurdService],
    children: [
      {
        path: '',
        component: ManagejobsComponent
      }
    ]
  },
  {
    path: '_dashboard/:txtid',
    component: DashboardComponent,
    canActivate: [AuthgaurdService],
    children: [
      {
        path: '',
        component: DashboardmapbyuseroleComponent
      },
    ]
  },
  {
    path: '_signupadmin',
    component: DashboardComponent,
    canActivate: [AuthgaurdService],
    children: [
      {
        path: '',
        component: SignupadminComponent
      }
    ]
  },
  {
    path: '_manageservice',
    component: DashboardComponent,
    canActivate: [AuthgaurdService],
    children: [
      {
        path: '',
        component: ManageserviceComponent
      }
    ]
  },
  {
    path: '_myservices',
    component: DashboardComponent,
    canActivate: [AuthgaurdService],
    children: [
      {
        path: '',
        component: UsersubscribeservicesComponent
      }
    ]
  },
  {
    path: '_createoreditwidget/:id',
    component: DashboardComponent,
    canActivate: [AuthgaurdService],
    children: [
      {
        path: '',
        component: CreateoreditwidgetComponent
      }
    ]
  },
  {
    path: '_viewclientservices/:id',
    component: DashboardComponent,
    canActivate: [AuthgaurdService],
    children: [
      {
        path: '',
        component: ViewuserservicedetailsComponent
      }
    ]
  },
  {
    path: '_viewfujobdetails/:id/:role',
    component: DashboardComponent,
    canActivate: [AuthgaurdService],
    children: [
      {
        path: '',
        component: ViewfujobdetailsComponent
      }
    ]
  },
  {
    path: '_profilesettings/:id',
    component: DashboardComponent,
    canActivate: [AuthgaurdService],
    children: [
      {
        path: '',
        component: EditprofileComponent
      }
    ]
  },
  {
    path: '_error/:id',
    component: Error504pageComponent,
  },
  {
    path: '_payments',
    component: DashboardComponent,
    canActivate: [AuthgaurdService],
    children: [
      {
        path: '',
        component: PaymenthistComponent
      }
    ]
  },
  {
    path: '_review/:id/:key',
    component: DashboardComponent,
    canActivate: [AuthgaurdService],
    children: [
      {
        path: '',
        component: ViewfureviewsComponent
      }
    ]
  },
  {
    path: '_reviewjid/:id/:key',
    component: DashboardComponent,
    canActivate: [AuthgaurdService],
    children: [
      {
        path: '',
        component: ViewfureviewsComponent
      }
    ]
  },
  {
    path: '_payment/:txnid',
    component: DashboardComponent,
    canActivate: [AuthgaurdService],
    children: [
      {
        path: '',
        component: PaymenthistComponent
      }
    ]
  },
  {
    path: '_livelocation/:jobid',
    component: DashboardComponent,
    canActivate: [AuthgaurdService],
    children: [
      {
        path: '',
        component: LiveTrackingComponent
      }
    ]
  },
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/home',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })],
  exports: [RouterModule],
})
export class AppRoutingModule { }
