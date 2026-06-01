<br />

<div align="center">

<a href="https://github.com/diegoa-mg/Lumina">
    <img src="frontend/img/logo/Logo Lumina (Fondo Negro) Horizontal.png" 
         alt="Logo Lumina" 
         width="650">
</a>

<br><br>

# ✨ Lumina

### Claridad a la información académica

<p align="center">
Plataforma web académica desarrollada para centralizar recursos educativos, artículos, videos y contenido escolar en un solo lugar.
</p>

<br>

<img src="https://img.shields.io/badge/STATUS-FINALIZADO-32CD32d?style=for-the-badge">

<img src="https://img.shields.io/badge/HTML5-Frontend-E34F26?style=for-the-badge&logo=html5&logoColor=white">

<img src="https://img.shields.io/badge/CSS3-Styles-1572B6?style=for-the-badge&logo=css3&logoColor=white">

<img src="https://img.shields.io/badge/JavaScript-Frontend-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black">

<img src="https://img.shields.io/badge/PHP-Backend-777BB4?style=for-the-badge&logo=php">

<img src="https://img.shields.io/badge/MySQL-Database-4479A1?style=for-the-badge&logo=mysql">

<img src="https://img.shields.io/badge/TailwindCSS-UI-38BDF8?style=for-the-badge&logo=tailwindcss">

<img src="https://img.shields.io/badge/Google-OAuth2-EA4335?style=for-the-badge&logo=google">

<img src="https://img.shields.io/badge/Java-POO-orange?style=for-the-badge&logo=openjdk&logoColor=white">
</div>

---

# 📝 Descripción

**Lumina** es una plataforma web educativa diseñada para instituciones académicas y estudiantes.

El proyecto busca resolver uno de los problemas más comunes dentro de las escuelas y universidades:


Lumina centraliza publicaciones, recursos, artículos educativos y contenido multimedia en un entorno moderno, organizado y accesible para toda la comunidad estudiantil.

El sistema está inspirado en el **ODS 4 — Educación de Calidad** de la ONU, promoviendo un acceso más claro y eficiente a la información académica.

---

# 🚀 Funcionalidades Implementadas

## 👨‍🎓 Usuarios
- Registro e inicio de sesión.
- Inicio de sesión con Google OAuth 2.0.
- Gestión de perfil.
- Sistema de autenticación segura.
- Navegación por materias.

---

## 📝 Publicaciones
- Creación de publicaciones.
- Edición y eliminación de posts.
- Sistema de borradores.
- Envío a revisión.
- Publicación aprobada por editor.
- Sistema de categorías académicas.
- Tipos de publicación:
  - 📄 Artículos
  - 🎥 Videos de YouTube
  - 📚 Recursos educativos

---

## ❤️ Interacción
- Sistema de likes.
- Guardado de publicaciones.
- Sistema visual moderno e interactivo.
- Modales dinámicos para lectura de contenido.

---

## 🛡️ Panel Administrativo
- Panel de revisión para editores.
- Aprobación o rechazo de publicaciones.
- Edición de posts desde panel de editor.
- Gestión de estados:
  - Borrador
  - Revisión
  - Publicado
  - Rechazado

---

# 🖼️ Interfaz del Proyecto

## 🏠 Página Principal

<p align="center">
<img width="1600" height="1000" alt="panel-autor" src="https://github.com/user-attachments/assets/28705c1a-1bb6-4be7-92a6-523668716628" />
</p>

---

## ✍️ Panel del Autor

<p align="center">
<img width="1600" height="1000" alt="WhatsApp Image 2026-05-20 at 8 29 11 PM" src="https://github.com/user-attachments/assets/b51bf67b-2dde-4b52-83bf-dbd7ba2a367c" />

</p>

---

## 🛠️ Panel del Editor

<p align="center">
<img width="1600" height="1000" alt="panel-editor" src="https://github.com/user-attachments/assets/2fd8e302-762f-467f-a389-f977f1be3d9a" />

</p>

---

## 📚 Vista de Materias

