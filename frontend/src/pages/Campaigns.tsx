import { useState, useEffect } from 'react';
import api from '../api/client';
import { Plus, Edit, X, Copy } from 'lucide-react';
import { format } from 'date-fns';

interface EventDefinition {
  id: number;
  name: string;
  description: string;
  min_app_open_count?: number;
  app_open_window_days?: number;
  min_refund_count?: number;
  refund_window_days?: number;
}

interface Campaign {
  id: number;
  name: string;
  description: string;
  event_id: number;
  event_name: string;
  benefit_type: string;
  benefit_value?: number;
  platforms: string[];
  start_date: string;
  end_date: string;
  status: string;
}

export default function Campaigns() {
  const [activeTab, setActiveTab] = useState<'events' | 'campaigns'>('events');
  const [events, setEvents] = useState<EventDefinition[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventDefinition | null>(null);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  const [eventForm, setEventForm] = useState({
    name: '',
    description: '',
    minAppOpenCount: '',
    appOpenWindowDays: '',
    minRefundCount: '',
    refundWindowDays: '',
  });

  const [campaignForm, setCampaignForm] = useState({
    name: '',
    description: '',
    eventId: '',
    benefitType: 'DOUBLE_REFUND_VALUE',
    benefitValue: '',
    platforms: ['ANDROID'],
    startDate: '',
    endDate: '',
    status: 'DRAFT',
  });

  useEffect(() => {
    loadEvents();
    loadCampaigns();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await api.get('/events');
      setEvents(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to load events', error);
      setEvents([]);
    }
  };

  const loadCampaigns = async () => {
    try {
      const response = await api.get('/campaigns');
      setCampaigns(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to load campaigns', error);
      setCampaigns([]);
    }
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        name: eventForm.name,
        description: eventForm.description,
        minAppOpenCount: eventForm.minAppOpenCount ? parseInt(eventForm.minAppOpenCount) : null,
        appOpenWindowDays: eventForm.appOpenWindowDays ? parseInt(eventForm.appOpenWindowDays) : null,
        minRefundCount: eventForm.minRefundCount ? parseInt(eventForm.minRefundCount) : null,
        refundWindowDays: eventForm.refundWindowDays ? parseInt(eventForm.refundWindowDays) : null,
      };

      if (editingEvent) {
        await api.put(`/events/${editingEvent.id}`, data);
      } else {
        await api.post('/events', data);
      }
      setShowEventForm(false);
      setEditingEvent(null);
      setEventForm({ name: '', description: '', minAppOpenCount: '', appOpenWindowDays: '', minRefundCount: '', refundWindowDays: '' });
      loadEvents();
    } catch (error) {
      alert('Event kaydedilemedi');
    }
  };

  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...campaignForm,
        benefitValue: campaignForm.benefitValue ? parseFloat(campaignForm.benefitValue) : null,
        eventId: parseInt(campaignForm.eventId),
      };

      if (editingCampaign) {
        await api.put(`/campaigns/${editingCampaign.id}`, data);
      } else {
        await api.post('/campaigns', data);
      }
      setShowCampaignForm(false);
      setEditingCampaign(null);
      setCampaignForm({
        name: '',
        description: '',
        eventId: '',
        benefitType: 'DOUBLE_REFUND_VALUE',
        benefitValue: '',
        platforms: ['ANDROID'],
        startDate: '',
        endDate: '',
        status: 'DRAFT',
      });
      loadCampaigns();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Kampanya kaydedilemedi');
    }
  };

  const handleDuplicateCampaign = async (id: number) => {
    try {
      await api.post(`/campaigns/${id}/duplicate`);
      loadCampaigns();
      alert('Kampanya kopyalandı');
    } catch (error) {
      alert('Kampanya kopyalanamadı');
    }
  };

  const handleDeleteEvent = async (id: number) => {
    if (!confirm('Bu event tanımını silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/events/${id}`);
      loadEvents();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Event silinemedi');
    }
  };

  const handleDeleteCampaign = async (id: number) => {
    if (!confirm('Bu kampanyayı silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/campaigns/${id}`);
      loadCampaigns();
    } catch (error) {
      alert('Kampanya silinemedi');
    }
  };

  const getEventDescription = (event: EventDefinition) => {
    const parts: string[] = [];
    if (event.min_app_open_count && event.app_open_window_days) {
      parts.push(`Son ${event.app_open_window_days} günde en az ${event.min_app_open_count} kez açan`);
    }
    if (event.min_refund_count && event.refund_window_days) {
      parts.push(`Son ${event.refund_window_days} günde en az ${event.min_refund_count} iade yapan`);
    }
    return parts.join(' ve ') || event.description;
  };

  const getBenefitLabel = (type: string) => {
    switch (type) {
      case 'DOUBLE_REFUND_VALUE':
        return 'İadeler 2 kat değerlenir';
      case 'DOUBLE_CASHBACK_RATE':
        return 'Cashback oranı 2 katına çıkar';
      case 'CUSTOM_TEXT':
        return 'Özel Metin';
      default:
        return type;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Kampanya Oluşturma</h2>
      </div>

      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('events')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'events' ? 'border-primary text-primary' : 'border-transparent text-gray-500'
            }`}
          >
            Event Tanımları
          </button>
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'campaigns' ? 'border-primary text-primary' : 'border-transparent text-gray-500'
            }`}
          >
            Kampanyalar
          </button>
        </nav>
      </div>

      {activeTab === 'events' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Event Tanımları</h3>
            <button
              onClick={() => {
                setEditingEvent(null);
                setEventForm({ name: '', description: '', minAppOpenCount: '', appOpenWindowDays: '', minRefundCount: '', refundWindowDays: '' });
                setShowEventForm(true);
              }}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Yeni Event
            </button>
          </div>

          {showEventForm && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h4 className="font-semibold mb-4">{editingEvent ? 'Event Düzenle' : 'Yeni Event'}</h4>
              <form onSubmit={handleSaveEvent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ad *</label>
                  <input
                    type="text"
                    value={eventForm.name}
                    onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                  <textarea
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Uygulama Açma Sayısı</label>
                    <input
                      type="number"
                      value={eventForm.minAppOpenCount}
                      onChange={(e) => setEventForm({ ...eventForm, minAppOpenCount: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Uygulama Açma Pencere (Gün)</label>
                    <input
                      type="number"
                      value={eventForm.appOpenWindowDays}
                      onChange={(e) => setEventForm({ ...eventForm, appOpenWindowDays: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min İade Sayısı</label>
                    <input
                      type="number"
                      value={eventForm.minRefundCount}
                      onChange={(e) => setEventForm({ ...eventForm, minRefundCount: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">İade Pencere (Gün)</label>
                    <input
                      type="number"
                      value={eventForm.refundWindowDays}
                      onChange={(e) => setEventForm({ ...eventForm, refundWindowDays: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>
                <div className="flex space-x-4">
                  <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">
                    Kaydet
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEventForm(false);
                      setEditingEvent(null);
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event Adı</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Açıklama</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Koşullar</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {events.map((event) => (
                  <tr key={event.id}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{event.name}</td>
                    <td className="px-6 py-4 text-gray-600">{event.description}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{getEventDescription(event)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => {
                          setEditingEvent(event);
                          setEventForm({
                            name: event.name,
                            description: event.description || '',
                            minAppOpenCount: event.min_app_open_count?.toString() || '',
                            appOpenWindowDays: event.app_open_window_days?.toString() || '',
                            minRefundCount: event.min_refund_count?.toString() || '',
                            refundWindowDays: event.refund_window_days?.toString() || '',
                          });
                          setShowEventForm(true);
                        }}
                        className="text-primary hover:text-primary-dark"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteEvent(event.id)} className="text-red-600 hover:text-red-800">
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'campaigns' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Kampanyalar</h3>
            <button
              onClick={() => {
                setEditingCampaign(null);
                setCampaignForm({
                  name: '',
                  description: '',
                  eventId: '',
                  benefitType: 'DOUBLE_REFUND_VALUE',
                  benefitValue: '',
                  platforms: ['ANDROID'],
                  startDate: '',
                  endDate: '',
                  status: 'DRAFT',
                });
                setShowCampaignForm(true);
              }}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Yeni Kampanya
            </button>
          </div>

          {showCampaignForm && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h4 className="font-semibold mb-4">{editingCampaign ? 'Kampanya Düzenle' : 'Yeni Kampanya'}</h4>
              <form onSubmit={handleSaveCampaign} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kampanya Adı *</label>
                    <input
                      type="text"
                      value={campaignForm.name}
                      onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Event *</label>
                    <select
                      value={campaignForm.eventId}
                      onChange={(e) => setCampaignForm({ ...campaignForm, eventId: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required
                    >
                      <option value="">Seçin...</option>
                      {Array.isArray(events) && events.map((event) => (
                        <option key={event.id} value={event.id}>
                          {event.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                  <textarea
                    value={campaignForm.description}
                    onChange={(e) => setCampaignForm({ ...campaignForm, description: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fayda Tipi *</label>
                    <select
                      value={campaignForm.benefitType}
                      onChange={(e) => setCampaignForm({ ...campaignForm, benefitType: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="DOUBLE_REFUND_VALUE">İadeler 2 kat değerlenir</option>
                      <option value="DOUBLE_CASHBACK_RATE">Cashback oranı 2 katına çıkar</option>
                      <option value="CUSTOM_TEXT">Özel Metin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fayda Değeri</label>
                    <input
                      type="number"
                      step="0.1"
                      value={campaignForm.benefitValue}
                      onChange={(e) => setCampaignForm({ ...campaignForm, benefitValue: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="Örn: 2.0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Başlangıç Tarihi *</label>
                    <input
                      type="datetime-local"
                      value={campaignForm.startDate}
                      onChange={(e) => setCampaignForm({ ...campaignForm, startDate: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bitiş Tarihi *</label>
                    <input
                      type="datetime-local"
                      value={campaignForm.endDate}
                      onChange={(e) => setCampaignForm({ ...campaignForm, endDate: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Platformlar *</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={campaignForm.platforms.includes('ANDROID')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCampaignForm({ ...campaignForm, platforms: [...campaignForm.platforms, 'ANDROID'] });
                          } else {
                            setCampaignForm({ ...campaignForm, platforms: campaignForm.platforms.filter((p) => p !== 'ANDROID') });
                          }
                        }}
                        className="mr-2"
                      />
                      Android
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={campaignForm.platforms.includes('IOS')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCampaignForm({ ...campaignForm, platforms: [...campaignForm.platforms, 'IOS'] });
                          } else {
                            setCampaignForm({ ...campaignForm, platforms: campaignForm.platforms.filter((p) => p !== 'IOS') });
                          }
                        }}
                        className="mr-2"
                      />
                      iOS
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
                  <select
                    value={campaignForm.status}
                    onChange={(e) => setCampaignForm({ ...campaignForm, status: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="DRAFT">Taslak</option>
                    <option value="ACTIVE">Aktif</option>
                    <option value="PAUSED">Duraklatıldı</option>
                  </select>
                </div>
                <div className="flex space-x-4">
                  <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">
                    Kaydet
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCampaignForm(false);
                      setEditingCampaign(null);
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kampanya Adı</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fayda</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Platformlar</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {Array.isArray(campaigns) && campaigns.length > 0 ? campaigns.map((campaign) => (
                  <tr key={campaign.id}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{campaign.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{campaign.event_name}</td>
                    <td className="px-6 py-4 text-sm">{getBenefitLabel(campaign.benefit_type)}</td>
                    <td className="px-6 py-4 text-sm">{campaign.platforms.join(', ')}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          campaign.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : campaign.status === 'DRAFT'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {campaign.status === 'ACTIVE' ? 'Aktif' : campaign.status === 'DRAFT' ? 'Taslak' : 'Duraklatıldı'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {format(new Date(campaign.start_date), 'dd.MM.yyyy')} - {format(new Date(campaign.end_date), 'dd.MM.yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => {
                          setEditingCampaign(campaign);
                          setCampaignForm({
                            name: campaign.name,
                            description: campaign.description || '',
                            eventId: campaign.event_id.toString(),
                            benefitType: campaign.benefit_type,
                            benefitValue: campaign.benefit_value?.toString() || '',
                            platforms: campaign.platforms,
                            startDate: new Date(campaign.start_date).toISOString().slice(0, 16),
                            endDate: new Date(campaign.end_date).toISOString().slice(0, 16),
                            status: campaign.status,
                          });
                          setShowCampaignForm(true);
                        }}
                        className="text-primary hover:text-primary-dark"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDuplicateCampaign(campaign.id)} className="text-blue-600 hover:text-blue-800">
                        <Copy className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteCampaign(campaign.id)} className="text-red-600 hover:text-red-800">
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

