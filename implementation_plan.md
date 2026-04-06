# Plan de Migración: Astro → Next.js (saslution-client-fe → fe-0nboarding)

## Contexto

Migrar la aplicación SaaS **saslution-client-fe** (Astro 5 + React 19 + Tailwind v4 + Sass + Firebase) hacia **fe-0nboarding** (Next.js 16 + React 19 + Tailwind v4). El enfoque inicial es implementar Storybook + migrar los **átomos** como prueba de concepto.

---

## Patrón de Estilos para Migración (Convención Obligatoria)

Todos los componentes migrados **deben** seguir este patrón de estilos. No se permiten clases Tailwind inline en los archivos TSX.

### Reglas

| Regla | Detalle |
|-------|--------|
| **Cero Tailwind inline** | Los archivos `.tsx` NO deben contener clases Tailwind. Solo `styles.className` o `styles['class-name']` |
| **SCSS Modules** | Cada componente tiene un `index.module.scss` con `@reference "tailwindcss"` + `@apply` |
| **BEM** | Clases siguen convención BEM: `.block`, `.block__element`, `.block--modifier` |
| **Variantes** | Los modificadores de variante se aplican vía `styles['component--variant']` en TSX |
| **Props dinámicas** | Solo `style={{ }}` para valores verdaderamente dinámicos (e.g. `width: percentage%`) |
| **className externo** | Se preserva `${className || ''}` al final para que el consumidor pueda extender |

### Ejemplo de patrón correcto

**`index.module.scss`**:
```scss
@reference "tailwindcss";

.button {
    @apply transition-all flex items-center justify-center gap-2 font-bold cursor-pointer;

    &--primary {
        @apply px-4 py-2 rounded-lg bg-[#1978e5] text-white text-sm hover:opacity-90;
    }

    &--secondary {
        @apply px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm border border-slate-200;
    }
}
```

**`index.tsx`**:
```tsx
import styles from './index.module.scss';

export default function Button({ children, variant, className, ...props }: ButtonProps) {
    const variantName = variant || 'primary';
    return (
        <button className={`${styles.button} ${styles[`button--${variantName}`] || ''} ${className || ''}`} {...props}>
            {children}
        </button>
    );
}
```

---

## Inventario del Proyecto Astro (origen)

### Arquitectura de Componentes (Atomic Design)

| Capa | Componentes | Stories |
|------|-------------|---------|
| **Atoms** (11) | `Icon`, `Avatar`, `Badge`, `Button`, `Card`, `Divider`, `DropdownButton`, `Logo`, `PageHeader`, `ProgressBar`, `TextField` | 10 archivos de stories |
| **Molecules** (5) | `Footer`, `LoginForm`, `NotificationItem`, `TopNavigation`, `ProviderTopNavigation` | 4 stories |
| **Organisms/Features** | `Dashboard` (5 sub), `ProviderDashboard` (6 sub), `UnifiedBilling` (7 sub), `Support` (2 sub), `ProviderFinance` (5 sub), `ProviderProducts` (2 sub), `UnifiedProductView` (12 sub), `ProviderProductView` | Múltiples stories |

### Stack Técnico del Origen

