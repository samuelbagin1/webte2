import { AppRoutes } from "@/router/routes";
import { CookieConsent } from "@/components/common/CookieConsent";

function App() {
  return (
    <>
      <AppRoutes />
      <CookieConsent />
    </>
  );
}

export default App;
