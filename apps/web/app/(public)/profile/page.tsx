export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <section className="theme-callout rounded-[1.75rem] p-6">
        <p className="text-sm uppercase tracking-[0.35em] theme-primary">
          Hồ sơ cá nhân
        </p>
        <h1 className="mt-4 text-2xl font-semibold theme-heading">
          Chỉnh sửa thông tin cá nhân
        </h1>
        <p className="mt-3 text-sm leading-7 theme-muted">
          Trang này sẽ là nơi cập nhật tên hiển thị, email, mật khẩu và các
          thông tin hồ sơ khác của bạn.
        </p>
      </section>
    </div>
  );
}
