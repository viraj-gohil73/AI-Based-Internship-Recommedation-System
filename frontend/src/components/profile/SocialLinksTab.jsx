import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Save,
  ExternalLink,
  Link as LinkIcon,
  Linkedin,
  Github,
  Twitter,
  Instagram,
  Youtube,
  Globe,
  Code,
} from "lucide-react";
import toast from "react-hot-toast";
import Input from "../profile/shared/Input";
import Select from "../profile/shared/Select";
import StudentLoadingCard from "../common/StudentLoadingCard";

const API_BASE_URL = "http://localhost:5000";

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
  Instagram,
  YouTube: Youtube,
  Portfolio: Globe,
  LeetCode: Code,
  CodeChef: Code,
  HackerRank: Code,
  Medium: Globe,
  "Dev.to": Globe,
};

const normalizeSocialLink = (item = {}) => ({
  platform: item.platform || "",
  url: item.url || "",
  username: item.username || "",
});

function normalizeUrl(url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

function normalizeUsername(username) {
  if (!username) return "";
  return username.replace(/^@+/, "");
}

function getDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export default function SocialLinksTab() {
  const [socials, setSocials] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState(EMPTY_SOCIAL);
  const [loadingLinks, setLoadingLinks] = useState(true);
  const [savingLinks, setSavingLinks] = useState(false);

  const isFormVisible = editingIndex !== null;
  const isEditMode = editingIndex !== null && editingIndex < socials.length;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoadingLinks(false);
      return;
    }

    fetch(`${API_BASE_URL}/api/student/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data?.message || "Failed to load social links");
        const items = Array.isArray(data?.profile?.socialLinks) ? data.profile.socialLinks : [];
        setSocials(items.map((item) => normalizeSocialLink(item)));
      })
      .catch((error) => {
        toast.error(error.message || "Failed to load social links");
      })
      .finally(() => {
        setLoadingLinks(false);
      });
  }, []);

  const saveSocialLinksToDb = async (nextSocials, successMessage) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Please login again");

    try {
      setSavingLinks(true);
      const response = await fetch(`${API_BASE_URL}/api/student/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ socialLinks: nextSocials }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Failed to save social links");

      const apiLinks = Array.isArray(data?.profile?.socialLinks)
        ? data.profile.socialLinks.map((item) => normalizeSocialLink(item))
        : nextSocials.map((item) => normalizeSocialLink(item));

      setSocials(apiLinks);
      toast.success(successMessage);
    } finally {
      setSavingLinks(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddNew = () => {
    setFormData(EMPTY_SOCIAL);
    setEditingIndex(socials.length);
  };

  const handleSave = async () => {
    if (!formData.platform || !formData.url.trim()) {
      toast.error("Platform and URL are required");
      return;
    }

    const payload = normalizeSocialLink({
      ...formData,
      url: normalizeUrl(formData.url.trim()),
      username: normalizeUsername(formData.username.trim()),
    });

    const nextSocials =
      editingIndex === socials.length
        ? [...socials, payload]
        : socials.map((item, index) => (index === editingIndex ? payload : item));

    try {
      await saveSocialLinksToDb(nextSocials, editingIndex === socials.length ? "Social link added" : "Social link updated");
      setFormData(EMPTY_SOCIAL);
      setEditingIndex(null);
    } catch (error) {
      toast.error(error.message || "Unable to save social link");
    }
  };

  const handleEdit = (index) => {
    setFormData(normalizeSocialLink(socials[index]));
    setEditingIndex(index);
  };

  const handleDelete = async (index) => {
    const nextSocials = socials.filter((_, i) => i !== index);
    try {
      await saveSocialLinksToDb(nextSocials, "Social link deleted");
    } catch (error) {
      toast.error(error.message || "Unable to delete social link");
    }
  };

  const handleCancel = () => {
    setFormData(EMPTY_SOCIAL);
    setEditingIndex(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Social Links</h2>
          <p className="text-sm text-slate-500 mt-1">Add professional profiles so recruiters can validate your work faster.</p>
        </div>

        {!isFormVisible && (
          <button
            onClick={handleAddNew}
            disabled={loadingLinks || savingLinks}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-sm shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Plus size={16} /> Add Social Link
          </button>
        )}
      </div>

      <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
        <LinkIcon size={14} className="text-blue-600" />
        {socials.length} link{socials.length !== 1 ? "s" : ""} added
      </div>

      {loadingLinks && !isFormVisible && <StudentLoadingCard message="Loading social links..." className="sm:p-10" />}

      {!loadingLinks && socials.length === 0 && !isFormVisible && (
        <div className="rounded-2xl border border-dashed border-blue-200 bg-gradient-to-b from-blue-50/70 to-white p-8 sm:p-10 text-center space-y-4">
          <div className="mx-auto w-14 h-14 rounded-full bg-white ring-4 ring-blue-100 flex items-center justify-center text-blue-600">
            <LinkIcon size={24} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">No social links yet</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Add LinkedIn, GitHub, portfolio, or coding profiles to improve visibility.
            </p>
            <button
              onClick={handleAddNew}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-blue-600 text-blue-700 hover:bg-blue-50 text-sm"
            >
              <Plus size={16} /> Add your first link
            </button>
          </div>
        </div>
      )}

      {isFormVisible && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 sm:p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-semibold text-slate-800">{isEditMode ? "Edit Social Link" : "Add Social Link"}</h3>
            <p className="text-sm text-slate-500 mt-1">Keep URLs public so recruiters can access them.</p>
          </div>

          <Select label="Social Platform" value={formData.platform} options={SOCIAL_OPTIONS} onChange={(val) => handleChange("platform", val)} />

          <Input
            label="Profile URL"
            placeholder="https://example.com/username"
            value={formData.url}
            onChange={(e) => handleChange("url", e.target.value)}
          />

          <Input
            label="Username (optional)"
            placeholder="@username"
            value={formData.username}
            onChange={(e) => handleChange("username", e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={handleCancel}
              disabled={savingLinks}
              className="px-4 py-2 text-sm border rounded-lg hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={savingLinks}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Save size={16} /> {savingLinks ? "Saving..." : isEditMode ? "Update Link" : "Save Link"}
            </button>
          </div>
        </div>
      )}

      {!isFormVisible && socials.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {socials.map((item, index) => {
            const Icon = SOCIAL_ICON_MAP[item.platform] || LinkIcon;
            return (
              <div
                key={index}
                className="group rounded-2xl border border-slate-200 bg-white p-4 hover:border-blue-300 hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="h-1 w-14 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 mb-4" />

                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 ring-1 ring-blue-100">
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-800 truncate">{item.platform}</h3>
                      {item.username && <p className="text-xs text-slate-500 truncate">@{item.username}</p>}
                      <p className="text-xs text-slate-400 truncate">{getDomain(item.url)}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-md border border-slate-200 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 cursor-pointer text-slate-500"
                      title="Open"
                    >
                      <ExternalLink size={14} />
                    </a>

                    <button
                      onClick={() => handleEdit(index)}
                      disabled={savingLinks}
                      className="p-1.5 rounded-md border border-slate-200 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 cursor-pointer text-slate-500 disabled:opacity-60 disabled:cursor-not-allowed"
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </button>

                    <button
                      onClick={() => handleDelete(index)}
                      disabled={savingLinks}
                      className="p-1.5 rounded-md border border-slate-200 hover:border-red-500 hover:bg-red-50 hover:text-red-600 cursor-pointer text-slate-500 disabled:opacity-60 disabled:cursor-not-allowed"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <p title={item.url} className="mt-4 text-xs text-slate-400 break-all">
                  {item.url}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


