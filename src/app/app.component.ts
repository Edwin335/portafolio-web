import { Component, OnInit } from '@angular/core';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  ngOnInit() {
  // Verifica si el usuario está realmente autenticado
  const isLogged = localStorage.getItem('isLoggedIn');
  if (isLogged !== 'true') {
    localStorage.removeItem('isLoggedIn'); // borra valores corruptos o falsos
  }

  // ... el resto de tu lógica (como AOS.init(), etc.)
}
}
