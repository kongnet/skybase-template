---
name: frontend-design
description: 前端设计最佳实践，包含CSS架构、组件设计模式、响应式布局、设计系统和性能优化指南
---

# Frontend Design Skill

## Overview

本 Skill 提供前端开发的完整设计指南，涵盖从 CSS 架构到组件设计的各个方面，帮助团队建立统一的前端开发规范。

## CSS 架构方法论

### 1. BEM 命名规范

**Block（块）** - 独立的组件
**Element（元素）** - 块的组成部分
**Modifier（修饰符）** - 块或元素的状态/变体

```css
/* Block */
.card { }

/* Element */
.card__title { }
.card__content { }
.card__button { }

/* Modifier */
.card--large { }
.card__button--primary { }
.card__button--disabled { }
```

**命名规则：**
- Block: `.block-name`（小写，单词间用连字符）
- Element: `.block-name__element-name`（双下划线）
- Modifier: `.block-name--modifier-name`（双连字符）

### 2. ITCSS 架构

**Inverted Triangle CSS** - 从通用到具体的层级结构

```
styles/
├── settings/          # 变量、配置
│   ├── _colors.scss
│   ├── _typography.scss
│   └── _spacing.scss
├── tools/            # Mixins、函数
│   ├── _mixins.scss
│   └── _functions.scss
├── generic/          # 重置、Normalize
│   ├── _reset.scss
│   └── _normalize.scss
├── elements/         # 基础 HTML 元素
│   ├── _headings.scss
│   ├── _links.scss
│   └── _lists.scss
├── objects/          # OOCSS 对象（布局）
│   ├── _grid.scss
│   ├── _media.scss
│   └── _container.scss
├── components/       # UI 组件
│   ├── _buttons.scss
│   ├── _cards.scss
│   └── _forms.scss
└── utilities/        # 辅助类
    ├── _spacing.scss
    ├── _display.scss
    └── _text.scss
```

**导入顺序（必须严格遵守）：**
```scss
// main.scss
@import 'settings/colors';
@import 'settings/typography';
@import 'tools/mixins';
@import 'generic/reset';
@import 'elements/headings';
@import 'objects/grid';
@import 'components/buttons';
@import 'utilities/spacing';
```

### 3. 变量命名规范

```scss
// _colors.scss
:root {
  /* Primary Colors */
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  --color-primary-900: #1e3a8a;
  
  /* Neutral Colors */
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-500: #6b7280;
  --color-gray-900: #111827;
  
  /* Semantic Colors */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;
}

// _spacing.scss
:root {
  --space-xs: 0.25rem;   /* 4px */
  --space-sm: 0.5rem;    /* 8px */
  --space-md: 1rem;      /* 16px */
  --space-lg: 1.5rem;    /* 24px */
  --space-xl: 2rem;      /* 32px */
  --space-2xl: 3rem;     /* 48px */
}

// _typography.scss
:root {
  --font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-family-mono: 'Fira Code', Consolas, Monaco, monospace;
  
  --font-size-xs: 0.75rem;    /* 12px */
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-base: 1rem;     /* 16px */
  --font-size-lg: 1.125rem;   /* 18px */
  --font-size-xl: 1.25rem;    /* 20px */
  --font-size-2xl: 1.5rem;    /* 24px */
  
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-bold: 700;
  
  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;
}
```

## 组件设计原则

### 1. 原子化设计（Atomic Design）

```
components/
├── atoms/           # 原子 - 最小单位
│   ├── Button/
│   ├── Input/
│   ├── Label/
│   └── Icon/
├── molecules/       # 分子 - 原子组合
│   ├── SearchField/
│   ├── FormGroup/
│   └── CardHeader/
├── organisms/       # 有机体 - 复杂组件
│   ├── Header/
│   ├── Card/
│   ├── Form/
│   └── DataTable/
├── templates/       # 模板 - 页面布局
│   ├── DashboardLayout/
│   └── AuthLayout/
└── pages/          # 页面
    ├── HomePage/
    └── LoginPage/
```

### 2. React 组件示例

