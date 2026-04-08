import { AuthShell } from "@/shared/components/layout/auth-shell";
import { RegisterForm } from "@/features/auth/components/register-form";

export default function RegisterPage() {
  return (
    <AuthShell
      title="Tạo tài khoản"
      description="Tham gia sàn với vai trò người mua, người bán hoặc nhân sự vận hành"
    >
      <RegisterForm />
    </AuthShell>
  );
}
