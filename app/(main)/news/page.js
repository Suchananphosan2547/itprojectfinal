import NewsClientPage from "./NewsClientPage";

export default function NewsPage() {
    // Data fetching will now be handled client-side within NewsClientPage
    return (
        <NewsClientPage 
            disableCrud={false}
        />
    );
}