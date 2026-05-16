from datetime import datetime, timedelta
from .database import transactions_collection


# =========================
# DATE RANGE HELPER
# =========================
def get_date_range(range_type: str):
    now = datetime.utcnow()

    if range_type == "weekly":
        start = now - timedelta(days=7)
    elif range_type == "monthly":
        start = now - timedelta(days=30)
    else:
        raise ValueError("Invalid range")

    return start, now


# =========================
# SUMMARY GENERATOR (MONGO)
# =========================
async def generate_summary(range_type: str, user_id: str):
    start, end = get_date_range(range_type)

    pipeline = [
        {
            "$match": {
                "user_id": user_id,
                "date": {"$gte": start, "$lte": end}
            }
        },
        {
            "$group": {
                "_id": "$type",
                "total": {"$sum": "$amount"}
            }
        }
    ]

    grouped = await transactions_collection.aggregate(pipeline).to_list(length=None)

    total_income = 0
    total_expense = 0

    for item in grouped:
        if item["_id"] == "income":
            total_income = item["total"]
        elif item["_id"] == "expense":
            total_expense = item["total"]

    # CATEGORY BREAKDOWN (expenses only)
    category_pipeline = [
        {
            "$match": {
                "user_id": user_id,
                "type": "expense",
                "date": {"$gte": start, "$lte": end}
            }
        },
        {
            "$group": {
                "_id": "$category",
                "total": {"$sum": "$amount"}
            }
        }
    ]

    category_data = await transactions_collection.aggregate(category_pipeline).to_list(length=None)

    category_totals = {}
    for item in category_data:
        category_name = item["_id"] or "uncategorized"
        category_totals[category_name] = item["total"]

    total_expense_safe = total_expense or 0

    category_percentages = {
        cat: (amt / total_expense_safe * 100) if total_expense_safe else 0
        for cat, amt in category_totals.items()
    }

    return {
        "range": range_type,
        "total_income": total_income,
        "total_expense": total_expense,
        "balance": total_income - total_expense,
        "category_breakdown": category_percentages
    }
