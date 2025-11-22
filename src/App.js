import './App.css';
import Login from "../public/dist/js/login.js";
import Dashboard from "../public/dist/js/pages/dashboard.js";
function App() {
  useEffect(() => {
    // Dynamically load jQuery-based scripts after React mounts
    import("../public/dist/js/login.js").catch((err) =>
      console.warn("login.js not found or failed to load:", err)
    );
    import("../public/dist/js/pages/dashboard.js").catch((err) =>
      console.warn("dashboard.js not found or failed to load:", err)
    );
  }, []);
  return (
    <div className="wrapper">
      <p>
        Base URL: {process.env.REACT_APP_BASE_URL}
        API Key: {process.env.REACT_APP_API_KEY}
      </p>
      {/* Your app content will be rendered by React Router */}
    </div>
  );
}

export default App;