<p align="center">
<img width="1600" height="1000" alt="materias" src="https://github.com/user-attachments/assets/594afe5f-f47c-4389-bb4c-2142f32d1de4" />

</p>

---

# 🛠️ Tecnologías Utilizadas

| Tecnología | Uso |
| :--- | :--- |
| **HTML5** | Estructura de la aplicación |
| **CSS3** | Estilos personalizados |
| **Tailwind CSS** | Diseño responsivo moderno |
| **JavaScript** | Interactividad y lógica frontend |
| **PHP** | Backend y procesamiento |
| **MySQL** | Base de datos |
| **Google OAuth 2.0** | Inicio de sesión con Google |
| **Git & GitHub** | Control de versiones |
| **Figma** | Diseño UI/UX |

---

# 📂 Estructura del Proyecto

```bash
Lumina/
│
├── backend/
│   ├── publicar.php
│   ├── editar_post.php
│   ├── login_google.php
│   └── ...
│
├── frontend/
│   ├── css/
│   ├── js/
│   ├── img/
│   ├── uploads/
│   └── ...
│
├── database/
│   └── lumina.sql
│
└── README.md
```

---

# 💻 Instalación Local

## 1️⃣ Clonar repositorio

```bash
git clone https://github.com/diegoa-mg/Lumina.git
```

---

## 2️⃣ Mover proyecto a XAMPP

Mover la carpeta:

```bash
Lumina
```

hacia:

```bash
C:\xampp\htdocs\
```

---

## 3️⃣ Importar base de datos

1. Abrir phpMyAdmin.
2. Crear base de datos:

```sql
lumina
```

3. Importar:

```bash
database/lumina.sql
```

---

## 4️⃣ Configurar conexión

Editar:

```bash
backend/conexion_bd.php
```

---

## 5️⃣ Ejecutar proyecto

Abrir en navegador:

```bash
http://localhost/Lumina/frontend
```

---

# 🔐 Configuración Login con Google

## 1️⃣ Crear proyecto en Google Cloud Console

Ir a:

```bash
https://console.cloud.google.com/
```

---

## 2️⃣ Habilitar Google OAuth

Activar:
- Google Identity Services
- OAuth 2.0

---

## 3️⃣ Crear credenciales OAuth

Tipo:
```bash
Aplicación web
```

---

## 4️⃣ Agregar URIs autorizados

### Origen autorizado

```bash
http://localhost
```

o dominio real:

```bash
https://lumina-cia.com
```

---

### URI de redirección

```bash
http://localhost/Lumina/backend/google_callback.php
```

o:

```bash
https://lumina-cia.com/backend/google_callback.php
```

---

## 5️⃣ Configurar credenciales

Editar:

```bash
backend/config.php
```

```php
define('GOOGLE_CLIENT_ID', 'TU_CLIENT_ID');
define('GOOGLE_CLIENT_SECRET', 'TU_CLIENT_SECRET');
```

---

# 🌟 Funcionalidades Futuras

- 🔔 Notificaciones en tiempo real.
- 📱 Aplicación móvil.
- 🤖 Recomendaciones inteligentes.
- 📊 Estadísticas de interacción.
- 🧠 Integración con IA educativa.

---

# 👨‍💻 Equipo de Desarrollo

## Ingeniería de Software 2E

| Integrante | Contacto |
| :--- | :--- |
| **Miguel Ángel Alpizar Orozco** | - |
| **Ernesto Carmona Medina** | - |
| **Francisco Jared Espitia Cárdenas** | - |
| **Diego Alejandro Morales Gutiérrez** | [GitHub](https://github.com/diegoa-mg) |
| **Luis Fernando Ramírez Vázquez** | [GitHub](https://github.com/FerRamirez-dev) |

---

# ❤️ Apoya el Proyecto

Si te gustó Lumina:

⭐ Dale estrella al repositorio  
🍴 Haz un fork  
🛠️ Contribuye al proyecto  
📢 Comparte el proyecto  

---

# 📄 Licencia

Este proyecto fue desarrollado con fines académicos y educativos.

© 2026 Lumina — Claridad a la información.
