# PuntoVentaSSD

Sistema de Punto de Venta moderno y eficiente diseñado específicamente para el mercado dominicano, con soporte multiplataforma (web y móvil) y sincronización en tiempo real.

## Características

- Interfaz moderna y responsiva
- Gestión de inventario en tiempo real
- Procesamiento de ventas y facturación
- Sistema de usuarios y permisos
- Reportes y análisis de ventas
- Integración con impresoras fiscales
- Soporte para NCF (Números de Comprobantes Fiscales)
- Gestión de clientes y proveedores

## Stack Tecnológico

### Frontend Web
- Next.js 13+ (App Router)
- TailwindCSS para estilos
- Shadcn/ui para componentes
- Zustand para manejo de estado

### Frontend Móvil
- React Native con Expo
- Native Base UI
- Async Storage

### Backend
- Supabase
  - Autenticación y autorización
  - Base de datos PostgreSQL
  - Almacenamiento de archivos
  - Funciones Edge y WebHooks
  - Real-time subscriptions

## Estructura del Proyecto

```
/
├── web/                # Aplicación web Next.js
│   ├── app/           # App router y páginas
│   ├── components/    # Componentes reutilizables
│   └── lib/           # Utilidades y configuraciones
│
├── mobile/            # Aplicación móvil React Native
│   ├── src/           # Código fuente
│   ├── assets/        # Recursos estáticos
│   └── app.json       # Configuración de Expo
│
└── shared/            # Código compartido
    ├── types/         # Tipos TypeScript
    ├── constants/     # Constantes compartidas
    └── utils/         # Utilidades comunes
```

## Configuración Inicial

1. Clonar el repositorio
2. Instalar dependencias:
   ```bash
   # Web
   cd web
   npm install

   # Mobile
   cd ../mobile
   npm install
   ```
3. Configurar variables de entorno (.env)
4. Iniciar el servidor de desarrollo:
   ```bash
   # Web
   npm run dev

   # Mobile
   npm start
   ```

## Contribución

Para contribuir al proyecto:
1. Crear un fork
2. Crear una rama para tu feature
3. Hacer commit de tus cambios
4. Crear un Pull Request

## Licencia

MIT
