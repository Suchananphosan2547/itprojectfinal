import NewsClientPage from '../news/NewsClientPage';

export default function HomePage() {
  // Access token will be handled client-side within NewsClientPage
  // or passed from a client-side context if available.
  // For now, we pass null as it's no longer fetched server-side here.
  return (
    <NewsClientPage disableCrud={true} />
  );
}