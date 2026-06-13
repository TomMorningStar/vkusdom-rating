import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "../components/Layout";
import { EmployeePage } from "../pages/EmployeePage";
import { HomePage } from "../pages/HomePage";
import { RatingPage } from "../pages/RatingPage";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="employee/:id" element={<EmployeePage />} />
          <Route path="rating" element={<RatingPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
