/**
 * Admin Content Manager Component
 * SOLID: Single Responsibility - manages features and FAQs
 * Dependency: hooks, types
 */

"use client";

import { useMemo, useState } from "react";
import {
  useAdminFeatures,
  useCreateAdminFeature,
  useDeleteAdminFeature,
  useAdminFaqs,
  useCreateAdminFaq,
  useDeleteAdminFaq,
} from "@/features/admin/hooks";

type ContentTab = "features" | "faqs";

export function AdminContentManager() {
  const [activeTab, setActiveTab] = useState<ContentTab>("features");

  // Features
  const featuresQuery = useAdminFeatures();
  const createFeatureMutation = useCreateAdminFeature();
  const deleteFeatureMutation = useDeleteAdminFeature();

  // FAQs
  const faqsQuery = useAdminFaqs();
  const createFaqMutation = useCreateAdminFaq();
  const deleteFaqMutation = useDeleteAdminFaq();

  const [showFeatureForm, setShowFeatureForm] = useState(false);
  const [featureFormData, setFeatureFormData] = useState({
    name: "",
    description: "",
    displayOrder: 0,
  });

  const [showFaqForm, setShowFaqForm] = useState(false);
  const [faqFormData, setFaqFormData] = useState({
    question: "",
    answer: "",
    displayOrder: 0,
  });

  const features = useMemo(() => {
    return featuresQuery.data?.data ?? [];
  }, [featuresQuery.data]);

  const faqs = useMemo(() => {
    return faqsQuery.data?.data ?? [];
  }, [faqsQuery.data]);

  const handleCreateFeature = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createFeatureMutation.mutateAsync({
        name: featureFormData.name,
        description: featureFormData.description,
        displayOrder: featureFormData.displayOrder,
      });
      setFeatureFormData({ name: "", description: "", displayOrder: 0 });
      setShowFeatureForm(false);
      alert("Tính năng đã được tạo thành công");
    } catch {
      alert("Lỗi: Không thể tạo tính năng");
    }
  };

  const handleDeleteFeature = async (featureId: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa tính năng này?")) {
      try {
        await deleteFeatureMutation.mutateAsync(featureId);
        alert("Tính năng đã được xóa thành công");
      } catch {
        alert("Lỗi: Không thể xóa tính năng");
      }
    }
  };

  const handleCreateFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createFaqMutation.mutateAsync({
        question: faqFormData.question,
        answer: faqFormData.answer,
        displayOrder: faqFormData.displayOrder,
      });
      setFaqFormData({ question: "", answer: "", displayOrder: 0 });
      setShowFaqForm(false);
      alert("Câu hỏi đã được tạo thành công");
    } catch {
      alert("Lỗi: Không thể tạo câu hỏi");
    }
  };

  const handleDeleteFaq = async (faqId: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa câu hỏi này?")) {
      try {
        await deleteFaqMutation.mutateAsync(faqId);
        alert("Câu hỏi đã được xóa thành công");
      } catch {
        alert("Lỗi: Không thể xóa câu hỏi");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("features")}
          className={`px-4 py-2 font-semibold ${
            activeTab === "features"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600"
          }`}
        >
          Tính năng
        </button>
        <button
          onClick={() => setActiveTab("faqs")}
          className={`px-4 py-2 font-semibold ${
            activeTab === "faqs"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600"
          }`}
        >
          Câu hỏi thường gặp
        </button>
      </div>

      {activeTab === "features" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">Quản lý tính năng</h3>
            <button
              onClick={() => setShowFeatureForm(!showFeatureForm)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              {showFeatureForm ? "Đóng" : "Thêm tính năng"}
            </button>
          </div>

          {showFeatureForm && (
            <form
              onSubmit={handleCreateFeature}
              className="space-y-4 rounded-lg border border-gray-200 p-6"
            >
              <div>
                <label className="block text-sm font-semibold">Tên</label>
                <input
                  type="text"
                  value={featureFormData.name}
                  onChange={(e) =>
                    setFeatureFormData({
                      ...featureFormData,
                      name: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold">Mô tả</label>
                <textarea
                  value={featureFormData.description}
                  onChange={(e) =>
                    setFeatureFormData({
                      ...featureFormData,
                      description: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={createFeatureMutation.isPending}
                className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:bg-gray-400"
              >
                {createFeatureMutation.isPending ? "Đang tạo..." : "Tạo"}
              </button>
            </form>
          )}

          <div className="space-y-2">
            {features.map((feature) => (
              <div
                key={feature.id}
                className="flex justify-between items-center rounded-lg border border-gray-200 p-4"
              >
                <div>
                  <p className="font-semibold">{feature.name}</p>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
                <button
                  onClick={() => handleDeleteFeature(feature.id)}
                  className="text-red-600 hover:underline"
                >
                  Xóa
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "faqs" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">Quản lý Câu hỏi thường gặp</h3>
            <button
              onClick={() => setShowFaqForm(!showFaqForm)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              {showFaqForm ? "Đóng" : "Thêm câu hỏi"}
            </button>
          </div>

          {showFaqForm && (
            <form
              onSubmit={handleCreateFaq}
              className="space-y-4 rounded-lg border border-gray-200 p-6"
            >
              <div>
                <label className="block text-sm font-semibold">Câu hỏi</label>
                <input
                  type="text"
                  value={faqFormData.question}
                  onChange={(e) =>
                    setFaqFormData({
                      ...faqFormData,
                      question: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold">
                  Câu trả lời
                </label>
                <textarea
                  value={faqFormData.answer}
                  onChange={(e) =>
                    setFaqFormData({
                      ...faqFormData,
                      answer: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={createFaqMutation.isPending}
                className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:bg-gray-400"
              >
                {createFaqMutation.isPending ? "Đang tạo..." : "Tạo"}
              </button>
            </form>
          )}

          <div className="space-y-2">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="flex justify-between items-center rounded-lg border border-gray-200 p-4"
              >
                <div>
                  <p className="font-semibold">{faq.question}</p>
                  <p className="text-sm text-gray-600">{faq.answer}</p>
                </div>
                <button
                  onClick={() => handleDeleteFaq(faq.id)}
                  className="text-red-600 hover:underline"
                >
                  Xóa
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
