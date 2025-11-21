import { useState, useEffect } from 'react';
import api from '../api/client';
import { Plus, Edit } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  code: string;
  status: string;
}

interface CategoryOffer {
  id: number;
  category_id: number;
  integrator_id: number;
  integrator_name: string;
  integrator_code: string;
  ekomobil_rate: number;
  user_rate: number;
  is_active: boolean;
}

interface Integrator {
  id: number;
  name: string;
  code: string;
  is_active: boolean;
}

export default function CategoryCashback() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryOffers, setCategoryOffers] = useState<Record<number, CategoryOffer[]>>({});
  const [integrators, setIntegrators] = useState<Integrator[]>([]);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingCashbackId, setEditingCashbackId] = useState<number | null>(null);
  const [editingCashbackValue, setEditingCashbackValue] = useState<number>(0);
  const [editingIntegratorId, setEditingIntegratorId] = useState<number | null>(null);

  const [filters, setFilters] = useState({
    name: '',
    status: '',
  });

  const [categoryForm, setCategoryForm] = useState({ name: '', code: '', status: 'ACTIVE' });

  useEffect(() => {
    loadCategories();
    loadIntegrators();
  }, []);

  useEffect(() => {
    if (Array.isArray(categories) && categories.length > 0) {
      categories.forEach(category => {
        if (category && category.id) {
          loadOffers(category.id);
        }
      });
    }
  }, [categories]);

  useEffect(() => {
    loadCategories();
  }, [filters.name, filters.status]);

  const loadCategories = async () => {
    try {
      const response = await api.get('/categories');
      let filtered = Array.isArray(response.data) ? response.data : [];
      
      if (filters.name && Array.isArray(filtered)) {
        filtered = filtered.filter((c: Category) => 
          c.name?.toLowerCase().includes(filters.name.toLowerCase())
        );
      }
      
      if (filters.status && Array.isArray(filtered)) {
        filtered = filtered.filter((c: Category) => c.status === filters.status);
      }
      
      setCategories(Array.isArray(filtered) ? filtered : []);
    } catch (error) {
      console.error('Failed to load categories', error);
      setCategories([]);
    }
  };

  const loadIntegrators = async () => {
    try {
      const response = await api.get('/integrators');
      const data = Array.isArray(response.data) ? response.data : [];
      setIntegrators(data.filter((i: Integrator) => i.is_active));
    } catch (error) {
      console.error('Failed to load integrators', error);
      setIntegrators([]);
    }
  };

  const loadOffers = async (categoryId: number) => {
    try {
      const response = await api.get(`/categories/${categoryId}/offers`);
      setCategoryOffers(prev => ({
        ...prev,
        [categoryId]: Array.isArray(response.data) ? response.data : []
      }));
    } catch (error) {
      console.error('Failed to load offers', error);
      setCategoryOffers(prev => ({
        ...prev,
        [categoryId]: []
      }));
    }
  };

  const getCategoryOffer = (categoryId: number, integratorId: number): CategoryOffer | null => {
    const offers = categoryOffers[categoryId] || [];
    return offers.find(o => o.integrator_id === integratorId) || null;
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, categoryForm);
      } else {
        await api.post('/categories', categoryForm);
      }
      setShowCategoryForm(false);
      setEditingCategory(null);
      setCategoryForm({ name: '', code: '', status: 'ACTIVE' });
      loadCategories();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Kategori kaydedilemedi');
    }
  };

  const handleToggleActive = async (categoryId: number) => {
    try {
      const category = categories.find(c => c.id === categoryId);
      if (!category) return;
      
      await api.put(`/categories/${categoryId}`, {
        name: category.name,
        code: category.code,
        status: category.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
      });
      loadCategories();
    } catch (error) {
      alert('Kategori durumu güncellenemedi');
    }
  };

  const handleStartEditCashback = (categoryId: number, integratorId: number) => {
    const offer = getCategoryOffer(categoryId, integratorId);
    if (offer) {
      setEditingCashbackId(categoryId);
      setEditingIntegratorId(integratorId);
      setEditingCashbackValue(offer.user_rate * 100); // Convert to percentage
    }
  };

  const handleSaveCashback = async (categoryId: number, integratorId: number) => {
    try {
      const offer = getCategoryOffer(categoryId, integratorId);
      if (offer) {
        await api.put(`/categories/${categoryId}/offers/${offer.id}`, {
          integratorId: integratorId,
          ekomobilRate: offer.ekomobil_rate,
          userRate: editingCashbackValue / 100, // Convert to decimal
          isActive: offer.is_active,
        });
        await loadOffers(categoryId);
      } else {
        // Create new offer
        await api.post(`/categories/${categoryId}/offers`, {
          integratorId: integratorId,
          ekomobilRate: 0.05,
          userRate: editingCashbackValue / 100,
          isActive: true,
        });
        await loadOffers(categoryId);
      }
      setEditingCashbackId(null);
      setEditingIntegratorId(null);
    } catch (error) {
      alert('Cashback oranı güncellenemedi');
    }
  };

  const handleCancelEditCashback = () => {
    setEditingCashbackId(null);
    setEditingIntegratorId(null);
    setEditingCashbackValue(0);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Harca Kazan Kategoriler</h2>
        <button
          onClick={() => {
            setEditingCategory(null);
            setCategoryForm({ name: '', code: '', status: 'ACTIVE' });
            setShowCategoryForm(true);
          }}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Yeni Kategori
        </button>
      </div>

      {showCategoryForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori'}
          </h3>
          <form onSubmit={handleSaveCategory} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori Adı *</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kod *</label>
                <input
                  type="text"
                  value={categoryForm.code}
                  onChange={(e) => setCategoryForm({ ...categoryForm, code: e.target.value.toUpperCase() })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
              <select
                value={categoryForm.status}
                onChange={(e) => setCategoryForm({ ...categoryForm, status: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="ACTIVE">Aktif</option>
                <option value="INACTIVE">Pasif</option>
              </select>
            </div>
            <div className="flex space-x-4">
              <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">
                {editingCategory ? 'Güncelle' : 'Ekle'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCategoryForm(false);
                  setEditingCategory(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex space-x-4">
            <input
              type="text"
              placeholder="Kategori ara..."
              value={filters.name}
              onChange={(e) => setFilters({ ...filters, name: e.target.value })}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
            />
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2"
            >
              <option value="">Tüm Durumlar</option>
              <option value="ACTIVE">Aktif</option>
              <option value="INACTIVE">Pasif</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase border-b">
                  <div className="flex flex-col">
                    <span className="mb-2">Kategori Adı</span>
                    <input
                      type="text"
                      placeholder="Filtrele..."
                      value={filters.name}
                      onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                      className="border border-gray-300 rounded px-2 py-1 text-xs"
                    />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase border-b">Kod</th>
                {Array.isArray(integrators) && integrators.map((integrator) => (
                  <th key={integrator.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase border-b">
                    <div className="flex flex-col">
                      <span className="mb-1">{integrator.name}</span>
                      <span className="text-xs text-gray-400">Kullanıcı (%)</span>
                    </div>
                  </th>
                ))}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase border-b">
                  <div className="flex flex-col">
                    <span className="mb-2">Durum</span>
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                      className="border border-gray-300 rounded px-2 py-1 text-xs"
                    >
                      <option value="">Tümü</option>
                      <option value="ACTIVE">Aktif</option>
                      <option value="INACTIVE">Pasif</option>
                    </select>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase border-b">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={integrators.length + 4} className="px-6 py-8 text-center text-gray-500">
                    Henüz kategori eklenmemiş
                  </td>
                </tr>
              ) : (
                Array.isArray(categories) && categories.map((category) => {
                  const isEditing = editingCashbackId === category.id;
                  
                  return (
                    <tr 
                      key={category.id} 
                      className={`hover:bg-gray-50 ${category.status === 'INACTIVE' ? 'opacity-60' : ''}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{category.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">{category.code}</td>
                      {integrators.map((integrator) => {
                        const offer = getCategoryOffer(category.id, integrator.id);
                        const userRate = offer ? offer.user_rate * 100 : 0;
                        const isEditingThis = isEditing && editingIntegratorId === integrator.id;

                        return (
                          <td key={integrator.id} className="px-6 py-4 whitespace-nowrap">
                            {isEditingThis ? (
                              <div className="flex items-center space-x-2">
                                <input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  max="100"
                                  value={editingCashbackValue}
                                  onChange={(e) => setEditingCashbackValue(parseFloat(e.target.value) || 0)}
                                  className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleSaveCashback(category.id, integrator.id);
                                    } else if (e.key === 'Escape') {
                                      handleCancelEditCashback();
                                    }
                                  }}
                                />
                                <button
                                  onClick={() => handleSaveCashback(category.id, integrator.id)}
                                  className="text-green-600 hover:text-green-800"
                                  title="Kaydet (Enter)"
                                >
                                  ✓
                                </button>
                                <button
                                  onClick={handleCancelEditCashback}
                                  className="text-red-600 hover:text-red-800"
                                  title="İptal (Esc)"
                                >
                                  ×
                                </button>
                              </div>
                            ) : (
                              <span
                                className="cursor-pointer hover:text-primary flex items-center space-x-1"
                                onClick={() => handleStartEditCashback(category.id, integrator.id)}
                                title="Düzenlemek için tıklayın"
                              >
                                <span>{userRate.toFixed(2)}%</span>
                                <span className="text-gray-400 text-xs">✎</span>
                              </span>
                            )}
                          </td>
                        );
                      })}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={category.status === 'ACTIVE'}
                            onChange={() => handleToggleActive(category.id)}
                            className="w-4 h-4 text-primary rounded focus:ring-primary"
                          />
                          <span className={`text-xs ${category.status === 'ACTIVE' ? 'text-green-600' : 'text-gray-500'}`}>
                            {category.status === 'ACTIVE' ? 'Aktif' : 'Pasif'}
                          </span>
                        </label>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setEditingCategory(category);
                            setCategoryForm({
                              name: category.name,
                              code: category.code,
                              status: category.status,
                            });
                            setShowCategoryForm(true);
                          }}
                          className="text-primary hover:text-primary-dark"
                          title="Düzenle"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
