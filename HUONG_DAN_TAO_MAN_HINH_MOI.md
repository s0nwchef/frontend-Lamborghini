# HƯỚNG DẪN TẠO MÀN HÌNH MỚI (PAGE) & QUY CHUẨN TÁCH CODE
> **Dự án:** Website Giới thiệu & Bán ô tô trực tuyến Automobili Lamborghini  
> **Kiến trúc áp dụng:** Feature-Driven Architecture (React 19 + TypeScript + Vite + Tailwind CSS v4)

---

## 1. TỔNG QUAN KIẾN TRÚC FRONTEND

Dự án áp dụng mô hình **Feature-Driven (Hướng tính năng)** để giữ cho code luôn sạch, dễ bảo trì và mở rộng:

```
frontend/src/
├── api/                  # Cấu hình axios / fetch client chung (http.ts)
├── assets/               # Hình ảnh, video, icons tĩnh
├── components/           # Components dùng chung TOÀN DỰ ÁN (Navbar, Footer, Breadcrumb, Chatbot,...)
├── features/             # NƠI CHỨA LOGIC CỦA TỪNG TÍNH NĂNG RIÊNG BIỆT (Tách theo domain)
│   ├── home/             # Tính năng Trang chủ
│   ├── model/            # Tính năng Chi tiết dòng xe
│   ├── configurator/     # Tính năng 3D Studio & Cấu hình xe
│   ├── showroom/         # Tính năng Đại lý & Bản đồ
│   └── <tính-năng-mới>/  # ← Tính năng mới của bạn sẽ đặt ở đây!
├── pages/                # NƠI CHỨA CÁC TRANG CHÍNH (Smart/Container Components)
│   ├── HomePage.tsx
│   ├── ShowroomPage.tsx
│   └── <MànHìnhMới>Page.tsx # ← File trang kết nối Router đặt ở đây!
├── App.tsx               # Khai báo các Route (URL)
└── main.tsx              # Entry point React
```

### Nguyên tắc phân tách trách nhiệm:
1. **`src/pages/<TênMànHình>Page.tsx`**: Chỉ đóng vai trò là **Container/Orchestrator** (Điều phối viên). Nó gọi Hooks lấy data, quản lý state cấp trang (state lọc, mở modal...), và ghép các sub-components lại với nhau. **Không viết toàn bộ giao diện 500-1000 dòng vào đây!**
2. **`src/features/<tên-tính-năng>/components/`**: Chứa các mảnh giao diện nhỏ (Presentational Components: Card, FilterBar, Banner, List, Modal...).
3. **`src/features/<tên-tính-năng>/api.ts & hooks.ts`**: Tách rời toàn bộ logic gọi API và React Query ra khỏi giao diện.

---

## 2. CẤU TRÚC THƯ MỤC CHUẨN CHO 1 TÍNH NĂNG MỚI

Khi được giao làm một màn hình mới (Ví dụ: **Đặt lịch hẹn / Appointment** hoặc **So sánh xe / Compare**), bạn tạo các file theo cấu trúc chuẩn sau:

```
src/
├── features/appointment/             # Thư mục tính năng
│   ├── types.ts                      # 1. Khai báo Interface, Types, Data Adapter
│   ├── api.ts                        # 2. Khai báo API Endpoint
│   ├── hooks.ts                      # 3. Tạo React Query Hooks (useQuery, useMutation)
│   ├── data.ts (nếu cần)             # Mock data / Hằng số / Options mẫu
│   └── components/                   # 4. Tách các thành phần UI nhỏ
│       ├── AppointmentHero.tsx       # Banner tiêu đề trang
│       ├── AppointmentForm.tsx       # Form nhập liệu
│       ├── ShowroomSelector.tsx      # Bộ chọn showroom
│       └── AppointmentSuccessModal.tsx # Modal báo thành công
│
└── pages/
    └── AppointmentPage.tsx           # 5. File trang chính (kết nối Router)
```

---

## 3. QUY TRÌNH 5 BƯỚC CODE MÀN HÌNH MỚI TỪ A-Z