- **Framework**: Astro 5 (SSR con `@astrojs/node`)
- **UI**: React 19 como integración de Astro
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`) + SCSS Modules (`sass`)
- **Storybook**: v10 con `@storybook-astro/framework` + `@storybook/react`
- **Auth**: Firebase Admin SDK (session cookies) + middleware Astro
- **API**: Módulo `lib/api.js` con loaders centralizados
- **Config**: `lib/config.js` con locale/timezone/currency (Colombia)
- **Patrón SCSS**: Usa `@reference "tailwindcss"` o `@reference "../../../../styles/global.css"` + `@apply`
- **Dark Mode**: Clase `.dark` en `<html>` vía `@custom-variant dark (&:is(.dark *))`

### Stack Técnico del Destino (Next.js 16)

- **Framework**: Next.js 16.2.2 (App Router)
- **UI**: React 19
- **Styling**: Tailwind CSS v4 (`@tailwindcss/postcss`) — ya configurado
- **TypeScript**: Habilitado
- **Fonts**: Geist Sans/Mono via `next/font/google`

---

## User Review Required

> [!IMPORTANT]
> **Decisión: SCSS vs CSS Modules puros**
> Los componentes actuales usan `.module.scss` con `@apply` de Tailwind v4. Next.js 16 soporta Sass nativamente instalando `sass`. Recomiendo **mantener SCSS Modules** para minimizar cambios en la migración. ¿Estás de acuerdo?

> [!IMPORTANT]
> **Decisión: JSX vs TSX**
> El proyecto de origen usa `.jsx`. El proyecto de destino está configurado con TypeScript (`.tsx`). Recomiendo **migrar a TSX** con tipos básicos para aprovechar el ecosistema Next.js. ¿Prefieres mantener JSX?

> [!WARNING]
> **Cambio de `@reference` → declaración correcta para Next.js**
> En Astro los SCSS usan `@reference "tailwindcss"` para resolver los utilities. En Next.js con PostCSS necesitaremos ajustar esto. Se usará `@reference "tailwindcss"` que debería funcionar igual con `sass` + `@tailwindcss/postcss`.

---

## Fase 1: Storybook + Migración de Átomos (Prueba de Concepto)

### 1.1 — Setup Storybook en Next.js

#### [NEW] [.storybook/main.ts](file:///c:/Users/tamar/Documents/RealInovation.tech/saslution/fe-0nboarding/.storybook/main.ts)
- Configurar Storybook v9+ para Next.js (framework: `@storybook/nextjs`)
- Configurar stories glob: `../src/**/*.stories.@(js|jsx|ts|tsx)`
- Integrar Tailwind CSS v4 vía PostCSS (no `@tailwindcss/vite`)
- Sass support

#### [NEW] [.storybook/preview.ts](file:///c:/Users/tamar/Documents/RealInovation.tech/saslution/fe-0nboarding/.storybook/preview.ts)
- Importar global CSS (`../app/globals.css`)
- Configurar dark mode toggle en toolbar (mismo patron que el proyecto Astro)
- Definir decorator para theme switching (clase `.dark` en `<html>`)

#### [NEW] [.storybook/preview-head.html](file:///c:/Users/tamar/Documents/RealInovation.tech/saslution/fe-0nboarding/.storybook/preview-head.html)
- Cargar Google Fonts: Inter + Material Symbols Outlined

#### [MODIFY] [package.json](file:///c:/Users/tamar/Documents/RealInovation.tech/saslution/fe-0nboarding/package.json)
- Agregar dependencias: `storybook`, `@storybook/nextjs`, `@storybook/react`, `sass`
- Agregar scripts: `storybook`, `build-storybook`

---

### 1.2 — Setup Design System Base

#### [MODIFY] [globals.css](file:///c:/Users/tamar/Documents/RealInovation.tech/saslution/fe-0nboarding/app/globals.css)
- Agregar el theme del proyecto Astro: `--color-primary: #1978e5`, backgrounds, etc.
- Agregar `@custom-variant dark (&:is(.dark *))` para dark mode class-based
- Agregar `@source "../src/"` para que Tailwind detecte clases en `src/`

#### [MODIFY] [layout.tsx](file:///c:/Users/tamar/Documents/RealInovation.tech/saslution/fe-0nboarding/app/layout.tsx)
- Cambiar fuente de Geist a Inter via `next/font/google`
- Agregar carga de Material Symbols Outlined
- Mantener configuración base

---

### 1.3 — Migrar los 11 Átomos ✅ COMPLETADO

Estructura en destino: `src/components/shared/atoms/[ComponentName]/`

Cada componente tiene:
- `index.tsx` — Componente React con tipos TypeScript, **cero Tailwind inline**, usa `import styles from './index.module.scss'`
- `index.module.scss` — Todos los estilos vía `@reference "tailwindcss"` + `@apply` con BEM

#### Átomos a migrar (en orden de dependencia):

