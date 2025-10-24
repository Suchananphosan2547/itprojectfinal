import FiscalYearClientPage from './FiscalYearClientPage';

export const dynamic = 'force-dynamic'; // Keep if still needed for other reasons, otherwise remove

export default function BudgetPage() {
    // Data fetching will now be handled client-side within FiscalYearClientPage
    return (
        <FiscalYearClientPage initialFiscalYears={[]} accessToken={null} />
    );
}