### BƯỚC 1: Khai báo Interface & Type (`features/<feature>/types.ts`)
Định nghĩa cấu trúc dữ liệu Backend trả về và cấu trúc dữ liệu UI cần dùng:

```typescript
// src/features/appointment/types.ts

// 1. Kiểu dữ liệu nhận từ hoặc gửi lên API Backend
export interface AppointmentDTO {
    maLichHen?: number
    loaiLichHen: 'LAI_THU' | 'TU_VAN' | 'XEM_XE'
    hoTenLienHe: string
    sdtLienHe: string
    emailLienHe: string
    maShowroom: number
    maXe?: number
    thoiGianHen: string
    ghiChu?: string
}

// 2. Kiểu dữ liệu phản hồi từ Backend
export interface AppointmentResponse {
    maLichHen: number
    maYeuCau: string
    trangThai: string
    thongBao: string
}
```

---

### BƯỚC 2: Khai báo API (`features/<feature>/api.ts`)
Sử dụng wrapper `http` có sẵn trong `src/api/http.ts` (tự động gắn baseURL `/api` và headers):

```typescript
// src/features/appointment/api.ts
import { http } from '../../api/http'
import type { AppointmentDTO, AppointmentResponse } from './types'

export const appointmentApi = {
    // Gửi yêu cầu đặt lịch (POST)
    createAppointment: (payload: AppointmentDTO) =>
        http<AppointmentResponse>('/appointment', {
            method: 'POST',
            body: JSON.stringify(payload),
        }),

    // Lấy danh sách lịch hẹn của tôi (GET)
    getMyAppointments: () => 
        http<AppointmentDTO[]>('/appointment/my'),
}
```

---

### BƯỚC 3: Tạo React Query Hook (`features/<feature>/hooks.ts`)
Quản lý Cache, Loading state và Error state một cách chuyên nghiệp:

```typescript
// src/features/appointment/hooks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { appointmentApi } from './api'
import type { AppointmentDTO } from './types'

// Hook lấy dữ liệu (GET)
export const useMyAppointments = () =>
    useQuery({
        queryKey: ['my-appointments'],
        queryFn: appointmentApi.getMyAppointments,
    })

// Hook gửi dữ liệu (POST/PUT/DELETE)
export const useCreateAppointment = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (payload: AppointmentDTO) => appointmentApi.createAppointment(payload),
        onSuccess: () => {
            // Tự động làm mới dữ liệu sau khi tạo thành công
            queryClient.invalidateQueries({ queryKey: ['my-appointments'] })
        },
    })
}
```

---

### BƯỚC 4: Tách nhỏ các UI Component (`features/<feature>/components/`)
Mỗi component chỉ làm một nhiệm vụ duy nhất (Single Responsibility).

#### Ví dụ 1: Component Thẻ hiển thị (`AppointmentCard.tsx`)
```tsx
// src/features/appointment/components/AppointmentCard.tsx
import React from 'react'
import { Calendar, MapPin, ArrowUpRight } from 'lucide-react'
import type { AppointmentDTO } from '../types'

interface AppointmentCardProps {
    data: AppointmentDTO
    onSelect?: (id: number) => void
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({ data, onSelect }) => {
    return (
        <div className="bg-[#232323] border border-transparent hover:border-lambo-primary/50 p-6 transition-all duration-300">
            {/* Tag nhỏ trên cùng */}
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-lambo-primary font-barlow mb-2">
                {data.loaiLichHen}
            </div>

            {/* Tiêu đề */}
            <h3 className="font-barlow text-2xl font-black uppercase text-white mb-3">
                {data.hoTenLienHe}
            </h3>

            {/* Thông tin chi tiết */}
            <div className="space-y-1.5 text-xs text-neutral-400 mb-5">
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-lambo-primary shrink-0" />
                    <span>{data.thoiGianHen}</span>
                </div>
                <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-lambo-primary shrink-0" />
                    <span>Showroom #{data.maShowroom}</span>
                </div>
            </div>

            {/* Nút hành động */}
            <button
                type="button"
                onClick={() => data.maLichHen && onSelect?.(data.maLichHen)}
                className="w-fit py-2 px-5 bg-black border border-lambo-primary text-lambo-primary hover:bg-lambo-primary hover:text-black transition-colors font-barlow text-xs font-bold uppercase tracking-[0.18em] flex items-center gap-2 cursor-pointer"
            >
                <span>XEM CHI TIẾT</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
        </div>
    )
}
```

