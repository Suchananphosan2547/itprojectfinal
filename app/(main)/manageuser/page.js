import ManageUserClientPage from "./ManageUserClientPage";

export default function ManageUserPage() {
    // Data fetching will now be handled client-side within ManageUserClientPage
    return (
        <ManageUserClientPage
            initialUsers={[]}
            initialRoles={[]}
            initialFaculties={[]}
            initialMajors={[]}
            currentUser={null}
            accessToken={null}
        />
    );
}
