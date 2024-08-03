import { Routes, Route, Outlet } from "react-router-dom";
import SignInAuthPage from "./pages/Auth/SignInAuth";
import SignUpAuthPage from "./pages/Auth/SignUpAuth";
import ProtectedRouter from "./routes/ProtectedRouter";
import { HomePage } from "./pages/Home/Home";
import UserSettings from "./pages/User/Settings";
import { OutletLayout } from "./common/OutletLayout";
import { TestPage } from "./pages/Tests/Test";
import TestDetailsPage from "./pages/Tests/Details";
import QuizPage from "./pages/Quiz/Quiz";
import Result from "./pages/Results/Result";
import LeaderBoard from "./pages/LeaderBoard/LeaderBoard";

function App() {
  return (
    <Routes>
      <Route path="/" index element={<h1>Hello App</h1>} />
      <Route path="/auth/login" element={<SignInAuthPage />} />
      <Route path="/auth/register" element={<SignUpAuthPage />} />
      <Route
        path="/user"
        element={
          <OutletLayout>
            <ProtectedRouter>
              <Outlet />
            </ProtectedRouter>
          </OutletLayout>
        }
      >
        <Route path="dashboard" element={<HomePage />} />
        <Route path="profile" element={<UserSettings />} />
        <Route path="tests" element={<TestPage />} />
        <Route path="leaderboard" element={<LeaderBoard />} />
        <Route path="analytics" element={<h1>Analytics Page</h1>} />
        <Route path="tests/quiz" element={<TestDetailsPage />} />
      </Route>
      <Route path="/quiz" element={<QuizPage />}></Route>
      <Route
        path="/result/:id"
        element={
          <ProtectedRouter>
            <Result />
          </ProtectedRouter>
        }
      />
      <Route
        path="*"
        element={<h1 className="text-xl font-bold">404 Page Not Found</h1>}
      />
    </Routes>
  );
}

export default App;
