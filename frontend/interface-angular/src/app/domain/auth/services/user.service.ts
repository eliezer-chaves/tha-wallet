import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root' 
})
export class RegisterService {
  private baseUrl = 'http://localhost:8000/api/v1/usuarios'; 

  constructor(private http: HttpClient) {}

  registerUser(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/users`, data);
  }
}
