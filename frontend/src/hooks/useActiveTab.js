import { useEffect, useMemo, useState } from "react";

const getHashTab = (availableTabs, fallbackTab) => {
  const hash = window.location.hash.replace("#", "");
  return availableTabs.includes(hash) ? hash : fallbackTab;
};

export function useActiveTab(navigationItems, fallbackTab = "accueil") {
  const availableTabs = useMemo(() => navigationItems.map((item) => item.id), [navigationItems]);
  const [activeTab, setActiveTab] = useState(() => getHashTab(availableTabs, fallbackTab));

  useEffect(() => {
    const handleHashChange = () => {
      setActiveTab(getHashTab(availableTabs, fallbackTab));
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [availableTabs, fallbackTab]);

  return activeTab;
}
