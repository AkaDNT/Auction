"use client";

import { useEffect, useMemo, useState } from "react";

type CountdownTextProps = {
  timeEnd: string;
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

export function CountdownText({ timeEnd }: CountdownTextProps) {
  const endMs = useMemo(() => new Date(timeEnd).getTime(), [timeEnd]);
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => window.clearInterval(id);
  }, []);

  if (Number.isNaN(endMs)) {
    return <span>Không xác định</span>;
  }

  return <span>{formatCountdown(endMs - nowMs)}</span>;
}
