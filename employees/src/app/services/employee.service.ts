import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  url = environment.vaultApi;

  constructor(private http: HttpClient) {}

  getTimeEntries() {
    let code = environment.vaultApiAuthCode;
    return this.http.get(`${this.url}/gettimeentries?code=${code}`);
  }
}
