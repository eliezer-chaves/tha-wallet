import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Importing the ViaCepResponse interface to define the structure of the response from the ViaCEP API
import { ViaCepResponse } from '../interfaces/viaCepResponse.interface';

@Injectable({
  // This service is provided at the root level, making it available throughout the application
  providedIn: 'root'
})
export class ViacepService {

  private apiUrl = 'https://viacep.com.br/ws';

  constructor(private http: HttpClient) { }

  // Method to search for an address by CEP (Postal Code)
  // It takes a CEP string, cleans it by removing non-digit characters, and makes a GET request to the ViaCEP API
  // The response is expected to conform to the ViaCepResponse interface
  searchCep(cep: string): Observable<ViaCepResponse> {
    const cleanCep = cep.replace(/\D/g, '');
    return this.http.get<ViaCepResponse>(`${this.apiUrl}/${cleanCep}/json/`);
  }
}
