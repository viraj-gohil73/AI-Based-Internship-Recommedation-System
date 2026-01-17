export default function VerificationBlockedModal({ open }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl max-w-md w-[90%] text-center">
        <h2 className="text-xl font-semibold text-slate-800">
          Profile Under Review
        </h2>

        <p className="mt-3 text-sm text-slate-600">
          Your company profile has been submitted.
          <br />
          You can continue after admin approval.
        </p>

        <p className="mt-4 text-xs text-slate-500">
          ⏳ Approval may take 24–48 hours
        </p>
      </div>
    </div>
  );
}
