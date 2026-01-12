export default function CompanyInfoEdit({ data, setData, onCancel }) {
  const update = (k, v) => setData(p => ({ ...p, [k]: v }));

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      <h2 className="text-xl font-semibold">Edit Company Information</h2>

      <div className="bg-white border rounded-lg p-5 space-y-4">
        <input className="input" placeholder="Company Name"
          value={data.name}
          onChange={e=>update("name",e.target.value)}
        />

        <input className="input" placeholder="Tagline"
          value={data.tagline}
          onChange={e=>update("tagline",e.target.value)}
        />

        <div className="grid md:grid-cols-2 gap-4">
          <input className="input" placeholder="Industry"
            value={data.industry}
            onChange={e=>update("industry",e.target.value)}
          />
          <input className="input" placeholder="Company Size"
            value={data.size}
            onChange={e=>update("size",e.target.value)}
          />
        </div>

        <textarea className="input" rows="4" placeholder="About Company"
          value={data.about}
          onChange={e=>update("about",e.target.value)}
        />
      </div>

      <div className="flex justify-end gap-3">
        <button onClick={onCancel}
          className="px-4 py-2 border rounded-lg text-sm">
          Cancel
        </button>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
          Save Changes
        </button>
      </div>
    </div>
  );
}
