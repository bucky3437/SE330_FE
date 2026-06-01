# Skill: UI Animation & Interaction Guidelines

## 1. Mục tiêu

Skill này dùng để định hướng các hiệu ứng UI nên dùng trong website, giúp giao diện sinh động hơn nhưng vẫn giữ cảm giác:

- Sạch
- Hiện đại
- Học thuật
- Chuyên nghiệp
- Không màu mè quá mức

> **Nguyên tắc chính:** Hiệu ứng phải hỗ trợ trải nghiệm, không được làm người dùng mất tập trung.

---

## 2. Nguyên tắc chung

### Nên dùng
- `transition` nhẹ
- fade in
- slide up nhẹ
- hover lift
- shadow nhẹ
- focus rõ ràng
- loading state
- skeleton loading
- toast notification

### Không nên dùng
- animation xoay liên tục
- text chạy ngang
- parallax quá mạnh
- hover quá giật
- màu neon
- nhiều animation cùng lúc
- animation quá chậm

### Timing chuẩn

| Loại tương tác | Thời gian |
|---|---|
| Hover / click | 150ms – 300ms |
| Section xuất hiện khi scroll | 400ms – 700ms |
| Modal mở / đóng | 200ms – 250ms |

---

## 3. Navbar

### Hiệu ứng nên dùng
- Đổi nền khi scroll
- Thêm shadow khi scroll
- Underline animation khi hover link
- Dropdown fade in nếu có menu

**Mục đích:** Giúp navbar có cảm giác sống động và cho user biết họ đang không còn ở đầu trang.

```tsx
<header
  className={`fixed top-0 z-50 w-full transition-all duration-300 ${
    isScrolled
      ? "bg-[#000054] shadow-md"
      : "bg-transparent"
  }`}
>
  Navbar
</header>
```

Nav link hover:

```tsx
<a className="group relative px-3 py-2 text-white">
  Books
  <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#E60028] transition-all duration-300 group-hover:w-full" />
</a>
```

---

## 4. Hero Section

### Hiệu ứng nên dùng
- Title fade in + slide up
- Subtitle fade in chậm hơn một chút
- Search bar fade in
- CTA button hover lift

**Mục đích:** Hero là phần đầu tiên user thấy, hiệu ứng cần mượt và tạo cảm giác chuyên nghiệp.

```css
@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-up {
  animation: fade-up 0.6s ease-out both;
}
```

```tsx
<h1 className="animate-fade-up">
  The MinhTam Digital Library
</h1>
```

---

## 5. Search Bar

### Hiệu ứng nên dùng
- Focus glow
- Border đổi màu khi focus
- Button hover lift
- Loading spinner khi đang search

```tsx
<input
  className="h-[45px] w-full rounded-[17px] border border-[#AFAFAF] px-6 text-[18px] outline-none transition-all duration-200 focus:border-[#337AB7] focus:ring-4 focus:ring-[#337AB7]/10"
  placeholder="Search by book title, author, ISBN or category..."
/>
```

```tsx
<button className="h-[45px] rounded-[17px] bg-[#E60028] px-6 font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#CC0024] hover:shadow-lg active:translate-y-0">
  Search
</button>
```

---

## 6. Cards

Áp dụng cho: Library Services, Featured Books, Borrowing Guide, Dashboard stats.

### Hiệu ứng nên dùng
- Hover lift
- Shadow nhẹ
- Border đổi màu nhẹ
- Card xuất hiện lần lượt khi scroll

```tsx
<div className="border border-[#EDEDF2] bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#337AB7]/40 hover:shadow-[0_4px_12px_rgba(7,7,88,0.12)]">
  <h3 className="text-xl font-bold text-[#000054]">Find Books</h3>
  <p className="mt-3 text-[#333333]">
    Search across titles, authors, categories and ISBNs.
  </p>
</div>
```

---

## 7. Section Reveal On Scroll

Dùng cho các section lớn: Library Services, Featured Books, Borrowing & Reservation, Notices, Footer.

```bash
npm install framer-motion
```

```tsx
"use client";

import { motion } from "framer-motion";

export default function LibraryServicesSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="py-16"
    >
      <h2 className="text-3xl font-bold text-[#000054]">
        Library Services
      </h2>
    </motion.section>
  );
}
```

> **Lưu ý:** Dùng `viewport={{ once: true }}` để section chỉ animate một lần, tránh gây mỏi mắt khi scroll lên xuống nhiều lần.

---

## 8. Buttons

### Trạng thái cần có
- `default`
- `hover`
- `active`
- `disabled`
- `loading`

```tsx
<button
  disabled={loading}
  className="flex h-[45px] items-center justify-center rounded-[17px] bg-[#E60028] px-6 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
>
  {loading && (
    <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
  )}
  {loading ? "Processing..." : "Login"}
</button>
```