**Button 组件（Atom）：**
```tsx
// components/atoms/Button/Button.tsx
import React from 'react';
import './Button.scss';

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  children,
  onClick,
  type = 'button'
}) => {
  const classNames = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    fullWidth && 'btn--full-width',
    loading && 'btn--loading'
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classNames}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading && <span className="btn__spinner" />}
      {!loading && leftIcon && <span className="btn__icon btn__icon--left">{leftIcon}</span>}
      <span className="btn__text">{children}</span>
      {!loading && rightIcon && <span className="btn__icon btn__icon--right">{rightIcon}</span>}
    </button>
  );
};
```

```scss
// components/atoms/Button/Button.scss
@import '../../../styles/settings/colors';
@import '../../../styles/tools/mixins';

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  font-family: var(--font-family-base);
  font-weight: var(--font-weight-medium);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  
  /* Sizes */
  &--sm {
    padding: var(--space-xs) var(--space-sm);
    font-size: var(--font-size-sm);
    height: 32px;
  }
  
  &--md {
    padding: var(--space-sm) var(--space-md);
    font-size: var(--font-size-base);
    height: 40px;
  }
  
  &--lg {
    padding: var(--space-md) var(--space-lg);
    font-size: var(--font-size-lg);
    height: 48px;
  }
  
  /* Variants */
  &--primary {
    background-color: var(--color-primary-500);
    color: white;
    
    &:hover:not(:disabled) {
      background-color: var(--color-primary-600);
    }
  }
  
  &--secondary {
    background-color: var(--color-gray-100);
    color: var(--color-gray-900);
    
    &:hover:not(:disabled) {
      background-color: var(--color-gray-200);
    }
  }
  
  &--outline {
    background-color: transparent;
    border: 1px solid var(--color-gray-300);
    color: var(--color-gray-700);
    
    &:hover:not(:disabled) {
      border-color: var(--color-gray-400);
      background-color: var(--color-gray-50);
    }
  }
  
  /* States */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &--loading {
    position: relative;
    color: transparent;
  }
  
  &--full-width {
    width: 100%;
  }
}

.btn__spinner {
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

### 3. Vue 组件示例

**Card 组件（Organism）：**
```vue
<!-- components/organisms/Card/Card.vue -->
<template>
  <article class="card" :class="cardClasses">
    <header v-if="$slots.header || title" class="card__header">
      <slot name="header">
        <h3 class="card__title">{{ title }}</h3>
        <p v-if="subtitle" class="card__subtitle">{{ subtitle }}</p>
      </slot>
    </header>
    
    <div class="card__body">
      <slot />
    </div>
    
    <footer v-if="$slots.footer" class="card__footer">
      <slot name="footer" />
    </footer>
  </article>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  title: String,
  subtitle: String,
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'outlined', 'elevated'].includes(value)
  },
  padding: {
    type: String,
    default: 'md',
    validator: (value) => ['none', 'sm', 'md', 'lg'].includes(value)
  }
});

const cardClasses = computed(() => ({
  [`card--${props.variant}`]: true,
  [`card--padding-${props.padding}`]: true
}));
</script>

<style scoped lang="scss">
.card {
  background-color: white;
  border-radius: var(--radius-lg);
  overflow: hidden;
  
  &--default {
    border: 1px solid var(--color-gray-200);
  }
  
  &--outlined {
    border: 2px solid var(--color-primary-500);
  }
  
  &--elevated {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
  
  &--padding-none {
    .card__body { padding: 0; }
  }
  
  &--padding-sm {
    .card__body { padding: var(--space-sm); }
  }
  
  &--padding-md {
    .card__body { padding: var(--space-md); }
  }
  
  &--padding-lg {
    .card__body { padding: var(--space-lg); }
  }
}

.card__header {
  padding: var(--space-md) var(--space-md) 0;
  border-bottom: 1px solid var(--color-gray-100);
  
  &:has(+ .card__body) {
    padding-bottom: var(--space-md);
  }
}

.card__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-gray-900);
  margin: 0;
}

