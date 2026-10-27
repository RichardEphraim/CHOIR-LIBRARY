import React, { useState } from 'react';
import { ChurchTenant } from '../types/choir';
import { X, Church, Check, Plus, MapPin, Hash } from 'lucide-react';
import { ASSETS } from '../data/seedData';
import { generateChurchRoomCode } from '../services/authApi';

interface TenantSwitcherModalProps {
  isOpen: boolean;
  tenants: ChurchTenant[];
  currentTenantId: string;
  onSelectTenant: (tenantId: string) => void;
  onRegisterTenant: (newTenant: Omit<ChurchTenant, 'id' | 'memberCount'>) => void;
  onClose: () => void;
}

export const TenantSwitcherModal: React.FC<TenantSwitcherModalProps> = ({
  isOpen,
  tenants,
  currentTenantId,
  onSelectTenant,
  onRegisterTenant,
  onClose,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [denomination, setDenomination] = useState('');
  const [choirMasterName, setChoirMasterName] = useState('');
  const [motto, setMotto] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !city.trim() || !choirMasterName.trim()) {
      setError('Church name, city, and choir director name are required.');
      return;
    }

    const roomCode = generateChurchRoomCode(name.trim());

    onRegisterTenant({
      name: name.trim(),
      roomCode,
      city: city.trim(),
      denomination: denomination.trim() || 'Ecclesiastical Choir',
      choirMasterName: choirMasterName.trim(),
      motto: motto.trim() || 'Singing in Sacred Fellowship',
      inviteCode: roomCode,
      logoUrl: ASSETS.churchSeal,
    });

    setName('');
    setCity('');
    setDenomination('');
    setChoirMasterName('');
    setMotto('');
    setError('');
    setShowAddForm(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tenant-switcher-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-neutral-200 bg-white text-neutral-900 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-200 bg-neutral-50/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-neutral-900 text-white">
              <Church className="h-4 w-4" />
            </div>
            <div>
              <h2 id="tenant-switcher-title" className="font-cinzel text-lg font-bold text-neutral-900">
                Church Organizations
              </h2>
              <p className="text-xs text-neutral-500">
                Multi-Tenant Isolation · Repertoire strictly scoped by church
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3.5 max-h-[70vh] overflow-y-auto">
          {!showAddForm ? (
            <div className="space-y-2">
              {tenants.map((tenant) => {
                const isSelected = tenant.id === currentTenantId;
                return (
                  <button
                    key={tenant.id}
                    onClick={() => {
                      onSelectTenant(tenant.id);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-neutral-50 border-neutral-900 shadow-xs'
                        : 'bg-white border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm text-neutral-900 font-cinzel">
                          {tenant.name}
                        </h4>
                        {isSelected && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-900 text-white font-semibold">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                        <MapPin className="h-3 w-3 text-neutral-400 shrink-0" />
                        <span>{tenant.city}</span>
                        <span aria-hidden="true">·</span>
                        <span>{tenant.denomination}</span>
                      </div>
                      <div className="text-[11px] text-neutral-400">
                        Director: {tenant.choirMasterName}
                      </div>
                    </div>

                    <div className="shrink-0 pl-3">
                      {isSelected ? (
                        <div className="h-5 w-5 rounded-full bg-neutral-900 text-white flex items-center justify-center">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </div>
                      ) : (
                        <span className="text-xs text-neutral-400">
                          Switch →
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}

              <button
                onClick={() => setShowAddForm(true)}
                className="w-full flex items-center justify-center gap-1.5 p-3 rounded-xl border border-dashed border-neutral-300 hover:border-neutral-900 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Register New Church / Organization</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3 bg-neutral-50 p-4 rounded-xl border border-neutral-200">
              <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                Register New Church Organization
              </h4>

              {error && <p className="text-xs text-red-600">{error}</p>}

              <div>
                <label className="block text-[11px] text-neutral-600 mb-1">
                  Church / Choir Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Saint Peter's Choral Society"
                  className="w-full px-3 py-1.5 text-xs rounded-lg bg-white border border-neutral-300 text-neutral-900 focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] text-neutral-600 mb-1">City / State *</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Boston, MA"
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-white border border-neutral-300 text-neutral-900 focus:outline-none focus:border-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-neutral-600 mb-1">Denomination</label>
                  <input
                    type="text"
                    value={denomination}
                    onChange={(e) => setDenomination(e.target.value)}
                    placeholder="e.g. Baptist, Anglican"
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-white border border-neutral-300 text-neutral-900 focus:outline-none focus:border-neutral-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-neutral-600 mb-1">Choir Director *</label>
                <input
                  type="text"
                  value={choirMasterName}
                  onChange={(e) => setChoirMasterName(e.target.value)}
                  placeholder="e.g. Dr. Thomas More"
                  className="w-full px-3 py-1.5 text-xs rounded-lg bg-white border border-neutral-300 text-neutral-900 focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block text-[11px] text-neutral-600 mb-1">Choir Motto</label>
                <input
                  type="text"
                  value={motto}
                  onChange={(e) => setMotto(e.target.value)}
                  placeholder="e.g. Singing in joyful fellowship"
                  className="w-full px-3 py-1.5 text-xs rounded-lg bg-white border border-neutral-300 text-neutral-900 focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1 text-xs text-neutral-600 hover:text-neutral-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1 text-xs font-semibold rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 cursor-pointer"
                >
                  Create Organization
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
