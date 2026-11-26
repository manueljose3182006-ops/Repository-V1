# TJ_APP — Plataforma Digital de Asistencia Vial

Página web estática que documenta el proyecto semestral de **Desarrollo de Productos** (2026-2) realizado con **TJ Asistencia S.A.S.**

**Equipo:** Shamy Bacca · Alexandra González · José Vargas · Johann Parra
**Empresa:** TJ Asistencia S.A.S. · Encargado: William Parra
**Prototipo:** https://sites.google.com/view/tjasistencia/page

## Estructura

```
Repository-V1/
├── index.html          # Contenido de la página
├── styles.css          # Estilos (variables de color, grid, responsivo)
├── script.js           # Interacciones y datos editables de las gráficas
├── README.md
├── assets/
│   └── img/            # Logo, capturas del prototipo, diagramas y Gantt
└── docs/               # Informe, plan, vigilancia, matrices y BMC
```

## Publicar en GitHub Pages

Repositorio: https://github.com/manueljose3182006-ops/Repository-V1

1. El sitio está en la raíz del repositorio.
2. Verifique que el repositorio sea público.
3. En el repositorio: **Settings → Pages → Build and deployment → Source: Deploy from a branch**.
4. Elija la rama `main` y la carpeta `/ (root)`, y guarde.
5. En uno o dos minutos la página queda en `https://manueljose3182006-ops.github.io/Repository-V1/`.

Todas las rutas son relativas (`./styles.css`, `./assets/...`, `./docs/...`), así que funciona en la subcarpeta del repositorio sin cambios.

## Antes de publicar

- Los documentos de `docs/` quedarán públicos en internet. Retire los que la empresa no quiera publicar.

## Editar las gráficas

Los datos están al inicio de `script.js`, en el objeto `DATA`:

- `DATA.scoring`: puntajes del concept scoring y el umbral (3,0).
- `DATA.finance`: inversión, ingreso adicional y utilidad incremental de cada escenario.

## Librerías (por CDN, sin instalación)

- [Lucide](https://lucide.dev) — iconos
- [Chart.js](https://www.chartjs.org) — gráficas
- Google Fonts — Plus Jakarta Sans e Inter