.card__subtitle {
  font-size: var(--font-size-sm);
  color: var(--color-gray-500);
  margin: var(--space-xs) 0 0;
}

.card__body {
  padding: var(--space-md);
}

.card__footer {
  padding: var(--space-md);
  background-color: var(--color-gray-50);
  border-top: 1px solid var(--color-gray-100);
}
</style>
```

## 响应式设计

### 1. 断点定义

```scss
// _breakpoints.scss
$breakpoints: (
  'xs': 0,
  'sm': 640px,
  'md': 768px,
  'lg': 1024px,
  'xl': 1280px,
  '2xl': 1536px
);

@mixin respond-to($breakpoint) {
  $value: map-get($breakpoints, $breakpoint);
  
  @if $value != 0 {
    @media (min-width: $value) {
      @content;
    }
  } @else {
    @content;
  }
}

// 使用示例
.component {
  padding: var(--space-sm);
  
  @include respond-to('md') {
    padding: var(--space-md);
  }
  
  @include respond-to('lg') {
    padding: var(--space-lg);
  }
}
```

### 2. 容器查询（Container Queries）

```scss
// _container.scss
.card-container {
  container-type: inline-size;
  container-name: card;
}

@container card (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 200px 1fr;
    gap: var(--space-md);
  }
  
  .card__image {
    grid-row: span 2;
  }
}

@container card (min-width: 600px) {
  .card {
    grid-template-columns: 300px 1fr;
  }
}
```

### 3. 流式布局（Fluid Layout）

```scss
// _fluid.scss
@mixin fluid($property, $min-value, $max-value, $min-vw: 320px, $max-vw: 1920px) {
  #{$property}: $min-value;
  
  @media (min-width: $min-vw) {
    #{$property}: calc(
      #{$min-value} + 
      #{($max-value - $min-value) / 1px} * 
      (100vw - #{$min-vw}) / 
      #{($max-vw - $min-vw) / 1px}
    );
  }
  
  @media (min-width: $max-vw) {
    #{$property}: $max-value;
  }
}

// 使用示例
.hero__title {
  @include fluid('font-size', 2rem, 4rem);
  @include fluid('margin-bottom', 1rem, 3rem);
}
```

## 设计系统规范

### 1. 颜色系统

```scss
// _colors-system.scss
:root {
  /* 基础色板 */
  --hue-primary: 220;
  --hue-success: 150;
  --hue-warning: 45;
  --hue-error: 10;
  
  /* 主色调色阶 */
  --color-primary-50: hsl(var(--hue-primary), 100%, 97%);
  --color-primary-100: hsl(var(--hue-primary), 90%, 93%);
  --color-primary-200: hsl(var(--hue-primary), 80%, 85%);
  --color-primary-300: hsl(var(--hue-primary), 70%, 70%);
  --color-primary-400: hsl(var(--hue-primary), 65%, 55%);
  --color-primary-500: hsl(var(--hue-primary), 75%, 45%);
  --color-primary-600: hsl(var(--hue-primary), 80%, 38%);
  --color-primary-700: hsl(var(--hue-primary), 85%, 32%);
  --color-primary-800: hsl(var(--hue-primary), 90%, 25%);
  --color-primary-900: hsl(var(--hue-primary), 95%, 18%);
  
  /* 语义化颜色 */
  --color-text-primary: var(--color-gray-900);
  --color-text-secondary: var(--color-gray-600);
  --color-text-tertiary: var(--color-gray-400);
  --color-text-disabled: var(--color-gray-300);
  
  --color-bg-primary: white;
  --color-bg-secondary: var(--color-gray-50);
  --color-bg-tertiary: var(--color-gray-100);
  
  --color-border-light: var(--color-gray-100);
  --color-border-default: var(--color-gray-200);
  --color-border-strong: var(--color-gray-300);
}

