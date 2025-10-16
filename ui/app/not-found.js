import Link from 'next/link';

export default async function NotFound() {


  return (
    <div className="flex flex-col items-center py-20 text-center px-3">
      <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
      <h2 className="text-2xl font-bold mb-4">We're sorry, but the page you were looking for doesn't exist.</h2>
      <Link href={`/`} className="btn btn-lg">
        Go back to home
      </Link>
    </div>
  );
}