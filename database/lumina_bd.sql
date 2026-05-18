-- phpMyAdmin SQL Dump
-- version 5.2.3-1.fc43
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost
-- Tiempo de generación: 18-05-2026 a las 06:52:09
-- Versión del servidor: 10.11.16-MariaDB
-- Versión de PHP: 8.4.20

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `lumina_bd`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `autor_categoria`
--

CREATE TABLE `autor_categoria` (
  `id` int(11) NOT NULL,
  `autor_id` int(11) NOT NULL,
  `categoria_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias`
--

CREATE TABLE `categorias` (
  `id` int(11) NOT NULL,
  `nombre_categoria` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categorias`
--

INSERT INTO `categorias` (`id`, `nombre_categoria`) VALUES
(9, 'Avisos Generales'),
(3, 'Ciclo de Vida del Software'),
(5, 'Desarrollo Emprendedor'),
(7, 'Inglés'),
(4, 'Métodos Numéricos'),
(8, 'Orientación y Tutoría'),
(1, 'Programación Orientada a Objetos'),
(2, 'Servicios de Internet'),
(6, 'Sistemas Digitales');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `comentarios_materia`
--

CREATE TABLE `comentarios_materia` (
  `id` int(11) NOT NULL,
  `categoria_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `comentario` text NOT NULL,
  `fecha_creacion` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `publicaciones`
--

CREATE TABLE `publicaciones` (
  `id` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `descripcion` text NOT NULL,
  `imagen_url` varchar(500) DEFAULT NULL,
  `tipo` enum('articulo','video','noticia','recurso') NOT NULL DEFAULT 'articulo',
  `youtube_url` varchar(500) DEFAULT NULL,
  `noticia_url` varchar(500) DEFAULT NULL,
  `categoria_id` int(11) DEFAULT NULL,
  `status` enum('borrador','revision','publicado','rechazado') DEFAULT 'borrador',
  `autor_id` int(11) NOT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `fecha_publicacion` timestamp NULL DEFAULT NULL,
  `observaciones_editor` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `publicaciones`
--

INSERT INTO `publicaciones` (`id`, `titulo`, `descripcion`, `imagen_url`, `tipo`, `youtube_url`, `noticia_url`, `categoria_id`, `status`, `autor_id`, `fecha_creacion`, `fecha_actualizacion`, `fecha_publicacion`, `observaciones_editor`) VALUES
(13, 'asfasdfasdfadf', 'asdfasdfasdfasdfad', 'uploads/posts/post_1_1779064539_ef9471d7.jpeg', 'articulo', '', '', 1, 'publicado', 1, '2026-05-18 00:35:39', '2026-05-18 02:08:43', '2026-05-18 02:08:43', NULL),
(15, 'sfasfasdfasdf', 'asfasdfasdfasdfasdfadf', 'uploads/posts/aviso_1_1779070094_3466f509.jpeg', 'articulo', '', '', 1, 'publicado', 1, '2026-05-18 02:08:14', '2026-05-18 02:08:26', '2026-05-18 02:08:26', NULL),
(16, 'pRUEBA', 'asdf;kajsdflkajs;lfa', 'uploads/posts/post_1_1779075042_716c77a1.jpeg', 'articulo', '', '', 1, 'revision', 1, '2026-05-18 03:30:42', '2026-05-18 03:30:45', NULL, NULL),
(20, 'asdlkñfjañlksdfjañlksdf', 'añlksdjfñlasdjfñlaksdjfla', 'uploads/posts/aviso_1_1779078977_03cfced9.jpeg', 'articulo', '', '', 1, 'publicado', 1, '2026-05-18 04:36:17', '2026-05-18 04:36:26', '2026-05-18 04:36:26', NULL),
(22, 'aaaaas', 'asfadsfasdfadf', 'uploads/posts/post_1_1779081451_e3a6dfda.jpeg', 'articulo', '', '', 4, 'revision', 1, '2026-05-18 05:17:31', '2026-05-18 05:29:14', NULL, NULL),
(24, 'adfasdfasdfasdf', 'asdflaksdflakjsdfasdfa', NULL, 'articulo', '', '', 9, 'publicado', 1, '2026-05-18 05:26:58', '2026-05-18 05:27:03', '2026-05-18 05:27:03', NULL),
(25, 'AVISO IMPORTANTE PRUEBA', 'ASÑLFJASLKFJASÑLKDFJADS', 'uploads/posts/aviso_1_1779082169_30d267a0.jpeg', 'articulo', '', '', 9, 'publicado', 1, '2026-05-18 05:29:29', '2026-05-18 05:29:34', '2026-05-18 05:29:34', NULL),
(26, 'Aviso prueba', 'asdfasdfadsf', NULL, 'articulo', '', '', 9, 'revision', 1, '2026-05-18 05:46:37', '2026-05-18 05:46:37', NULL, NULL),
(27, 'Tarea de programación - Método Numérico Bisección', 'OSTÍAS CHAVAL', 'uploads/posts/post_1_1779084488_75d8a9d4.jpeg', 'articulo', '', '', 4, 'publicado', 1, '2026-05-18 06:08:08', '2026-05-18 06:08:13', '2026-05-18 06:08:13', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reacciones`
--

CREATE TABLE `reacciones` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `elemento_id` int(11) NOT NULL,
  `seccion` varchar(50) NOT NULL,
  `tipo_reaccion` varchar(20) NOT NULL,
  `fecha` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `reacciones`
--

INSERT INTO `reacciones` (`id`, `usuario_id`, `elemento_id`, `seccion`, `tipo_reaccion`, `fecha`) VALUES
(11, 1, 20, 'recursos', 'like', '2026-05-18 05:15:57'),
(12, 1, 20, 'recursos', 'guardado', '2026-05-18 05:21:54');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `roles`
--

INSERT INTO `roles` (`id`, `nombre`) VALUES
(4, 'Administrador'),
(2, 'Autor'),
(3, 'Editor'),
(1, 'Visitante');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre` text NOT NULL,
  `usuarios` text NOT NULL,
  `correo` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `foto_url` varchar(500) DEFAULT NULL,
  `rol_id` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `usuarios`, `correo`, `password`, `foto_url`, `rol_id`) VALUES
(1, 'Diego Morales', 'diegoa.mg', 'ddiegoa.mg@gmail.com', '$2y$10$cJnOP7UJxdJAAlUFAE9ZFe2L5CWeKhw.Y6OwgY/OkkIs3bYZxkAUu', 'uploads/perfiles/perfil_1_1778769079_e7b2bbba.jpeg', 4),
(2, 'Cristiano Ronaldo', 'cr7', 'cr7@gmail.com', '$2y$10$.aJDxAWXWAjd6eUWt09Nw.qZfmDMvIahrcXTY46LfJLyJ9ihfIX7u', NULL, 2),
(3, 'Ernesto', 'ecarmona2', 'ernestocame07@gmail.com', '$2y$10$tUwVoSDmr3k6SE7dlBvgDO6ZoOvOvtg5V5dsvNTOTPz/gQUksbTN.', NULL, 4),
(4, 'Lionel Messi', 'messi', 'messi@gmail.com', '$2y$12$l3/phdZI8oK8HdAy9jFcROlW1spa0ehwRf6LsT.Bs/aKRMNjgVG5m', NULL, 1),
(5, 'Luis Fernando', 'luisfer', 'Fernandoramirez9137@gmail.com', '$2y$12$b9NVczZi8xYHx5sO215tWu7GG74BDlfTi/r5SKUOeXTT8QJrzqgyi', NULL, 4);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `autor_categoria`
--
ALTER TABLE `autor_categoria`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_autor_categoria` (`autor_id`,`categoria_id`),
  ADD KEY `categoria_id` (`categoria_id`);

--
-- Indices de la tabla `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre_categoria` (`nombre_categoria`);

--
-- Indices de la tabla `comentarios_materia`
--
ALTER TABLE `comentarios_materia`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_comentarios_materia_categoria` (`categoria_id`),
  ADD KEY `idx_comentarios_materia_usuario` (`usuario_id`);

--
-- Indices de la tabla `publicaciones`
--
ALTER TABLE `publicaciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_publicaciones_usuarios` (`autor_id`),
  ADD KEY `fk_publicaciones_categorias` (`categoria_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_autor_status` (`autor_id`,`status`);

--
-- Indices de la tabla `reacciones`
--
ALTER TABLE `reacciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_usuario_reaccion` (`usuario_id`);

--
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `rol_id` (`rol_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `autor_categoria`
--
ALTER TABLE `autor_categoria`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `comentarios_materia`
--
ALTER TABLE `comentarios_materia`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `publicaciones`
--
ALTER TABLE `publicaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT de la tabla `reacciones`
--
ALTER TABLE `reacciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `autor_categoria`
--
ALTER TABLE `autor_categoria`
  ADD CONSTRAINT `autor_categoria_ibfk_1` FOREIGN KEY (`autor_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `autor_categoria_ibfk_2` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `comentarios_materia`
--
ALTER TABLE `comentarios_materia`
  ADD CONSTRAINT `fk_comentarios_materia_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_comentarios_materia_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `publicaciones`
--
ALTER TABLE `publicaciones`
  ADD CONSTRAINT `fk_publicaciones_categorias` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_publicaciones_usuarios` FOREIGN KEY (`autor_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `reacciones`
--
ALTER TABLE `reacciones`
  ADD CONSTRAINT `fk_usuario_reaccion` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