/* 暗色模式 */
[data-theme='dark'] {
  --color-text-primary: var(--color-gray-100);
  --color-text-secondary: var(--color-gray-300);
  --color-text-tertiary: var(--color-gray-500);
  --color-text-disabled: var(--color-gray-600);
  
  --color-bg-primary: var(--color-gray-900);
  --color-bg-secondary: var(--color-gray-800);
  --color-bg-tertiary: var(--color-gray-700);
}
```

### 2. 间距系统

```scss
// _spacing-system.scss
:root {
  /* 基础间距单位 */
  --space-unit: 0.25rem; /* 4px */
  
  /* 间距规模 */
  --space-0: 0;
  --space-1: calc(var(--space-unit) * 1);   /* 4px */
  --space-2: calc(var(--space-unit) * 2);   /* 8px */
  --space-3: calc(var(--space-unit) * 3);   /* 12px */
  --space-4: calc(var(--space-unit) * 4);   /* 16px */
  --space-5: calc(var(--space-unit) * 5);   /* 20px */
  --space-6: calc(var(--space-unit) * 6);   /* 24px */
  --space-8: calc(var(--space-unit) * 8);   /* 32px */
  --space-10: calc(var(--space-unit) * 10); /* 40px */
  --space-12: calc(var(--space-unit) * 12); /* 48px */
  --space-16: calc(var(--space-unit) * 16); /* 64px */
  --space-20: calc(var(--space-unit) * 20); /* 80px */
  --space-24: calc(var(--space-unit) * 24); /* 96px */
}

/* 辅助类生成 */
$spacing-properties: (
  'm': 'margin',
  'p': 'padding'
);

$spacing-directions: (
  '': '',
  't': '-top',
  'r': '-right',
  'b': '-bottom',
  'l': '-left',
  'x': '-left' '-right',
  'y': '-top' '-bottom'
);

@each $prop-key, $prop-value in $spacing-properties {
  @each $dir-key, $dir-value in $spacing-directions {
    @for $i from 0 through 24 {
      .#{$prop-key}#{$dir-key}-#{$i} {
        @if length($dir-value) == 2 {
          #{$prop-value}#{nth($dir-value, 1)}: var(--space-#{$i});
          #{$prop-value}#{nth($dir-value, 2)}: var(--space-#{$i});
        } @else {
          #{$prop-value}#{$dir-value}: var(--space-#{$i});
        }
      }
    }
  }
}
```

### 3. 圆角与阴影

```scss
// _effects.scss
:root {
  /* 圆角 */
  --radius-none: 0;
  --radius-sm: 0.125rem;   /* 2px */
  --radius-md: 0.375rem;   /* 6px */
  --radius-lg: 0.5rem;     /* 8px */
  --radius-xl: 0.75rem;    /* 12px */
  --radius-2xl: 1rem;      /* 16px */
  --radius-full: 9999px;
  
  /* 阴影 */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  
  /* 过渡 */
  --transition-fast: 150ms ease;
  --transition-normal: 250ms ease;
  --transition-slow: 350ms ease;
  
  /* Z-Index 层级 */
  --z-dropdown: 1000;
  --z-sticky: 1020;
  --z-fixed: 1030;
  --z-modal-backdrop: 1040;
  --z-modal: 1050;
  --z-popover: 1060;
  --z-tooltip: 1070;
}
```

## 性能优化

### 1. 图片优化

```html
<!-- 响应式图片 -->
<picture>
  <source 
    srcset="image-400.webp 400w,
            image-800.webp 800w,
            image-1200.webp 1200w"
    sizes="(max-width: 768px) 100vw,
           (max-width: 1200px) 50vw,
           33vw"
    type="image/webp">
  <img 
    src="image-800.jpg" 
    srcset="image-400.jpg 400w,
            image-800.jpg 800w,
            image-1200.jpg 1200w"
    sizes="(max-width: 768px) 100vw,
           (max-width: 1200px) 50vw,
           33vw"
    alt="描述文字"
    loading="lazy"
    decoding="async">
</picture>
```

### 2. CSS 优化

```scss
// _critical.scss - 关键 CSS
/* 只包含首屏渲染必需的样式 */
.critical-css {
  /* Header, Hero section, etc. */
}

