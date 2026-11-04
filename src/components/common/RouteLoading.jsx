import { useLanguage } from "../../context/LanguageContext";
import "./RouteLoading.css";

function RouteLoading() {
  const { t } = useLanguage();

  return (
    <div className="route-loading-container" role="status" aria-live="polite">
      <div className="route-loading-spinner" />
      <span className="route-loading-text">{t("loading")}</span>
    </div>
  );
}

export default RouteLoading;
