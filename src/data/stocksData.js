// Market datasets for top Indian equities (NSE/BSE)
export const STOCKS_DATA = {
  RELIANCE: {
    symbol: "RELIANCE",
    name: "Reliance Industries Ltd",
    sector: "Energy / Telecom / Retail",
    exchange: "NSE",
    price: 2942.50,
    change: +38.20,
    changePercent: +1.31,
    dayHigh: 2958.00,
    dayLow: 2912.10,
    volume: "8.42M",
    avgVolume: "5.10M",
    volumeSurgeRatio: 1.65,
    marketCap: "₹19.92 Lakh Cr",
    peRatio: 26.8,
    beta: 0.88,
    week52High: 3024.90,
    week52Low: 2220.30,
    technicalMetrics: {
      rsi14: 68.4,
      rsiSignal: "Bullish (Approaching Overbought)",
      dma50: 2840.10,
      dma200: 2615.40,
      movingAvgSignal: "Golden Cross Active (Price > 50 DMA > 200 DMA)",
      macd: {
        macdLine: 24.5,
        signalLine: 18.2,
        histogram: +6.3,
        status: "Bullish Divergence"
      },
      bollingerBands: {
        upper: 2980.0,
        middle: 2890.0,
        lower: 2800.0,
        percentile: 0.79
      },
      volumeAnomalyDetected: true,
      anomalyDescription: "Unusual block accumulation detected at ₹2,920 (+65% over 20-day median)"
    },
    candles: [
      { date: "Oct 01", open: 2840, high: 2865, low: 2825, close: 2855, volume: 4.8 },
      { date: "Oct 02", open: 2855, high: 2875, low: 2840, close: 2860, volume: 5.1 },
      { date: "Oct 03", open: 2860, high: 2885, low: 2850, close: 2878, volume: 5.4 },
      { date: "Oct 04", open: 2878, high: 2905, low: 2865, close: 2892, volume: 6.2 },
      { date: "Oct 07", open: 2892, high: 2915, low: 2880, close: 2885, volume: 5.0 },
      { date: "Oct 08", open: 2885, high: 2920, low: 2875, close: 2910, volume: 5.9 },
      { date: "Oct 09", open: 2910, high: 2935, low: 2895, close: 2925, volume: 6.8 },
      { date: "Oct 10", open: 2925, high: 2940, low: 2905, close: 2915, volume: 6.1 },
      { date: "Oct 11", open: 2915, high: 2930, low: 2890, close: 2904, volume: 5.8 },
      { date: "Oct 14", open: 2910, high: 2958, low: 2912, close: 2942.5, volume: 8.42 }
    ]
  },
  INFY: {
    symbol: "INFY",
    name: "Infosys Limited",
    sector: "Information Technology",
    exchange: "NSE",
    price: 1894.20,
    change: +24.80,
    changePercent: +1.33,
    dayHigh: 1910.00,
    dayLow: 1872.50,
    volume: "12.8M",
    avgVolume: "7.2M",
    volumeSurgeRatio: 1.78,
    marketCap: "₹7.86 Lakh Cr",
    peRatio: 29.4,
    beta: 0.94,
    week52High: 1991.45,
    week52Low: 1358.35,
    technicalMetrics: {
      rsi14: 64.2,
      rsiSignal: "Strong Momentum (Healthy Bullish)",
      dma50: 1812.50,
      dma200: 1620.00,
      movingAvgSignal: "Sustained Uptrend above 50/200 DMA",
      macd: {
        macdLine: 18.4,
        signalLine: 12.1,
        histogram: +6.3,
        status: "Bullish Crossover"
      },
      bollingerBands: {
        upper: 1930.0,
        middle: 1860.0,
        lower: 1790.0,
        percentile: 0.74
      },
      volumeAnomalyDetected: true,
      anomalyDescription: "Significant call option open interest concentration at ₹1,900 & ₹1,950 strikes"
    },
    candles: [
      { date: "Oct 01", open: 1795, high: 1820, low: 1785, close: 1810, volume: 6.5 },
      { date: "Oct 02", open: 1810, high: 1835, low: 1800, close: 1825, volume: 7.1 },
      { date: "Oct 03", open: 1825, high: 1840, low: 1815, close: 1832, volume: 6.9 },
      { date: "Oct 04", open: 1832, high: 1860, low: 1828, close: 1855, volume: 8.2 },
      { date: "Oct 07", open: 1855, high: 1870, low: 1845, close: 1862, volume: 7.8 },
      { date: "Oct 08", open: 1862, high: 1885, low: 1850, close: 1878, volume: 9.1 },
      { date: "Oct 09", open: 1878, high: 1890, low: 1860, close: 1870, volume: 7.4 },
      { date: "Oct 10", open: 1870, high: 1888, low: 1855, close: 1880, volume: 8.0 },
      { date: "Oct 11", open: 1880, high: 1895, low: 1865, close: 1869, volume: 7.7 },
      { date: "Oct 14", open: 1872, high: 1910, low: 1872.5, close: 1894.2, volume: 12.8 }
    ]
  },
  HDFCBANK: {
    symbol: "HDFCBANK",
    name: "HDFC Bank Limited",
    sector: "Banking & Financial Services",
    exchange: "NSE",
    price: 1682.40,
    change: -12.10,
    changePercent: -0.71,
    dayHigh: 1704.00,
    dayLow: 1675.20,
    volume: "18.6M",
    avgVolume: "19.2M",
    volumeSurgeRatio: 0.97,
    marketCap: "₹12.80 Lakh Cr",
    peRatio: 18.9,
    beta: 0.82,
    week52High: 1794.00,
    week52Low: 1363.55,
    technicalMetrics: {
      rsi14: 48.7,
      rsiSignal: "Neutral Consolidation",
      dma50: 1665.00,
      dma200: 1590.20,
      movingAvgSignal: "Hovering near 50-DMA support",
      macd: {
        macdLine: 2.1,
        signalLine: 3.4,
        histogram: -1.3,
        status: "Mild Bearish Convergence"
      },
      bollingerBands: {
        upper: 1720.0,
        middle: 1685.0,
        lower: 1650.0,
        percentile: 0.46
      },
      volumeAnomalyDetected: false,
      anomalyDescription: "Volume trading within 5% of 30-day baseline; institutional consolidation phase"
    },
    candles: [
      { date: "Oct 01", open: 1670, high: 1690, low: 1665, close: 1682, volume: 16.2 },
      { date: "Oct 02", open: 1682, high: 1700, low: 1678, close: 1695, volume: 18.0 },
      { date: "Oct 03", open: 1695, high: 1712, low: 1690, close: 1705, volume: 19.5 },
      { date: "Oct 04", open: 1705, high: 1715, low: 1688, close: 1698, volume: 17.8 },
      { date: "Oct 07", open: 1698, high: 1705, low: 1682, close: 1688, volume: 16.9 },
      { date: "Oct 08", open: 1688, high: 1699, low: 1675, close: 1682, volume: 18.1 },
      { date: "Oct 09", open: 1682, high: 1701, low: 1680, close: 1692, volume: 17.5 },
      { date: "Oct 10", open: 1692, high: 1708, low: 1685, close: 1700, volume: 20.1 },
      { date: "Oct 11", open: 1700, high: 1706, low: 1688, close: 1694.5, volume: 17.9 },
      { date: "Oct 14", open: 1698, high: 1704, low: 1675.2, close: 1682.4, volume: 18.6 }
    ]
  },
  TATAMOTORS: {
    symbol: "TATAMOTORS",
    name: "Tata Motors Limited",
    sector: "Automotive / EV",
    exchange: "NSE",
    price: 928.75,
    change: +19.40,
    changePercent: +2.13,
    dayHigh: 935.50,
    dayLow: 911.00,
    volume: "14.2M",
    avgVolume: "8.5M",
    volumeSurgeRatio: 1.67,
    marketCap: "₹3.42 Lakh Cr",
    peRatio: 10.8,
    beta: 1.32,
    week52High: 1179.05,
    week52Low: 622.00,
    technicalMetrics: {
      rsi14: 62.8,
      rsiSignal: "Bullish Reversal From Key Support",
      dma50: 955.00,
      dma200: 985.00,
      movingAvgSignal: "Testing short-term 50-DMA resistance after oversold bounce",
      macd: {
        macdLine: -8.2,
        signalLine: -14.6,
        histogram: +6.4,
        status: "Strong Bullish Reversal Histogram"
      },
      bollingerBands: {
        upper: 960.0,
        middle: 915.0,
        lower: 870.0,
        percentile: 0.65
      },
      volumeAnomalyDetected: true,
      anomalyDescription: "Commercial Vehicle segment delivery surge + EV retail bookings up 22% MoM"
    },
    candles: [
      { date: "Oct 01", open: 885, high: 900, low: 880, close: 892, volume: 7.8 },
      { date: "Oct 02", open: 892, high: 905, low: 888, close: 901, volume: 8.2 },
      { date: "Oct 03", open: 901, high: 915, low: 895, close: 908, volume: 8.9 },
      { date: "Oct 04", open: 908, high: 920, low: 902, close: 914, volume: 9.5 },
      { date: "Oct 07", open: 914, high: 922, low: 905, close: 910, volume: 8.4 },
      { date: "Oct 08", open: 910, high: 918, low: 898, close: 905, volume: 9.0 },
      { date: "Oct 09", open: 905, high: 924, low: 902, close: 918, volume: 10.2 },
      { date: "Oct 10", open: 918, high: 928, low: 910, close: 915, volume: 9.8 },
      { date: "Oct 11", open: 915, high: 920, low: 904, close: 909.3, volume: 8.6 },
      { date: "Oct 14", open: 911, high: 935.5, low: 911, close: 928.75, volume: 14.2 }
    ]
  }
};
