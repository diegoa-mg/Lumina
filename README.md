<br />

<div align="center">

<a href="https://github.com/diegoa-mg/Lumina">
  <img src="frontend/img/logo/Logo Lumina (Fondo Negro) Horizontal.png"
       alt="Logo Lumina"
       width="650">
</a>

# 🌟 Lumina

### Claridad a la información académica

<p align="center">

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![PHP](https://img.shields.io/badge/PHP-777BB4?style=for-the-badge&logo=php&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-00758F?style=for-the-badge&logo=mysql&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38BDF8?style=for-the-badge&logo=tailwind-css&logoColor=white)

</p>

<p align="center">
  Plataforma académica enfocada en centralizar información educativa,
  recursos escolares y comunicación institucional.
</p>

</div>

---

# 📖 Descripción del Proyecto

**Lumina** es una plataforma web académica desarrollada para instituciones educativas con el objetivo de centralizar noticias, recursos escolares, publicaciones académicas y convocatorias en un solo lugar.

La plataforma busca combatir la fragmentación de la información dentro de la comunidad estudiantil y docente, ofreciendo una experiencia moderna, organizada y accesible.

Este proyecto está alineado con el:

🎯 **ODS 4 — Educación de Calidad**  
de la Organización de las Naciones Unidas (ONU).

---

# ✨ Características Principales

## 📚 Sistema Académico
- Publicaciones académicas.
- Recursos educativos.
- Noticias escolares.
- Organización por materias.
- Sistema de categorías.

## 👥 Sistema de Roles
- 👑 Administrador
- 🛠️ Editor
- ✍️ Autor
- 👨‍🎓 Usuario

Cada rol posee permisos específicos dentro de la plataforma.

---

## 📰 Publicaciones Inteligentes

- Creación de artículos.
- Publicaciones tipo video.
- Publicaciones tipo noticia.
- Recursos académicos.
- Sistema de borradores.
- Envío a revisión.
- Moderación de contenido.
- Publicaciones destacadas.

---

## 🔐 Sistema de Autenticación

- Inicio de sesión tradicional.
- Registro de usuarios.
- Inicio de sesión con Google OAuth 2.0.
- Gestión de sesiones.
- Protección de rutas.

---

## ❤️ Interacción Social

- Sistema de likes.
- Comentarios.
- Reacciones.
- Interfaz dinámica y moderna.

---

# 🖼️ Vista Previa

## 🏠 Página Principal
_Agrega aquí una captura de pantalla_

---

## ✍️ Panel de Autor
_Agrega aquí una captura de pantalla_

---

## 🛡️ Dashboard Administrativo
_Agrega aquí una captura de pantalla_

---

# 🛠️ Tecnologías Utilizadas

| Tecnología | Uso |
| :--- | :--- |
| **HTML5** | Estructura principal del sistema |
| **CSS3** | Estilos globales |
| **JavaScript** | Interactividad y consumo de datos |
| **PHP** | Backend y lógica del servidor |
| **MySQL** | Base de datos |
| **Tailwind CSS** | Diseño responsivo y moderno |
| **Google OAuth** | Inicio de sesión con Google |
| **Figma** | Diseño UI/UX |
| **Git & GitHub** | Control de versiones |

---

# 📂 Estructura del Proyecto

```bash
Lumina/
│
├── backend/
│   ├── conexion_bd.php
│   ├── login.php
│   ├── registro.php
│   ├── publicar.php
│   ├── editar_post.php
│   ├── obtener_publicaciones.php
│   └── ...
│
├── frontend/
│   ├── css/
│   ├── js/
│   ├── img/
│   ├── uploads/
│   ├── index.html
│   ├── dashboard_admin.html
│   ├── dashboard_autor.html
│   └── ...
│
├── database/
│   └── lumina_bd.sql
│
└── README.md

---

# 🚀 Instalación Local

<div align="center">

### Configura Lumina en tu entorno local fácilmente ⚡

</div>

<br>

## 1️⃣ Clonar el repositorio

```bash
git clone https://github.com/diegoa-mg/Lumina.git
```

---

## 2️⃣ Mover el proyecto a XAMPP

Coloca la carpeta del proyecto dentro de:

```bash
xampp/htdocs/
```

---

## 3️⃣ Importar Base de Datos

1. Abrir **phpMyAdmin**
2. Crear una base de datos llamada:

```sql
lumina_bd
```

3. Importar el archivo:

```bash
database/lumina_bd.sql
```

---

## 4️⃣ Ejecutar Apache y MySQL

Desde el panel de **XAMPP**:

- Apache ✅
- MySQL ✅

---

## 5️⃣ Abrir el proyecto

```bash
http://localhost/DIGITAL-UAT/frontend
```

---

# 🔐 Configuración Login con Google

<div align="center">

### Integra Google OAuth 2.0 en Lumina 🔑

</div>

<br>

## 1️⃣ Crear proyecto en Google Cloud

Ir a:

```bash
https://console.cloud.google.com/
```

---

## 2️⃣ Crear Credenciales OAuth 2.0

Ruta:

```bash
APIs y servicios → Credenciales → Crear credenciales
```

Seleccionar:

```bash
ID de cliente OAuth
```

Tipo:

```bash
Aplicación web
```

---

## 3️⃣ Agregar Orígenes Autorizados

```bash
http://localhost
```

o

```bash
http://localhost/DIGITAL-UAT
```

---

## 4️⃣ Agregar URI de Redirección

```bash
http://localhost/DIGITAL-UAT/frontend
```

---

## 5️⃣ Copiar el CLIENT_ID

Agregarlo en:

```bash
frontend/js/google-login.js
```

y también en:

```bash
backend/config.php
```

---

## 6️⃣ Verificar funcionamiento

Al iniciar sesión aparecerá:

✅ Botón “Continuar con Google”

---

# 📌 Funcionalidades Implementadas

<div align="center">

### Sistema académico moderno y dinámico 📚

</div>

<br>

## 🔐 Autenticación
- Inicio de sesión tradicional.
- Registro de usuarios.
- Login con Google OAuth 2.0.
- Gestión segura de sesiones.
- Protección de rutas privadas.

---

## 👥 Sistema de Roles
- 👑 Administrador
- 🛠️ Editor
- ✍️ Autor
- 👨‍🎓 Usuario estándar

Cada rol posee permisos específicos dentro de la plataforma.

---

## 📰 Gestión de Publicaciones
- Crear publicaciones.
- Editar publicaciones.
- Eliminar publicaciones.
- Guardar borradores.
- Enviar a revisión.
- Aprobar o rechazar contenido.
- Organización por materias.

---

## 🎥 Tipos de Contenido
- 📄 Artículos
- 🎥 Videos
- 📰 Noticias
- 📚 Recursos académicos

---

## ❤️ Interacción Social
- Sistema de comentarios.
- Likes y reacciones.
- Interfaz dinámica y moderna.

---

## 🎨 Diseño UI/UX
- Diseño responsivo.
- Adaptado a móviles.
- Interfaz moderna.
- Experiencia optimizada.

---

# 🔮 Funcionalidades Futuras

<div align="center">

### Próximas mejoras planeadas para Lumina 🚀

</div>

<br>

- 📱 Aplicación móvil oficial.
- 🔔 Notificaciones en tiempo real.
- 📂 Subida de archivos PDF.
- 🎥 Subida de videos locales.
- 📊 Estadísticas de publicaciones.
- 🤖 Recomendaciones académicas con IA.
- 🌙 Modo oscuro.
- 💬 Sistema de mensajería interna.
- 🏆 Sistema de logros.
- 📚 Biblioteca digital integrada.
- 📈 Dashboard analítico avanzado.

---

# 👥 Equipo de Desarrollo

<div align="center">

## Ingeniería de Software 2E 💻

</div>

<br>

| Integrante | Rol | Contacto |
| :--- | :--- | :--- |
| **Alpizar Orozco Miguel Ángel** | Desarrollador | _Pendiente_ |
| **Carmona Medina Ernesto** | Desarrollador | _Pendiente_ |
| **Espitia Cárdenas Francisco Jared** | Desarrollador | _Pendiente_ |
| **Morales Gutiérrez Diego Alejandro** | Desarrollador Backend | _Pendiente_ |
| **Ramírez Vázquez Luis Fernando** | Desarrollador Frontend / Backend | _Pendiente_ |

---

# ⭐ Apoya el Proyecto

<div align="center">

### Si te gustó Lumina, apóyanos 🌟

</div>

<br>

- ⭐ Dale una estrella al repositorio.
- 🍴 Haz fork del proyecto.
- 🛠️ Contribuye con mejoras.
- 🐛 Reporta bugs o errores.
- 📢 Comparte el proyecto.
- 💡 Propón nuevas funcionalidades.

---

# 📜 Licencia

<div align="center">

### Proyecto desarrollado con fines educativos 🎓

</div>

<br>

© 2026 **Lumina** — Todos los derechos reservados.

El uso, modificación y distribución del proyecto debe respetar los créditos correspondientes al equipo de desarrollo.

---

<div align="center">

## 🌟 Lumina — Claridad a la información académica

</div>
