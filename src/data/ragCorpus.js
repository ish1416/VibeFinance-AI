// Verified SEBI Filings, Audited Statements & Earnings Transcripts Corpus for RAG
export const RAG_CORPUS = {
  RELIANCE: [
    {
      id: "RIL_SEBI_Q1_2025_01",
      documentName: "SEBI LODR Reg 30 Disclosure - Q1 FY25 Financials",
      filingDate: "July 22, 2024",
      regulator: "Securities and Exchange Board of India (SEBI)",
      category: "Quarterly Financial Statements & Segmental Results",
      chunkId: "Chunk #104",
      highlightQuote: "Consolidated EBITDA for the quarter stood at ₹42,748 crore ($5.12B), up 2.0% YoY. Jio Platforms EBITDA grew 11.6% YoY to ₹14,638 crore led by higher subscriber base (489.7M) and monthly ARPU expansion to ₹181.7.",
      fullExcerpt: "Reliance Industries Limited hereby informs the Exchange pursuant to Regulation 30 and 33 of SEBI (LODR) Regulations, 2015. Highlights of Consolidated Performance: Gross Revenue reached ₹2,57,823 crore ($30.9B). The Digital Services (Jio) business demonstrated continuous operating leverage with subscriber churn remaining low at 1.7%. Retail segment EBITDA margins held steady at 8.5% with square footage expansion of 3.2M sq. ft across Tier-2/3 cities. Net debt-to-equity ratio remains conservative at 0.38x.",
      metrics: {
        ebitda: "₹42,748 Cr (+2.0% YoY)",
        pat: "₹17,445 Cr",
        netDebtToEquity: "0.38x",
        fcfYield: "4.8%",
        roce: "11.2%"
      },
      verificationStatus: "VERIFIED_SEBI_FILING",
      sourceUrl: "https://www.bseindia.com/corporates/ann.html?scrip=500325"
    },
    {
      id: "RIL_EARNINGS_CALL_TRANSCRIPT_Q1",
      documentName: "Reliance Industries Q1 FY25 Earnings Call Transcript",
      filingDate: "July 23, 2024",
      regulator: "NSE / BSE Investor Relations",
      category: "Management Discussion & Analysis (MD&A)",
      chunkId: "Chunk #218",
      highlightQuote: "Management confirmed that capital expenditure peak is behind the group. The upcoming New Energy gigafactories in Jamnagar will begin phased commissioning by end of CY2024, requiring zero incremental external debt.",
      fullExcerpt: "Analyst Question (Morgan Stanley): Could management provide color on capital expenditure trajectory for the second half and progress on green energy initiatives?\nExecutive Director Response: As stated in our AGM disclosures, capex for 5G rollout has virtually concluded. Our net free cash flow will expand significantly in subsequent quarters. Renewable solar PV manufacturing and energy storage gigafactories at Dhirubhai Ambani Green Energy Complex are on track for Q4 CY24 commissioning.",
      metrics: {
        capexRunRate: "Declining YoY by 18%",
        freeCashFlow: "Positive ₹12,400 Cr",
        newEnergyTimeline: "Phased rollout starting Q4 CY24"
      },
      verificationStatus: "VERIFIED_TRANSCRIPT",
      sourceUrl: "https://www.ril.com/investor-relations/financial-reporting"
    }
  ],
  INFY: [
    {
      id: "INFY_SEBI_Q1_2025_01",
      documentName: "SEBI Regulation 33 - Infosys Q1 FY25 Audited Consolidated Results",
      filingDate: "July 18, 2024",
      regulator: "Securities and Exchange Board of India (SEBI)",
      category: "Financial Results & Guidance Revision",
      chunkId: "Chunk #42",
      highlightQuote: "Infosys raised constant currency revenue growth guidance for FY25 to 3.0% - 4.0% (from 1.0% - 3.0% earlier). Operating margin expanded by 30 bps YoY to 21.1%. Large deal Total Contract Value (TCV) was $4.1 billion.",
      fullExcerpt: "Infosys Limited (NSE: INFY) announces results for the quarter ended June 30, 2024: Consolidated Revenue grew 2.1% YoY in constant currency to ₹39,315 crore. Free cash flow generation was exceptional at $1,094 million (₹9,161 crore), an increase of 54.3% YoY. The company signed 34 large deals with 52% net new scope, driven by generative AI enterprise adoption via Infosys Topaz suite.",
      metrics: {
        largeDealTcv: "$4.1 Billion",
        operatingMargin: "21.1% (+30 bps YoY)",
        fy25Guidance: "Revised Upwards to 3.0% - 4.0%",
        freeCashFlow: "$1.09 Billion (+54.3% YoY)",
        attritionLTM: "12.7% (Multi-quarter low)"
      },
      verificationStatus: "VERIFIED_SEBI_FILING",
      sourceUrl: "https://www.nseindia.com/companies-listing/corporate-filings-announcements"
    },
    {
      id: "INFY_EARNINGS_CALL_TRANSCRIPT_Q1",
      documentName: "Infosys Q1 FY25 Earnings Conference Call Transcript",
      filingDate: "July 18, 2024",
      regulator: "BSE / NSE Disclosures",
      category: "CEO & CFO Commentary",
      chunkId: "Chunk #88",
      highlightQuote: "CEO Salil Parekh: 'We are seeing strong client interest in generative AI with over 225 active client engagements in Infosys Topaz. Financial Services and BFSI sectors have returned to sequential positive growth.'",
      fullExcerpt: "CFO Commentary on Cash Allocation: 'Our balance sheet remains debt-free with cash and liquid investments totaling ₹37,500 crore. We remain committed to our capital allocation policy of returning 85% of free cash flow over 5-year cycles via dividends and buybacks.'",
      metrics: {
        genAiEngagements: "225+ active enterprise programs",
        debtStatus: "Zero Debt (Net Cash Balance)",
        capitalReturnPolicy: "85% of FCF returned to shareholders"
      },
      verificationStatus: "VERIFIED_TRANSCRIPT",
      sourceUrl: "https://www.infosys.com/investors/reports-filings"
    }
  ],
  HDFCBANK: [
    {
      id: "HDFC_SEBI_Q1_2025_01",
      documentName: "HDFC Bank SEBI LODR Disclosure - Asset Quality & Q1 Results",
      filingDate: "July 20, 2024",
      regulator: "Securities and Exchange Board of India (SEBI)",
      category: "Audited Banking Results & Basel III Disclosures",
      chunkId: "Chunk #67",
      highlightQuote: "Gross Non-Performing Assets (GNPA) ratio stood at 1.33% compared to 1.26% in the previous quarter. Net Interest Margin (NIM) on total assets stabilized at 3.47% as post-merger liquidity buffer unwinds.",
      fullExcerpt: "HDFC Bank Ltd reported net profit of ₹16,175 crore for Q1 FY25, up 35.3% YoY reflecting post-merger integration. Total deposits grew 16.5% YoY to ₹23.79 lakh crore with CASA ratio at 36.3%. Capital Adequacy Ratio (CAR) as per Basel III guidelines was 19.33% against regulatory requirement of 11.7%, demonstrating strong capital cushion.",
      metrics: {
        netProfit: "₹16,175 Cr (+35.3% YoY)",
        gnpa: "1.33%",
        nnpa: "0.39%",
        nim: "3.47% (Stable)",
        capitalAdequacy: "19.33% (Basel III)"
      },
      verificationStatus: "VERIFIED_SEBI_FILING",
      sourceUrl: "https://www.bseindia.com/corporates/ann.html?scrip=500180"
    }
  ],
  TATAMOTORS: [
    {
      id: "TAMO_SEBI_Q1_2025_01",
      documentName: "Tata Motors SEBI Reg 30 - JLR Wholesales & De-merger Progress",
      filingDate: "July 25, 2024",
      regulator: "Securities and Exchange Board of India (SEBI)",
      category: "Corporate Restructuring & Global Auto Performance",
      chunkId: "Chunk #15",
      highlightQuote: "Jaguar Land Rover (JLR) order book remains robust at over 104,000 units, with Range Rover and Defender representing 68% of forward orders. Consolidated net automotive debt reduced to ₹18,600 crore.",
      fullExcerpt: "Tata Motors Limited announces that the National Company Law Tribunal (NCLT) has granted initial approval for the proposed de-merger into two independent listed entities: (1) Commercial Vehicles, and (2) Passenger Vehicles & EVs including JLR. Domestic electric passenger vehicle market share maintained at 71% despite heightened market competition.",
      metrics: {
        jlrOrderBook: "104,000+ units",
        evMarketShare: "71% in India",
        autoNetDebt: "Down 48% YoY to ₹18,600 Cr",
        ncltStatus: "De-merger on schedule for H2 FY25"
      },
      verificationStatus: "VERIFIED_SEBI_FILING",
      sourceUrl: "https://www.tatamotors.com/investors"
    }
  ]
};
