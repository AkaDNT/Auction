type Props = {
  amount?: number;
};

export default function CurrentBid({ amount }: Props) {
  const text = amount ? "$" + amount : "No bids";
  const color = amount ? "bg-green-600" : "bg-red-600";
  return (
    <div
      className={`border-2 border-white text-white py-1 px-2 rounded-lg flex justify-center ${color}`}
    >
      {text}
    </div>
  );
}
