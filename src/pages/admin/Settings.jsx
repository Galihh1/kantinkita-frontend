import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  Settings as SettingsIcon, DollarSign, CreditCard, Package,
  Globe, History, Save, RefreshCw, ChevronDown, ChevronUp,
  CheckCircle, AlertTriangle, Clock,
} from 'lucide-react';

// ── Field Component ───────────────────────────────────────────────────────────
function SettingField({ fieldKey, label, type = 'text', hint, options, value, onChange }) {
  const id = `setting-${fieldKey}`;
  const baseClass =
    'w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-800 ' +
    'focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition';

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">{label}</label>
      {type === 'select' ? (
        <select id={id} value={value ?? ''} onChange={(e) => onChange(fieldKey, e.target.value)} className={baseClass}>
          {options.map((opt) => (
            <option key={opt.value ?? opt} value={opt.value ?? opt}>
              {opt.label ?? opt}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea id={id} value={value ?? ''} onChange={(e) => onChange(fieldKey, e.target.value)}
          rows={3} className={baseClass} />
      ) : (
        <input id={id} type={type} value={value ?? ''} onChange={(e) => onChange(fieldKey, e.target.value)}
          className={baseClass} />
      )}
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

// ── Collapsible Section ───────────────────────────────────────────────────────
function Section({ icon: Icon, title, color = 'emerald', children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-100 hover:bg-gray-100 transition"
      >
        <div className="flex items-center gap-3">
          <span className={`p-2 rounded-lg bg-${color}-100`}>
            <Icon size={16} className={`text-${color}-600`} />
          </span>
          <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
        </div>
        {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>
      {open && <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">{children}</div>}
    </div>
  );
}

// ── Version History ───────────────────────────────────────────────────────────
function VersionHistory() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['setting-versions'],
    queryFn: () => adminApi.getSettingVersions().then((r) => r.data.data?.data ?? r.data.data ?? []),
  });

  const rollbackMutation = useMutation({
    mutationFn: ({ key, value }) => adminApi.updateSettings({ [key]: value }),
    onSuccess: (_, { key }) => {
      toast.success(`Pengaturan '${key}' berhasil dikembalikan ke nilai sebelumnya.`);
      qc.invalidateQueries({ queryKey: ['admin-settings'] });
      qc.invalidateQueries({ queryKey: ['setting-versions'] });
    },
    onError: (err) => toast.error(err?.response?.data?.message ?? 'Gagal melakukan rollback pengaturan.'),
  });

  const handleRollback = (key, oldValue) => {
    if (!window.confirm(`Kembalikan pengaturan '${key}' ke nilai: "${oldValue ?? '(kosong)'}"?`)) return;
    rollbackMutation.mutate({ key, value: oldValue ?? '' });
  };

  if (isLoading) return <LoadingSpinner label="Memuat riwayat..." />;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center gap-3">
        <span className="p-2 rounded-lg bg-slate-100"><History size={16} className="text-slate-600" /></span>
        <h2 className="text-sm font-semibold text-gray-800">Riwayat Perubahan Konfigurasi</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100 bg-gray-50">
              <th className="px-4 py-2.5 text-left">Ver</th>
              <th className="px-4 py-2.5 text-left">Kunci</th>
              <th className="px-4 py-2.5 text-left">Nilai Lama</th>
              <th className="px-4 py-2.5 text-left">Nilai Baru</th>
              <th className="px-4 py-2.5 text-left">Diubah Oleh</th>
              <th className="px-4 py-2.5 text-left">Waktu</th>
              <th className="px-4 py-2.5 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {(data?.data ?? data ?? []).slice(0, 20).map((v) => (
              <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                <td className="px-4 py-2.5 font-mono text-xs text-gray-500">v{v.version}</td>
                <td className="px-4 py-2.5 font-mono text-xs text-emerald-700 font-medium">{v.changed_key}</td>
                <td className="px-4 py-2.5 text-red-500 text-xs">{v.old_value ?? '—'}</td>
                <td className="px-4 py-2.5 text-emerald-600 text-xs font-medium">{v.new_value ?? '—'}</td>
                <td className="px-4 py-2.5 text-gray-600 text-xs">{v.changed_by}</td>
                <td className="px-4 py-2.5 text-gray-500 text-xs">
                  {new Date(v.created_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                </td>
                <td className="px-4 py-2.5">
                  {v.old_value !== null && v.old_value !== undefined && (
                    <button
                      onClick={() => handleRollback(v.changed_key, v.old_value)}
                      disabled={rollbackMutation.isPending}
                      className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1 hover:bg-amber-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Kembalikan
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!data || (data?.data ?? data)?.length === 0) && (
          <p className="text-center py-8 text-gray-500 text-sm">Belum ada riwayat perubahan konfigurasi.</p>
        )}
      </div>
    </div>
  );
}


// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Settings() {
  const qc = useQueryClient();
  const [local, setLocal] = useState(null);
  const [activeTab, setActiveTab] = useState('settings');
  const [saved, setSaved] = useState(false);

  const { data: rawData, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => adminApi.getSettings().then((r) => r.data.data),
  });

  // Flatten { group: [{key, value}] } → { key: value }
  useEffect(() => {
    if (!rawData) return;
    const flat = {};
    Object.values(rawData).flat().forEach((s) => { flat[s.key] = s.value; });
    setLocal(flat);
  }, [rawData]);

  const settings = local ?? {};
  const set = (key, value) => setLocal((s) => ({ ...s, [key]: value }));

  const saveMutation = useMutation({
    mutationFn: () => adminApi.updateSettings(settings),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-settings'] });
      qc.invalidateQueries({ queryKey: ['setting-versions'] });
      toast.success('Pengaturan berhasil disimpan!');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Gagal menyimpan pengaturan'),
  });

  if (isLoading) return <LoadingSpinner label="Memuat pengaturan sistem..." />;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <SettingsIcon size={22} className="text-emerald-600" />
            Pengaturan Sistem
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Semua konfigurasi tersimpan di database dan berlaku secara real-time
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
              <CheckCircle size={16} /> Tersimpan
            </span>
          )}
          <Button
            id="btn-save-settings"
            variant="primary"
            loading={saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
            className="flex items-center gap-2"
          >
            <Save size={16} /> Simpan Semua
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {[
          { id: 'settings', label: 'Konfigurasi' },
          { id: 'history', label: 'Riwayat Perubahan' },
        ].map((tab) => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === tab.id
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'history' ? (
        <VersionHistory />
      ) : (
        <div className="space-y-4">
          {/* 1 — Aplikasi */}
          <Section icon={Globe} title="Aplikasi" color="blue">
            <SettingField fieldKey="app_name" label="Nama Aplikasi" value={settings.app_name} onChange={set} hint="Nama yang tampil di header dan email" />
            <SettingField fieldKey="support_email" label="Email Support" type="email" value={settings.support_email} onChange={set} />
            <SettingField fieldKey="support_phone" label="No. Telepon Support" type="tel" value={settings.support_phone} onChange={set} />
            <SettingField
              fieldKey="maintenance_mode"
              label="Mode Maintenance"
              type="select"
              value={settings.maintenance_mode}
              onChange={set}
              options={[{ value: 'false', label: 'Normal (Aktif)' }, { value: 'true', label: 'Maintenance (Ditutup)' }]}
              hint="Jika aktif, semua user (kecuali admin) tidak bisa mengakses aplikasi"
            />
          </Section>

          {/* 2 — Biaya Platform */}
          <Section icon={DollarSign} title="Biaya Platform" color="emerald">
            <SettingField
              fieldKey="fee_type"
              label="Tipe Biaya Layanan"
              type="select"
              value={settings.fee_type}
              onChange={set}
              options={[{ value: 'percentage', label: 'Persentase (%)' }, { value: 'fixed', label: 'Nominal Tetap (Rp)' }]}
            />
            <SettingField
              fieldKey="fee_value"
              label={settings.fee_type === 'fixed' ? 'Biaya Layanan (Rp)' : 'Biaya Layanan (%)'}
              type="number"
              value={settings.fee_value}
              onChange={set}
              hint="Dikenakan ke setiap transaksi customer"
            />
            <SettingField fieldKey="fee_label" label="Label Biaya" value={settings.fee_label} onChange={set} hint='Contoh: "Biaya Layanan" atau "Service Fee"' />
            <SettingField fieldKey="min_order_amount" label="Min. Order Default (Rp)" type="number" value={settings.min_order_amount} onChange={set} hint="Berlaku jika tenant tidak mengatur sendiri" />
          </Section>

          {/* 3 — Pembayaran */}
          <Section icon={CreditCard} title="Pembayaran & Midtrans" color="violet">
            <SettingField
              fieldKey="payment_timeout"
              label="Batas Waktu Pembayaran (menit)"
              type="number"
              value={settings.payment_timeout}
              onChange={set}
              hint="Pesanan akan expired jika tidak dibayar dalam waktu ini"
            />
            <SettingField
              fieldKey="midtrans_mode"
              label="Midtrans Environment"
              type="select"
              value={settings.midtrans_mode}
              onChange={set}
              options={[{ value: 'sandbox', label: 'Sandbox (Testing)' }, { value: 'production', label: 'Production (Live)' }]}
              hint="Ubah ke Production setelah go-live"
            />
          </Section>

          {/* 4 — Paket Langganan */}
          <Section icon={Package} title="Harga Paket Langganan" color="amber">
            <SettingField fieldKey="price_starter" label="Harga Paket Starter (Rp)" type="number" value={settings.price_starter} onChange={set} />
            <SettingField fieldKey="price_professional" label="Harga Paket Professional (Rp)" type="number" value={settings.price_professional} onChange={set} />
            <SettingField fieldKey="price_enterprise" label="Harga Paket Enterprise (Rp)" type="number" value={settings.price_enterprise} onChange={set} />
            <SettingField fieldKey="trial_days" label="Masa Trial Gratis (hari)" type="number" value={settings.trial_days} onChange={set} hint="Diberikan otomatis saat Owner baru mendaftar" />
          </Section>

          {/* 5 — Fitur Paket */}
          <Section icon={Clock} title="Deskripsi Fitur Paket" color="rose" defaultOpen={false}>
            <div className="col-span-2">
              <p className="text-xs text-gray-400 mb-4">
                Fitur ini ditampilkan di halaman pilihan paket langganan Owner. Pisahkan setiap fitur dengan koma (,).
              </p>
            </div>
            <SettingField
              fieldKey="plan_starter_features"
              label="Fitur Paket Starter"
              type="textarea"
              value={settings.plan_starter_features}
              onChange={set}
              hint="Contoh: 100 Orders/bulan, 50 Menu, 2 Staff Accounts"
            />
            <SettingField
              fieldKey="plan_professional_features"
              label="Fitur Paket Professional"
              type="textarea"
              value={settings.plan_professional_features}
              onChange={set}
            />
            <SettingField
              fieldKey="plan_enterprise_features"
              label="Fitur Paket Enterprise"
              type="textarea"
              value={settings.plan_enterprise_features}
              onChange={set}
            />
          </Section>

          {/* Info Box */}
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex gap-3">
            <AlertTriangle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">Catatan Penting</p>
              <p className="text-xs text-amber-600 mt-1">
                Hanya key yang sudah ada di database (<code className="bg-amber-100 px-1 rounded">system_settings</code>) yang dapat diubah di sini.
                Untuk menambah key baru, gunakan seeder atau insert langsung di database.
                Perubahan berlaku segera setelah disimpan — tidak perlu restart server.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
