/**
 * Standardizes billing cycles to display periods.
 * Maps 'monthly' -> 'month', 'annual' -> 'year', otherwise returns the input.
 */
export function mapBillingPeriod(billing: string): string {
    if (!billing) return 'month';
    const normalized = billing.toLowerCase();
    if (normalized === 'monthly') return 'month';
    if (normalized === 'annual') return 'year';
    return billing;
}
