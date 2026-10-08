/**
 * Standardizes billing cycles to display periods.
 * Maps "monthly" -> "month", "annual" -> "year", otherwise returns the input.
 */
export function mapBillingPeriod(billing: string): string {
    if (!billing) return "month";
    const normalized = billing.toLowerCase();
    if (normalized === "monthly") return "month";
    if (normalized === "annual") return "year";
    return billing;
}

/**
 * Humanizes raw billing model strings into user-friendly English display names.
 * e.g., "one_time" | "one-time" -> "Single Payment"
 *       "monthly" -> "Monthly"
 *       "annual" | "yearly" -> "Annual"
 *       "quarterly" -> "Quarterly"
 *       "semi_annual" -> "Semi-Annual"
 *       "usage" | "pay_as_you_go" -> "Usage Based"
 */
export function humanizeBillingModel(billing?: string | null): string {
    if (!billing) return "Subscription";
    const normalized = billing.toLowerCase().trim().replace(/[-_]/g, " ");
    switch (normalized) {
        case "one time":
        case "onetime":
        case "single payment":
        case "one time payment":
            return "Single Payment";
        case "monthly":
            return "Monthly";
        case "annual":
        case "yearly":
            return "Annual";
        case "quarterly":
            return "Quarterly";
        case "semi annual":
        case "semiannual":
            return "Semi-Annual";
        case "weekly":
            return "Weekly";
        case "daily":
            return "Daily";
        case "usage":
        case "by usage":
        case "pay as you go":
            return "Usage Based";
        default:
            return normalized
                .split(" ")
                .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" ");
    }
}

/**
 * Returns formatted period suffix for prices.
 * e.g., "one_time" -> ""
 *       "monthly" -> "/mo"
 *       "annual" -> "/yr"
 */
export function formatBillingPeriod(billing?: string | null): string {
    if (!billing) return "/mo";
    const normalized = billing.toLowerCase().trim().replace(/[-_]/g, " ");
    if (normalized === "one time" || normalized === "onetime" || normalized === "single payment" || normalized === "one time payment") {
        return "";
    }
    if (normalized === "monthly" || normalized === "month") return "/mo";
    if (normalized === "annual" || normalized === "yearly" || normalized === "year") return "/yr";
    if (normalized === "quarterly") return "/quarter";
    if (normalized === "weekly") return "/wk";
    if (normalized === "daily") return "/day";
    return `/${normalized}`;
}
