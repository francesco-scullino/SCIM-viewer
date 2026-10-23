import { Routes, Route } from 'react-router-dom';
import { NotFoundPage } from './pages/NotFoundPage';
import { Layout } from './components/Layout';
import { UsersGroupsPage } from './pages/UsersGroupsPage';
import { ApplicationsPage } from './pages/ApplicationsPage';
import { EnvironmentsPage } from './pages/EnvironmentsPage';
import { ToastProvider } from './components/ToastContext';
import { SelectionProvider } from './components/SelectionContext';

export function App() {
  return (
    <ToastProvider>
      <SelectionProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<UsersGroupsPage />} />
            <Route path="applications" element={<ApplicationsPage />} />
            <Route path="environments" element={<EnvironmentsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </SelectionProvider>
    </ToastProvider>
  );
}
