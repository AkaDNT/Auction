"use client";

import { AccountSummarySection } from "@/features/profile/components/account-summary-section";
import { ProfilePageFrame } from "@/features/profile/components/profile-page-frame";
import { useProfileData } from "@/features/profile/hooks/use-profile-data";

export function ProfileOverviewPage() {
  const { profile, profileQuery, isBooting } = useProfileData();

  return (
    <ProfilePageFrame
      title="Thông tin chung"
      description="Theo dõi trạng thái, vai trò và thông tin nhận diện hiện tại của tài khoản."
      profileQuery={profileQuery}
    >
      <AccountSummarySection profile={profile} isBooting={isBooting} />
    </ProfilePageFrame>
  );
}
