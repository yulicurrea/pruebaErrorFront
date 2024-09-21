import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Investigador } from '../modelo/investigador';
import { AutenticacionService } from '../services/autenticacion';
import { InvestigadorService } from '../services/registroInvestigador';
import Swal from 'sweetalert2'
import { MatSnackBar } from '@angular/material/snack-bar';
import { ResetPasswordDialogComponent } from './reset-password-dialog/reset-password-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ProyectoyproductoService } from '../services/proyectoyproducto'; 


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  pregrados: any[] = [];
  posgrados: any[] = [];
  constructor(private router: Router, private InvestigadorService: InvestigadorService, private formBuilder: FormBuilder, private snackBar: MatSnackBar, private proyectoyproductoService:ProyectoyproductoService,
    public dialog: MatDialog, private autenticacionService: AutenticacionService) {
    this.registroForm = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s]*$/)]],
      apellidos: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s]*$/)]],
      correo: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@unbosque\.edu\.co$/)]],
      tipodocumento: ['', [Validators.required]],
      numerodocumento: ['', [Validators.required,Validators.pattern(/^[0-9]+$/), Validators.minLength(9)]],
      contrasena: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)]],
      confirmarContrasena: ['', [Validators.required]],
    });
    
    this.loginForm = this.formBuilder.group({
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(8)]]
    });
  }


  // login
  loginForm: FormGroup;

  login(): void {
    if (this.loginForm.valid) {
      const correo = this.loginForm.get('correo')?.value;
      const contrasena = this.loginForm.get('contrasena')?.value;
      console.log('Contraseña enviada al backend:', contrasena);
      
      this.autenticacionService.login(correo, contrasena).subscribe(
        (response) => {
          console.log('Respuesta del servidor:', response);
  
          // Obtener el token y los datos del investigador del objeto de respuesta
          const token = response.token.numerodocumento;
          const rolInvestigador = response.token.rolinvestigador;
          const estado = response.token.estado;
          const userData = response.user_data; // Datos del perfil del usuario

          localStorage.setItem('token', token);
          this.autenticacionService.guardarDatosUsuario(userData); // Guardar los datos del usuario en el LocalStorage

  
          // Verificar el rol del investigador y su estado
          if (rolInvestigador === 'Investigador') {
            if (estado) {
              // Si el investigador está activo, redirigir a la URL del perfil del investigador
              window.location.href = 'http://localhost:4200/investigadores/perfil';
            } else {
              // Si el investigador está inactivo
              console.log('El investigador no está activo');
              Swal.fire({
                title: 'Usuario Inactivo !!!',
                text: 'Contacta al administrador para activar tu usuario',
                icon: 'warning',
                confirmButtonText: 'Aceptar'
              });
              // Aquí podrías mostrar un mensaje al usuario o tomar otra acción
            }
          } else if (rolInvestigador === 'Administrador') {
            // Si es un administrador, redirigir a la URL del perfil del administrador
            window.location.href = 'http://localhost:4200/administrador/perfil';
          } else {
            // Manejar otros roles si es necesario
            console.log("Rol estudiante")
          }
        },
        (error) => {
          console.error('Error al iniciar sesión:', error);
            Swal.fire({
              title: 'Error de inicio de sesión',
              text: 'Correo o contraseña incorrectos. Inténtalo de nuevo.',
              icon: 'error',
              confirmButtonText: 'Aceptar'
          });
        }
      );
    }
  }
  
   //metodo que abre el digalogo que contiene el formulario de restablecer contraseña
   openResetPasswordDialog() {
    const dialogRef = this.dialog.open(ResetPasswordDialogComponent);
  }
  
  // Método para decodificar el token (ejemplo, utilizando la función base64UrlDecode)
  decodeToken(token: string): any {
    console.log("esta resiviendo lo sigueinte: "+token)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
  
    try {
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error al decodificar el token:', error);
      return null;
    }
  }
  
  // mostrar imagen del grupo
  imagenURL: string = 'https://images.squarespace-cdn.com/content/v1/5f43e0c90ae7c17f8f8febbf/1624372945616-WCOAF6NAUO22J5BCPI2X/Enmascarar+grupo+3%402x.jpg';
  urlDeLaImagen: string = this.imagenURL;
  // mostrar informacion de todos los investigadores
  users: any[] = [];
  ngOnInit(): void {
    
    this.cargarInvestigadores();
    this.cargarPregrados();
    this.cargarPosgrados();
    this.obtenerUsuarios();
  }

  usuariosAdmin: any[] = [];
  obtenerUsuarios(){
    this.InvestigadorService.getUsuarios().subscribe((data) => {   
      const usersAdmin = data.filter(u => u.rolinvestigador === 'Administrador');
      usersAdmin.forEach(element => {
        this.usuariosAdmin.push(element.numerodocumento);
      });
    });
  }

  cargarInvestigadores() {
    this.InvestigadorService.getUsuarios().subscribe(
      (usuarios: any[]) => {
        this.users = usuarios;
      },
      (error) => {
        // Manejo de errores
        console.error(error);
      }
    );
  }

  cargarPregrados() {
    this.InvestigadorService.obtenerPregrado().subscribe(
      (data: any[]) => {
        this.pregrados = data;
      },
      error => {
        console.error('Error al cargar los pregrados', error);
      }
    );
  }

  cargarPosgrados() {
    this.InvestigadorService.obtenerPosgrado().subscribe(
      (data: any[]) => {
        this.posgrados = data;
      },
      error => {
        console.error('Error al cargar los posgrados', error);
      }
    );
  }

  getPregradosDeInvestigador(investigadorId: string | undefined): any[] {
    if (!investigadorId) return [];
    return this.pregrados.filter(pregrado => pregrado.Investigador_id === investigadorId);
  }

  getPosgradosDeInvestigador(investigadorId: string | undefined): any[] {
    if (!investigadorId) return [];
    return this.posgrados.filter(posgrado => posgrado.Investigador_id === investigadorId);
  }



  //ver contraseña
  hidePassword = true;
  togglePasswordVisibility(checked: boolean) {
    this.hidePassword = !checked;
  }

  // registro
  hide = true;

  public registroForm: FormGroup;
  
  private emailPattern: any = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  typedocument: string[] = ['CC', 'TI', 'CE', 'RC', 'PA'];

  

  get nombre() {
    return this.registroForm.get('nombre');
  }
  get apellidos() {
    return this.registroForm.get('apellidos');
  }
  get correo() {
    return this.registroForm.get('correo');
  }
  get contrasena() {
    return this.registroForm.get('contrasena');
  }
  get tipodocumento() {
    return this.registroForm.get('tipodocumento');
  }
  get numerodocumento() {
    return this.registroForm.get('numerodocumento');
  }

  createForm() {
    return new FormGroup({
      nombre: new FormControl('', [Validators.required]),
      apellidos: new FormControl('', [Validators.required]),
      correo: new FormControl('', [Validators.required, Validators.email]),
      tipodocumento: new FormControl('', [Validators.required]),
      numerodocumento: new FormControl('', [Validators.required]),
      contrasena: new FormControl('', [Validators.required, Validators.minLength(8)]),
    });
  }

  changeGender(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target && this.tipodocumento) {
      this.tipodocumento.setValue(target.value, {
        onlySelf: true,
      });
    }
  }
  
  onResetForm(): void {
    this.registroForm.reset();
  }

  onSaveForm(): void {
    console.log(this.registroForm.value);
  } 
 
  guardarUsuario() {
    if (this.registroForm.valid) {
      if (this.registroForm.valid) {
        const contrasena = this.contrasena?.value;
        const confirmarContrasena = this.registroForm.get('confirmarContrasena')?.value;
    
        if (contrasena !== confirmarContrasena) {
          Swal.fire({
            title: 'Error credenciales !!!',
            text: 'Las contraseñas no coinciden. Por favor verifica',
            icon: 'question',
            confirmButtonText: 'Aceptar'
          });
          return;
        }
      const investigador: Investigador = {
        nombre: this.nombre?.value,
        apellidos: this.apellidos?.value,
        correo: this.correo?.value,
        tipodocumento: this.tipodocumento?.value,
        contrasena: this.contrasena?.value,
        numerodocumento: this.numerodocumento?.value,
        horasestricto: 0, 
        horasformacion: 0, 
        unidadAcademica: "Facultad de Ingeniería",
        escalofonodocente: "NA", 
        rolinvestigador: "Investigador",
        lineainvestigacion: "Ingeniería de software y sociedad",
        ies: "NA",
        grupoinvestigacion: 1,
        ubicacion: 1,
        imagen: 1,
      };
      
      this.InvestigadorService.registrarInvestigador(investigador).subscribe(
        (resp) => {
          console.log('Se ha registrado el usuario exitosamente:', resp);
          Swal.fire({
            title: 'Registro Exitoso !!!',
            text: 'Tu usuario se encuentra preparado para activación',
            icon: 'success',
            confirmButtonText: 'Aceptar'
          }).then(() => {
            // Recarga la página después de que el usuario haga clic en 'Aceptar'
            setTimeout(() => {
              window.location.reload();
            }, 2000); // Espera 2 segundos antes de recargar
          });
          this.notificar(
            `Nuevo Usuario Registrado`,
            investigador.correo, // Remitente puede ser un valor estático o dinámico
            this.usuariosAdmin, // Reemplaza con destinatarios reales
            `El usuario ${investigador.nombre} ${investigador.apellidos} se ha registrado. Por favor, active su cuenta.`
          );
          this.registroForm.reset();
        },
        (error) => {
          console.error('Error al registrar el usuario:', error);
          Swal.fire({
            title: 'Oops...',
            text: 'Error al registrar el usuario. Contacta al administrador si el error persiste',
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
        }
      );
    } else {
      Swal.fire({
        title: 'Datos incompletos !!!',
        text: 'Por favor, completa el formulario correctamente.',
        icon: 'warning',
        confirmButtonText: 'Aceptar'
      });
    }
  }
  }
  notificar(asunto:string,remitente:any,destinatario:string[],mensaje:string):void {
    destinatario.forEach(admin => {
      const notificacion = {
        asunto: asunto,
        remitente: remitente,
        destinatario: admin,
        mensaje: mensaje
      }
      this.proyectoyproductoService.notificar(notificacion).subscribe(
        (resp: any) => {
          console.log('Se ha registrado el proyecto exitosamente:', resp);
        },
        (error: any) => {
          console.error('Error al registrar el proyecto:', error);
        }
      );
    });
  }
   // Muestra un mensaje de éxito usando MatSnackBar
  showSuccessMessage() {
    this.snackBar.open('Registro exitoso. Espera a que se active tu cuenta.', 'Cerrar', {
      duration: 5000,
    });
  }
}