// 非关键 CSS 懒加载
// <link rel="preload" href="non-critical.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
```

### 3. 字体优化

```html
<!-- 预连接 -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<!-- 字体显示策略 -->
<style>
  @font-face {
    font-family: 'CustomFont';
    src: url('font.woff2') format('woff2');
    font-display: swap; /* 先显示后备字体 */
    font-weight: 400;
    font-style: normal;
  }
</style>
```

### 4. 代码分割

```tsx
// React.lazy 代码分割
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyComponent />
    </Suspense>
  );
}
```

```vue
<!-- Vue 异步组件 -->
<script setup>
import { defineAsyncComponent } from 'vue';

const AsyncComponent = defineAsyncComponent(() =>
  import('./HeavyComponent.vue')
);
</script>
```

## 代码规范

### 1. ESLint 配置

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended'
  ],
  rules: {
    // 命名规范
    'react/function-component-definition': [
      'error',
      { namedComponents: 'arrow-function' }
    ],
    // 组件props排序
    'react/jsx-sort-props': ['error', {
      callbacksLast: true,
      shorthandFirst: true,
      reservedFirst: true
    }]
  }
};
```

### 2. Stylelint 配置

```javascript
// .stylelintrc.js
module.exports = {
  extends: [
    'stylelint-config-standard-scss',
    'stylelint-config-idiomatic-order'
  ],
  rules: {
    'selector-class-pattern': [
      '^[a-z]([a-z0-9-]+)?((__([a-z0-9]+-?)+)?(--([a-z0-9]+-?)+)?)*$',
      {
        message: 'Expected class selector to follow BEM convention'
      }
    ],
    'max-nesting-depth': 3
  }
};
```

### 3. 文件命名规范

```
components/
├── atoms/
│   ├── Button/
│   │   ├── Button.tsx        # PascalCase
│   │   ├── Button.scss
│   │   ├── Button.test.tsx
│   │   ├── Button.stories.tsx
│   │   └── index.ts          # 统一导出
│   └── index.ts              # atoms 统一导出
├── molecules/
│   └── SearchField/
│       ├── SearchField.tsx
│       ├── SearchField.scss
│       └── index.ts
└── index.ts                  # 统一导出所有组件
```

## 最佳实践清单

### CSS/SCSS
- [ ] 使用 BEM 命名规范
- [ ] 遵循 ITCSS 架构
- [ ] 变量命名使用语义化名称
- [ ] 避免深层嵌套（最大3层）
- [ ] 使用 CSS 自定义属性（变量）
- [ ] 避免使用 `!important`
- [ ] 使用 `rem` 替代 `px`

### 组件设计
- [ ] 单一职责原则
- [ ] Props 使用显式类型定义
- [ ] 提供合理的默认值
- [ ] 支持无障碍访问（ARIA）
- [ ] 使用 forwardRef 支持 ref 转发
- [ ] 关键样式内联，非关键懒加载

### 性能
- [ ] 图片使用 WebP 格式
- [ ] 实现懒加载（图片、组件）
- [ ] 代码分割和按需加载
- [ ] 使用 will-change 优化动画
- [ ] 减少重排和重绘

### 响应式
- [ ] 移动优先（Mobile First）
- [ ] 使用相对单位
- [ ] 测试所有断点
- [ ] 考虑触控目标大小（最小44px）

## 常用 Snippets

### CSS Grid 布局
```scss
.grid {
  display: grid;
  gap: var(--space-md);
  
  &--2col {
    grid-template-columns: repeat(2, 1fr);
  }
  
  &--3col {
    grid-template-columns: repeat(3, 1fr);
  }
  
  &--auto {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
}
```

### Flexbox 工具类
```scss
.flex {
  display: flex;
  
  &--center {
    justify-content: center;
    align-items: center;
  }
  
  &--between {
    justify-content: space-between;
  }
  
  &--column {
    flex-direction: column;
  }
  
  &--wrap {
    flex-wrap: wrap;
  }
}
```

### 文本截断
```scss
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.truncate-multiline {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

### 隐藏元素（无障碍友好）
```scss
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```