Dùng cho: Login, Register, Search, Reserve, Cancel booking, Payment.

---

## 9. Forms

Áp dụng cho: Login, Register.

### Hiệu ứng nên dùng
- Input focus ring
- Error message fade in
- Button loading
- Toast success / error

```tsx
<input
  className="h-11 w-full border border-[#AFAFAF] px-4 outline-none transition-all duration-200 focus:border-[#337AB7] focus:ring-4 focus:ring-[#337AB7]/10"
/>
```

```tsx
{error && (
  <p className="mt-2 animate-fade-up text-sm text-[#E60028]">
    {error}
  </p>
)}
```

---

## 10. Toast Notification

Dùng cho: đăng nhập thành công, đăng ký thành công, sai email/mật khẩu, gửi yêu cầu thành công, thanh toán thất bại.

```bash
npm install sonner
```

```tsx
import { Toaster } from "sonner";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
```

```tsx
import { toast } from "sonner";

toast.success("Đăng nhập thành công");
toast.error("Email hoặc mật khẩu không đúng");
```

---

## 11. Skeleton Loading

Dùng khi API chưa trả dữ liệu. Áp dụng cho: danh sách sách, dashboard stats, thông báo, lịch sử mượn/trả.

```tsx
export default function BookCardSkeleton() {
  return (
    <div className="animate-pulse border border-[#EDEDF2] bg-white p-6">
      <div className="h-5 w-3/4 rounded bg-gray-200" />
      <div className="mt-4 h-4 w-1/2 rounded bg-gray-200" />
      <div className="mt-6 h-10 w-full rounded bg-gray-200" />
    </div>
  );
}
```

---

## 12. Modal / Dialog

Dùng cho: xem chi tiết sách, xác nhận hủy booking, xác nhận logout, thông báo thanh toán.

### Hiệu ứng nên dùng
- Backdrop fade in
- Modal scale nhẹ
- Modal slide up nhẹ

```css
@keyframes modal-in {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.animate-modal-in {
  animation: modal-in 0.2s ease-out both;
}
```

---

## 13. Dashboard

Dashboard không nên nhiều animation quá.

### Nên dùng
- Card hover nhẹ
- Stats number fade in
- Table row hover
- Skeleton loading
- Toast
- Modal confirmation

```tsx
<tr className="transition-colors duration-150 hover:bg-[#F8F9FA]">
  ...
</tr>
```

---

## 14. Rule chọn hiệu ứng theo component

| Component | Hiệu ứng nên dùng |
|---|---|
| Navbar | scroll background, underline hover |
| Hero | fade up, search focus glow |
| Search bar | focus ring, loading button |
| Service card | hover lift, reveal on scroll |
| Book card | hover shadow, skeleton loading |
| Login form | focus ring, error fade, loading button |
| Register form | focus ring, toast success |
| Dashboard card | hover shadow nhẹ |
| Table | row hover |
| Modal | fade + scale |
| Toast | success/error feedback |
| Footer | ít animation, chỉ hover link |

---

## 15. Accessibility — Reduced Motion

Luôn respect setting `prefers-reduced-motion` của người dùng. Một số người có vấn đề về tiền đình sẽ bị khó chịu bởi animation.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

Với Framer Motion:

```tsx
import { useReducedMotion } from "framer-motion";

const shouldReduce = useReducedMotion();

<motion.div
  initial={{ opacity: 0, y: shouldReduce ? 0 : 24 }}
  animate={{ opacity: 1, y: 0 }}
/>
```

---

## 16. Performance — will-change

Chỉ dùng `will-change` khi thực sự cần — lạm dụng sẽ tốn thêm bộ nhớ GPU.

```css
/* Đúng: chỉ thêm khi hover, xóa sau khi animation xong */
.card:hover {
  will-change: transform;
}

/* Sai: không đặt will-change mặc định cho tất cả card */
.card {
  will-change: transform; /* tránh làm điều này */
}
```

Với Tailwind, ưu tiên dùng `transform` class trực tiếp thay vì can thiệp `will-change` thủ công — Tailwind đã xử lý GPU compositing hợp lý qua `translateY`, `scale`, v.v.

---

## 17. Checklist trước khi thêm animation

Trước khi thêm hiệu ứng, tự hỏi:

- [ ] Hiệu ứng này có giúp user hiểu UI hơn không?
- [ ] Có làm web chậm hoặc rối không?
- [ ] Có quá nhiều thứ chuyển động cùng lúc không?
- [ ] Có hoạt động tốt trên mobile không?
- [ ] Có gây khó chịu khi dùng lâu không?
- [ ] Có respect `prefers-reduced-motion` chưa?
- [ ] Có lạm dụng `will-change` không?

> Nếu câu trả lời là "không giúp gì nhiều" — bỏ hiệu ứng đó.
