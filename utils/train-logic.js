import adjusts from "../constants/adjusts.json";

export const processTrainData = (train, stationName) => {
  const stationKey = stationName?.toLowerCase().trim() || "pragal";
  let delay = parseInt(train.Delay) || 0;

  const now = new Date();
  const h = now.getHours();
  const isPeak = (h >= 7 && h <= 10) || (h >= 17 && h <= 20);

  if (stationKey.includes("pragal")) {
    delay += isPeak
      ? adjusts.structural_delays.bridge_peak
      : adjusts.structural_delays.bridge_base;
  }

  if (adjusts.active_works?.[stationKey]) {
    delay += adjusts.active_works[stationKey].extra_delay_mins;
  }

  return {
    ...train,
    finalDelay: Math.max(0, delay),
    severity: delay > 8 ? "#ff3e3e" : delay > 0 ? "#fa0" : "#00f2ff"
  };
};