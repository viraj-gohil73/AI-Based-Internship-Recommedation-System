import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Save,
  Link as LinkIcon,
  Linkedin,
  Github,
  Twitter,
  Instagram,
  Youtube,
  Globe,
  Code,
} from "lucide-react";

import Input from "../profile/shared/Input";
import Select from "../profile/shared/Select";

/* ================= CONSTANTS ================= */

const EMPTY_SOCIAL = {
  platform: "",
  url: "",
  username: "",
};

const SOCIAL_OPTIONS = [
  "LinkedIn",
  "GitHub",
  "Portfolio",
  "Twitter / X",
  "LeetCode",
  "CodeChef",
  "HackerRank",
  "Medium",
  "Dev.to",
  "Instagram",
  "YouTube",
];

const SOCIAL_ICON_MAP = {
  LinkedIn: Linkedin,
  GitHub: Github,
  "Twitter / X": Twitter,
  Instagram: Instagram,
  YouTube: Youtube,
  Portfolio: Globe,
  LeetCode: Code,
  CodeChef: Code,
  HackerRank: Code,
  Medium: Globe,
  "Dev.to": Globe,
};

/* ================= COMPONENT ================= */

export default function SocialLinksTab() {
  const [socials, setSocials] = useState([
    { platform: "LinkedIn", url: "https://linkedin.com/in/viraj", username: "@weekendcoder" },
    { platform: "GitHub", url: "https://github.com/viraj" },
    
  ]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState({
    platform: "leetcode",
    url: "viraj",
    username: "@weekendcoder",
  });

  const isFormVisible = editingIndex !== null;

  /* ================= HANDLERS ================= */

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleAddNew = () => {
    setFormData(EMPTY_SOCIAL);
    setEditingIndex(socials.length);
  };

  const handleSave = () => {
    if (!formData.platform || !formData.url) return;

    if (editingIndex === socials.length) {
      setSocials([...socials, formData]);
    } else {
      const updated = [...socials];
      updated[editingIndex] = formData;
      setSocials(updated);
    }

    setFormData(EMPTY_SOCIAL);
    setEditingIndex(null);

    // TODO: POST / PUT API
  };

  const handleEdit = (index) => {
    setFormData(socials[index]);
    setEditingIndex(index);
  };

  const handleDelete = (index) => {
    setSocials(socials.filter((_, i) => i !== index));
    // TODO: DELETE API
  };

  /* ================= UI ================= */

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Social Links</h2>

        {!isFormVisible && (
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2
            border border-blue-600 text-blue-600 rounded-lg
            hover:bg-blue-50 text-sm"
          >
            <Plus size={16} /> Add Social Link
          </button>
        )}
      </div>

      {/* EMPTY STATE */}
      {socials.length === 0 && !isFormVisible && (
        <div
          className="bg-white border border-dashed rounded-xl
          p-8 sm:p-10 text-center space-y-4"
        >
          <div
            className="mx-auto w-14 h-14 rounded-full bg-blue-50
            flex items-center justify-center text-blue-600"
          >
            <LinkIcon size={24} />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-800">
              No social links added
            </h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Add your LinkedIn, GitHub, portfolio, or coding profiles
              to improve your visibility.
            </p>
          </div>
        </div>
      )}

      {/* FORM */}
      {isFormVisible && (
        <div className="bg-white rounded-xl shadow p-4 sm:p-6 space-y-4">

          <Select
            label="Social Platform"
            value={formData.platform}
            options={SOCIAL_OPTIONS}
            onChange={(val) => handleChange("platform", val)}
          />

          <Input
            label="Profile URL"
            placeholder="https://"
            value={formData.url}
            onChange={(e) => handleChange("url", e.target.value)}
          />

          <Input
            label="Username (optional)"
            placeholder="@username"
            value={formData.username}
            onChange={(e) => handleChange("username", e.target.value)}
          />

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setEditingIndex(null)}
              className="px-4 py-2 text-sm border rounded-lg"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2
              bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              <Save size={16} /> Save Link
            </button>
          </div>
        </div>
      )}

      {/* CARD GRID */}
      {!isFormVisible && socials.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {socials.map((item, index) => {
            const Icon =
              SOCIAL_ICON_MAP[item.platform] || LinkIcon;

            return (
              <div
                key={index}
                className="bg-white rounded-xl border border-slate-300 hover:border-blue-500
                p-4 hover:shadow-md transition
                flex flex-col justify-between"
              >
                {/* TOP */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg bg-blue-50
                      flex items-center justify-center text-blue-600"
                    >
                      <Icon size={18} />
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-800 truncate">
                        {item.platform}
                      </h3>

                      {item.username && (
                        <p className="text-xs text-slate-500 w-32  truncate">
                          @{item.username}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(index)}
                      className="p-1.5 rounded-md border
                      border-blue-500 cursor-pointer
                      text-blue-600"
                    >
                      <Pencil size={14} />
                    </button>

                    <button
                      onClick={() => handleDelete(index)}
                      className="p-1.5 rounded-md border
                      border-red-500 cursor-pointer
                      text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* LINK */}
                <a
  href={item.url}
  target="_blank"
  rel="noreferrer"
  title={item.url}
  className="
    mt-3 text-sm text-blue-600
    inline-flex px-2 py-1
    hover:underline
    w-fit
  "
>
  {item.url}
</a>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
