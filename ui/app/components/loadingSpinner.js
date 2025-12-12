// components/LoadingSpinner.js
export default function LoadingSpinner() {
  return (
      <div className="flex justify-center items-center min-h-screen py-5">
        <div className="w-full max-w-4xl flex items-center justify-center">
          <span className="loading loading-spinner loading-lg" />
        </div>
      </div>
  );
}
