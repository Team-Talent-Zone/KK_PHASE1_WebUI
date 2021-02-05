import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DbviewsService {

  constructor(private http: HttpClient) { }

  getGraphFURatingData() {
    return this.http.get(`${environment.apiUrl}/getGraphFURatingData/`);
  }

  getGraphJobsData() {
    return this.http.get(`${environment.apiUrl}/getGraphJobsData/`);
  }

  getGraphSkillBasedData() {
    return this.http.get(`${environment.apiUrl}/getGraphSkillBasedData/`);
  }

  getGraphUserServiceData() {
    return this.http.get(`${environment.apiUrl}/getGraphUserServiceData/`);
  }

  getGraphSKVoliationData() {
    return this.http.get(`${environment.apiUrl}/getGraphSKVoliationData/`);
  }

}
