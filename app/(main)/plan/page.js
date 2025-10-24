import PlanClientPage from "./PlanClientPage";

export default function PlanPage() {
    // Data fetching will now be handled client-side within PlanClientPage
    return (
        <PlanClientPage initialPlans={[]} accessToken={null} />
    );
}
