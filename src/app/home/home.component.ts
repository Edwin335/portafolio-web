import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as AOS from 'aos';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';

interface Proyecto {
  _id: string;
  imagenesPrincipales: string[]; // ahora serán rutas
  imagenesCarrusel: string[];
  titulo: string;
  descripcion: string;
}

interface ProyectoNuevo {
  imagenesPrincipales: (File | null)[];
  imagenesCarrusel: (File | null)[];
  titulo: string;
  descripcion: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  title = 'portafolio';
  proyectos: Proyecto[] = [];
  isLoggedIn = false;

  constructor(private http: HttpClient, public auth: AuthService) {}

  nuevoProyecto: ProyectoNuevo = {
    imagenesPrincipales: [null, null, null],
    imagenesCarrusel: [null, null, null],
    titulo: '',
    descripcion: ''
  };

  mostrarModal = false;
  imagenesCarrusel: string[] = [];
  imagenActual = 0;

  ngOnInit() {
      this.auth.loggedIn$.subscribe(status => {
      this.isLoggedIn = status;
    });

    AOS.init({
      once: false,
      mirror: true,
      duration: 800,
      easing: 'ease-in-out',
    });

    window.addEventListener('scroll', () => {
      AOS.refresh();
    });

    this.http.get<Proyecto[]>('http://localhost:3000/api/proyectos').subscribe({
      next: (data) => {
        this.proyectos = data;
      },
      error: (err) => {
        console.error('Error al cargar proyectos:', err);
      }
    });
  }

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  cerrarMenu() {
    const navbar = document.querySelector('.navbar-collapse');
    if (navbar) {
      navbar.classList.remove('show');
    }
  }

  onImageChange(event: Event, index: number, tipo: 'principales' | 'carrusel') {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      if (tipo === 'principales') {
        this.nuevoProyecto.imagenesPrincipales[index] = file;
      } else if (tipo === 'carrusel') {
        this.nuevoProyecto.imagenesCarrusel[index] = file;
      }
    }
  }

  agregarProyecto() {
    const formData = new FormData();

    this.nuevoProyecto.imagenesPrincipales.forEach((file) => {
      if (file) {
        formData.append('imagenesPrincipales', file);
      }
    });

    this.nuevoProyecto.imagenesCarrusel.forEach((file) => {
      if (file) {
        formData.append('imagenesCarrusel', file);
      }
    });

    formData.append('titulo', this.nuevoProyecto.titulo);
    formData.append('descripcion', this.nuevoProyecto.descripcion);

    this.http.post<Proyecto>('http://localhost:3000/api/proyectos', formData).subscribe({
      next: (proyectoGuardado) => {
        this.proyectos.push(proyectoGuardado);
        this.nuevoProyecto = {
          imagenesPrincipales: [null, null, null],
          imagenesCarrusel: [null, null, null],
          titulo: '',
          descripcion: ''
        };
      },
      error: (err) => {
        console.error('Error al guardar el proyecto:', err);
      }
    });
  }

  eliminarProyecto(id: string) {
    if (confirm('¿Estás seguro de eliminar este proyecto?')) {
      this.http.delete(`http://localhost:3000/api/proyectos/${id}`).subscribe({
        next: () => {
          this.proyectos = this.proyectos.filter(p => p._id !== id);
        },
        error: (err) => {
          console.error('Error al eliminar proyecto:', err);
          alert('No se pudo eliminar el proyecto, intenta de nuevo.');
        }
      });
    }
  }

  abrirCarrusel(imagenes: string[]) {
    this.imagenesCarrusel = imagenes;
    this.imagenActual = 0;
    this.mostrarModal = true;
  }

  cerrarCarrusel() {
    this.mostrarModal = false;
  }

  anteriorImagen() {
    if (this.imagenActual > 0) {
      this.imagenActual--;
    } else {
      this.imagenActual = this.imagenesCarrusel.length - 1;
    }
  }

  siguienteImagen() {
    if (this.imagenActual < this.imagenesCarrusel.length - 1) {
      this.imagenActual++;
    } else {
      this.imagenActual = 0;
    }
  }

  isImage(filePath: string): boolean {
    return filePath.endsWith('.jpg') || filePath.endsWith('.jpeg') || filePath.endsWith('.png') || filePath.endsWith('.gif');
  }
 
}
