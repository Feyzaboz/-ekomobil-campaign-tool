import { useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { Plus, Edit, X } from 'lucide-react';

interface Brand {
  id: number;
  name: string;
  status: string;
  category_id?: number;
  category_name?: string;
  primary_offer?: {
    id: number;
    integrator_id: number;
    integrator_name?: string;
    integrator_code?: string;
    ekomobil_rate: number;
    user_rate: number;
    is_active: boolean;
    is_best_offer: boolean;
  } | null;
}

interface BrandOffer {
  id: number;
  brand_id: number;
  integrator_id: number;
  integrator_name?: string;
  integrator_code?: string;
  ekomobil_rate: number;
  user_rate: number;
  is_active: boolean;
  is_best_offer: boolean;
  valid_from?: string;
  valid_to?: string;
}

interface Integrator {
  id: number;
  name: string;
  code: string;
  is_active: boolean;
}

interface Category {
  id: number;
  name: string;
  code: string;
}

export default function BrandCashback() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandOffers, setBrandOffers] = useState<Record<number, BrandOffer[]>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [integrators, setIntegrators] = useState<Integrator[]>([]);
  const [showBrandForm, setShowBrandForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [editingCashbackId, setEditingCashbackId] = useState<number | null>(null);
  const [editingCashbackValue, setEditingCashbackValue] = useState<number>(0);
  const [editingIntegratorId, setEditingIntegratorId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const MAX_RETRIES = 5;

  const [filters, setFilters] = useState({
    name: '',
    category: '',
    partnerCompany: '',
    ekomobilCashback: '',
    userCashback: '',
    isActive: '',
  });

  const [brandForm, setBrandForm] = useState({ 
    name: '', 
    status: 'ACTIVE', 
    categoryId: '',
    integratorId: '',
    ekomobilRate: '',
    userRate: '',
    isActive: true,
  });

  const loadOffers = useCallback(async (brandId: number) => {
    try {
      const response = await api.get(`/brands/${brandId}/offers`);
      setBrandOffers(prev => ({
        ...prev,
        [brandId]: Array.isArray(response.data) ? response.data : []
      }));
    } catch (error) {
      console.error('Failed to load offers', error);
      setBrandOffers(prev => ({
        ...prev,
        [brandId]: []
      }));
    }
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const response = await api.get('/categories');
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to load categories', error);
      setCategories([]);
    }
  }, []);

  const loadIntegrators = useCallback(async () => {
    try {
      const response = await api.get('/integrators');
      const data = Array.isArray(response.data) ? response.data : [];
      setIntegrators(data.filter((i: Integrator) => i.is_active));
    } catch (error) {
      console.error('Failed to load integrators', error);
      setIntegrators([]);
    }
  }, []);

  const loadBrands = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const params: any = {};
      if (filters.isActive) params.status = filters.isActive;
      if (filters.name) params.search = filters.name;
      
      console.log('Loading brands from:', import.meta.env.PROD ? (import.meta.env.VITE_API_URL || 'https://ekomobil-campaign-tool.onrender.com/api') : '/api');
      const response = await api.get('/brands', { params, timeout: 90000 }); // 90 second timeout for cold start
      let filtered = Array.isArray(response.data) ? response.data : [];
      
      if (filters.category && Array.isArray(filtered)) {
        filtered = filtered.filter((b: Brand) => 
          b.category_name?.toLowerCase() === filters.category.toLowerCase()
        );
      }
      
      setBrands(Array.isArray(filtered) ? filtered : []);
      setRetryCount(0); // Reset retry count on success
      setIsRetrying(false);
      setError(null); // Clear error on success
      
      // Pre-load offers for brands that don't have primary_offer from backend
      // This is a fallback for brands without primary offers
      filtered.forEach((brand: Brand) => {
        if (brand.id && (!brand.primary_offer || !brandOffers[brand.id])) {
          loadOffers(brand.id);
        }
      });
    } catch (error: any) {
      console.error('Failed to load brands', error);
      const errorMessage = error.response?.data?.error || error.message || 'Bilinmeyen hata';
      
      // Determine error type and message
      let errorDetails = '';
      let shouldRetry = false;
      
      if (error.code === 'ECONNABORTED') {
        errorDetails = 'Backend yanıt vermiyor (timeout). Render.com ücretsiz katmanında backend\'in uyanması 30-90 saniye sürebilir.';
        shouldRetry = true;
      } else if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
        errorDetails = 'Backend API\'ye bağlanılamıyor. Render.com uyku modunda olabilir (ilk istek 30-90 saniye sürebilir).';
        shouldRetry = true;
      } else if (error.response?.status >= 500) {
        errorDetails = 'Backend sunucu hatası. Lütfen birkaç saniye bekleyip tekrar deneyin.';
        shouldRetry = true;
      } else {
        errorDetails = `API Hatası: ${errorMessage}`;
        shouldRetry = false;
      }
      
      setError(`Markalar yüklenemedi. ${errorDetails}`);
      setBrands([]);

      // Implement automatic retry for network/timeout/server errors
      if (shouldRetry && retryCount < MAX_RETRIES) {
        const nextRetryCount = retryCount + 1;
        setRetryCount(nextRetryCount);
        setIsRetrying(true);
        const retryDelay = Math.min(nextRetryCount * 3000, 15000); // Exponential backoff, max 15 seconds
        
        console.log(`Retrying loadBrands... Attempt ${nextRetryCount}/${MAX_RETRIES} after ${retryDelay}ms`);
        
        setTimeout(() => {
          loadBrands();
        }, retryDelay);
      } else if (retryCount >= MAX_RETRIES) {
        setIsRetrying(false);
        setError(`Markalar yüklenemedi. Backend API'ye ${MAX_RETRIES} kez denendi ancak ulaşılamadı. Render.com ücretsiz katmanında backend'in uyanması 30-90 saniye sürebilir. Lütfen birkaç dakika bekleyip sayfayı yenileyin.`);
      } else {
        setIsRetrying(false);
      }
    } finally {
      setLoading(false);
    }
  }, [filters.isActive, filters.name, filters.category, loadOffers, retryCount]);

  useEffect(() => {
    loadBrands();
    loadCategories();
    loadIntegrators();
  }, [loadBrands, loadCategories, loadIntegrators]);

  useEffect(() => {
    // Load offers for all brands
    if (Array.isArray(brands) && brands.length > 0) {
      brands.forEach(brand => {
        if (brand && brand.id) {
          loadOffers(brand.id);
        }
      });
    }
  }, [brands.length, loadOffers]);

  // Remove duplicate useEffect - loadBrands is already called in the first useEffect

  const getBrandOffer = (brandId: number, integratorId: number): BrandOffer | null => {
    const offers = brandOffers[brandId] || [];
    return offers.find(o => o.integrator_id === integratorId) || null;
  };

  const getPrimaryOffer = (brandId: number, brand?: Brand): BrandOffer | null => {
    // First try to use primary_offer from brand object (from backend)
    if (brand?.primary_offer) {
      return {
        id: brand.primary_offer.id,
        brand_id: brandId,
        integrator_id: brand.primary_offer.integrator_id,
        integrator_name: brand.primary_offer.integrator_name,
        integrator_code: brand.primary_offer.integrator_code,
        ekomobil_rate: brand.primary_offer.ekomobil_rate,
        user_rate: brand.primary_offer.user_rate,
        is_active: brand.primary_offer.is_active,
        is_best_offer: brand.primary_offer.is_best_offer,
      };
    }
    
    // Fallback to loaded offers
    const offers = brandOffers[brandId] || [];
    // First try to find best offer, then first active offer, then any offer
    return offers.find(o => o.is_best_offer && o.is_active) 
      || offers.find(o => o.is_active) 
      || offers[0] 
      || null;
  };

  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validate required fields
      if (!brandForm.integratorId) {
        alert('Lütfen entegratör firma seçin');
        return;
      }

      let brandId: number;
      
      if (editingBrand) {
        // Update brand
        await api.put(`/brands/${editingBrand.id}`, {
          name: brandForm.name,
          status: brandForm.status,
          categoryId: brandForm.categoryId || null,
        });
        brandId = editingBrand.id;
      } else {
        // Create brand
        const brandResponse = await api.post('/brands', {
          name: brandForm.name,
          status: brandForm.status,
          categoryId: brandForm.categoryId || null,
        });
        brandId = brandResponse.data.id;
      }

      // Update or create brand offer - ONLY for this specific brand
      const ekomobilRate = parseFloat(brandForm.ekomobilRate) || 0;
      const userRate = parseFloat(brandForm.userRate) || 0;
      const integratorId = parseInt(brandForm.integratorId);
      
      // Ensure offers are loaded before checking
      await loadOffers(brandId);
      // Wait a bit for state to update
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Find the offer for this specific brand and integrator
      const offers = brandOffers[brandId] || [];
      const existingOffer = offers.find((o: BrandOffer) => o.integrator_id === integratorId);
      
      try {
        if (existingOffer && existingOffer.id) {
          // Update existing offer - ONLY this specific offer
          await api.put(`/brands/${brandId}/offers/${existingOffer.id}`, {
            integratorId: integratorId,
            ekomobilRate: ekomobilRate / 100,
            userRate: userRate / 100,
            isActive: brandForm.isActive,
            isBestOffer: existingOffer.is_best_offer || true,
            validFrom: existingOffer.valid_from || null,
            validTo: existingOffer.valid_to || null,
          });
        } else {
          // Create new offer - ONLY for this brand
          await api.post(`/brands/${brandId}/offers`, {
            integratorId: integratorId,
            ekomobilRate: ekomobilRate / 100,
            userRate: userRate / 100,
            isActive: brandForm.isActive,
            isBestOffer: true,
          });
        }
      } catch (offerError: any) {
        // If update fails, try to create new offer
        if (offerError.response?.status === 404 || offerError.response?.data?.error?.includes('not found')) {
          await api.post(`/brands/${brandId}/offers`, {
            integratorId: integratorId,
            ekomobilRate: ekomobilRate / 100,
            userRate: userRate / 100,
            isActive: brandForm.isActive,
            isBestOffer: true,
          });
        } else {
          throw offerError;
        }
      }
      
      // Reload offers for this brand
      await loadOffers(brandId);

      setShowBrandForm(false);
      setEditingBrand(null);
      setBrandForm({ 
        name: '', 
        status: 'ACTIVE', 
        categoryId: '',
        integratorId: '',
        ekomobilRate: '',
        userRate: '',
        isActive: true,
      });
      loadBrands();
    } catch (error: any) {
      console.error('Failed to save brand', error);
      const errorMessage = error.response?.data?.error || error.message || 'Marka kaydedilemedi';
      alert(`Marka kaydedilemedi: ${errorMessage}`);
    }
  };

  const handleToggleActive = async (brandId: number) => {
    try {
      const brand = brands.find(b => b.id === brandId);
      if (!brand) return;
      
      await api.put(`/brands/${brandId}`, {
        name: brand.name,
        status: brand.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
        categoryId: brand.category_id || null,
      });
      loadBrands();
    } catch (error) {
      alert('Marka durumu güncellenemedi');
    }
  };

  const handleDelete = async (brandId: number) => {
    if (!confirm('Bu markayı silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/brands/${brandId}`);
      loadBrands();
    } catch (error) {
      alert('Marka silinemedi');
    }
  };

  const handleStartEditCashback = (brandId: number, integratorId: number) => {
    const offer = getBrandOffer(brandId, integratorId);
    if (offer) {
      setEditingCashbackId(brandId);
      setEditingIntegratorId(integratorId);
      setEditingCashbackValue(offer.user_rate * 100); // Convert to percentage
    }
  };

  const handleSaveCashback = async (brandId: number, integratorId: number) => {
    try {
      const offer = getBrandOffer(brandId, integratorId);
      if (offer) {
        await api.put(`/brands/${brandId}/offers/${offer.id}`, {
          integratorId: integratorId,
          ekomobilRate: offer.ekomobil_rate,
          userRate: editingCashbackValue / 100, // Convert to decimal
          isActive: offer.is_active,
          isBestOffer: offer.is_best_offer,
          validFrom: offer.valid_from,
          validTo: offer.valid_to,
        });
        await loadOffers(brandId);
      } else {
        // Create new offer
        await api.post(`/brands/${brandId}/offers`, {
          integratorId: integratorId,
          ekomobilRate: 0,
          userRate: editingCashbackValue / 100,
          isActive: true,
          isBestOffer: false,
        });
        await loadOffers(brandId);
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

      const filteredBrands = Array.isArray(brands) ? brands.filter((brand) => {
        const primaryOffer = getPrimaryOffer(brand.id, brand);
        const ekomobilRate = primaryOffer ? primaryOffer.ekomobil_rate * 100 : 0;
        const userRate = primaryOffer ? primaryOffer.user_rate * 100 : 0;
    
    return (
      (filters.name === '' || brand.name?.toLowerCase().includes(filters.name.toLowerCase())) &&
      (filters.category === '' || brand.category_name?.toLowerCase() === filters.category.toLowerCase()) &&
      (filters.partnerCompany === '' || 
        (primaryOffer && primaryOffer.integrator_code?.toLowerCase() === filters.partnerCompany.toLowerCase())) &&
      (filters.ekomobilCashback === '' || ekomobilRate.toString().includes(filters.ekomobilCashback)) &&
      (filters.userCashback === '' || userRate.toString().includes(filters.userCashback)) &&
      (filters.isActive === '' || 
        (filters.isActive === 'ACTIVE' && brand.status === 'ACTIVE') || 
        (filters.isActive === 'INACTIVE' && brand.status === 'INACTIVE'))
    );
  }) : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Uyarı</h3>
          <p className="text-yellow-700">{error}</p>
          <p className="text-sm text-yellow-600 mt-2">
            Backend API çalışmıyor olabilir. Lütfen backend'in çalıştığından emin olun.
          </p>
        </div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Harca Kazan Markalar</h2>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Harca Kazan Markalar</h2>
        <button
          onClick={() => {
            setEditingBrand(null);
            setBrandForm({ 
              name: '', 
              status: 'ACTIVE', 
              categoryId: '',
              integratorId: integrators[0]?.id?.toString() || '',
              ekomobilRate: '0',
              userRate: '5',
              isActive: true,
            });
            setShowBrandForm(true);
          }}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Yeni Marka Ekle
        </button>
      </div>

      {showBrandForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingBrand ? 'Marka Düzenle' : 'Yeni Marka Ekle'}
          </h3>
          <form onSubmit={handleSaveBrand} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marka Adı *</label>
              <input
                type="text"
                value={brandForm.name}
                onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
              <select
                value={brandForm.categoryId}
                onChange={(e) => setBrandForm({ ...brandForm, categoryId: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">Kategori Seçin</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Entegratör Firma *</label>
              <select
                value={brandForm.integratorId}
                onChange={(e) => setBrandForm({ ...brandForm, integratorId: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              >
                <option value="">Entegratör Seçin</option>
                {integrators.map((int) => (
                  <option key={int.id} value={int.id}>
                    {int.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ekomobil Cashback (%) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={brandForm.ekomobilRate}
                  onChange={(e) => setBrandForm({ ...brandForm, ekomobilRate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kullanıcı Cashback (%) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={brandForm.userRate}
                  onChange={(e) => setBrandForm({ ...brandForm, userRate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
                {brandForm.ekomobilRate && brandForm.userRate && (
                  <small className="text-gray-500 text-xs mt-1 block">
                    Fark: %{(parseFloat(brandForm.ekomobilRate) - parseFloat(brandForm.userRate)).toFixed(2)}
                  </small>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
              <select
                value={brandForm.status}
                onChange={(e) => setBrandForm({ ...brandForm, status: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="ACTIVE">Aktif</option>
                <option value="INACTIVE">Pasif</option>
              </select>
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={brandForm.isActive}
                  onChange={(e) => setBrandForm({ ...brandForm, isActive: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Teklif Aktif (kullanıcılara görünsün)</span>
              </label>
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
              >
                {editingBrand ? 'Güncelle' : 'Ekle'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowBrandForm(false);
                  setEditingBrand(null);
                  setBrandForm({ 
                    name: '', 
                    status: 'ACTIVE', 
                    categoryId: '',
                    integratorId: '',
                    ekomobilRate: '',
                    userRate: '',
                    isActive: true,
                  });
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase border-b">
                  <div className="flex flex-col">
                    <span className="mb-2">Marka Adı</span>
                    <input
                      type="text"
                      placeholder="Filtrele..."
                      value={filters.name}
                      onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                      className="border border-gray-300 rounded px-2 py-1 text-xs"
                    />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase border-b">
                  <div className="flex flex-col">
                    <span className="mb-2">Kategori</span>
                    <select
                      value={filters.category}
                      onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                      className="border border-gray-300 rounded px-2 py-1 text-xs"
                    >
                      <option value="">Tümü</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.name.toLowerCase()}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase border-b">
                  <div className="flex flex-col">
                    <span className="mb-2">Entegratör Firma</span>
                    <select
                      value={filters.partnerCompany}
                      onChange={(e) => setFilters({ ...filters, partnerCompany: e.target.value })}
                      className="border border-gray-300 rounded px-2 py-1 text-xs"
                    >
                      <option value="">Tümü</option>
                      {integrators.map((int) => (
                        <option key={int.id} value={int.code.toLowerCase()}>
                          {int.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase border-b">
                  <div className="flex flex-col">
                    <span className="mb-2">Ekomobil Cashback (%)</span>
                    <input
                      type="text"
                      placeholder="Filtrele..."
                      value={filters.ekomobilCashback}
                      onChange={(e) => setFilters({ ...filters, ekomobilCashback: e.target.value })}
                      className="border border-gray-300 rounded px-2 py-1 text-xs"
                    />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase border-b">
                  <div className="flex flex-col">
                    <span className="mb-2">Kullanıcı Cashback (%)</span>
                    <input
                      type="text"
                      placeholder="Filtrele..."
                      value={filters.userCashback}
                      onChange={(e) => setFilters({ ...filters, userCashback: e.target.value })}
                      className="border border-gray-300 rounded px-2 py-1 text-xs"
                    />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase border-b">
                  <div className="flex flex-col">
                    <span className="mb-2">Durum</span>
                    <select
                      value={filters.isActive}
                      onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}
                      className="border border-gray-300 rounded px-2 py-1 text-xs"
                    >
                      <option value="">Tümü</option>
                      <option value="ACTIVE">Aktif</option>
                      <option value="INACTIVE">Pasif</option>
                    </select>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase border-b">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBrands.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    {brands.length === 0 ? 'Henüz marka eklenmemiş' : 'Filtreye uygun marka bulunamadı'}
                  </td>
                </tr>
              ) : (
                filteredBrands.map((brand) => {
                  const primaryOffer = getPrimaryOffer(brand.id, brand);
                  const ekomobilRate = primaryOffer ? primaryOffer.ekomobil_rate * 100 : 0;
                  const userRate = primaryOffer ? primaryOffer.user_rate * 100 : 0;
                  const integratorName = primaryOffer?.integrator_name || '-';
                  const isEditing = editingCashbackId === brand.id && editingIntegratorId === primaryOffer?.integrator_id;

                  return (
                    <tr 
                      key={brand.id} 
                      className={`hover:bg-gray-50 ${brand.status === 'INACTIVE' ? 'opacity-60' : ''}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{brand.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                          {brand.category_name || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded bg-purple-100 text-purple-800">
                          {integratorName}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{ekomobilRate.toFixed(2)}%</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isEditing && primaryOffer ? (
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
                                  handleSaveCashback(brand.id, primaryOffer.integrator_id);
                                } else if (e.key === 'Escape') {
                                  handleCancelEditCashback();
                                }
                              }}
                            />
                            <button
                              onClick={() => handleSaveCashback(brand.id, primaryOffer.integrator_id)}
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
                            onClick={() => primaryOffer && handleStartEditCashback(brand.id, primaryOffer.integrator_id)}
                            title="Düzenlemek için tıklayın"
                          >
                            <span>{userRate.toFixed(2)}%</span>
                            <span className="text-gray-400 text-xs">✎</span>
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={brand.status === 'ACTIVE'}
                            onChange={() => handleToggleActive(brand.id)}
                            className="w-4 h-4 text-primary rounded focus:ring-primary"
                          />
                          <span className={`text-xs ${brand.status === 'ACTIVE' ? 'text-green-600' : 'text-gray-500'}`}>
                            {brand.status === 'ACTIVE' ? 'Aktif' : 'Pasif'}
                          </span>
                        </label>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={async () => {
                              setEditingBrand(brand);
                              // Load offers first
                              await loadOffers(brand.id);
                              // Wait a bit for state to update
                              setTimeout(() => {
                                const primaryOffer = getPrimaryOffer(brand.id);
                                
                                setBrandForm({
                                  name: brand.name,
                                  status: brand.status,
                                  categoryId: brand.category_id?.toString() || '',
                                  integratorId: primaryOffer?.integrator_id?.toString() || integrators[0]?.id?.toString() || '',
                                  ekomobilRate: primaryOffer ? (primaryOffer.ekomobil_rate * 100).toFixed(2) : '0',
                                  userRate: primaryOffer ? (primaryOffer.user_rate * 100).toFixed(2) : '5',
                                  isActive: primaryOffer?.is_active ?? true,
                                });
                                setShowBrandForm(true);
                              }, 100);
                            }}
                            className="text-primary hover:text-primary-dark"
                            title="Düzenle"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(brand.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Sil"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
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
