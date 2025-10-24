import ManagerClientPage from "./ManagerClientPage";

export default function ManagerManagementPage() {
    // Data fetching will now be handled client-side within ManagerClientPage
    return (
        <ManagerClientPage 
            initialManagers={[]}
            initialFaculties={[]}
            initialMajors={[]}
            accessToken={null}
        />
    );
}