1. **Icon** → Base dependency for otros componentes

   #### [NEW] [src/components/shared/atoms/Icon/index.tsx](file:///c:/Users/tamar/Documents/RealInovation.tech/saslution/fe-0nboarding/src/components/shared/atoms/Icon/index.tsx)
   - Migrar de JSX a TSX, agregar `IconProps` interface
   - Usa Material Symbols Outlined + classes Tailwind inline
   
   #### [NEW] [src/components/shared/atoms/Icon/index.module.scss](file:///c:/Users/tamar/Documents/RealInovation.tech/saslution/fe-0nboarding/src/components/shared/atoms/Icon/index.module.scss)
   - Migrar estilos, ajustar `@reference`

2. **Avatar**

   #### [NEW] [src/components/shared/atoms/Avatar/index.tsx](file:///c:/Users/tamar/Documents/RealInovation.tech/saslution/fe-0nboarding/src/components/shared/atoms/Avatar/index.tsx)
   - Agregar tipos. El componente es casi puro Tailwind, migración directa.

3. **Badge**

   #### [NEW] [src/components/shared/atoms/Badge/index.tsx](file:///c:/Users/tamar/Documents/RealInovation.tech/saslution/fe-0nboarding/src/components/shared/atoms/Badge/index.tsx)
   #### [NEW] [src/components/shared/atoms/Badge/index.module.scss](file:///c:/Users/tamar/Documents/RealInovation.tech/saslution/fe-0nboarding/src/components/shared/atoms/Badge/index.module.scss)

4. **Button**

   #### [NEW] [src/components/shared/atoms/Button/index.tsx](file:///c:/Users/tamar/Documents/RealInovation.tech/saslution/fe-0nboarding/src/components/shared/atoms/Button/index.tsx)
   #### [NEW] [src/components/shared/atoms/Button/index.module.scss](file:///c:/Users/tamar/Documents/RealInovation.tech/saslution/fe-0nboarding/src/components/shared/atoms/Button/index.module.scss)

5. **Card**

   #### [NEW] [src/components/shared/atoms/Card/index.tsx](file:///c:/Users/tamar/Documents/RealInovation.tech/saslution/fe-0nboarding/src/components/shared/atoms/Card/index.tsx)

6. **Divider**

   #### [NEW] [src/components/shared/atoms/Divider/index.tsx](file:///c:/Users/tamar/Documents/RealInovation.tech/saslution/fe-0nboarding/src/components/shared/atoms/Divider/index.tsx)

7. **DropdownButton** (depende de `Icon`)

   #### [NEW] [src/components/shared/atoms/DropdownButton/index.tsx](file:///c:/Users/tamar/Documents/RealInovation.tech/saslution/fe-0nboarding/src/components/shared/atoms/DropdownButton/index.tsx)
   #### [NEW] [src/components/shared/atoms/DropdownButton/index.module.scss](file:///c:/Users/tamar/Documents/RealInovation.tech/saslution/fe-0nboarding/src/components/shared/atoms/DropdownButton/index.module.scss)

8. **Logo**

   #### [NEW] [src/components/shared/atoms/Logo/index.tsx](file:///c:/Users/tamar/Documents/RealInovation.tech/saslution/fe-0nboarding/src/components/shared/atoms/Logo/index.tsx)

9. **PageHeader** (depende de `Icon`)

   #### [NEW] [src/components/shared/atoms/PageHeader/index.tsx](file:///c:/Users/tamar/Documents/RealInovation.tech/saslution/fe-0nboarding/src/components/shared/atoms/PageHeader/index.tsx)
   #### [NEW] [src/components/shared/atoms/PageHeader/index.module.scss](file:///c:/Users/tamar/Documents/RealInovation.tech/saslution/fe-0nboarding/src/components/shared/atoms/PageHeader/index.module.scss)

10. **ProgressBar**

    #### [NEW] [src/components/shared/atoms/ProgressBar/index.tsx](file:///c:/Users/tamar/Documents/RealInovation.tech/saslution/fe-0nboarding/src/components/shared/atoms/ProgressBar/index.tsx)
    #### [NEW] [src/components/shared/atoms/ProgressBar/index.module.scss](file:///c:/Users/tamar/Documents/RealInovation.tech/saslution/fe-0nboarding/src/components/shared/atoms/ProgressBar/index.module.scss)

