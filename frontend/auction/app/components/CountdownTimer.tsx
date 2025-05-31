"use client";
import Countdown, { CountdownRendererFn } from "react-countdown";

type CountdownTimerProps = {
  /** Có thể là Date object, timestamp (ms) hoặc ISO string */
  targetDate: Date | number | string;
};

// Renderer tuỳ chỉnh
const renderer: CountdownRendererFn = ({
  days,
  hours,
  minutes,
  seconds,
  completed,
}) => {
  const zeroPad = (n: number) => String(n).padStart(2, "0");
  return (
    <div
      className={`text-xl font-medium text-white border-2 rounded-full text-center border-gray-800 pr-2 pl-2 ${
        completed
          ? "bg-red-600"
          : days < 1 && hours < 10
          ? "bg-amber-700"
          : "bg-green-600"
      }`}
    >
      {completed ? (
        <span>Auction Finished</span>
      ) : (
        <span>
          {zeroPad(days)} Days {zeroPad(hours)}:{zeroPad(minutes)}:
          {zeroPad(seconds)}
        </span>
      )}
    </div>
  );
};

export function CountdownTimer({ targetDate }: CountdownTimerProps) {
  return (
    <div>
      <Countdown date={targetDate} renderer={renderer} />
    </div>
  );
}
