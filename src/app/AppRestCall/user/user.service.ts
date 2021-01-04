import { UserManagerDetails } from './../../appmodels/UserManagerDetails';
import { FreelanceDocuments } from './../../appmodels/FreelanceDocuments';
import { FreelanceHistory } from './../../appmodels/FreelanceHistory';
import { Injectable } from '@angular/core';
import { User } from 'src/app/appmodels/User';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { config } from 'src/app/appconstants/config';
import { UserRole } from 'src/app/appmodels/UserRole';
import { UserBiz } from 'src/app/appmodels/UserBiz';
import { Freelance } from 'src/app/appmodels/Freelance';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserAdapter } from 'src/app/adapters/useradapter';
import { UserNotification } from 'src/app/appmodels/UserNotification';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;
  usrObj: User;
  freelanceobj: FreelanceHistory;
  constructor(
    private http: HttpClient,
    private userAdapter: UserAdapter,
  ) {
    this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }
  public setCurrentUserValue(userobj: User) {
    this.currentUserSubject.next(userobj);
  }
  /*loginUserByUsername(username: string, password: string) {
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa(username + ':' + password)
    });
    // tslint:disable-next-line: max-line-length
    return this.http.get(`${environment.apiUrl}/findByUsername/` + username + '/' ,  { headers }).pipe(map(result => {
      console.log('this is this.userobj', result);
      this.usrObj = this.userAdapter.adapt(result);
      // store user details and jwt token in local storage to keep user logged in between page refreshes
      localStorage.setItem('currentUser', JSON.stringify(this.usrObj));
      localStorage.setItem('currentPwd', password);
      this.currentUserSubject.next(this.usrObj);
    }));
  }*/

  loginUserByUsername(username: string, password: string) {
    return this.http.get(`${environment.apiUrl}/findByUsername/` + username + '/').pipe(map(user => {
      this.usrObj = this.userAdapter.adapt(user);
      // store user details and jwt token in local storage to keep user logged in between page refreshes
      localStorage.setItem('currentUser', JSON.stringify(this.usrObj));
      localStorage.setItem('currentPwd', password);
      this.currentUserSubject.next(this.usrObj);
    }));
  }

  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentPwd');
    this.currentUserSubject.next(null);
  }

  saveUser(user: any, refCode: string, shortkey: string, userobj: User) {
    userobj.createdby = user.firstname;
    userobj.updateby = user.firstname;
    userobj.userroles = new UserRole();
    userobj.userroles.rolecode = refCode;
    userobj.userbizdetails = new UserBiz();
    if (shortkey === config.shortkey_role_fu) {
      userobj.freeLanceDetails = new Freelance();
      userobj.freeLanceDetails.category = user.category;
      userobj.freeLanceDetails.subCategory = user.subcategory;
      userobj.freeLanceDetails.bgcurrentstatus = config.bg_code_incompleteprofile;
      userobj.freelancehistoryentity = new Array<FreelanceHistory>();
      this.freelanceobj = new FreelanceHistory();
      this.freelanceobj.bgstatus = config.bg_code_incompleteprofile;
      userobj.freelancehistoryentity.push(this.freelanceobj);
    } else
      if (shortkey === config.shortkey_role_csst ||
        shortkey === config.shortkey_role_cssm) {
        userobj.createdby = this.currentUserValue.firstname + ' ' + this.currentUserValue.lastname;
        userobj.updateby = this.currentUserValue.firstname + ' ' + this.currentUserValue.lastname;
        userobj.usermanagerdetailsentity = new UserManagerDetails();
        userobj.usermanagerdetailsentity.managerid = this.currentUserValue.userId;
        userobj.password = user.password;
        userobj.preferlang = user.preferlang;
      }
    return this.http.post(`${environment.apiUrl}/saveUser/`, userobj);
  }

  checkusernamenotexist(username: string) {
    return this.http.get(`${environment.apiUrl}/checkusernamenotexist/` + username + '/');
  }

  checkusername(username: string) {
    return this.http.get(`${environment.apiUrl}/checkusername/` + username + '/');
  }

  saveorupdate(user: User) {
    return this.http.post(`${environment.apiUrl}/saveorupdateuser/`, user);
  }

  saveFreeLanceHistory(freelanceHistory: FreelanceHistory) {
    return this.http.post(`${environment.apiUrl}/saveFreeLanceHistory/`, freelanceHistory);
  }

  saveFreeLanceDocument(freelanceDocuments: FreelanceDocuments) {
    return this.http.post(`${environment.apiUrl}/saveFreeLanceDocument/`, freelanceDocuments);
  }

  getUserByUserId(userId: number) {
    return this.http.get(`${environment.apiUrl}/getUserByUserId/` + userId + '/');
  }

  getUsersByRole(role: string) {
    return this.http.get(`${environment.apiUrl}/getUsersByRole/` + role + '/');
  }

  getUserDetailsByJobAvailable() {
    return this.http.get(`${environment.apiUrl}/getUserDetailsByJobAvailable/`);
  }

  getUserDetailsByJobAvailableByCreateOn(jobcreatedon: string, scategory: string) {
    return this.http.get(`${environment.apiUrl}/getUserDetailsByJobAvailableByCreateOn/` + jobcreatedon + '/' + scategory + '/');
  }

  forgetPassword(username: string) {
    return this.http.get(`${environment.apiUrl}/forgetPassword/` + username + '/');
  }

  prepareAdminToSignUp(username: string) {
    return this.http.get(`${environment.apiUrl}/prepareAdminToSignUp/` + username + '/');
  }

  saveUserNotification(usernotification: UserNotification) {
    return this.http.post(`${environment.apiUrl}/saveUserNotification/`, usernotification);
  }

  getAllUsers() {
    return this.http.get(`${environment.apiUrl}/getAllUsers/`);
  }
}
