// Transaction Loading Module
document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('transaction-body');
    
    // We fetch based on a hardcoded account context for the frontend, 
    // but the backend handles the mapping. 
    // Parameter hidden from URL but visible in Network Tab.
    const fetchTransactions = async () => {
        try {
            // Added header to ensure server provides JSON instead of HTML template
            const response = await fetch('/transactions?account=guest', {
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            });
            const result = await response.json();
            
            if (result.error) {
                tableBody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:red;">${result.error}</td></tr>`;
                return;
            }

            const transactions = result.data;

            tableBody.innerHTML = transactions.map(tx => `
                <tr>
                    <td>
                        <div style="font-weight:600">${tx.description}</div>
                        <div style="font-size:0.85rem; color:var(--text-muted)">${tx.settlement_date} | ${tx.id}</div>
                    </td>
                    <td class="${tx.value < 0 ? 'amount-negative' : 'amount-positive'}">
                        ${tx.value < 0 ? '' : '+'}$${Math.abs(tx.value).toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </td>
                    <td style="text-align:right">
                        <span style="font-size:0.75rem; background:var(--glass); padding:0.25rem 0.5rem; border-radius:4px; border:1px solid var(--glass-border)">SETTLED</span>
                    </td>
                </tr>
            `).join('');

        } catch (err) {
            console.error("Failed to load transactions", err);
        }
    };

    fetchTransactions();
});
