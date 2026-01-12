export default function ProgressBar({ progress }) {
  return (
    <div className="px-6 pt-4">
      <p className="text-sm mb-1">Profile Completion: {progress}%</p>
      <div className="h-2 bg-gray-200 rounded">
        <div className="h-2 bg-blue-600 rounded" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
