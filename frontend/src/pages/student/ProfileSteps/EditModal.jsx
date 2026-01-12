export default function EditModal({ section, close }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
        
        <h2 className="text-xl font-semibold mb-4 capitalize">
          Edit {section}
        </h2>

        <textarea
          className="w-full p-3 border rounded-lg h-32 focus:ring-2 focus:ring-blue-400 outline-none"
          placeholder={`Enter your ${section} details here...`}
        />

        <div className="flex justify-end gap-3 mt-5">
          <button
            onClick={close}
            className="px-4 py-2 rounded-lg bg-gray-200"
          >
            Cancel
          </button>

          <button
            className="px-5 py-2 rounded-lg bg-blue-600 text-white"
          >
            Save
          </button>
        </div>

      </div>
    </div>
  );
}
