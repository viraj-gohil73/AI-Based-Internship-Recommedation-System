import { useCallback, useEffect, useRef, useState } from "react";
import { fetchResumeOptions } from "../utils/resumePicker";

export const useResumePickerModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalMode, setModalMode] = useState("select");
  const [options, setOptions] = useState([]);
  const [selectedResumeUrl, setSelectedResumeUrl] = useState("");
  const resolverRef = useRef(null);

  const resolveSelection = useCallback((value) => {
    const resolver = resolverRef.current;
    resolverRef.current = null;
    setIsOpen(false);
    setModalMode("select");
    setOptions([]);
    setSelectedResumeUrl("");
    if (resolver) resolver(value);
  }, []);

  const requestResumeSelection = useCallback(async (apiBaseUrl, token) => {
    const resumeOptions = await fetchResumeOptions(apiBaseUrl, token);
    if (!resumeOptions.length) {
      setModalMode("required");
      setOptions([]);
      setSelectedResumeUrl("");
      setIsOpen(true);
      return null;
    }

    if (resumeOptions.length === 1) {
      return resumeOptions[0];
    }

    return new Promise((resolve) => {
      setModalMode("select");
      resolverRef.current = resolve;
      setOptions(resumeOptions);
      setSelectedResumeUrl(resumeOptions[0]?.url || "");
      setIsOpen(true);
    });
  }, []);

  const confirmSelection = useCallback(() => {
    const selected =
      options.find((item) => item.url === selectedResumeUrl) || options[0] || null;
    resolveSelection(selected);
  }, [options, selectedResumeUrl, resolveSelection]);

  const cancelSelection = useCallback(() => {
    resolveSelection(null);
  }, [resolveSelection]);

  useEffect(() => {
    return () => {
      if (resolverRef.current) {
        resolverRef.current(null);
        resolverRef.current = null;
      }
    };
  }, []);

  return {
    isOpen,
    modalMode,
    options,
    selectedResumeUrl,
    setSelectedResumeUrl,
    requestResumeSelection,
    confirmSelection,
    cancelSelection,
  };
};
