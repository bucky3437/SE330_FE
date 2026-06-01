# Skill: Next.js Frontend Folder Structure Review

## 1. Mục tiêu

Skill này dùng để review và chuẩn hóa cấu trúc thư mục cho project Next.js frontend, đặc biệt với project dùng:

- Next.js App Router
- TypeScript
- `src/app`
- `features/`
- `components/`
- `models/`
- `types/`
- `libs/`
- `validations/`

Mục tiêu chính là giúp project dễ mở rộng, dễ bảo trì, tránh việc code bị dồn quá nhiều vào `page.tsx` hoặc component.

---

## 2. Khi nào dùng skill này?

Dùng skill này khi:

- Tạo mới project Next.js.
- Review cấu trúc folder hiện tại.
- Không chắc nên đặt file vào `features`, `components`, `models`, `types` hay `libs`.
- Muốn tổ chức frontend gọi API từ backend Spring Boot.
- Muốn project nhìn chuyên nghiệp hơn để đưa vào CV hoặc portfolio.

---

## 3. Nguyên tắc chính

### 3.1. `src/app` chỉ nên phụ trách routing

`src/app` dùng cho:

- `page.tsx`
- `layout.tsx`
- `loading.tsx`
- `error.tsx`
- route group
- dynamic route

Ví dụ:

```txt
src/app/
├── layout.tsx
├── page.tsx
├── login/
│   └── page.tsx
├── register/
│   └── page.tsx
└── dashboard/
    ├── layout.tsx
    └── page.tsx
```

Không nên viết quá nhiều business logic trong `page.tsx`.

Tốt hơn:

```tsx
import LoginForm from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  return <LoginForm />;
}
```

---

### 3.2. `features` chứa code theo nghiệp vụ

Mỗi nghiệp vụ chính nên có một folder riêng trong `features`.

Ví dụ:

```txt
src/features/
├── auth/
├── books/
├── users/
└── loans/
```

Mỗi feature có thể gồm:

```txt
features/books/
├── components/
├── services/
├── hooks/
├── types/
└── validations/
```

Ý nghĩa:

- `components/`: component riêng của feature đó.
- `services/`: hàm gọi API.
- `hooks/`: custom hook.
- `types/`: request/response/form type riêng của feature.
- `validations/`: schema validate riêng của feature.

---

### 3.3. `components` chỉ chứa component dùng chung

`src/components` dùng cho component có thể tái sử dụng ở nhiều feature.

Ví dụ:

```txt
src/components/
├── ui/
│   ├── Button.tsx
│   ├── Input.tsx
│   └── Modal.tsx
├── layout/
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   └── Footer.tsx
└── common/
    ├── Loading.tsx
    └── EmptyState.tsx
```

Không nên đặt component quá đặc thù vào đây.

Ví dụ `BookCard` nếu chỉ dùng cho books thì nên để:

```txt
src/features/books/components/BookCard.tsx
```

---

### 3.4. Giữ `models` cho entity/domain chính

Project quyết định giữ `models`, nên quy ước như sau:

`models/` chỉ chứa các dữ liệu nghiệp vụ chính của hệ thống.

Ví dụ project quản lý thư viện:

```txt
src/models/
├── book.model.ts
├── member.model.ts
├── user.model.ts
├── loan.model.ts
└── transaction.model.ts
```

Ví dụ `book.model.ts`:

```ts
export type Book = {
  id: number;
  title: string;
  author: string;
  isbn: string;
  quantity: number;
  availableQuantity: number;
  createdAt: string;
  updatedAt: string;
};
```

Ví dụ `member.model.ts`:

```ts
export type Member = {
  id: number;
  fullName: string;
  email: string;
  status: "ACTIVE" | "LOCKED" | "PENDING_VERIFICATION";
  createdAt: string;
};
```

---

### 3.5. `types` dùng cho type kỹ thuật hoặc type dùng chung

`src/types` không nên chứa lại các entity đã có trong `models`.

Nên dùng `types` cho:

- API wrapper type
- pagination type
- error response type
- common UI type
- utility type

Ví dụ:

```txt
src/types/
├── api.type.ts
└── common.type.ts
```

Ví dụ `api.type.ts`:

```ts
export type ApiResponse<T> = {
  success: boolean;
  message: string;
  code?: string;
  data: T;
  meta?: unknown;
  timestamp?: string;
  traceId?: string;
};

export type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};
```

Ví dụ `common.type.ts`:

```ts
export type SelectOption = {
  label: string;
  value: string;
};

export type Nullable<T> = T | null;
```

---

## 4. Phân biệt `models`, `types`, `features/*/types`

### `models`

Dùng cho entity chính:

```txt
Book
User
Member
Loan
Transaction
Wallet
```

### `types`

Dùng cho type global/kỹ thuật:

```txt
ApiResponse<T>
PageResponse<T>
ApiError
SelectOption
Nullable<T>
SortDirection
```

### `features/*/types`

Dùng cho type riêng của feature:

```txt
LoginRequest
RegisterRequest
AuthResponse
CreateBookRequest
UpdateBookRequest
BookFilter
BorrowBookRequest
ReturnBookRequest
```

Ví dụ:

