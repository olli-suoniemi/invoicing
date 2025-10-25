// components/LoadingSpinner.js
export default function LoadingSpinner() {
  return (
    <div className="fixed inset-0 grid place-items-center">
      <div className="w-10 h-10 border-4 border-t-4 border-t-neutral border-neutral-content rounded-full animate-spin" />
    </div>
  );
}
