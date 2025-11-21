import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import BrandCashback from './pages/BrandCashback';
import CategoryCashback from './pages/CategoryCashback';
import Campaigns from './pages/Campaigns';
import Announcements from './pages/Announcements';
import { ShoppingBag, FolderTree, Megaphone, Bell } from 'lucide-react';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<BrandCashback />} />
            <Route path="/brands" element={<BrandCashback />} />
            <Route path="/categories" element={<CategoryCashback />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/announcements" element={<Announcements />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

function NavBar() {
  const location = useLocation();

  const tabs = [
    { path: '/brands', label: 'Harca Kazan Markalar', icon: ShoppingBag },
    { path: '/categories', label: 'Harca Kazan Kategoriler', icon: FolderTree },
    { path: '/campaigns', label: 'Kampanya Oluşturma', icon: Megaphone },
    { path: '/announcements', label: 'Duyurular', icon: Bell },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">Ekomobil Campaign Tool</h1>
          </div>
          <div className="flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = location.pathname === tab.path || (tab.path === '/brands' && location.pathname === '/');
              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default App;

