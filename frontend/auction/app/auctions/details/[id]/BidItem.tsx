import { Bid } from "@/app/models/Bid";
import { numberWithCommas } from "@/lib/numberWithCommas";
import { parseISO } from "date-fns";
import { format } from "date-fns";

type Props = {
  bid: Bid;
};

export default function BidItem({ bid }: Props) {
  const bidTime = parseISO(bid.bidTime as unknown as string);
  return (
    <div
      className={`
                border-gray-300 border-2 px-3 py-2 
                rounded-lg flex justify-between items-center mb-2
                bg-green-200
            `}
    >
      <div className="flex flex-col">
        <span>Bidder: {bid.displayName}</span>
        <span className="text-gray-700 text-sm">
          Time: {format(bidTime, "dd MMM yyyy h:mm a")}
        </span>
      </div>
      <div className="flex flex-col text-right">
        <div className="text-xl font-semibold">
          ${numberWithCommas(bid.amount)}
        </div>
        <div className="flex flex-row items-center">
          <span>Bid accepted</span>
        </div>
      </div>
    </div>
  );
}
