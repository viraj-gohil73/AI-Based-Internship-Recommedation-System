import { motion } from "framer-motion";

export default function StudentLoadingCard({ message = "Loading...", className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`rounded-2xl border border-blue-100 bg-white p-8 text-center ${className}`.trim()}
    >
      <div className="mx-auto flex w-fit items-center gap-3 rounded-full border border-blue-100 bg-blue-50 px-4 py-2">
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
          className="h-5 w-5 rounded-full border-2 border-blue-200 border-t-blue-600"
        />
        <span className="text-sm font-medium text-blue-700">{message}</span>
      </div>

      <div className="mt-3 flex items-center justify-center gap-1.5">
        {[0, 1, 2].map((dot) => (
          <motion.span
            key={dot}
            className="h-1.5 w-1.5 rounded-full bg-blue-500"
            animate={{ opacity: [0.35, 1, 0.35], scale: [0.9, 1.1, 0.9] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: dot * 0.15, ease: "easeInOut" }}
          />
        ))}
      </div>
    </motion.div>
  );
}
