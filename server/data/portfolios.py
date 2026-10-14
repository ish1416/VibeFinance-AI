"""
Seeded investor profiles, portfolios and reference quotes.
Mirrors src/data/portfolios.js.
"""

from server.data.stocks import STOCKS_DATA

SECTOR_BY_SYMBOL = {
    "RELIANCE": "Energy",
    "INFY": "IT",
    "HDFCBANK": "Banking",
    "TATAMOTORS": "Auto",
    "TCS": "IT",
    "WIPRO": "IT",
    "SUNPHARMA": "Pharma",
    "ITC": "FMCG",
    "NTPC": "Power",
}

REFERENCE_QUOTES = {
    "TCS": {"name": "Tata Consultancy Services Ltd", "price": 3900.0, "beta": 0.79, "tracked": False},
    "WIPRO": {"name": "Wipro Limited", "price": 245.0, "beta": 1.05, "tracked": False},
    "SUNPHARMA": {"name": "Sun Pharmaceutical Industries Ltd", "price": 1450.0, "beta": 0.71, "tracked": False},
    "ITC": {"name": "ITC Limited", "price": 430.0, "beta": 0.62, "tracked": False},
    "NTPC": {"name": "NTPC Limited", "price": 410.0, "beta": 0.95, "tracked": False},
}


def price_for(symbol, stocks_data=STOCKS_DATA):
    if symbol in stocks_data:
        s = stocks_data[symbol]
        return {
            "symbol": s["symbol"],
            "name": s["name"],
            "sector": SECTOR_BY_SYMBOL.get(symbol, s["sector"]),
            "price": s["price"],
            "beta": s["beta"],
            "tracked": True,
        }
    ref = REFERENCE_QUOTES.get(symbol)
    if ref:
        return {
            "symbol": symbol,
            "name": ref["name"],
            "sector": SECTOR_BY_SYMBOL.get(symbol, "Other"),
            "price": ref["price"],
            "beta": ref["beta"],
            "tracked": False,
        }
    return {
        "symbol": symbol,
        "name": symbol,
        "sector": SECTOR_BY_SYMBOL.get(symbol, "Other"),
        "price": 1000.0,
        "beta": 1.0,
        "tracked": False,
    }


USERS = [
    {
        "id": "aarav",
        "name": "Aarav Mehta",
        "initials": "AM",
        "profileId": "BALANCED",
        "riskAppetite": 6,
        "subtitle": "Balanced Growth · 6 holdings",
        "cashDebt": 0,
        "watchlist": ["RELIANCE", "TATAMOTORS"],
        "holdings": [
            {"symbol": "RELIANCE", "qty": 12, "avgPrice": 2790.0},
            {"symbol": "INFY", "qty": 25, "avgPrice": 1720.0},
            {"symbol": "TCS", "qty": 6, "avgPrice": 3620.0},
            {"symbol": "HDFCBANK", "qty": 40, "avgPrice": 1610.0},
            {"symbol": "TATAMOTORS", "qty": 60, "avgPrice": 842.0},
            {"symbol": "SUNPHARMA", "qty": 20, "avgPrice": 1385.0},
        ],
        "decisions": [
            {"ts": "2026-09-18", "symbol": "INFY", "profileId": "BALANCED", "action": "accepted", "sizeRatio": 1.0},
            {"ts": "2026-09-24", "symbol": "HDFCBANK", "profileId": "BALANCED", "action": "accepted", "sizeRatio": 0.85},
            {"ts": "2026-09-30", "symbol": "TATAMOTORS", "profileId": "BALANCED", "action": "accepted", "sizeRatio": 1.0},
            {"ts": "2026-10-06", "symbol": "RELIANCE", "profileId": "BALANCED", "action": "accepted", "sizeRatio": 0.6},
            {"ts": "2026-10-11", "symbol": "INFY", "profileId": "BALANCED", "action": "ignored", "sizeRatio": 0.0},
        ],
    },
    {
        "id": "meera",
        "name": "Meera Joshi",
        "initials": "MJ",
        "profileId": "CONSERVATIVE",
        "riskAppetite": 3,
        "subtitle": "Capital Preservation · 5 holdings + debt",
        "cashDebt": 120000,
        "watchlist": ["HDFCBANK"],
        "holdings": [
            {"symbol": "HDFCBANK", "qty": 60, "avgPrice": 1605.0},
            {"symbol": "TCS", "qty": 15, "avgPrice": 3710.0},
            {"symbol": "ITC", "qty": 100, "avgPrice": 412.0},
            {"symbol": "NTPC", "qty": 80, "avgPrice": 380.0},
            {"symbol": "SUNPHARMA", "qty": 30, "avgPrice": 1410.0},
        ],
        "decisions": [
            {"ts": "2026-09-12", "symbol": "HDFCBANK", "profileId": "CONSERVATIVE", "action": "accepted", "sizeRatio": 1.0},
            {"ts": "2026-09-20", "symbol": "TATAMOTORS", "profileId": "CONSERVATIVE", "action": "ignored", "sizeRatio": 0.0},
            {"ts": "2026-10-02", "symbol": "INFY", "profileId": "CONSERVATIVE", "action": "early_exit", "sizeRatio": 0.5},
            {"ts": "2026-10-08", "symbol": "RELIANCE", "profileId": "CONSERVATIVE", "action": "skipped", "sizeRatio": 0.0},
        ],
    },
    {
        "id": "rohan",
        "name": "Rohan Verma",
        "initials": "RV",
        "profileId": "AGGRESSIVE",
        "riskAppetite": 9,
        "subtitle": "High Beta Breakout · 4 high-beta names",
        "cashDebt": 0,
        "watchlist": ["INFY", "TATAMOTORS", "RELIANCE"],
        "holdings": [
            {"symbol": "TATAMOTORS", "qty": 150, "avgPrice": 880.0},
            {"symbol": "RELIANCE", "qty": 35, "avgPrice": 2850.0},
            {"symbol": "INFY", "qty": 45, "avgPrice": 1780.0},
            {"symbol": "WIPRO", "qty": 120, "avgPrice": 235.0},
        ],
        "decisions": [
            {"ts": "2026-09-15", "symbol": "TATAMOTORS", "profileId": "AGGRESSIVE", "action": "accepted", "sizeRatio": 1.8},
            {"ts": "2026-09-22", "symbol": "INFY", "profileId": "AGGRESSIVE", "action": "accepted", "sizeRatio": 2.0},
            {"ts": "2026-09-29", "symbol": "RELIANCE", "profileId": "AGGRESSIVE", "action": "accepted", "sizeRatio": 1.5},
            {"ts": "2026-10-05", "symbol": "HDFCBANK", "profileId": "AGGRESSIVE", "action": "ignored", "sizeRatio": 0.0},
            {"ts": "2026-10-12", "symbol": "TATAMOTORS", "profileId": "AGGRESSIVE", "action": "accepted", "sizeRatio": 2.2},
        ],
    },
]


def get_user(user_id):
    for u in USERS:
        if u["id"] == user_id:
            return u
    return USERS[0]
