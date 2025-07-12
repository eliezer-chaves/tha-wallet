import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { iUser } from '../../../shared/interfaces/user.interface';
import { iApiResponse } from '../../../shared/interfaces/apiResponse.interface';
import { environment } from '../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  registerUser(userData: iUser): Observable<iApiResponse<iUser>> {
    return this.http.post<iApiResponse<iUser>>(`${this.baseUrl}/usuarios`, userData)
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    // Verifica se é um erro de conexão (servidor offline)
    if (error.status === 0) {
      return throwError(() => ({
        success: false,
        message: 'Servidor fora do ar. Tente novamente mais tarde.'
      }));
    }

    // Retorna o erro do backend como está
    return throwError(() => error.error || {
      success: false,
      message: 'Erro desconhecido'
    });
  }
}