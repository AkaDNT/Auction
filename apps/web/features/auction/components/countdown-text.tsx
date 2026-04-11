"use client";

import { useEffect, useMemo, useState } from "react";

type CountdownTextProps = {
  timeEnd: string;
  className?: string;
  mode?: "inline" | "stacked";
};

function formatCountdown(remainingMs: number) {
  if (remainingMs <= 0) {
    return "Đã kết thúc";
  }

  const totalSeconds = Math.floor(remainingMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");

  return days > 0 ? `${days} ngày ${hh}:${mm}:${ss}` : `${hh}:${mm}:${ss}`;
}

function formatStackedCountdown(remainingMs: number) {
  if (remainingMs <= 0) {
    return {
      dayLabel: "Đã kết thúc",
      timeLabel: "00:00:00",
    };
  }

  const totalSeconds = Math.floor(remainingMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");

  return {
    dayLabel: `${days} ngày`,
    timeLabel: `${hh}:${mm}:${ss}`,
  };
}

export function CountdownText({
  timeEnd,
  className,
  mode = "inline",
}: CountdownTextProps) {
  const endMs = useMemo(() => new Date(timeEnd).getTime(), [timeEnd]);
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => window.clearInterval(id);
  }, []);

  if (Number.isNaN(endMs)) {
    if (mode === "stacked") {
      return (
        <span className={className}>
          <span className="block text-[11px] text-theme-muted">
            Không rõ ngày
          </span>
          <span className="mt-0.5 block font-mono tabular-nums">--:--:--</span>
        </span>
      );
    }

    return <span className={className}>Không xác định</span>;
  }

  if (mode === "stacked") {
    const { dayLabel, timeLabel } = formatStackedCountdown(endMs - nowMs);

    return (
      <span className={className}>
        <span className="block text-[11px] text-theme-muted">{dayLabel}</span>
        <span className="mt-0.5 block font-mono tabular-nums">{timeLabel}</span>
      </span>
    );
  }

  return <span className={className}>{formatCountdown(endMs - nowMs)}</span>;
}
