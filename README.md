# Gestión de gastos

Aplicación web para gestionar y repartir gastos entre los participantes de un proyecto.

Proyecto desarrollado para la unidad DAN02 del módulo Desarrollo en la Nube del ciclo formativo de Desarrollo de Aplicaciones Web (DAW).

## Aplicación desplegada

[Acceder a Gestión de gastos](https://gestion-gastos-e1c76.web.app/)

## Funcionalidades

- Registro e inicio de sesión de usuarios.
- Protección de rutas mediante autenticación.
- Creación, edición y eliminación de proyectos.
- Gestión de participantes.
- Creación, edición y eliminación de gastos.
- Reparto de gastos entre participantes seleccionados.
- Cálculo automático del resumen económico y los balances individuales.
- Reglas de seguridad de Firestore.
- Pruebas automatizadas de seguridad.

## Tecnologías utilizadas

- React
- JavaScript
- Vite
- React Router
- Tailwind CSS
- DaisyUI
- Firebase Authentication
- Cloud Firestore
- Firebase Emulator Suite
- Firebase Hosting
- ESLint
- Git y GitHub

## Instalación

Clonar el repositorio:

```bash
git clone https://github.com/PauR07/gestion-gastos.git
cd gestion-gastos
```

Instalar las dependencias:

```bash
npm install
```

## Configuración de Firebase

Crear un proyecto en Firebase y habilitar los siguientes servicios:

- Firebase Authentication con correo electrónico y contraseña.
- Cloud Firestore.
- Firebase Hosting.

Crear el archivo de variables de entorno a partir de la plantilla proporcionada:

```bash
cp .env.example .env
```

Completar las variables del archivo `.env` con los datos de configuración del proyecto de Firebase.

Publicar las reglas de seguridad incluidas en el archivo `firestore.rules`.

## Ejecución en desarrollo

```bash
npm run dev
```

## Compilación para producción

```bash
npm run build
```

Los archivos generados se almacenan en el directorio `dist`.

## Despliegue

La aplicación se encuentra desplegada mediante Firebase Hosting.

Para actualizar el despliegue del proyecto original, utilizando una cuenta autorizada:

```bash
npx firebase login
npm run build
npx firebase deploy --only hosting --project gestion-gastos-e1c76
```

## Validación del código

```bash
npm run lint
```

## Pruebas de seguridad

Para ejecutar los emuladores es necesario disponer de Java 21 o una versión compatible posterior.

Iniciar los emuladores de Firebase:

```bash
npx firebase emulators:start --project demo-gestion-gastos
```

Desde una segunda terminal, ejecutar:

```bash
npm test
```

El proyecto incluye doce pruebas automatizadas para comprobar los permisos de acceso, la validación de los gastos y las referencias a los participantes.

## Seguridad

Las reglas de Firestore restringen el acceso a los proyectos a sus propietarios autenticados.

También se comprueba la estructura de los documentos, los importes de los gastos y la existencia de los participantes asociados durante la creación y modificación de gastos.

La aplicación comprueba que un participante no tenga gastos asociados antes de permitir su eliminación.

## Estructura del proyecto

```text
gestion-gastos/
├── src/
│   ├── components/
│   ├── config/
│   ├── context/
│   │   ├── AuthContext.js
│   │   └── AuthProvider.jsx
│   ├── pages/
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── tests/
│   └── firestore.test.js
├── .env.example
├── .firebaserc
├── .gitignore
├── firebase.json
├── firestore.rules
├── package.json
└── README.md
```

## Control de versiones

El desarrollo se ha realizado mediante Git y GitHub, utilizando una rama principal, una rama de desarrollo y ramas específicas para distintas funcionalidades.

## Autor

Pablo Rodríguez Borrajo

Desarrollo de Aplicaciones Web (DAW).
