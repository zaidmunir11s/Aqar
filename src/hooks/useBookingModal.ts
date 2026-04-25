import { useState, useEffect, useRef } from "react";

// Module-level variable to track if modal has been shown in this session
// This is shared across all instances of the hook
let hasShownInSession = false;

/**
 * Hook to manage booking date modal visibility
 * Shows modal once per session when user first enters daily section
 */
export function useBookingModal() {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const hasInitialized = useRef<boolean>(false);

  useEffect(() => {
    // Show modal on first mount if it hasn't been shown in this session
    if (!hasInitialized.current && !hasShownInSession) {
      setModalVisible(true);
      hasShownInSession = true;
      hasInitialized.current = true;
    }
  }, []);

  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  return {
    modalVisible,
    openModal,
    closeModal,
  };
}
