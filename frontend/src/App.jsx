import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PersonalList from './pages/PersonalList';
import PersonalNew from './pages/PersonalNew';
import PersonalSearch from './pages/PersonalSearch';
import PersonalEdit from './pages/PersonalEdit';
import PersonalDetail from './pages/PersonalDetail';
import './styles/index.css';

import { ThemeProvider } from './context/ThemeContext';
import { ThemeToggle } from './components/common/ThemeToggle';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <AuthProvider>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/personal"
              element={
                <ProtectedRoute>
                  <PersonalList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/personal/nuevo"
              element={
                <ProtectedRoute>
                  <PersonalNew />
                </ProtectedRoute>
              }
            />
            <Route
              path="/personal/agregar"
              element={
                <ProtectedRoute>
                  <PersonalNew />
                </ProtectedRoute>
              }
            />
            <Route
              path="/personal/buscar"
              element={
                <ProtectedRoute>
                  <PersonalSearch />
                </ProtectedRoute>
              }
            />
            <Route
              path="/personal/editar/:id"
              element={
                <ProtectedRoute>
                  <PersonalEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/personal/:id"
              element={
                <ProtectedRoute>
                  <PersonalDetail />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          <ThemeToggle />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
