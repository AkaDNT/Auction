export type ProfileUser = {
  id: string;
  email: string;
  name: string;
  slug: string;
  status: string;
  roles: string[];
  createdAt: string;
  updatedAt: string;
};

export type ProfileFormState = {
  name: string;
  slug: string;
};

export type EmailFormState = {
  email: string;
  password: string;
};

export type PasswordFormState = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};
