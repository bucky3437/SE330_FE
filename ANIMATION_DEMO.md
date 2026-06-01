# 🎨 Animation Demo - Sprint 1

Tài liệu này demo tất cả animations và components mới được tạo trong Sprint 1.

---

## 🎬 Available Animations

### 1. Entrance Animations

#### fade-up (Existing - Enhanced)
```tsx
<div className="animate-fade-up">
  Content fades in and slides up
</div>
```

#### slide-in-right (NEW)
```tsx
<div className="animate-slide-in-right">
  Content slides in from right
</div>
```

#### slide-in-left (NEW)
```tsx
<div className="animate-slide-in-left">
  Content slides in from left
</div>
```

#### scale-in (NEW)
```tsx
<div className="animate-scale-in">
  Content scales up from 92% to 100%
</div>
```

#### bounce-in (NEW)
```tsx
<div className="animate-bounce-in">
  Content bounces in with overshoot
</div>
```

#### modal-in (Existing)
```tsx
<div className="animate-modal-in">
  Modal entrance animation
</div>
```

### 2. Loading Animations

#### skeleton-pulse (NEW)
```tsx
<div className="animate-skeleton bg-gray-200 h-4 w-32 rounded">
  Pulsing skeleton loader
</div>
```

#### spin (NEW)
```tsx
<div className="animate-spin">
  <SpinnerIcon />
</div>
```

### 3. Interactive Animations

#### ripple (NEW)
```tsx
<button className="relative overflow-hidden">
  Click me
  <span className="absolute animate-ripple bg-white/30 rounded-full" />
</button>
```

#### float (NEW)
```tsx
<div className="animate-float">
  Floating element (up and down)
</div>
```

#### glow (NEW)
```tsx
<div className="animate-glow">
  Glowing element
</div>
```

### 4. Notification Animations

#### toast-slide-in (NEW)
```tsx
<div className="animate-toast-slide-in">
  Toast notification slides in from right
</div>
```

### 5. Progress Animations

#### progress-indeterminate (NEW)
```tsx
<div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
  <div className="absolute h-full w-1/4 bg-red-600 animate-[progress-indeterminate_1.5s_ease-in-out_infinite]" />
</div>
```

---

## 🧩 Skeleton Components

### Base Skeleton
```tsx
import { Skeleton } from "@/components/ui/Skeleton";

// Rectangular (default)
<Skeleton variant="rectangular" className="h-32 w-full" />

// Circular
<Skeleton variant="circular" className="h-12 w-12" />

// Text
<Skeleton variant="text" className="h-4 w-3/4" />

// Custom size
<Skeleton width={200} height={100} />
```

### BookCardSkeleton
```tsx
import { BookCardSkeleton } from "@/components/ui/BookCardSkeleton";

// Single skeleton
<BookCardSkeleton />

// Grid of skeletons
<div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
  {Array.from({ length: 8 }).map((_, i) => (
    <BookCardSkeleton key={i} />
  ))}
</div>
```

### FormSkeleton
```tsx
import { FormSkeleton } from "@/components/ui/FormSkeleton";

// Default 4 fields
<FormSkeleton />

// Custom number of fields
<FormSkeleton fields={6} />
```

### TableSkeleton
```tsx
import { TableSkeleton, TableRowSkeleton } from "@/components/ui/TableRowSkeleton";

// Full table skeleton
<TableSkeleton rows={8} columns={7} />

// Single row skeleton
<table>
  <tbody>
    <TableRowSkeleton columns={5} />
  </tbody>
</table>
```

---

## 📊 Progress Components

### ProgressBar
```tsx
import { ProgressBar } from "@/components/ui/ProgressBar";

// Determinate progress
<ProgressBar value={75} showLabel />

// Indeterminate progress
<ProgressBar indeterminate />

// Different colors
<ProgressBar value={50} color="primary" />
<ProgressBar value={50} color="secondary" />
<ProgressBar value={50} color="success" />
<ProgressBar value={50} color="error" />

// Different sizes
<ProgressBar value={50} size="sm" />
<ProgressBar value={50} size="md" />
<ProgressBar value={50} size="lg" />
```

### CircularProgress
```tsx
import { CircularProgress } from "@/components/ui/CircularProgress";

// Determinate progress
<CircularProgress value={75} showLabel />

// Indeterminate progress
<CircularProgress indeterminate />

// Different sizes
<CircularProgress size={32} />
<CircularProgress size={48} />
<CircularProgress size={64} />

// Different colors
<CircularProgress value={50} color="primary" />
<CircularProgress value={50} color="secondary" />
<CircularProgress value={50} color="success" />
<CircularProgress value={50} color="error" />

// Custom stroke width
<CircularProgress size={64} strokeWidth={6} />
```

---

## 🎯 Animation Delays

Use with any animation class:

```tsx
<div className="animate-fade-up animate-delay-75">First</div>
<div className="animate-fade-up animate-delay-150">Second</div>
<div className="animate-fade-up animate-delay-225">Third</div>
<div className="animate-fade-up animate-delay-300">Fourth</div>
<div className="animate-fade-up animate-delay-375">Fifth</div>
<div className="animate-fade-up animate-delay-450">Sixth</div>
```

---

## 🎨 Real-World Examples

### Loading Book Catalog
```tsx
{isLoading ? (
  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
    {Array.from({ length: 8 }).map((_, i) => (
      <BookCardSkeleton key={i} />
    ))}
  </div>
) : (
  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
    {books.map((book) => (
      <BookCard key={book.id} book={book} />
    ))}
  </div>
)}
```

### Loading Table
```tsx
{isLoading ? (
  <TableSkeleton rows={8} columns={7} />
) : (
  <table>
    <thead>...</thead>
    <tbody>
      {items.map((item) => (
        <tr key={item.id}>...</tr>
      ))}
    </tbody>
  </table>
)}
```

### File Upload Progress
```tsx
{uploading && (
  <div className="mt-4">
    <ProgressBar 
      value={uploadProgress} 
      showLabel 
      color="primary"
    />
    <p className="mt-2 text-sm text-gray-600">
      Uploading... {uploadProgress}%
    </p>
  </div>
)}
```

### Loading Spinner
```tsx
{isLoading && (
  <div className="flex items-center justify-center p-8">
    <CircularProgress indeterminate size={48} />
  </div>
)}
```

### Staggered Card Entrance
```tsx
<div className="grid gap-6 md:grid-cols-3">
  {services.map((service, index) => (
    <div
      key={service.id}
      className={`animate-fade-up ${
        index === 0 ? "animate-delay-75" :
        index === 1 ? "animate-delay-150" :
        "animate-delay-225"
      }`}
    >
      <ServiceCard {...service} />
    </div>
  ))}
</div>
```

---

## ♿ Accessibility

All animations respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}
```

Users who prefer reduced motion will see instant transitions instead of animations.

---

## 🎬 Performance Tips

1. **Use transforms over position**
   - ✅ `transform: translateY()`
   - ❌ `top`, `left`

2. **Limit concurrent animations**
   - Don't animate 100 items at once
   - Use staggered delays

3. **Use will-change sparingly**
   - Only for actively animating elements
   - Remove after animation completes

4. **Prefer CSS animations over JS**
   - Better performance
   - GPU accelerated
   - Respects prefers-reduced-motion

---

## 📚 Resources

- [CSS Animations MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations)
- [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API)
- [Prefers Reduced Motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)

---

*Created: May 20, 2026*  
*Sprint 1 Deliverable*
