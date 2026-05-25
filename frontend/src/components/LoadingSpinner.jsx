export default function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <div className="loading-screen">
      <div className="spinner" aria-hidden />
      <p>{label}</p>
    </div>
  );
}
