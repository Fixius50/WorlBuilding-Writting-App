import { useLanguage } from "@context/LanguageContext";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useAppStore } from "@features/App/store/useAppStore";

export const useProjectView = () => {
  const { projectName, projectId } = useOutletContext<{
    projectName: string;
    projectId: number | null;
  }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const user = useAppStore((state) => state.user);

  const baseUrl = `/local/${projectName}`;

  return {
    projectName,
    projectId,
    navigate,
    t,
    user,
    baseUrl
  };
};