11. **TextField**

    #### [NEW] [src/components/shared/atoms/TextField/index.tsx](file:///c:/Users/tamar/Documents/RealInovation.tech/saslution/fe-0nboarding/src/components/shared/atoms/TextField/index.tsx)

---

### 1.4 — Migrar Stories de los Átomos

Estructura: `src/components/shared/atoms/stories/`

#### [NEW] Archivos de Stories (10 archivos)
- `Icon.stories.tsx`
- `Avatar.stories.tsx`
- `Badge.stories.tsx`
- `Button.stories.tsx`
- `Card.stories.tsx`
- `Divider.stories.tsx`
- `DropdownButton.stories.tsx`
- `Logo.stories.tsx`
- `ProgressBar.stories.tsx`
- `TextField.stories.tsx`

**Cambios respecto al original:**
- JSX → TSX
- Eliminar `parameters: { renderer: 'react' }` (no necesario en `@storybook/nextjs`)
- Mantener la misma estructura de `title: 'Shared UI/atoms/...'`
- Importaciones relativas se mantienen igual

---

## Fase 2: Migración de Molecules ✅ COMPLETADO

> [!NOTE]
> Esta fase se implementará **después** de validar la Fase 1.

Cada molécula sigue el mismo patrón de estilos: `index.tsx` (cero Tailwind inline) + `index.module.scss` (`@reference "tailwindcss"` + `@apply` + BEM).

| Componente | Archivos | Dependencias | Story |
|---|---|---|---|
| **Footer** | `index.tsx` + `index.module.scss` | Icon, Logo | ✅ |
| **NotificationItem** | `index.tsx` + `index.module.scss` | Icon, Badge | ✅ |
| **TopNavigation** | `index.tsx` + `index.module.scss` | Icon, Avatar, Logo, DropdownButton | ✅ |
| **ProviderTopNavigation** | `index.tsx` + `index.module.scss` | Icon, Avatar, Logo, DropdownButton | ✅ |
| **LoginForm** | `index.tsx` + `index.module.scss` | TextField, Button, Divider, Logo | ✅ |

**Proceso por componente:**
1. Crear `index.module.scss` con **todos** los estilos vía `@apply`
2. Crear `index.tsx` importando `styles` — sin clases Tailwind inline
3. Crear story `.stories.tsx` correspondiente
4. Verificar en Storybook

---

## Fase 3: Migración de Features/Organisms

> [!NOTE]
> Esta fase se ejecutará ahora, migrando cada Feature como un componente con ruta de importación desde sus stories. Al igual que con los átomos y moléculas, se utilizará el patrón SCSS Modules + `@apply` y TSX para cada archivo.

Estructura en destino: `src/components/features/[FeatureName]/[ComponentName]/` y sus stories en `src/components/features/[FeatureName]/stories/`.

A continuación, los sub-componentes a migrar por cada feature:

### 3.1 - Dashboard (Client)
- **Componentes**: `Dashboard`, `NotificationHero`, `OnboardingProgressBlock`, `ServicesList`, `SupportLinks`
- **Stories**: `Dashboard.stories.tsx`, `NotificationHero.stories.tsx`, `ServicesList.stories.tsx`, `SupportLinks.stories.tsx`

### 3.2 - Provider Dashboard
- **Componentes**: `ProviderDashboard`, `OnboardingProgressBlock`, `RequestItem`, `SubscriptionActionCenter`, `SubscriptionList`, `SubscriptionRow`
- **Stories**: `ProviderDashboard.stories.tsx`, `SubscriptionList.stories.tsx`, `SubscriptionRow.stories.tsx`, `SubscriptionActionCenter.stories.tsx`, `RequestItem.stories.tsx`, `OnboardingProgressBlock.stories.tsx`

