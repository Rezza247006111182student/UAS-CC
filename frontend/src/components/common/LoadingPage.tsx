import Spinner from '../ui/Spinner';

export default function LoadingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white gap-4">
      <Spinner size="lg" />
      <p className="text-gray-500 text-sm font-medium">CloudMart</p>
    </div>
  );
}
