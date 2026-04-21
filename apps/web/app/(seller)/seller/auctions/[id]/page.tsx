import { redirect } from "next/navigation";

type SellerAuctionDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function SellerAuctionDetailPage({
  params,
}: SellerAuctionDetailPageProps) {
  const { id } = await params;

  redirect(`/auctions/${encodeURIComponent(id)}`);
}