### 3.3 - Unified Billing
- **Componentes**: `UnifiedBilling`, `BillingHeader`, `CostMetricCard`, `PaymentCard`, `PaymentMethodsContainer`, `QuickActions`, `TransactionHistory`
- **Stories**: `UnifiedBilling.stories.tsx`, `BillingHeader.stories.tsx`, `CostMetricCard.stories.tsx`, `PaymentMethodsContainer.stories.tsx`, `QuickActions.stories.tsx`, `TransactionHistory.stories.tsx`

### 3.4 - Support
- **Componentes**: `SupportCenter`, `TicketList`
- **Stories**: `SupportCenter.stories.tsx` (TicketList.stories is not separated usually but included or tested inside the center)

### 3.5 - Provider Finance
- **Componentes**: `ProviderFinance`, `DistributionPieChart`, `FinanceKpiCard`, `RevenueAreaChart`, `TransactionTable`
- **Stories**: `ProviderFinance.stories.tsx`, `DistributionPieChart.stories.tsx`, `FinanceKpiCard.stories.tsx`, `RevenueAreaChart.stories.tsx`, `TransactionTable.stories.tsx`

### 3.6 - Provider Products
- **Componentes**: `ProviderProducts`, `ProductCard`
- **Stories**: `ProviderProducts.stories.tsx`, `ProductCard.stories.tsx`

### 3.7 - Unified Product View
- **Componentes**: `UnifiedProductView`, `AuxiliarOverview`, `ContractingProgress`, `DocumentRequest`, `FormRequest`, `LegalDocuments`, `PaymentHistory`, `PaymentRequest`, `ProductHeader`, `ServiceDetails`, `SupportAccess`, `TermsAndConditionsRequest`
- **Stories**: 12 archivos TSX con stories correspondientes.

### 3.8 - Provider Product View
- **Componentes**: `ProviderProductView`, `DocumentRequestCard`, `FormRequestCard`, `ProviderOnboardingManager`, `ProviderProductHeader`, `ProviderRequestsManager`, `ProviderRequirementsManager`, `RequestPaymentCard`, `TermsAndConditionsRequestCard`
- **Stories**: Múltiples stories asociadas.

---## Fase 4: Infraestructura de la App

> [!NOTE]
> Pendiente de validar las fases anteriores.

- **Auth**: Migrar Firebase middleware de Astro a Next.js middleware (`middleware.ts`)
- **API/Loaders**: Migrar `lib/api.js`, `lib/loaders.js`, `lib/provider-loaders.js` a Server Components / Route Handlers
- **Config**: Adaptar `lib/config.js` (reemplazar `import.meta.env` por `process.env` / `NEXT_PUBLIC_`)
- **Routing**: Mapear páginas Astro al App Router de Next.js:
  - `/login` → `app/login/page.tsx`
  - `/dashboard` → `app/dashboard/page.tsx`
  - `/billing` → `app/billing/page.tsx`
  - `/support` → `app/support/page.tsx`
  - `/provider/*` → `app/provider/*/page.tsx`
  - `/api/*` → `app/api/*/route.ts`
- **Layouts**: Migrar `Layout.astro` a `layout.tsx` (ya existe base)

---

## Decisiones Resueltas

| Decisión | Resolución |
|---|---|
| JSX vs TSX | **TSX** con interfaces tipadas |
| Estructura | **`src/components/`** separado de `app/` (routing) |
| Storybook | **v10.3.4** (`@storybook/nextjs`) |
| Estilos | **SCSS Modules** con `@apply` — cero Tailwind inline en TSX |

---

## Verification Plan

### Automated Tests
1. `npm run storybook` — verificar que Storybook arranca sin errores
2. `npm run build-storybook` — verificar que el build estático funciona
3. `npm run build` — verificar que Next.js compila sin errores

### Manual Verification  
1. Navegar cada story de átomo en Storybook y comparar visualmente con el Storybook del proyecto Astro
2. Verificar dark mode toggle funciona correctamente
3. Verificar que las fuentes (Inter, Material Symbols) cargan correctamente
4. Verificar que los SCSS modules compilan correctamente con `@apply` de Tailwind v4
