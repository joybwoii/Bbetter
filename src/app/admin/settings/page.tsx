'use client';
import { useState, useEffect } from 'react';
import { getSettings, saveSettings } from '@/lib/actions/admin';
import styles from '../admin.module.css';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<any>({
    storeName: '',
    supportEmail: '',
    description: '',
    currency: 'INR',
    gateway: 'razorpay'
  });

  useEffect(() => {
    async function loadSettings() {
      const data = await getSettings();
      setSettings(data);
      setLoading(false);
    }
    loadSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    const result = await saveSettings(settings);
    setSaving(false);
    if (result.success) {
      alert('Settings saved successfully');
    } else {
      alert(result.error || 'Failed to save settings');
    }
  };

  if (loading) return <div className={styles.emptyState}>Loading settings...</div>;

  return (
    <div>
      <h1 className={styles.pageTitle}>Store Settings</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className={styles.panelCard}>
            <h2 className={styles.panelTitle}>General Information</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label className={styles.statLabel} style={{ display: 'block', marginBottom: '0.5rem' }}>Store Name</label>
                <input 
                  type="text" 
                  name="storeName"
                  className="input" 
                  value={settings.storeName} 
                  onChange={handleChange}
                  style={{ width: '100%' }} 
                />
              </div>
              <div>
                <label className={styles.statLabel} style={{ display: 'block', marginBottom: '0.5rem' }}>Support Email</label>
                <input 
                  type="email" 
                  name="supportEmail"
                  className="input" 
                  value={settings.supportEmail} 
                  onChange={handleChange}
                  style={{ width: '100%' }} 
                />
              </div>
              <div>
                <label className={styles.statLabel} style={{ display: 'block', marginBottom: '0.5rem' }}>Store Description</label>
                <textarea 
                  name="description"
                  className="input" 
                  rows={4} 
                  value={settings.description} 
                  onChange={handleChange}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>

          <div className={styles.panelCard}>
            <h2 className={styles.panelTitle}>Payments & Currency</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                 <div>
                    <label className={styles.statLabel} style={{ display: 'block', marginBottom: '0.5rem' }}>Store Currency</label>
                    <select 
                      name="currency"
                      className={styles.select} 
                      value={settings.currency} 
                      onChange={handleChange}
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                    </select>
                 </div>
                 <div>
                    <label className={styles.statLabel} style={{ display: 'block', marginBottom: '0.5rem' }}>Payment Gateway</label>
                    <select 
                      name="gateway"
                      className={styles.select} 
                      value={settings.gateway} 
                      onChange={handleChange}
                    >
                      <option value="razorpay">Razorpay</option>
                      <option value="stripe">Stripe</option>
                    </select>
                 </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(34,197,94,0.1)', borderRadius: 'var(--radius-md)' }}>
                 <div style={{ color: 'var(--success)', fontWeight: 600 }}>Razorpay Connected</div>
                 <button className="btn btn-outline" style={{ marginLeft: 'auto', fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>Configure</button>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
             <button className="btn btn-outline" onClick={() => window.location.reload()}>Discard Changes</button>
             <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
               {saving ? 'Saving...' : 'Save Settings'}
             </button>
          </div>
        </div>

        <aside>
          <div className={styles.panelCard} style={{ marginBottom: '1.5rem' }}>
            <h2 className={styles.panelTitle}>Quick Links</h2>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <li><a href="#" style={{ color: 'var(--primary)', fontSize: '0.875rem', textDecoration: 'none' }}>Privacy Policy</a></li>
              <li><a href="#" style={{ color: 'var(--primary)', fontSize: '0.875rem', textDecoration: 'none' }}>Terms of Service</a></li>
              <li><a href="#" style={{ color: 'var(--primary)', fontSize: '0.875rem', textDecoration: 'none' }}>Shipping Policy</a></li>
              <li><a href="#" style={{ color: 'var(--primary)', fontSize: '0.875rem', textDecoration: 'none' }}>Refund Policy</a></li>
            </ul>
          </div>
          <div className={styles.panelCard}>
            <h2 className={styles.panelTitle}>System Info</h2>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Version</span>
                <span>1.0.4-stable</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Environment</span>
                <span>Production</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Last Updated</span>
                <span>{settings.updatedAt ? new Date(settings.updatedAt).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
