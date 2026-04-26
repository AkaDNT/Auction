import type { FormEvent, RefObject } from "react";
import type { AdminCategory } from "@/features/admin/types";

export interface AdminCategoriesListProps {
  search?: string;
}

export type CategoryFormState = {
  slug: string;
  label: string;
  description: string;
};

export const initialCategoryFormState: CategoryFormState = {
  slug: "",
  label: "",
  description: "",
};

export type CategoryMutationMode = "create" | "edit";

export interface AdminCategoryFormDialogProps {
  formData: CategoryFormState;
  isOpen: boolean;
  isVisible: boolean;
  isPending: boolean;
  mode: CategoryMutationMode;
  onChange: (field: keyof CategoryFormState, value: string) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  popupRef: RefObject<HTMLDivElement | null>;
  slugInputRef: RefObject<HTMLInputElement | null>;
}

export interface AdminCategoriesTableProps {
  categories: AdminCategory[];
  isDeleting: boolean;
  onEdit: (category: AdminCategory) => void;
  onDelete: (category: AdminCategory) => void;
}

export interface AdminCategoryDeleteDialogProps {
  category: AdminCategory | null;
  isOpen: boolean;
  isVisible: boolean;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
  dialogRef: RefObject<HTMLDivElement | null>;
  confirmButtonRef: RefObject<HTMLButtonElement | null>;
}