---

### BƯỚC 5: Lắp ghép vào Trang chính (`src/pages/<PageName>.tsx`)
Ghép toàn bộ các mảnh lại thành một trang hoàn chỉnh:

```tsx
// src/pages/AppointmentPage.tsx
import { useState } from 'react'
import { useMyAppointments, useCreateAppointment } from '../features/appointment/hooks'
import { AppointmentCard } from '../features/appointment/components/AppointmentCard'
import ScrollToTop from '../components/ScrollToTop'

export default function AppointmentPage() {
    const { data: appointments, isLoading, isError } = useMyAppointments()
    const createMutation = useCreateAppointment()
    const [filterType, setFilterType] = useState<string>('ALL')

    return (
        <div className="min-h-screen bg-lambo-bold-black text-[#e5e5e5] pb-20 select-none">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
                {/* 1. Header Trang chuẩn Typography Lamborghini */}
                <header className="pt-10 mb-12">
                    <div className="text-xs font-bold tracking-[0.24em] text-lambo-primary uppercase mb-2 font-barlow">
                        CONCIERGE SERVICES
                    </div>
                    <h1 className="font-barlow text-5xl sm:text-7xl font-black uppercase text-white tracking-tight leading-none mb-4">
                        MY APPOINTMENTS.
                    </h1>
                    <p className="text-sm text-neutral-400 max-w-xl font-light">
                        Quản lý lịch hẹn lái thử và tư vấn cấu hình Ad Personam chính hãng.
                    </p>
                </header>

                {/* 2. Trạng thái Loading / Error */}
                {isLoading && (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-10 h-10 border-2 border-lambo-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                {isError && (
                    <div className="p-6 bg-red-950/40 border border-red-800 text-red-300 text-sm">
                        Không thể tải danh sách lịch hẹn. Vui lòng thử lại sau.
                    </div>
                )}

                {/* 3. Danh sách Cards */}
                {!isLoading && !isError && appointments && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {appointments.map((item) => (
                            <AppointmentCard key={item.maLichHen} data={item} />
                        ))}
                    </div>
                )}
            </div>

            <ScrollToTop />
        </div>
    )
}
```

---

## 4. ĐĂNG KÝ ROUTE & GẮN MENU ĐIỀU HƯỚNG

### 4.1. Khai báo Route trong `src/App.tsx`
Mở file `frontend/src/App.tsx`, import trang mới và gắn Route:

```tsx
// src/App.tsx
import AppointmentPage from './pages/AppointmentPage' // ← Import page mới

function App() {
    // ...
    return (
        <div className="min-h-screen bg-lambo-bold-black text-[#e5e5e5]">
            <Navbar />
            <main className="pt-14">
                <Breadcrumb />
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/showroom" element={<ShowroomPage />} />
                    
                    {/* Thêm Route mới của bạn tại đây: */}
                    <Route path="/appointments" element={<AppointmentPage />} />
                </Routes>
            </main>
            <Footer />
            <Chatbot />
        </div>
    )
}
```

> **Lưu ý:** Nếu trang của bạn là dạng **Full-screen độc lập** (không muốn có thanh Navbar và Footer như `ConfiguratorPage` hay `AuthPage`), hãy thêm điều kiện kiểm tra đường dẫn ở đầu hàm `App()` trước khi return Layout chuẩn.

### 4.2. Thêm liên kết trên `Navbar.tsx`
Mở `src/components/Navbar.tsx`, thêm `<Link>` vào thanh Menu Desktop hoặc Mobile:

```tsx
<Link
    to="/appointments"
    className="hover:text-white transition-colors py-2"
>
    LỊCH HẸN
</Link>
```

---

