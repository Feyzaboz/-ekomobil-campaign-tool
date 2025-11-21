import { useState, useEffect } from 'react';
import api from '../api/client';
import { Plus, Edit, X, Power } from 'lucide-react';
import { format } from 'date-fns';

interface Campaign {
  id: number;
  name: string;
}

interface Announcement {
  id: number;
  title: string;
  subtitle: string;
  body: string;
  terms_and_conditions: string;
  image_url?: string;
  target_campaign_id?: number;
  campaign_name?: string;
  target_platforms: string[];
  scheduled_at: string;
  expires_at?: string;
  status: string;
}

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    body: '',
    termsAndConditions: '',
    imageUrl: '',
    targetCampaignId: '',
    targetPlatforms: ['ANDROID'],
    scheduledAt: '',
    expiresAt: '',
    status: 'DRAFT',
  });

  useEffect(() => {
    loadAnnouncements();
    loadCampaigns();
  }, []);

  const loadAnnouncements = async () => {
    try {
      const response = await api.get('/announcements');
      setAnnouncements(response.data);
    } catch (error) {
      console.error('Failed to load announcements', error);
    }
  };

  const loadCampaigns = async () => {
    try {
      const response = await api.get('/campaigns');
      setCampaigns(response.data);
    } catch (error) {
      console.error('Failed to load campaigns', error);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...form,
        targetCampaignId: form.targetCampaignId || null,
        expiresAt: form.expiresAt || null,
      };

      if (editingAnnouncement) {
        await api.put(`/announcements/${editingAnnouncement.id}`, data);
      } else {
        await api.post('/announcements', data);
      }
      setShowForm(false);
      setEditingAnnouncement(null);
      resetForm();
      loadAnnouncements();
    } catch (error) {
      alert('Duyuru kaydedilemedi');
    }
  };

  const handleActivate = async (id: number) => {
    try {
      await api.post(`/announcements/${id}/activate`);
      loadAnnouncements();
    } catch (error) {
      alert('Duyuru etkinleştirilemedi');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu duyuruyu silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/announcements/${id}`);
      loadAnnouncements();
    } catch (error) {
      alert('Duyuru silinemedi');
    }
  };

  const resetForm = () => {
    setForm({
      title: '',
      subtitle: '',
      body: '',
      termsAndConditions: '',
      imageUrl: '',
      targetCampaignId: '',
      targetPlatforms: ['ANDROID'],
      scheduledAt: '',
      expiresAt: '',
      status: 'DRAFT',
    });
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      DRAFT: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Taslak' },
      SCHEDULED: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Zamanlanmış' },
      ACTIVE: { bg: 'bg-green-100', text: 'text-green-800', label: 'Aktif' },
      FINISHED: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Bitti' },
    };
    const badge = badges[status] || badges.DRAFT;
    return (
      <span className={`px-2 py-1 text-xs rounded ${badge.bg} ${badge.text}`}>{badge.label}</span>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Duyurular</h2>
        <button
          onClick={() => {
            setEditingAnnouncement(null);
            resetForm();
            setShowForm(true);
          }}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Yeni Duyuru
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">{editingAnnouncement ? 'Duyuru Düzenle' : 'Yeni Duyuru'}</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Başlık *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alt Başlık</label>
                <input
                  type="text"
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">İçerik</label>
              <textarea
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kampanya Koşulları</label>
              <textarea
                value={form.termsAndConditions}
                onChange={(e) => setForm({ ...form, termsAndConditions: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Görsel URL</label>
              <input
                type="url"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="https://..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hedef Kampanya</label>
                <select
                  value={form.targetCampaignId}
                  onChange={(e) => setForm({ ...form, targetCampaignId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">Kampanya seçilmedi</option>
                  {campaigns.map((campaign) => (
                    <option key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Platformlar *</label>
                <div className="flex space-x-4 mt-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={form.targetPlatforms.includes('ANDROID')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setForm({ ...form, targetPlatforms: [...form.targetPlatforms, 'ANDROID'] });
                        } else {
                          setForm({ ...form, targetPlatforms: form.targetPlatforms.filter((p) => p !== 'ANDROID') });
                        }
                      }}
                      className="mr-2"
                    />
                    Android
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={form.targetPlatforms.includes('IOS')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setForm({ ...form, targetPlatforms: [...form.targetPlatforms, 'IOS'] });
                        } else {
                          setForm({ ...form, targetPlatforms: form.targetPlatforms.filter((p) => p !== 'IOS') });
                        }
                      }}
                      className="mr-2"
                    />
                    iOS
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zamanlanma Tarihi *</label>
                <input
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bitiş Tarihi</label>
                <input
                  type="datetime-local"
                  value={form.expiresAt}
                  onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="DRAFT">Taslak</option>
                <option value="SCHEDULED">Zamanlanmış</option>
                <option value="ACTIVE">Aktif</option>
              </select>
            </div>

            <div className="flex space-x-4">
              <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">
                Kaydet
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingAnnouncement(null);
                  resetForm();
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Başlık</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hedef Kampanya</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Platformlar</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Zamanlanma</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bitiş</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {announcements.map((announcement) => (
              <tr key={announcement.id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium">{announcement.title}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{announcement.campaign_name || '-'}</td>
                <td className="px-6 py-4 text-sm">{announcement.target_platforms.join(', ')}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {format(new Date(announcement.scheduled_at), 'dd.MM.yyyy HH:mm')}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {announcement.expires_at ? format(new Date(announcement.expires_at), 'dd.MM.yyyy HH:mm') : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(announcement.status)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => {
                      setEditingAnnouncement(announcement);
                      setForm({
                        title: announcement.title,
                        subtitle: announcement.subtitle || '',
                        body: announcement.body || '',
                        termsAndConditions: announcement.terms_and_conditions || '',
                        imageUrl: announcement.image_url || '',
                        targetCampaignId: announcement.target_campaign_id?.toString() || '',
                        targetPlatforms: announcement.target_platforms,
                        scheduledAt: new Date(announcement.scheduled_at).toISOString().slice(0, 16),
                        expiresAt: announcement.expires_at ? new Date(announcement.expires_at).toISOString().slice(0, 16) : '',
                        status: announcement.status,
                      });
                      setShowForm(true);
                    }}
                    className="text-primary hover:text-primary-dark"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  {announcement.status !== 'ACTIVE' && (
                    <button
                      onClick={() => handleActivate(announcement.id)}
                      className="text-green-600 hover:text-green-800"
                    >
                      <Power className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => handleDelete(announcement.id)} className="text-red-600 hover:text-red-800">
                    <X className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

