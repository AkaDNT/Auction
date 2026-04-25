# Admin Feature Module

## Cấu trúc thư mục

Mô-đun Admin được tổ chức theo nguyên tắc SOLID và tách biệt các mối quan tâm:

```
features/admin/
├── components/          # Các thành phần UI
│   ├── index.ts
│   ├── admin-auctions-list.tsx
│   ├── admin-auction-detail.tsx
│   ├── admin-categories-list.tsx
│   ├── admin-content-manager.tsx
│   └── admin-bids-list.tsx
├── hooks/              # React Query hooks
│   ├── index.ts
│   ├── use-admin-auctions.ts
│   ├── use-admin-categories.ts
│   ├── use-admin-content.ts
│   └── use-admin-bids.ts
├── services/           # API services
│   ├── index.ts
│   ├── admin-auction.service.ts
│   ├── admin-category.service.ts
│   ├── admin-content.service.ts
│   └── admin-bid.service.ts
├── types/             # TypeScript definitions
│   ├── index.ts
│   ├── auction.types.ts
│   ├── category.types.ts
│   ├── content.types.ts
│   └── bid.types.ts
├── utils/             # Utility functions
│   ├── index.ts
│   ├── status-badge.ts
│   ├── format-currency.ts
│   └── date-formatter.ts
└── index.ts           # Feature module exports

app/(admin)/
├── layout.tsx         # Admin layout wrapper
├── dashboard/
│   ├── page.tsx       # Dashboard overview
│   └── analytics/
│       └── page.tsx   # Analytics page
├── auctions/
│   ├── page.tsx       # Auctions list
│   └── [id]/
│       └── page.tsx   # Auction detail
├── categories/
│   └── page.tsx       # Categories management
├── content/
│   ├── page.tsx       # Content management (Features & FAQs)
│   ├── features/
│   │   └── page.tsx   # Redirects to /admin/content
│   └── faqs/
│       └── page.tsx   # Redirects to /admin/content
├── bids/
│   └── page.tsx       # Bids management
├── settings/
│   └── page.tsx       # Settings
└── users/
    └── page.tsx       # Users management
```

## Nguyên tắc SOLID áp dụng

### 1. Single Responsibility Principle (SRP)

- **Services**: Mỗi service chỉ xử lý một loại tài nguyên (Auctions, Categories, Content, Bids)
- **Hooks**: Mỗi hook chỉ quản lý một loại dữ liệu
- **Components**: Mỗi component có trách nhiệm duy nhất (list, detail, form, etc.)

### 2. Open/Closed Principle (OCP)

- Các types được định nghĩa rõ ràng, dễ mở rộng
- Services có thể được thêm request/response types mới mà không ảnh hưởng code cũ
- Components có thể nhận props để tùy chỉnh hành vi

### 3. Liskov Substitution Principle (LSP)

- Tất cả hooks tuân theo quy ước React Query
- Services có interface nhất quán
- Types được định nghĩa rõ ràng để tránh lỗi runtime

### 4. Interface Segregation Principle (ISP)

- Các types được tách biệt (AdminAuction, AdminCategory, etc.)
- Requests chỉ chứa các field cần thiết
- Hooks exports chỉ cung cấp những gì cần thiết

### 5. Dependency Inversion Principle (DIP)

- Các index.ts files cung cấp single entry point
- Components phụ thuộc vào hooks, không trực tiếp vào services
- Services phụ thuộc vào types, không hardcode values

## API Endpoints

### Auctions

- `GET /admin/auctions` - List auctions
- `GET /admin/auctions/:id` - Get auction detail
- `POST /admin/auctions/:id/cancel` - Cancel auction

### Categories

- `POST /admin/auction-categories` - Create category
- `PATCH /admin/auction-categories/:id` - Update category
- `DELETE /admin/auction-categories/:id` - Delete category

### Content (Features)

- `POST /admin/auction-features` - Create feature
- `PATCH /admin/auction-features/:id` - Update feature
- `DELETE /admin/auction-features/:id` - Delete feature

### Content (FAQs)

- `POST /admin/auction-faqs` - Create FAQ
- `PATCH /admin/auction-faqs/:id` - Update FAQ
- `DELETE /admin/auction-faqs/:id` - Delete FAQ

### Bids

- `GET /admin/bids` - List bids
- `GET /admin/bids/:id` - Get bid detail
- `PATCH /admin/bids/:id/reject` - Reject bid
- `PATCH /admin/bids/:id/cancel` - Cancel bid

## Cách sử dụng

### Trong Components

```tsx
import { AdminAuctionsList } from "@/features/admin/components";

export function MyComponent() {
  return <AdminAuctionsList request={{ status: "LIVE" }} />;
}
```

### Với Hooks

```tsx
import {
  useAdminAuctions,
  useCancelAdminAuction,
} from "@/features/admin/hooks";

export function MyComponent() {
  const auctionsQuery = useAdminAuctions({ page: 1 });
  const cancelMutation = useCancelAdminAuction();

  const handleCancel = async (auctionId: string) => {
    await cancelMutation.mutateAsync({ auctionId });
  };

  return <div>{/* JSX */}</div>;
}
```

### Import chính

```tsx
// Import từ module index
import {
  AdminAuctionsList,
  useAdminAuctions,
  listAdminAuctions,
  type AdminAuction,
  formatCurrency,
} from "@/features/admin";
```

## Mô phỏng dữ liệu

Để phát triển ngoại tuyến, thêm mock data vào `features/admin/mocks/`:

```tsx
// features/admin/mocks/index.ts
export const mockAdminAuctions = [
  { id: '1', title: 'Auction 1', status: 'LIVE', ... },
  // ...
];
```

Sau đó tạo mock services:

```tsx
// Sử dụng trong development
const response = import.meta.env.DEV
  ? { data: mockAdminAuctions }
  : await fetch(...).then(r => r.json());
```

## Tiếp theo

### Có thể mở rộng:

1. **Admin Users Management** - Thêm user management pages
2. **Admin Reports** - Thêm reporting features
3. **Admin Moderation** - Thêm content moderation
4. **Advanced Filters** - Thêm filter components phức tạp hơn
5. **Bulk Actions** - Thêm bulk operations cho list pages
6. **Real-time Updates** - Integrating WebSocket cho real-time data

### Best Practices:

- Luôn sử dụng types được định nghĩa sẵn
- Tận dụng React Query's invalidateQueries để refresh data
- Thêm error handling và loading states
- Viết unit tests cho hooks và services
- Thêm pagination cho danh sách lớn
