import { useEffect } from "react";

export default function useAutoSave(data) {
  useEffect(() => {
    localStorage.setItem("companyProfileDraft", JSON.stringify(data));
  }, [data]);
}