```txt
src/features/auth/types/auth.type.ts
src/features/books/types/book.type.ts
src/features/loans/types/loan.type.ts
```

---

## 5. Cấu trúc khuyến nghị

```txt
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── login/
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   ├── books/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   └── dashboard/
│       ├── layout.tsx
│       └── page.tsx
│
├── components/
│   ├── ui/
│   ├── layout/
│   └── common/
│
├── constants/
│   └── routes.ts
│
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── validations/
│   ├── books/
│   │   ├── components/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── validations/
│   └── loans/
│       ├── components/
│       ├── services/
│       ├── hooks/
│       ├── types/
│       └── validations/
│
├── libs/
│   ├── api.ts
│   └── auth.ts
│
├── models/
│   ├── book.model.ts
│   ├── member.model.ts
│   └── loan.model.ts
│
├── types/
│   ├── api.type.ts
│   └── common.type.ts
│
├── utils/
│   ├── formatDate.ts
│   └── formatCurrency.ts
│
└── validations/
    └── common.schema.ts
```

---

## 6. Quy tắc đặt file

### Page

```txt
src/app/login/page.tsx
src/app/books/page.tsx
src/app/books/[id]/page.tsx
```

### Layout

```txt
src/app/layout.tsx
src/app/dashboard/layout.tsx
```

### Component dùng chung

```txt
src/components/ui/Button.tsx
src/components/layout/Header.tsx
src/components/common/EmptyState.tsx
```

### Component theo feature

```txt
src/features/auth/components/LoginForm.tsx
src/features/books/components/BookCard.tsx
```

### API service

```txt
src/features/auth/services/authService.ts
src/features/books/services/bookService.ts
```

### Entity model

```txt
src/models/book.model.ts
src/models/member.model.ts
```

### Type dùng chung

```txt
src/types/api.type.ts
src/types/common.type.ts
```

### Validation

```txt
src/features/auth/validations/loginSchema.ts
src/features/books/validations/bookSchema.ts
```

---

## 7. Checklist review folder structure

Khi review project, kiểm tra các điểm sau:

- [ ] Project có dùng `src/app` đúng chuẩn App Router không?
- [ ] `page.tsx` có đang quá dày không?
- [ ] Business logic có bị viết trực tiếp trong `page.tsx` không?
- [ ] Component dùng riêng có được đặt trong `features/*/components` không?
- [ ] Component dùng chung có được đặt trong `components/` không?
- [ ] API call có được đặt trong `features/*/services` hoặc `libs/api.ts` không?
- [ ] Entity chính có được đặt trong `models/` không?
- [ ] Type kỹ thuật có được đặt trong `types/` không?
- [ ] Có bị khai báo trùng `User`, `Book`, `Loan` ở nhiều nơi không?
- [ ] `.env` và `.env.local` có nằm trong `.gitignore` không?
- [ ] `.env.example` có được commit để người khác biết cần biến môi trường nào không?

---

## 8. Anti-pattern cần tránh

### 8.1. Viết quá nhiều logic trong `page.tsx`

Không nên:

```tsx
export default function LoginPage() {
  // state
  // validation
  // call API
  // handle error
  // render form rất dài
}
```

Nên:

```tsx
import LoginForm from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  return <LoginForm />;
}
```

---

### 8.2. Gọi API rải rác trong component

Không nên để component nào cũng tự `fetch`.

Nên gom API call vào service:

```txt
src/features/auth/services/authService.ts
src/features/books/services/bookService.ts
```

---

### 8.3. Trùng type giữa `models` và `types`

Không nên có:

```txt
src/models/user.model.ts
src/types/user.type.ts
src/features/users/types/user.type.ts
```

Nếu cả ba đều khai báo `User`, project sẽ dễ rối.

Quy tắc:

```txt
User entity chính       → models/user.model.ts
User API request/filter → features/users/types/user.type.ts
ApiResponse chung       → types/api.type.ts
```

---

## 9. Output mong muốn khi dùng skill này

Khi dùng skill này để review project, output nên gồm:

1. Đánh giá tổng quan cấu trúc hiện tại.
2. Folder nào đang ổn.
3. Folder nào dễ bị trùng trách nhiệm.
4. Đề xuất nơi đặt file cụ thể.
5. Cấu trúc folder đề xuất sau khi chỉnh.
6. Checklist việc cần làm tiếp theo.

Ví dụ output:

```txt
Cấu trúc hiện tại ổn vì dùng src/app, features, components, libs.
Bạn có thể giữ models, nhưng cần quy định rõ:
- models chứa entity chính
- types chứa type dùng chung/kỹ thuật
- features/*/types chứa request/response/form type theo nghiệp vụ
```

---

## 10. Tóm tắt ngắn

```txt
app        = routing
features   = nghiệp vụ
components = UI dùng chung
libs       = code kỹ thuật dùng chung
models     = entity/domain chính
types      = type kỹ thuật/dùng chung
utils      = hàm tiện ích
validations = schema validate
```

Quy tắc quan trọng nhất:

```txt
Không quan trọng có giữ models hay không.
Quan trọng là không để trùng trách nhiệm giữa models, types và features/*/types.
```
