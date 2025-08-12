import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
   private loggedInSubject = new BehaviorSubject<boolean>(this.isAuthenticated());
  loggedIn$ = this.loggedInSubject.asObservable(); // observable que puedes suscribirte

  //private apiUrl = 'http://localhost:3000/api/login'; // URL del backend como lo tenemos antes de usar Render
  private apiUrl = 'https://backend-portafolio-3skv.onrender.com/api/login'; // URL del backend en Render

  constructor(private http: HttpClient) {
      // Verifica y elimina el token de localStorage al cargar la aplicación
      this.checkSession();
   }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('isLoggedIn');
  }
  
   // Método que verifica si el token está presente y lo elimina
   private checkSession() {
     // Verificar si el token existe en el localStorage
     const token = localStorage.getItem('isLoggedIn');
     
     // Si el token está presente, lo eliminamos
     if (token) {
        console.log('Token encontrado, eliminando...');
        localStorage.removeItem('isLoggedIn');
     }

     // Forzar que el usuario se loguee nuevamente
     this.loggedInSubject.next(false);  // Cambia el estado de la sesión
   }

  login(username: string, password: string): Promise<boolean> {
    return this.http.post<any>(this.apiUrl, { username, password }).toPromise()
      .then(response => {
        if (response.success) {
          localStorage.setItem('isLoggedIn', 'true');
          this.loggedInSubject.next(true);
          return true;
        } else {
          return false;
        }
      })
      .catch(error => {
        console.error('Error en login:', error);
        return false;
      });
  }

  logout(): void {
    localStorage.removeItem('isLoggedIn');
    this.loggedInSubject.next(false); // Notifica a los suscriptores que el usuario ha cerrado sesión
  }
}
