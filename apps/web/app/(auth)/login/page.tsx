import { LoginForm } from "@/features/auth/components/login-form";
import { AuthShell } from "@/shared/components/layout/auth-shell";

export default function LoginPage() {
  return (
    <AuthShell
      title="Chào mừng trở lại"
      description="Đăng nhập vào không gian làm việc của sàn đấu giá"
    >
      <LoginForm />
    </AuthShell>
  );
}
