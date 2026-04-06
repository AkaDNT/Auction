const biddingNotes = [
  "Hoàn tất xác thực hồ sơ, phương thức thanh toán và trạng thái tài khoản trước thời điểm mở phiên để tránh gián đoạn khi vào lệnh.",
  "Theo dõi đồng hồ đếm ngược và bước giá tối thiểu của từng phiên; việc vào lệnh đúng nhịp giúp tối ưu biên độ giá.",
  "Phân tích lịch sử đặt giá, số lượng bidder đang hoạt động và tốc độ tăng giá để đánh giá mức cạnh tranh thực tế.",
  "Chuẩn bị sẵn quy trình đối soát, chứng từ và kế hoạch thanh toán ngay từ đầu nhằm rút ngắn thời gian tất toán sau khi thắng.",
];

export function AuctionsNotesSection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 pb-8 sm:pb-10">
      <div className="border-t border-theme-line pt-8 sm:pt-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-theme-brand">
          Ghi chú cách đấu giá
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold leading-tight text-theme-heading sm:text-3xl lg:text-[2.1rem]">
          Hướng dẫn tham gia phiên đấu giá hiệu quả
        </h2>
        <p className="mt-3 max-w-4xl text-sm leading-relaxed text-theme-muted sm:text-base">
          Để đảm bảo quyết định đặt giá được thực hiện chính xác và đúng thời
          điểm, người tham gia nên chuẩn bị trước các yếu tố về tài khoản, nguồn
          lực thanh toán và chiến lược vào lệnh. Các khuyến nghị dưới đây được
          xây dựng theo thực tiễn vận hành các phiên đấu giá có mức cạnh tranh
          cao.
        </p>

        <ol className="mt-6 space-y-4 text-sm leading-relaxed text-theme-muted sm:text-base">
          {biddingNotes.map((note, index) => (
            <li
              key={note}
              className="flex gap-4 border-b border-theme-line/60 pb-4 last:border-b-0 last:pb-0"
            >
              <span className="min-w-7 font-semibold text-theme-brand">
                {index + 1}.
              </span>
              <span>{note}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
