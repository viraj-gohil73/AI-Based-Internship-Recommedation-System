export default function InternshipStatusBadge({ status }) {
  const normalized = (status || "").toLowerCase();

  const classes =
    normalized === "active"
      ? "bg-green-100 text-green-700"
      : normalized === "draft"
        ? "bg-amber-100 text-amber-700"
        : "bg-red-100 text-red-700";

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${classes}`}>
      {status || "Unknown"}
    </span>
  );
}
