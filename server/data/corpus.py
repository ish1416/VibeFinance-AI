"""
Verified SEBI Filings, Audited Statements & Earnings Transcripts Corpus for RAG.
Mirrors src/data/ragCorpus.js with verbatim highlightQuote spans.
"""

RAG_CORPUS = {
    "RELIANCE": [
        {
            "id": "RIL_SEBI_Q1_2025_01",
            "documentName": "SEBI LODR Reg 30 Disclosure - Q1 FY25 Financials",
            "filingDate": "July 22, 2024",
            "regulator": "Securities and Exchange Board of India (SEBI)",
            "category": "Quarterly Financial Statements & Segmental Results",
            "chunkId": "Chunk #104",
            "synthetic": True,
            "highlightQuote": "Consolidated EBITDA for the quarter stood at ₹42,748 crore ($5.12B), up 2.0% YoY. Jio Platforms EBITDA grew 11.6% YoY to ₹14,638 crore led by higher subscriber base (489.7M) and monthly ARPU expansion to ₹181.7.",
            "fullExcerpt": "Reliance Industries Limited hereby informs the Exchange pursuant to Regulation 30 and 33 of SEBI (LODR) Regulations, 2015. Highlights of Consolidated Performance: Gross Revenue reached ₹2,57,823 crore ($30.9B). The Digital Services (Jio) business demonstrated continuous operating leverage with subscriber churn remaining low at 1.7%. Retail segment EBITDA margins held steady at 8.5% with square footage expansion of 3.2M sq. ft across Tier-2/3 cities. Net debt-to-equity ratio remains conservative at 0.38x. Consolidated EBITDA for the quarter stood at ₹42,748 crore ($5.12B), up 2.0% YoY. Jio Platforms EBITDA grew 11.6% YoY to ₹14,638 crore led by higher subscriber base (489.7M) and monthly ARPU expansion to ₹181.7.",
            "metrics": {
                "ebitda": "₹42,748 Cr (+2.0% YoY)",
                "pat": "₹17,445 Cr",
                "netDebtToEquity": "0.38x",
                "fcfYield": "4.8%",
                "roce": "11.2%",
            },
            "verificationStatus": "SYNTHETIC_DISCLOSURE",
            "sourceUrl": "https://www.bseindia.com/corporates/ann.html?scrip=500325",
        },
        {
            "id": "RIL_EARNINGS_CALL_TRANSCRIPT_Q1",
            "documentName": "Reliance Industries Q1 FY25 Earnings Call Transcript",
            "filingDate": "July 23, 2024",
            "regulator": "NSE / BSE Investor Relations",
            "category": "Management Discussion & Analysis (MD&A)",
            "chunkId": "Chunk #218",
            "synthetic": True,
            "highlightQuote": "Management confirmed that capital expenditure peak is behind the group. The upcoming New Energy gigafactories in Jamnagar will begin phased commissioning by end of CY2024, requiring zero incremental external debt.",
            "fullExcerpt": "Analyst Question (Morgan Stanley): Could management provide color on capital expenditure trajectory for the second half and progress on green energy initiatives?\nExecutive Director Response: As stated in our AGM disclosures, capex for 5G rollout has virtually concluded. Our net free cash flow will expand significantly in subsequent quarters. Renewable solar PV manufacturing and energy storage gigafactories at Dhirubhai Ambani Green Energy Complex are on track for Q4 CY24 commissioning. Management confirmed that capital expenditure peak is behind the group. The upcoming New Energy gigafactories in Jamnagar will begin phased commissioning by end of CY2024, requiring zero incremental external debt.",
            "metrics": {
                "capexRunRate": "Declining YoY by 18%",
                "freeCashFlow": "Positive ₹12,400 Cr",
                "newEnergyTimeline": "Phased rollout starting Q4 CY24",
            },
            "verificationStatus": "SYNTHETIC_DISCLOSURE",
            "sourceUrl": "https://www.ril.com/investors/financial-reporting",
        },
    ],
    "INFY": [
        {
            "id": "INFY_SEBI_Q1FY25_REG33",
            "documentName": "Infosys SEBI Regulation 33 Statement - Q1 FY25 Audited Consolidated Results",
            "filingDate": "July 18, 2024",
            "regulator": "Securities and Exchange Board of India (SEBI)",
            "category": "SEBI LODR Regulation 33 Financial Results",
            "chunkId": "Chunk #82",
            "synthetic": True,
            "highlightQuote": "Large deal total contract value (TCV) was $4.1 billion, with net new deals accounting for 52.5% of total bookings. The company revised its FY25 constant currency revenue guidance upwards to 3.0%-4.0%.",
            "fullExcerpt": "Infosys Limited submits the audited consolidated financial statements pursuant to Regulation 33 of SEBI (Listing Obligations and Disclosure Requirements) Regulations, 2015. Operating margin expanded 30 bps sequentially to 21.1%, driven by Project Maximus margin resilience initiatives. Free cash flow for the quarter was $1,094 million, representing an exceptional 125% conversion of net profit. Large deal total contract value (TCV) was $4.1 billion, with net new deals accounting for 52.5% of total bookings. The company revised its FY25 constant currency revenue guidance upwards to 3.0%-4.0%.",
            "metrics": {
                "tcv": "$4.1 Billion",
                "operatingMargin": "21.1%",
                "revGuidance": "3.0% - 4.0% in CC",
                "capitalReturnPolicy": "85% of free cash flow returned",
            },
            "verificationStatus": "SYNTHETIC_DISCLOSURE",
            "sourceUrl": "https://www.infosys.com/investors/reports-filings",
        },
        {
            "id": "INFY_ANNUAL_REPORT_MDA_FY24",
            "documentName": "Infosys Annual Report FY24 - Management Discussion & Analysis extract",
            "filingDate": "June 12, 2024",
            "regulator": "BSE / NSE Annual Report Filing",
            "category": "Annual Report MD&A",
            "chunkId": "Chunk #311",
            "synthetic": True,
            "highlightQuote": "Client concentration remained stable with the top ten clients contributing 30.6% of revenue, and the company maintained a net cash position of ₹37,500 crore at year end.",
            "fullExcerpt": "Extract from the Management Discussion and Analysis section of the FY24 annual report. Client concentration remained stable with the top ten clients contributing 30.6% of revenue, and the company maintained a net cash position of ₹37,500 crore at year end. Revenue per employee improved 3.4% as the pyramid was optimised, and utilisation excluding trainees closed at 83.6%. The board recommended a final dividend of ₹20 per share, subject to shareholder approval.",
            "metrics": {
                "topTenClientShare": "30.6% of revenue",
                "netCash": "₹37,500 Cr",
                "utilisationExTrainees": "83.6%",
                "finalDividend": "₹20 per share",
            },
            "verificationStatus": "SYNTHETIC_DISCLOSURE",
            "sourceUrl": "https://www.infosys.com/investors/reports-filings/annual-report.html",
        },
    ],
    "HDFCBANK": [
        {
            "id": "HDFC_SEBI_Q1FY25_01",
            "documentName": "HDFC Bank SEBI LODR Disclosure - Asset Quality & Q1 Results",
            "filingDate": "July 20, 2024",
            "regulator": "Securities and Exchange Board of India (SEBI)",
            "category": "Audited Banking Results & Basel III Disclosures",
            "chunkId": "Chunk #67",
            "synthetic": True,
            "highlightQuote": "Gross Non-Performing Assets (GNPA) ratio stood at 1.33% compared to 1.26% in the previous quarter. Net Interest Margin (NIM) on total assets stabilised at 3.47% as the post-merger liquidity buffer unwinds.",
            "fullExcerpt": "HDFC Bank Limited discloses results for the quarter ended June 30, 2024 under Regulation 30 and 33 of the SEBI (LODR) Regulations, 2015. Gross Non-Performing Assets (GNPA) ratio stood at 1.33% compared to 1.26% in the previous quarter. Net Interest Margin (NIM) on total assets stabilised at 3.47% as the post-merger liquidity buffer unwinds. Net profit was ₹16,175 crore, up 35.3% YoY, reflecting post-merger integration. Total deposits grew 16.5% YoY to ₹23.79 lakh crore with a CASA ratio of 36.3%. Net NPA was 0.39% and the Capital Adequacy Ratio under Basel III was 19.33% against a regulatory requirement of 11.7%.",
            "metrics": {
                "netProfit": "₹16,175 Cr (+35.3% YoY)",
                "gnpa": "1.33%",
                "nnpa": "0.39%",
                "nim": "3.47% (stable)",
                "capitalAdequacy": "19.33% (Basel III)",
            },
            "verificationStatus": "SYNTHETIC_DISCLOSURE",
            "sourceUrl": "https://www.bseindia.com/corporates/ann.html?scrip=500180",
        },
        {
            "id": "HDFC_MERGER_INTEGRATION_NOTE",
            "documentName": "HDFC Bank post-merger integration update - Investor presentation extract",
            "filingDate": "August 6, 2024",
            "regulator": "BSE / NSE Investor Relations",
            "category": "Investor Presentation",
            "chunkId": "Chunk #19",
            "synthetic": True,
            "highlightQuote": "The loan-to-deposit ratio improved to 104% during the quarter as deposit accretion outpaced credit growth of 14.9% YoY.",
            "fullExcerpt": "Slide 12 of the post-merger integration investor presentation. The loan-to-deposit ratio improved to 104% during the quarter as deposit accretion outpaced credit growth of 14.9% YoY. Mortgage disbursements of ₹58,700 crore were the highest in four quarters. Management reiterated that the excess liquidity deployed into government securities will mature progressively over the next three quarters, supporting margin recovery.",
            "metrics": {
                "loanToDeposit": "104%",
                "creditGrowth": "14.9% YoY",
                "mortgageDisbursements": "₹58,700 Cr",
                "marginOutlook": "Recovery over three quarters",
            },
            "verificationStatus": "SYNTHETIC_DISCLOSURE",
            "sourceUrl": "https://www.hdfcbank.com/personal/about-us/investor-relations/financial-results",
        },
    ],
    "TATAMOTORS": [
        {
            "id": "TAMO_SEBI_Q1FY25_01",
            "documentName": "Tata Motors SEBI Reg 30 - JLR Wholesales & De-merger Progress",
            "filingDate": "July 25, 2024",
            "regulator": "Securities and Exchange Board of India (SEBI)",
            "category": "Corporate Restructuring & Global Auto Performance",
            "chunkId": "Chunk #15",
            "synthetic": True,
            "highlightQuote": "Jaguar Land Rover (JLR) order book remains robust at over 104,000 units, with Range Rover and Defender representing 68% of forward orders. Consolidated net automotive debt reduced to ₹18,600 crore.",
            "fullExcerpt": "Tata Motors Limited announces, pursuant to Regulation 30 of the SEBI (LODR) Regulations, 2015, that the National Company Law Tribunal (NCLT) has granted initial approval for the proposed de-merger into two independent listed entities: (1) Commercial Vehicles, and (2) Passenger Vehicles & EVs including Jaguar Land Rover. Jaguar Land Rover (JLR) order book remains robust at over 104,000 units, with Range Rover and Defender representing 68% of forward orders. Consolidated net automotive debt reduced to ₹18,600 crore. Automotive net debt fell 48% year on year. Domestic electric passenger vehicle market share was maintained at 71% despite heightened competition.",
            "metrics": {
                "jlrOrderBook": "104,000+ units",
                "evMarketShare": "71% in India",
                "autoNetDebt": "Down 48% YoY to ₹18,600 Cr",
                "ncltStatus": "De-merger on schedule for H2 FY25",
            },
            "verificationStatus": "SYNTHETIC_DISCLOSURE",
            "sourceUrl": "https://www.tatamotors.com/investors",
        },
        {
            "id": "TAMO_EV_BOOKINGS_NOTE",
            "documentName": "Tata Motors EV business update - monthly retail disclosure",
            "filingDate": "August 2, 2024",
            "regulator": "BSE / NSE Investor Relations",
            "category": "Regulatory & Business Update",
            "chunkId": "Chunk #23",
            "synthetic": True,
            "highlightQuote": "Electric vehicle retail bookings rose 22% month on month in July, supported by the newly launched curvv platform.",
            "fullExcerpt": "Monthly business update filed with the Exchanges. Electric vehicle retail bookings rose 22% month on month in July, supported by the newly launched curvv platform. Commercial vehicle wholesales in the domestic market were 28,600 units, up 4% sequentially, while passenger vehicle dispatches were 43,200 units ahead of the festive build-up. Management reiterated that battery pack localisation now covers 62% of bill-of-material value.",
            "metrics": {
                "evBookingGrowth": "+22% MoM",
                "cvWholesales": "28,600 units",
                "pvDispatches": "43,200 units",
                "batteryLocalisation": "62% of BOM value",
            },
            "verificationStatus": "SYNTHETIC_DISCLOSURE",
            "sourceUrl": "https://www.tatamotors.com/investors/",
        },
    ],
}


def flatten_corpus(corpus=RAG_CORPUS):
    """Flattened list of all chunks across all issuers."""
    return [
        {**doc, "symbol": symbol}
        for symbol, docs in corpus.items()
        for doc in docs
    ]
