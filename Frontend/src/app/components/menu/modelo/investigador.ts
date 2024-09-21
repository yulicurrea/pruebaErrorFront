export interface Investigador {
    nombre?: string;
    apellidos?: string;
    correo?: string;
    contrasena?: string;
    numerodocumento?: string;
    tipodocumento?: string;
    horasestricto?: number;
    horasformacion?: number;
    unidadAcademica?: string;
    escalofonodocente?: string;
    rolinvestigador?: string;
    lineainvestigacion?: string;
    ies?: string;
    grupoinvestigacion?: number;
    ubicacion?: number;
    imagen?: number;
}

export interface Investigadores {
    nombre?: string;
    apellidos?: string;
    correo?: string;
    contrasena?: string;
    numerodocumento?: string;
    tipodocumento?: string;
    horasestricto?: number;
    horasformacion?: number;
    unidadAcademica?: string;
    escalofonodocente?: string;
    rolinvestigador?: string;
    lineainvestigacion?: string;
    ies?: string;
    grupoinvestigacion?: number;
    ubicacion?: number;
    imagen?: File;
}
export interface Grupoinvestigacion{
    codigo?:string;
    nombre?:string;
}