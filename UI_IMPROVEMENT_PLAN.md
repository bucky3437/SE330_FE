# 📋 KẾ HOẠCH CẢI THIỆN GIAO DIỆN - THE ATHENAEUM LIBRARY SYSTEM

> **Phân tích và kế hoạch chi tiết để nâng cấp UI/UX cho hệ thống quản lý thư viện**
> 
> **Ngày tạo:** 20/05/2026  
> **Phiên bản:** 1.0  
> **Công nghệ:** Next.js 16, React 19, Tailwind CSS 4, TypeScript 5

---

## 📊 PHẦN 1: ĐÁNH GIÁ HIỆN TRẠNG

### ✅ Điểm Mạnh Hiện Tại

1. **Hệ thống màu sắc nhất quán**
   - Primary Navy (#000054) - màu thương hiệu
   - Accent Red (#E60028) - CTA và highlights
   - Blue tones (#337AB7, #51D2FF) - links và accents
   - Neutrals (#F8F9FA, #EDEDF2, #333333) - backgrounds và text

2. **Kiến trúc component tốt**
   - Feature-based structure rõ ràng
   - Reusable shell patterns (CatalogShell, InstitutionalShell)
   - Separation of concerns tốt

3. **Animation cơ bản**
   - fade-up, modal-in animations
   - Staggered delays cho sequential reveals
   - Hover transforms

4. **Responsive design**
   - Mobile-first approach
   - Grid layouts linh hoạt

### ⚠️ Điểm Cần Cải Thiện

1. **Thiếu micro-interactions**
   - Không có loading skeletons chi tiết
   - Transitions giữa states còn đơn giản
   - Feedback khi user tương tác còn hạn chế

2. **Animation chưa phong phú**
   - Chỉ có 3 keyframe animations cơ bản
   - Không có parallax effects
   - Không có scroll-triggered animations
   - Shimmer effect được define nhưng chưa dùng

3. **Visual hierarchy chưa tối ưu**
   - Cards thiếu depth và layering
   - Typography scale có thể cải thiện
   - Spacing chưa đồng nhất ở một số nơi

4. **Interactive elements**
   - Buttons thiếu ripple effects
   - Form inputs thiếu floating labels
   - Không có toast notification system
   - Modal/Dialog animations còn đơn giản

5. **Loading states**
   - Chỉ có text-based loading
   - Không có skeleton screens
   - Progress indicators còn cơ bản

---

## 🎯 PHẦN 2: KẾ HOẠCH CẢI THIỆN CHI TIẾT

### GIAI ĐOẠN 1: NÂNG CẤP ANIMATION SYSTEM (Ưu tiên cao)

#### 1.1. Mở rộng Custom Animations trong globals.css

**Thêm animations mới:**

```css
/* Slide animations */
@keyframes slide-in-right {
  from {
    opacity: 0;
    transform: translateX(24px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slide-in-left {
  from {
    opacity: 0;
    transform: translateX(-24px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Scale animations */
@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.92);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Bounce animation */
@keyframes bounce-in {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.97);
  }
  100% {
    transform: scale(1);
  }
}

/* Skeleton loading */
@keyframes skeleton-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Progress bar */
@keyframes progress-indeterminate {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(400%);
  }
}

/* Ripple effect */
@keyframes ripple {
  to {
    transform: scale(4);
    opacity: 0;
  }
}

/* Notification slide */
@keyframes toast-slide-in {
  from {
    transform: translateX(calc(100% + 24px));
  }
  to {
    transform: translateX(0);
  }
}

/* Floating animation */
@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* Glow pulse */
@keyframes glow-pulse {
  0%, 100% {
    box-shadow: 0 0 20px rgba(230, 0, 40, 0.3);
  }
  50% {
    box-shadow: 0 0 40px rgba(230, 0, 40, 0.6);
  }
}
```

**Utility classes tương ứng:**

```css
.animate-slide-in-right { animation: slide-in-right 0.4s ease-out both; }
.animate-slide-in-left { animation: slide-in-left 0.4s ease-out both; }
.animate-scale-in { animation: scale-in 0.3s ease-out both; }
.animate-bounce-in { animation: bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) both; }
.animate-skeleton { animation: skeleton-pulse 1.5s ease-in-out infinite; }
.animate-float { animation: float 3s ease-in-out infinite; }
.animate-glow { animation: glow-pulse 2s ease-in-out infinite; }
```

#### 1.2. Tạo Component Animation Wrappers

**File mới: `src/components/animations/FadeIn.tsx`**
- Wrapper component cho fade-in effects
- Support intersection observer để trigger khi scroll vào viewport
- Props: delay, duration, direction (up/down/left/right)

**File mới: `src/components/animations/Stagger.tsx`**
- Container cho staggered children animations
- Tự động apply delays cho children
- Props: staggerDelay, childAnimation


---

### GIAI ĐOẠN 2: LOADING STATES & SKELETONS (Ưu tiên cao)

#### 2.1. Tạo Skeleton Components

**File mới: `src/components/ui/Skeleton.tsx`**

```typescript
// Base skeleton component
export function Skeleton({ className, variant = "rectangular" }) {
  // rectangular, circular, text variants
  // Shimmer effect overlay
}

// Specific skeletons
export function BookCardSkeleton() {
  // Skeleton cho book card trong catalog
}

export function TableRowSkeleton({ columns }) {
  // Skeleton cho table rows
}

export function FormSkeleton() {
  // Skeleton cho forms
}
```

**Áp dụng vào:**
- BooksExplorer: Thay "Loading catalog..." bằng grid of BookCardSkeleton
- StaffBooksPage: Table với TableRowSkeleton
- BookDetailPage: Detailed skeleton layout
- Dashboard: Section skeletons

#### 2.2. Progress Indicators

**File mới: `src/components/ui/ProgressBar.tsx`**

```typescript
// Linear progress bar
export function ProgressBar({ value, indeterminate, color }) {
  // Determinate: show actual progress
  // Indeterminate: animated bar
}

// Circular progress
export function CircularProgress({ size, value, indeterminate }) {
  // SVG-based circular progress
}
```

**Áp dụng vào:**
- File upload progress (ImportBooksPage)
- Form submission states
- Page transitions

---

### GIAI ĐOẠN 3: MICRO-INTERACTIONS (Ưu tiên trung bình)

#### 3.1. Button Enhancements

**Cải thiện các button hiện tại:**

```typescript
// src/components/ui/Button.tsx
export function Button({ 
  variant = "primary", 
  size = "md",
  loading = false,
  ripple = true,
  children 
}) {
  // Ripple effect on click
  // Loading spinner integration
  // Disabled states với animation
  // Icon support
}
```

**Variants:**
- primary: Red gradient với glow effect
- secondary: Outlined với hover fill
- ghost: Transparent với hover background
- danger: Red solid
- success: Green gradient

**Sizes:** xs, sm, md, lg, xl


#### 3.2. Form Input Enhancements

**File mới: `src/components/ui/Input.tsx`**

```typescript
export function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  floatingLabel = true,
  ...props
}) {
  // Floating label animation
  // Focus ring với smooth transition
  // Error shake animation
  // Character counter cho maxLength
  // Clear button cho text inputs
}
```

**Features:**
- Floating labels khi focus/có value
- Smooth focus transitions
- Error states với shake animation
- Success states với checkmark
- Loading states với spinner

**File mới: `src/components/ui/Select.tsx`**
- Custom styled select với dropdown animation
- Search functionality cho long lists
- Multi-select support
- Keyboard navigation

**File mới: `src/components/ui/Checkbox.tsx` & `Radio.tsx`**
- Custom styled với smooth transitions
- Checkmark animation
- Ripple effect on click

#### 3.3. Card Enhancements

**Cải thiện BookCard trong BooksExplorer:**

```typescript
// Enhanced hover effects
- Lift animation (đã có)
- Shadow expansion
- Image zoom on hover
- Overlay với quick actions (View, Hold)
- Badge animations (Available/Unavailable)
```

**Thêm vào cards:**
- Shimmer effect khi loading images
- Skeleton placeholder cho images
- Lazy loading với fade-in
- Hover state với gradient overlay

---

### GIAI ĐOẠN 4: NOTIFICATION SYSTEM (Ưu tiên trung bình)

#### 4.1. Toast Notification Component

**File mới: `src/components/ui/Toast.tsx`**

```typescript
export function Toast({ 
  message, 
  type = "info", // info, success, error, warning
  duration = 5000,
  action,
  onClose 
}) {
  // Slide in from right
  // Auto dismiss với progress bar
  // Stack multiple toasts
  // Action button support
}
```

**File mới: `src/components/ui/ToastProvider.tsx`**
- Context provider cho toast system
- useToast hook để trigger từ anywhere
- Toast container với positioning
- Queue management


**Thay thế Notice components hiện tại:**
- LoginForm: Error notices → Toast
- RegisterFlow: Success/error → Toast
- BookDetailPage: Hold placement → Toast
- Tất cả CRUD operations → Toast feedback

#### 4.2. Modal/Dialog System

**File mới: `src/components/ui/Modal.tsx`**

```typescript
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  closeOnOverlayClick = true
}) {
  // Backdrop với fade-in
  // Modal với scale + fade animation
  // Focus trap
  // ESC key to close
  // Scroll lock khi open
}
```

**Variants:**
- Confirmation dialogs
- Form modals
- Image lightbox
- Alert dialogs

**Áp dụng vào:**
- Delete confirmations (Admin pages)
- Quick view book details
- Image previews
- Form submissions

---

### GIAI ĐOẠN 5: VISUAL ENHANCEMENTS (Ưu tiên trung bình)

#### 5.1. Gradient & Shadow System

**Mở rộng gradient palette:**

```css
/* Thêm vào globals.css */
.gradient-primary {
  background: linear-gradient(135deg, #E60028 0%, #c90022 100%);
}

.gradient-secondary {
  background: linear-gradient(135deg, #337AB7 0%, #2563EB 100%);
}

.gradient-navy {
  background: linear-gradient(135deg, #000054 0%, #070758 65%, #111173 100%);
}

.gradient-mesh {
  background: 
    radial-gradient(at 15% 10%, rgba(81,210,255,0.22) 0%, transparent 50%),
    radial-gradient(at 85% 90%, rgba(230,0,40,0.15) 0%, transparent 50%),
    linear-gradient(135deg, #000054 0%, #070758 100%);
}
```

**Shadow elevation system:**

```css
.shadow-xs { box-shadow: 0 1px 2px rgba(7,7,88,0.05); }
.shadow-sm { box-shadow: 0 2px 8px rgba(7,7,88,0.06); }
.shadow-md { box-shadow: 0 8px 16px rgba(7,7,88,0.08); }
.shadow-lg { box-shadow: 0 16px 30px rgba(7,7,88,0.12); }
.shadow-xl { box-shadow: 0 24px 60px rgba(7,7,88,0.14); }
.shadow-2xl { box-shadow: 0 32px 80px rgba(7,7,88,0.18); }
```


#### 5.2. Typography Enhancements

**Cải thiện font system:**

```css
/* Thêm font weights */
.font-light { font-weight: 300; }
.font-normal { font-weight: 400; }
.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }
.font-extrabold { font-weight: 800; }
.font-black { font-weight: 900; }

/* Text gradients */
.text-gradient-primary {
  background: linear-gradient(135deg, #E60028, #c90022);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.text-gradient-blue {
  background: linear-gradient(135deg, #337AB7, #51D2FF);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

**Áp dụng:**
- Hero titles với gradient text
- Section headings với better hierarchy
- Consistent line-heights
- Letter-spacing cho uppercase text

#### 5.3. Icon System

**File mới: `src/components/ui/Icon.tsx`**

```typescript
// SVG icon component với animation support
export function Icon({ 
  name, 
  size = 24, 
  color = "currentColor",
  className,
  animate = false // rotate, pulse, bounce
}) {
  // Centralized icon management
  // Consistent sizing
  // Animation support
}
```

**Icon library:**
- Book, BookOpen, BookmarkPlus
- User, Users, UserCheck
- Search, Filter, Sort
- Calendar, Clock, Bell
- Check, X, AlertCircle, Info
- ChevronDown, ChevronRight, ArrowRight
- Menu, X (hamburger menu)
- Eye, EyeOff (password visibility)
- Upload, Download, File
- Edit, Trash, Plus, Minus

---

### GIAI ĐOẠN 6: PAGE-SPECIFIC IMPROVEMENTS (Ưu tiên thấp)

#### 6.1. Landing Page (/)

**HeroSearchSection:**
- Parallax effect cho background image
- Animated gradient overlay
- Search bar với focus animation
- Popular searches với hover effects (đã có, enhance thêm)
- Scroll indicator animation

**LibraryServicesSection:**
- Cards với staggered entrance (đã có)
- Hover effects với icon animations
- Number badges với glow effect
- Add subtle background patterns

**FeaturedBooksSection:**
- Carousel/slider cho featured books
- Auto-play với pause on hover
- Smooth transitions
- Dots navigation với animation


#### 6.2. Books Catalog (/books)

**BooksExplorer:**
- Filter panel với collapse/expand animation
- Active filters với remove animation
- Sort dropdown với custom styling
- Grid/List view toggle với smooth transition
- Pagination với page number animations
- "Load more" button với loading state
- Empty state illustration khi no results

**Book Cards:**
- Image lazy loading với skeleton
- Hover zoom effect cho cover image
- Quick action buttons on hover
- Availability badge với pulse animation
- Category tag với hover color change

#### 6.3. Book Detail (/books/[bookId])

**Layout improvements:**
- Book cover với lightbox on click
- Breadcrumb navigation
- Related books section
- Reviews/ratings section (nếu có)
- Share buttons với animation
- Print-friendly view

**Interactions:**
- "Place Hold" button với loading state
- Success animation khi hold placed
- Availability status với real-time updates
- Copy ISBN button với tooltip

#### 6.4. Auth Pages (/login, /register)

**LoginForm:**
- Split-screen layout (đã có, enhance)
- Form inputs với floating labels
- Password strength indicator (register có rồi)
- "Remember me" checkbox với animation
- Social login buttons (nếu cần)
- Forgot password link với hover effect

**RegisterFlow:**
- Multi-step progress indicator (đã có, enhance)
- Step transitions với slide animations
- Form validation với real-time feedback
- Success confetti animation
- Email verification countdown

#### 6.5. Dashboard (/dashboard)

**Role-based sections:**
- Stats cards với count-up animations
- Recent activity timeline
- Quick actions grid
- Charts/graphs (nếu cần)
- Notifications panel
- Personalized recommendations


#### 6.6. Staff/Admin Pages

**Table improvements:**
- Sortable columns với arrow animations
- Row hover effects
- Bulk selection với checkbox animations
- Inline editing với smooth transitions
- Action buttons với tooltips
- Export functionality với progress

**Forms:**
- Multi-step forms với progress
- Auto-save indicators
- Validation feedback
- Success/error states
- Cancel confirmation

---

### GIAI ĐOẠN 7: ADVANCED FEATURES (Ưu tiên thấp)

#### 7.1. Dark Mode Support

**File mới: `src/contexts/ThemeContext.tsx`**

```typescript
export function ThemeProvider({ children }) {
  // Light/Dark mode toggle
  // System preference detection
  // Smooth transition between modes
  // Persist preference
}
```

**CSS variables cho dark mode:**

```css
:root {
  --background: #ffffff;
  --foreground: #333333;
  --primary: #000054;
  --accent: #E60028;
  /* ... */
}

[data-theme="dark"] {
  --background: #0a0a0a;
  --foreground: #e5e5e5;
  --primary: #51D2FF;
  --accent: #ff4458;
  /* ... */
}
```

#### 7.2. Accessibility Enhancements

**Focus management:**
- Visible focus indicators
- Skip to content link
- Keyboard navigation improvements
- ARIA labels và descriptions
- Screen reader announcements

**Motion preferences:**

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

#### 7.3. Performance Optimizations

**Image optimization:**
- Next.js Image component
- Lazy loading
- Blur placeholders
- WebP format
- Responsive images

**Code splitting:**
- Dynamic imports cho heavy components
- Route-based splitting
- Component lazy loading


---

## 📝 PHẦN 3: IMPLEMENTATION ROADMAP

### Sprint 1 (Tuần 1-2): Foundation & Core Animations

**Mục tiêu:** Xây dựng nền tảng animation và loading states

**Tasks:**
1. ✅ Mở rộng animation system trong globals.css
   - Thêm 10+ keyframe animations mới
   - Tạo utility classes
   - Test với prefers-reduced-motion

2. ✅ Tạo Skeleton components
   - Base Skeleton component
   - BookCardSkeleton
   - TableRowSkeleton
   - FormSkeleton

3. ✅ Implement ProgressBar & CircularProgress
   - Linear progress bar
   - Circular progress
   - Indeterminate states

4. ✅ Áp dụng skeletons vào các pages chính
   - BooksExplorer
   - BookDetailPage
   - StaffBooksPage
   - Dashboard

**Deliverables:**
- globals.css với expanded animations
- 4 skeleton components
- 2 progress components
- Updated 4 pages với loading states

---

### Sprint 2 (Tuần 3-4): UI Components Library

**Mục tiêu:** Tạo reusable UI components với animations

**Tasks:**
1. ✅ Button component với variants
   - 5 variants (primary, secondary, ghost, danger, success)
   - 5 sizes (xs, sm, md, lg, xl)
   - Ripple effect
   - Loading states

2. ✅ Form components
   - Input với floating labels
   - Select với custom dropdown
   - Checkbox & Radio với animations
   - TextArea component

3. ✅ Card enhancements
   - Enhanced hover effects
   - Image zoom
   - Quick actions overlay
   - Badge animations

4. ✅ Icon system
   - Icon component
   - 20+ icons library
   - Animation support

**Deliverables:**
- Button.tsx với full features
- 4 form components
- Enhanced card components
- Icon.tsx với icon library


---

### Sprint 3 (Tuần 5-6): Notification & Modal Systems

**Mục tiêu:** Implement feedback systems

**Tasks:**
1. ✅ Toast notification system
   - Toast component
   - ToastProvider & context
   - useToast hook
   - Queue management

2. ✅ Modal/Dialog system
   - Base Modal component
   - Confirmation dialog
   - Form modal
   - Alert dialog

3. ✅ Replace existing Notice components
   - Update LoginForm
   - Update RegisterFlow
   - Update BookDetailPage
   - Update all CRUD operations

4. ✅ Add modals to appropriate places
   - Delete confirmations
   - Quick views
   - Form submissions

**Deliverables:**
- Toast system (3 files)
- Modal system (4 variants)
- Updated 10+ pages với toast
- Added modals to 5+ pages

---

### Sprint 4 (Tuần 7-8): Visual Polish & Page Enhancements

**Mục tiêu:** Polish existing pages với better visuals

**Tasks:**
1. ✅ Gradient & shadow system
   - Expand gradient palette
   - Shadow elevation system
   - Apply to components

2. ✅ Typography enhancements
   - Font weight system
   - Text gradients
   - Better hierarchy

3. ✅ Landing page improvements
   - Parallax hero
   - Enhanced service cards
   - Featured books carousel

4. ✅ Catalog page improvements
   - Filter panel animations
   - Grid/List toggle
   - Enhanced book cards
   - Empty states

**Deliverables:**
- Updated globals.css với gradients/shadows
- Enhanced typography system
- Improved landing page
- Improved catalog page


---

### Sprint 5 (Tuần 9-10): Auth & Dashboard Polish

**Mục tiêu:** Enhance user-facing pages

**Tasks:**
1. ✅ Auth pages improvements
   - Floating labels
   - Better validation feedback
   - Success animations
   - Social login UI (optional)

2. ✅ Dashboard enhancements
   - Stats với count-up
   - Activity timeline
   - Quick actions
   - Notifications panel

3. ✅ Profile page improvements
   - Avatar upload với preview
   - Form sections
   - Save indicators

4. ✅ Book detail page
   - Lightbox for cover
   - Related books
   - Share buttons
   - Better layout

**Deliverables:**
- Enhanced auth pages
- Improved dashboard
- Better profile page
- Enhanced book detail

---

### Sprint 6 (Tuần 11-12): Staff/Admin & Advanced Features

**Mục tiêu:** Polish admin interfaces và add advanced features

**Tasks:**
1. ✅ Table improvements
   - Sortable columns
   - Bulk actions
   - Inline editing
   - Export functionality

2. ✅ Form improvements
   - Multi-step forms
   - Auto-save
   - Better validation
   - Success states

3. ✅ Dark mode (optional)
   - Theme context
   - CSS variables
   - Toggle component
   - Smooth transitions

4. ✅ Accessibility audit
   - Focus management
   - ARIA labels
   - Keyboard navigation
   - Screen reader testing

**Deliverables:**
- Enhanced tables
- Improved forms
- Dark mode (optional)
- Accessibility improvements

---

## 🎨 PHẦN 4: DESIGN SPECIFICATIONS

### Color Palette Extended

```css
/* Primary Colors */
--navy-50: #f0f0f9;
--navy-100: #d9d9f2;
--navy-500: #000054; /* Primary */
--navy-600: #000048;
--navy-700: #00003c;
--navy-900: #000024;

/* Accent Red */
--red-50: #fff0f2;
--red-100: #ffd9de;
--red-500: #E60028; /* Accent */
--red-600: #c90022;
--red-700: #b0001e;

/* Blue Tones */
--blue-50: #e6f4ff;
--blue-100: #bae0ff;
--blue-500: #337AB7; /* Links */
--blue-600: #2563EB;
--blue-700: #1d4ed8;

/* Cyan Accent */
--cyan-50: #e0f7ff;
--cyan-100: #b3ecff;
--cyan-500: #51D2FF; /* Accent */
--cyan-600: #29b8e8;

/* Neutrals */
--gray-50: #F8F9FA;
--gray-100: #EDEDF2;
--gray-200: #D9DCE8;
--gray-300: #B8BBC8;
--gray-500: #6B7280;
--gray-700: #333333;
--gray-900: #111827;
```


### Typography Scale

```css
/* Font Sizes */
--text-xs: 0.75rem;     /* 12px */
--text-sm: 0.875rem;    /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg: 1.125rem;    /* 18px */
--text-xl: 1.25rem;     /* 20px */
--text-2xl: 1.5rem;     /* 24px */
--text-3xl: 1.875rem;   /* 30px */
--text-4xl: 2.25rem;    /* 36px */
--text-5xl: 3rem;       /* 48px */
--text-6xl: 3.75rem;    /* 60px */

/* Line Heights */
--leading-tight: 1.25;
--leading-snug: 1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose: 2;

/* Letter Spacing */
--tracking-tight: -0.025em;
--tracking-normal: 0;
--tracking-wide: 0.025em;
--tracking-wider: 0.05em;
--tracking-widest: 0.1em;
```

### Spacing Scale

```css
/* Spacing (Tailwind default, documented here) */
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
```

### Border Radius

```css
--radius-sm: 0.375rem;   /* 6px */
--radius-md: 0.5rem;     /* 8px */
--radius-lg: 0.75rem;    /* 12px */
--radius-xl: 1rem;       /* 16px */
--radius-2xl: 1.5rem;    /* 24px */
--radius-full: 9999px;
```

### Animation Timing

```css
--duration-fast: 150ms;
--duration-normal: 200ms;
--duration-slow: 300ms;
--duration-slower: 500ms;

--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

---

## 🔧 PHẦN 5: TECHNICAL IMPLEMENTATION NOTES

### Animation Best Practices

1. **Use CSS transforms over position properties**
   - ✅ `transform: translateY()` 
   - ❌ `top`, `left`
   - Reason: Better performance, GPU acceleration

2. **Prefer opacity over visibility**
   - ✅ `opacity: 0` với `pointer-events: none`
   - ❌ `display: none` (không animate được)

3. **Use will-change sparingly**
   - Chỉ dùng cho elements đang animate
   - Remove sau khi animation xong
   - Tránh overuse (memory issues)

4. **Respect prefers-reduced-motion**
   - Always provide fallback
   - Reduce animation duration
   - Remove decorative animations


### Component Structure Pattern

```typescript
// Example: Enhanced Button Component

"use client";

import { ButtonHTMLAttributes, ReactNode, useState } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "success";
type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  ripple?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  ripple = true,
  leftIcon,
  rightIcon,
  children,
  className = "",
  onClick,
  disabled,
  ...props
}: ButtonProps) {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (ripple && !disabled && !loading) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = Date.now();
      
      setRipples((prev) => [...prev, { x, y, id }]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 600);
    }
    
    if (onClick && !disabled && !loading) {
      onClick(e);
    }
  };

  const baseStyles = "relative overflow-hidden inline-flex items-center justify-center font-bold transition-all duration-200 focus:outline-none focus:ring-4 disabled:cursor-not-allowed";
  
  const variantStyles = {
    primary: "bg-gradient-to-r from-[#E60028] to-[#c90022] text-white shadow-lg shadow-[#E60028]/25 hover:-translate-y-0.5 hover:shadow-[#E60028]/35 focus:ring-[#E60028]/20 disabled:from-gray-300 disabled:to-gray-400 disabled:shadow-none",
    secondary: "border-2 border-[#D9DCE8] text-[#000054] hover:border-[#337AB7] hover:bg-[#337AB7]/5 focus:ring-[#337AB7]/20 disabled:border-gray-300 disabled:text-gray-400",
    ghost: "text-[#000054] hover:bg-[#000054]/8 focus:ring-[#000054]/10 disabled:text-gray-400",
    danger: "bg-red-600 text-white shadow-lg shadow-red-600/25 hover:-translate-y-0.5 hover:shadow-red-600/35 focus:ring-red-600/20 disabled:bg-gray-400 disabled:shadow-none",
    success: "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg shadow-green-600/25 hover:-translate-y-0.5 hover:shadow-green-600/35 focus:ring-green-600/20 disabled:from-gray-300 disabled:to-gray-400 disabled:shadow-none",
  };

  const sizeStyles = {
    xs: "px-3 py-1.5 text-xs rounded-lg",
    sm: "px-4 py-2 text-sm rounded-lg",
    md: "px-5 py-3 text-sm rounded-full",
    lg: "px-6 py-3.5 text-base rounded-full",
    xl: "px-8 py-4 text-lg rounded-full",
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-2">{rightIcon}</span>}
      
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute h-5 w-5 animate-ripple rounded-full bg-white/30"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
          }}
        />
      ))}
    </button>
  );
}
```


### Skeleton Loading Pattern

```typescript
// Example: BookCardSkeleton

export function BookCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-[#EDEDF2] bg-white p-4">
      {/* Image skeleton */}
      <div className="aspect-[3/4] w-full animate-skeleton rounded-lg bg-gray-200" />
      
      {/* Title skeleton */}
      <div className="mt-4 space-y-2">
        <div className="h-4 w-3/4 animate-skeleton rounded bg-gray-200" />
        <div className="h-4 w-1/2 animate-skeleton rounded bg-gray-200" />
      </div>
      
      {/* Author skeleton */}
      <div className="mt-3 h-3 w-2/3 animate-skeleton rounded bg-gray-200" />
      
      {/* Badge skeleton */}
      <div className="mt-4 h-6 w-20 animate-skeleton rounded-full bg-gray-200" />
    </div>
  );
}

// Usage in BooksExplorer
{isLoading ? (
  <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
    {Array.from({ length: 8 }).map((_, i) => (
      <BookCardSkeleton key={i} />
    ))}
  </div>
) : (
  <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
    {books.map((book) => (
      <BookCard key={book.id} book={book} />
    ))}
  </div>
)}
```

### Toast System Pattern

```typescript
// ToastContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type ToastType = "info" | "success" | "error" | "warning";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: ToastType = "info", duration = 5000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

// Usage
const { addToast } = useToast();
addToast("Book hold placed successfully!", "success");
```


---

## 📊 PHẦN 6: TESTING & QUALITY ASSURANCE

### Animation Testing Checklist

- [ ] Test tất cả animations trên Chrome, Firefox, Safari
- [ ] Verify prefers-reduced-motion hoạt động
- [ ] Check performance với Chrome DevTools (60fps target)
- [ ] Test trên mobile devices (iOS, Android)
- [ ] Verify animations không block user interactions
- [ ] Check memory leaks với long-running animations

### Accessibility Testing

- [ ] Keyboard navigation hoạt động đầy đủ
- [ ] Screen reader testing (NVDA, JAWS, VoiceOver)
- [ ] Color contrast ratios đạt WCAG AA (4.5:1)
- [ ] Focus indicators visible và clear
- [ ] ARIA labels và descriptions đầy đủ
- [ ] Form validation accessible
- [ ] Error messages announced properly

### Responsive Testing

- [ ] Mobile (320px - 767px)
- [ ] Tablet (768px - 1023px)
- [ ] Desktop (1024px - 1439px)
- [ ] Large desktop (1440px+)
- [ ] Touch interactions work properly
- [ ] Hover states có fallback cho touch devices

### Performance Metrics

**Target metrics:**
- First Contentful Paint (FCP): < 1.8s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3.8s
- Cumulative Layout Shift (CLS): < 0.1
- First Input Delay (FID): < 100ms

**Optimization strategies:**
- Code splitting
- Image optimization
- Lazy loading
- CSS/JS minification
- Caching strategies

---

## 🎯 PHẦN 7: SUCCESS METRICS

### User Experience Metrics

**Quantitative:**
- Page load time giảm 30%
- Animation frame rate ≥ 60fps
- User task completion time giảm 20%
- Bounce rate giảm 15%
- Session duration tăng 25%

**Qualitative:**
- User feedback surveys (NPS score)
- Usability testing sessions
- A/B testing results
- Heatmap analysis
- User interviews

### Technical Metrics

- Lighthouse score ≥ 90
- Accessibility score ≥ 95
- Bundle size không tăng quá 15%
- Code coverage ≥ 80%
- Zero console errors/warnings

---

## 📚 PHẦN 8: RESOURCES & REFERENCES

### Design Inspiration

- **Dribbble:** Library management systems, dashboard designs
- **Behance:** Educational platform UIs
- **Awwwards:** Award-winning web animations
- **CodePen:** Animation examples và experiments

### Technical Resources

**Animation:**
- CSS Tricks: Animation guides
- Web.dev: Performance best practices
- MDN: Animation API documentation

**Accessibility:**
- WCAG 2.1 Guidelines
- A11y Project
- WebAIM resources

**React/Next.js:**
- Next.js documentation
- React documentation
- Tailwind CSS documentation


### Component Libraries for Reference

**Không cài đặt, chỉ tham khảo patterns:**
- Radix UI: Accessible component patterns
- Headless UI: Unstyled component logic
- shadcn/ui: Component design patterns
- Material UI: Animation patterns
- Chakra UI: Theme system patterns

---

## 🚀 PHẦN 9: GETTING STARTED

### Bước 1: Setup Development Environment

```bash
# Đảm bảo dependencies đã cài
npm install

# Start dev server
npm run dev

# Open browser
# http://localhost:3000
```

### Bước 2: Create Feature Branch

```bash
git checkout -b feature/ui-improvements-sprint-1
```

### Bước 3: Implement Sprint 1 Tasks

**Thứ tự thực hiện:**

1. **Mở rộng globals.css**
   - Thêm keyframe animations
   - Thêm utility classes
   - Test với existing pages

2. **Tạo Skeleton components**
   - `src/components/ui/Skeleton.tsx`
   - `src/components/ui/BookCardSkeleton.tsx`
   - `src/components/ui/TableRowSkeleton.tsx`

3. **Tạo Progress components**
   - `src/components/ui/ProgressBar.tsx`
   - `src/components/ui/CircularProgress.tsx`

4. **Update pages với loading states**
   - BooksExplorer
   - BookDetailPage
   - StaffBooksPage
   - Dashboard

5. **Test & Review**
   - Visual testing
   - Performance testing
   - Accessibility testing

### Bước 4: Code Review & Merge

```bash
# Commit changes
git add .
git commit -m "feat: implement sprint 1 - animations and loading states"

# Push to remote
git push origin feature/ui-improvements-sprint-1

# Create pull request
# Review với team
# Merge vào main branch
```

### Bước 5: Repeat for Next Sprints

Lặp lại quy trình cho Sprint 2, 3, 4, 5, 6

---

## 💡 PHẦN 10: TIPS & BEST PRACTICES

### Animation Tips

1. **Start subtle, then enhance**
   - Bắt đầu với animations nhẹ nhàng
   - Tăng dần độ phức tạp
   - Luôn có option để disable

2. **Performance first**
   - Use transform và opacity
   - Avoid animating width/height
   - Use will-change carefully
   - Monitor frame rate

3. **Meaningful animations**
   - Mỗi animation phải có mục đích
   - Guide user attention
   - Provide feedback
   - Show relationships

4. **Consistent timing**
   - Use timing variables
   - Keep durations consistent
   - Match easing functions
   - Coordinate related animations

### Component Design Tips

1. **Composition over inheritance**
   - Small, focused components
   - Compose complex UIs
   - Reusable patterns
   - Clear props interface

2. **Accessibility by default**
   - Semantic HTML
   - ARIA labels
   - Keyboard support
   - Focus management

3. **Performance optimization**
   - Lazy loading
   - Code splitting
   - Memoization
   - Virtual scrolling (for long lists)

4. **Type safety**
   - TypeScript interfaces
   - Prop validation
   - Generic types
   - Strict mode


### CSS Organization Tips

1. **Use CSS variables**
   - Centralize values
   - Easy theming
   - Runtime changes
   - Better maintenance

2. **Tailwind utilities first**
   - Use Tailwind classes
   - Custom CSS for complex cases
   - Keep specificity low
   - Avoid !important

3. **Animation classes**
   - Reusable keyframes
   - Utility classes
   - Delay variants
   - Duration variants

4. **Responsive design**
   - Mobile first
   - Breakpoint consistency
   - Touch-friendly sizes
   - Flexible layouts

---

## 📋 PHẦN 11: CHECKLIST TỔNG HỢP

### Sprint 1 Checklist
- [ ] Expand globals.css với 10+ animations
- [ ] Create Skeleton base component
- [ ] Create BookCardSkeleton
- [ ] Create TableRowSkeleton
- [ ] Create FormSkeleton
- [ ] Create ProgressBar component
- [ ] Create CircularProgress component
- [ ] Update BooksExplorer với skeletons
- [ ] Update BookDetailPage với skeletons
- [ ] Update StaffBooksPage với skeletons
- [ ] Update Dashboard với skeletons
- [ ] Test animations performance
- [ ] Test prefers-reduced-motion
- [ ] Accessibility audit
- [ ] Code review

### Sprint 2 Checklist
- [ ] Create Button component với 5 variants
- [ ] Add ripple effect to Button
- [ ] Create Input component với floating labels
- [ ] Create Select component
- [ ] Create Checkbox component
- [ ] Create Radio component
- [ ] Create TextArea component
- [ ] Enhance BookCard với hover effects
- [ ] Create Icon component
- [ ] Add 20+ icons to library
- [ ] Replace old buttons với new Button
- [ ] Replace old inputs với new Input
- [ ] Test all form components
- [ ] Accessibility audit
- [ ] Code review

### Sprint 3 Checklist
- [ ] Create Toast component
- [ ] Create ToastProvider & context
- [ ] Create useToast hook
- [ ] Implement toast queue management
- [ ] Create Modal base component
- [ ] Create ConfirmDialog variant
- [ ] Create FormModal variant
- [ ] Create AlertDialog variant
- [ ] Replace Notice in LoginForm
- [ ] Replace Notice in RegisterFlow
- [ ] Replace Notice in BookDetailPage
- [ ] Add modals to delete actions
- [ ] Add modals to form submissions
- [ ] Test toast system
- [ ] Test modal system
- [ ] Code review

### Sprint 4 Checklist
- [ ] Expand gradient palette in globals.css
- [ ] Create shadow elevation system
- [ ] Add text gradient utilities
- [ ] Improve typography hierarchy
- [ ] Add parallax to hero section
- [ ] Enhance LibraryServicesSection cards
- [ ] Create FeaturedBooks carousel
- [ ] Add filter panel animations
- [ ] Create grid/list toggle
- [ ] Enhance book cards
- [ ] Create empty state components
- [ ] Test visual improvements
- [ ] Responsive testing
- [ ] Code review

### Sprint 5 Checklist
- [ ] Add floating labels to auth forms
- [ ] Improve validation feedback
- [ ] Add success animations
- [ ] Create stats count-up animation
- [ ] Create activity timeline
- [ ] Create quick actions grid
- [ ] Create notifications panel
- [ ] Improve profile page layout
- [ ] Add avatar upload preview
- [ ] Add lightbox to book detail
- [ ] Create related books section
- [ ] Add share buttons
- [ ] Test all improvements
- [ ] Code review

### Sprint 6 Checklist
- [ ] Add sortable columns to tables
- [ ] Implement bulk actions
- [ ] Add inline editing
- [ ] Create export functionality
- [ ] Improve multi-step forms
- [ ] Add auto-save indicators
- [ ] Create ThemeProvider (optional)
- [ ] Implement dark mode (optional)
- [ ] Accessibility audit (full)
- [ ] Focus management review
- [ ] ARIA labels review
- [ ] Keyboard navigation testing
- [ ] Screen reader testing
- [ ] Final code review
- [ ] Performance audit
- [ ] Documentation update

---

## 🎉 PHẦN 12: KẾT LUẬN

### Tóm Tắt Kế Hoạch

Kế hoạch này bao gồm **6 sprints (12 tuần)** để cải thiện toàn diện giao diện và trải nghiệm người dùng của hệ thống The Athenaeum Library Management.

**Các cải tiến chính:**

1. ✨ **Animation System** - Mở rộng từ 3 lên 15+ animations
2. 🎨 **Loading States** - Skeleton screens thay vì text loading
3. 🎯 **UI Components** - Reusable component library
4. 📢 **Notification System** - Toast và Modal systems
5. 💅 **Visual Polish** - Gradients, shadows, typography
6. ♿ **Accessibility** - WCAG AA compliance
7. 🌙 **Dark Mode** - Optional theme support

### Lợi Ích Mong Đợi

**Cho Users:**
- Trải nghiệm mượt mà hơn với animations
- Feedback rõ ràng hơn với toast notifications
- Loading states không gây khó chịu
- Giao diện đẹp và hiện đại hơn
- Dễ sử dụng hơn với better UX

**Cho Developers:**
- Reusable component library
- Consistent design system
- Better code organization
- Easier maintenance
- Type-safe components

**Cho Project:**
- Professional appearance
- Better user retention
- Higher satisfaction scores
- Competitive advantage
- Scalable architecture

### Next Steps

1. **Review kế hoạch** với team
2. **Prioritize sprints** theo business needs
3. **Assign tasks** cho team members
4. **Setup tracking** (Jira, Trello, etc.)
5. **Start Sprint 1** 🚀

---

## 📞 SUPPORT & QUESTIONS

Nếu có câu hỏi hoặc cần clarification về bất kỳ phần nào trong kế hoạch này, vui lòng:

1. Review lại phần tương ứng trong document
2. Check code examples và patterns
3. Tham khảo resources được list
4. Hỏi team lead hoặc senior developers

**Good luck với việc implementation! 🎨✨**

---

*Document này là living document và sẽ được update theo progress của project.*

*Last updated: 20/05/2026*
