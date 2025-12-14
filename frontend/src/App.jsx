import AppRouter from "./router/AppRouter";
import "./index.css";
import "./styles/global.css";

function App() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <AppRouter />
    </div>
  );
}

export default App;