## 5. BỘ QUY CHUẨN DESIGN SYSTEM BẮT BUỘC (PHẢI TUÂN THỦ)

Để tránh bị lệch font chữ hoặc sai màu sắc so với toàn bộ dự án, bạn **BẮT BUỘC** tuân thủ các quy tắc sau:

### 5.1. Typography (Phông chữ)
- Mọi **tiêu đề (`h1, h2, h3, h4`), nhãn (`label`), nút bấm (`button`), sub-tag**: **BẮT BUỘC** có class `font-barlow`.
- **TUYỆT ĐỐI KHÔNG** dùng inline style: `style={{ fontFamily: "'Barlow Condensed'..." }}`.
- Font chữ thường cho đoạn văn dài (`p`, mô tả): để mặc định (sẽ tự nhận `Barlow Body`).

### 5.2. Bảng mã màu chuẩn Lamborghini (`COLOR_PALETTE_GUIDE.md`)
| Vị trí sử dụng | Class Tailwind được phép dùng | Mã HEX | Ghi chú |
| :--- | :--- | :--- | :--- |
| **Màu vàng thương hiệu chính** | `text-lambo-primary` / `bg-lambo-primary` | `#D8A016` | Dùng cho logo, icon nhấn, border active, nút chính |
| **Màu vàng khi Hover** | `hover:bg-lambo-hover` / `hover:text-lambo-hover` | `#F9CE5C` | Dùng cho trạng thái rê chuột |
| **Màu vàng khi Click/Active** | `active:bg-lambo-pressed` | `#9F6B08` | Dùng cho trạng thái nhấn giữ |
| **Nền đen chính của trang** | `bg-lambo-bold-black` | `#040404` | Nền tổng thể toàn bộ trang web |
| **Nền tối trung gian** | `bg-lambo-dark` | `#070707` | Nền các section |
| **Nền Card / Hộp nội dung** | `bg-lambo-dark-light` hoặc `bg-[#232323]` | `#0a0a0a` / `#232323` | Nền thẻ sản phẩm, dropdown, modal |
| **Viền ngăn cách tối** | `border-white/10` hoặc `border-[#2a2a2a]` | - | Viền tối tinh tế |

> ❌ **CẤM DÙNG:** `bg-amber-400`, `text-amber-400`, `bg-[#d4af37]`, `bg-[#070707]`. Tất cả đã được cấu hình alias trong Tailwind v4.

### 5.3. Quy chuẩn Nút bấm (Button Styles)
- **Nút Vàng nổi bật (Primary):**
  ```tsx
  className="py-3 px-6 bg-lambo-primary hover:bg-lambo-hover active:bg-lambo-pressed text-lambo-bold-black font-extrabold uppercase tracking-[0.2em] font-barlow text-xs flex items-center gap-2 cursor-pointer transition-colors"
  ```
- **Nút Khung Đen Viền Vàng (Secondary Luxury - Chuẩn Figma):**
  ```tsx
  className="w-fit py-2 px-5 bg-black border border-lambo-primary text-lambo-primary hover:bg-lambo-primary hover:text-black transition-colors font-barlow text-xs font-bold uppercase tracking-[0.18em] flex items-center gap-2 cursor-pointer"
  ```

---

## 6. CHECKLIST KIỂM TRA TRƯỚC KHI TẠO PR / MERGE

Trước khi hoàn thành màn hình mới, hãy mở terminal và chạy kiểm tra:

- [ ] **Kiểm tra build:** Chạy `npm --prefix frontend run build` đạt kết quả `✓ built` và **0 lỗi TypeScript**.
- [ ] **Kiểm tra Font:** Tất cả `h1-h6`, sub-tag hoa, nút bấm đều đã gắn class `font-barlow`.
- [ ] **Kiểm tra Màu:** Không còn sót mã màu `amber-*` hay hardcode hex lung tung.
- [ ] **Kiểm tra Tách code:** File trong `src/pages/` dưới 250 dòng (các phần con đã được tách vào `src/features/.../components/`).
- [ ] **Responsive:** Kiểm tra giao diện co giãn tốt trên cả Mobile (375px) và Desktop (1440px).
