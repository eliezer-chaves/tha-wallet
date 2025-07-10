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

  // Verifica se tem resposta do servidor
  if (error.error) {
    // CPF/Email já cadastrado (409 Conflict)
    if (error.status === 409) {
      const field = error.error.message.includes('CPF') ? 'cpf' : 
                   error.error.message.includes('Email') ? 'email' : '';
      
      return throwError(() => ({
        success: false,
        message: error.error.message,
        field: field
      }));
    }

    // Outros erros do servidor
    return throwError(() => ({
      success: false,
      message: error.error.message || 'Erro ao processar a requisição'
    }));
  }

  // Erro genérico
  return throwError(() => ({
    success: false,
    message: 'Erro desconhecido'
  }));
}

  private getFieldFromMessage(message: string): string {
    if (message.includes('CPF')) return 'cpf';
    if (message.includes('Email')) return 'email';
    return '';
  }
}