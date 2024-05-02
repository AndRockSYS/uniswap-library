export function convertPrice(price: number): string {
    return price <= 1e-19
        ? (price / 1e-19).toFixed(4) + '*10⁻¹⁹'
        : price <= 1e-16
        ? (price / 1e-16).toFixed(4) + '*10⁻¹⁶'
        : price <= 1e-13
        ? (price / 1e-13).toFixed(4) + '*10⁻¹³'
        : price <= 1e-11
        ? (price / 1e-11).toFixed(4) + '*10⁻¹¹'
        : price <= 1e-9
        ? (price / 1e-9).toFixed(4) + '*10⁻⁹'
        : price <= 1e-6
        ? (price / 1e-6).toFixed(4) + '*10⁻⁶'
        : price <= 1e-3
        ? (price / 1e-3).toFixed(4) + '*10⁻³'
        : price.toFixed(4);
}

export function convertAmount(amount: number | bigint): string {
    amount = Number(amount);

    return amount >= 1e9
        ? (amount / 1e9).toFixed(2) + 'B'
        : amount >= 1e6
        ? (amount / 1e6).toFixed(2) + 'M'
        : amount >= 1e3
        ? (amount / 1e3).toFixed(2) + 'K'
        : amount.toFixed(4);
}
