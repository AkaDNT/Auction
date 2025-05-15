# AuctionSale 🛎️ - Real-Time Auction Platform

![GitHub](https://img.shields.io/github/license/yourusername/AuctionSale)
![.NET Core](https://img.shields.io/badge/.NET-8.0.11-blue)
![Next.js](https://img.shields.io/badge/Next.js-15.2.1-blueviolet)
![SQL](https://img.shields.io/badge/SQL-blueviolet)

**AuctionSale** là nền tảng đấu giá trực tuyến thời gian thực được xây dựng bằng ASP.NET Core API và Next.js, tích hợp các công nghệ hiện đại để mang lại trải nghiệm đấu giá sôi động và an toàn.

## ✨ Tính năng nổi bật

- **🔄 Đấu giá thời gian thực** với SignalR
- **🔐 Xác thực người dùng** bằng JWT & Cookie
- **🔔 Thông báo real-time** cho người dùng
- **📈 Lịch sử đấu giá** chi tiết
- **🔎 Tìm kiếm & Lọc** sản phẩm thông minh

## 🛠 Công nghệ sử dụng

**Backend (ASP.NET Core 8):**
- SignalR cho real-time communication
- Entity Framework Core + SQL
- Data‑Validation Annotation
- JWT Authentication
- AutoMapper
- MediatR

**Frontend (Next.js 15):**
- App Router + Server Components
- Tailwind CSS với Shadcn/ui
- Axios Client
- React-Hook-Form

### Cài đặt

**1. Clone repository**
```bash
git clone https://github.com/AkaDNT/Auction.git
cd AuctionSale
```
**2. Cấu hình Backend**
```bash
cd src/AuctionSale.API 

# Khôi phục dependencies
dotnet restore

# Thiết lập database
dotnet ef database update

# Chạy ứng dụng
dotnet run
```
**3. Cấu hình Frontend**
```bash
cd frontend/auction

# Cài đặt dependencies
npm install

# Khởi động dev server
npm run dev
