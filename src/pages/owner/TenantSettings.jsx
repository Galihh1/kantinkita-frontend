import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tenantApi } from '../../api/tenant';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  BuildingStorefrontIcon,
  PhotoIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

const DAYS = [
  { key: 'monday',    label: 'Senin'  },
  { key: 'tuesday',   label: 'Selasa' },
  { key: 'wednesday', label: 'Rabu'   },
  { key: 'thursday',  label: 'Kamis'  },
  { key: 'friday',    label: 'Jumat'  },
  { key: 'saturday',  label: 'Sabtu'  },
  { key: 'sunday',    label: 'Minggu' },
];

const DEFAULT_HOURS = Object.fromEntries(DAYS.map((d) => [d.key, { open: '07:00', close: '17:00', closed: false }]));

export default function OwnerTenantSettings() {
  const qc = useQueryClient();
  const fileRef = useRef(null);

  const [form, setForm]       = useState({ tenant_name: '', description: '', min_order: '', is_open: true });
  const [openHours, setHours] = useState(DEFAULT_HOURS);
  const [photo, setPhoto]     = useState(null);
  const [preview, setPreview] = useState(null);

  const { data: tenant, isLoading } = useQuery({
    queryKey: ['my-tenant'],
    queryFn: () => tenantApi.getMyTenant().then((r) => r.data.data),
  });

  // Sync form saat data tenant tersedia
  useEffect(() => {
    if (!tenant) return;
    setForm({
      tenant_name: tenant.tenant_name ?? '',
      description: tenant.description ?? '',
      min_order:   tenant.min_order   ?? '',
      is_open:     tenant.is_open     ?? true,
    });
    if (tenant.open_hours && typeof tenant.open_hours === 'object') {
      setHours({ ...DEFAULT_HOURS, ...tenant.open_hours });
    }
    setPreview(tenant.photo_url ?? null);
  }, [tenant]);

  const saveMutation = useMutation({
    mutationFn: (data) => tenantApi.updateMyTenant(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-tenant'] });
      toast.success('Pengaturan kantin berhasil disimpan.');
    },
    onError: (err) => toast.error(err?.response?.data?.message ?? 'Gagal menyimpan pengaturan.'),
  });

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleHour = (day, field, value) => {
    setHours((h) => ({ ...h, [day]: { ...h[day], [field]: value } }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('tenant_name', form.tenant_name);
    fd.append('description', form.description);
    fd.append('min_order',   form.min_order || 0);
    fd.append('is_open',     form.is_open ? '1' : '0');
    fd.append('open_hours',  JSON.stringify(openHours));
    if (photo) fd.append('photo', photo);
    saveMutation.mutate(fd);
  };

  if (isLoading) return <LoadingSpinner label="Memuat pengaturan kantin..." />;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Pengaturan Kantin</h1>
          <p className="text-sm text-gray-500">Kelola profil, jam operasional, dan konfigurasi kantin Anda</p>
        </div>
        <Button type="submit" variant="primary" size="sm" loading={saveMutation.isPending}
          leftIcon={<CheckCircleIcon className="w-4 h-4" />}>
          Simpan Perubahan
        </Button>
      </div>

      {/* Foto Kantin */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-5">
          <span className="p-2 rounded-lg bg-emerald-100"><PhotoIcon className="w-4 h-4 text-emerald-600" /></span>
          <h2 className="text-sm font-semibold text-gray-800">Foto Kantin</h2>
        </div>
        <div className="flex items-center gap-5">
          <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
            {preview
              ? <img src={preview} alt="Foto kantin" className="w-full h-full object-cover" />
              : <PhotoIcon className="w-8 h-8 text-gray-300" />}
          </div>
          <div>
            <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
              Ganti Foto
            </Button>
            <p className="text-xs text-gray-500 mt-1.5">JPG, PNG, atau WebP. Maks 2MB.</p>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          </div>
        </div>
      </div>

      {/* Info Dasar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-5">
          <span className="p-2 rounded-lg bg-blue-100"><BuildingStorefrontIcon className="w-4 h-4 text-blue-600" /></span>
          <h2 className="text-sm font-semibold text-gray-800">Informasi Kantin</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Nama Kantin" value={form.tenant_name} required
            onChange={(e) => setForm((f) => ({ ...f, tenant_name: e.target.value }))} />
          <Input label="Minimum Order (Rp)" type="number" value={form.min_order} min="0"
            hint="Isi 0 jika tidak ada minimum order"
            onChange={(e) => setForm((f) => ({ ...f, min_order: e.target.value }))} />
          <div className="sm:col-span-2">
            <Input label="Deskripsi Kantin" value={form.description} textarea rows={3}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
        </div>
      </div>

      {/* Status Buka/Tutup */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-5">
          <span className="p-2 rounded-lg bg-amber-100"><CurrencyDollarIcon className="w-4 h-4 text-amber-600" /></span>
          <h2 className="text-sm font-semibold text-gray-800">Status Operasional</h2>
        </div>
        <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
          <div>
            <p className="text-sm font-semibold text-gray-800">Kantin Buka</p>
            <p className="text-xs text-gray-500">Customer dapat melihat dan memesan dari kantin Anda</p>
          </div>
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, is_open: !f.is_open }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${form.is_open ? 'bg-[#2D6A4F]' : 'bg-gray-300'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.is_open ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 px-1">
          {form.is_open
            ? 'Kantin sedang buka — customer dapat melakukan pemesanan.'
            : 'Kantin sedang tutup — customer tidak dapat memesan.'}
        </p>
      </div>

      {/* Jam Operasional */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-5">
          <span className="p-2 rounded-lg bg-purple-100"><ClockIcon className="w-4 h-4 text-purple-600" /></span>
          <h2 className="text-sm font-semibold text-gray-800">Jam Operasional</h2>
        </div>
        <div className="space-y-3">
          {DAYS.map((d) => (
            <div key={d.key} className="flex items-center gap-4 py-2.5 border-b border-gray-50 last:border-0">
              <div className="w-20">
                <p className="text-sm font-medium text-gray-700">{d.label}</p>
              </div>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!openHours[d.key]?.closed}
                  onChange={(e) => handleHour(d.key, 'closed', !e.target.checked)}
                  className="rounded border-gray-300 text-[#2D6A4F]"
                />
                <span className="text-xs text-gray-500">Buka</span>
              </label>
              {!openHours[d.key]?.closed ? (
                <div className="flex items-center gap-2 flex-1">
                  <input type="time" value={openHours[d.key]?.open ?? '07:00'}
                    onChange={(e) => handleHour(d.key, 'open', e.target.value)}
                    className="text-sm rounded-lg border border-gray-200 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20" />
                  <span className="text-gray-400 text-sm">—</span>
                  <input type="time" value={openHours[d.key]?.close ?? '17:00'}
                    onChange={(e) => handleHour(d.key, 'close', e.target.value)}
                    className="text-sm rounded-lg border border-gray-200 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20" />
                </div>
              ) : (
                <span className="text-xs text-gray-400 italic">Tutup hari ini</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </form>
  );
}
