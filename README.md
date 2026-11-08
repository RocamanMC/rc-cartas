<div align="center">

  # 🃏 CartasRC

  ### *Anotador interactivo de tantos para juegos clásicos de la baraja española*

  [![Demo Web](https://img.shields.io/badge/Web%20Oficial-cartas--rc.vercel.app-10b981?style=for-the-badge&logo=vercel)](https://cartas-rc.vercel.app/)
  [![PWA Ready](https://img.shields.io/badge/PWA-Instalable%20Offline-6366f1?style=for-the-badge&logo=pwa)](https://cartas-rc.vercel.app/)
  [![License: MIT](https://img.shields.io/badge/Licencia-MIT-f59e0b.svg?style=for-the-badge)](LICENSE)
  [![Author](https://img.shields.io/badge/Creador-Rocaman-ec4899.svg?style=for-the-badge&logo=vercel)](https://rocaman.vercel.app/)

  <br/>

  **[👉 Jugar / Abrir Anotador en Vivo](https://cartas-rc.vercel.app/)**

</div>

---

## 📌 ¿Qué es CartasRC?

**CartasRC** es una aplicación web progresiva (PWA) diseñada para sustituir el papel, bolígrafo o garbanzos en las partidas de cartas de mesa. Ofrece una interfaz táctil, animaciones fluidas, efectos de sonido y cálculo automático de puntuaciones según las reglas oficiales de cada juego.

---

## 🎮 Modos de Juego Incluidos

| Juego | Características del Anotador |
| :--- | :--- |
| 🐂 **Mus** | Soporte de amarracos (garbanzos y piedras), control de vacas y juegos (a 30 o 40 tantos), reseteo rápido y cambio de parejas. |
| 🧹 **Escoba del 15** | Contabilidad automática de escobas, siete de oros (*el velo*), setenta, mayoría de cartas y oros con cálculo instantáneo al final de cada ronda. |
| 🎴 **Chinchón** | Registro acumulativo de puntos por ronda, control de cierres con -10 y -25, límite de eliminación y sistema de reenganche. |
| 👑 **Tute** | Conteo directo de puntos de baza (ases, treses, figuras), suma de cantes de 20 y 40 (tute) y control de vueltas. |
| ✍️ **Mesa Libre** | Tablero multijugador universal con nombres personalizables e historial de sumas/restas para cualquier otro juego de cartas. |

---

## ✨ Características y Utilidades

- 📱 **Instalable como PWA**: Funciona sin conexión (offline) en Android, iOS y PC como si fuera una aplicación nativa.
- ⏱️ **Temporizador de Turno**: Reloj de cuenta atrás ajustable para evitar partidas lentas.
- 🎲 **Sorteo de Reparto / Mano**: Selector aleatorio para decidir quién baraja o sale primero.
- 🎨 **4 Temas de Tapete**:
  - 🟢 **Verde Clásico** (Tapete tradicional de paño)
  - 🔴 **Rojo Burdeos** (Estilo club privado)
  - 🔵 **Azul Casino** (Ambiente nocturno elegante)
  - ⚫ **Negro Neón** (Modo oscuro de alto contraste)
- 👤 **Perfiles de Jugadores**: Guarda estadísticas de partidas jugadas, victorias y avatares personalizados con los cuatro palos de la baraja (*Oros, Copas, Espadas, Bastos*).
- 🔊 **Sonido y Vibración**: Feedback háptico en móviles y sonidos realistas al sumar puntos o cantar victoria.

---

## 🚀 Instalación y Desarrollo Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/RocamanMC/rc-cartas.git
cd rc-cartas

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo
npm run dev

# 4. Compilar para producción
npm run build
```

---

## 🛠️ Tecnologías Utilizadas

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Estilos**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Iconos**: [Lucide React](https://lucide.dev/)
- **Efectos y Animaciones**: [Motion](https://motion.dev/) & [Canvas-Confetti](https://www.npmjs.com/package/canvas-confetti)
- **PWA**: [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) con Service Workers y caché offline Workbox

---

## 📄 Licencia

Este proyecto está distribuido bajo la Licencia **MIT**. Consulta el archivo [LICENSE](LICENSE) para más detalles.

---

## 👨‍💻 Autor

Desarrollado por **Rocaman**  
🌐 Web Oficial: [rocaman.vercel.app](https://rocaman.vercel.app/)
