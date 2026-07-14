import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "../components/Layout";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { AdminPage } from "../pages/AdminPage";
import { CommentsPage } from "../pages/CommentsPage";
import { EmployeePage } from "../pages/EmployeePage";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { RatingPage } from "../pages/RatingPage";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/employee/:id" element={<EmployeePage />} />

        <Route path="/admin" element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route index element={<AdminPage />} />
            <Route path="rating" element={<RatingPage />} />
            <Route path="comments" element={<CommentsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
