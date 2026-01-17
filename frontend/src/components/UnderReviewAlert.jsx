export default function UnderReviewAlert({
  message = "Your company profile is under admin review.",
  subMessage = "Settings will be enabled after approval.",
}) {
  return (
    <div className="border border-blue-300 bg-amber-50 text-amber-800 rounded-lg p-4 text-sm flex items-start gap-2">
      <span className="mt-0.5">🔒</span>
      <div>
        <p className="font-medium">{message}</p>
        <p className="text-xs mt-1">{subMessage}</p>
      </div>
    </div>
  );
}
