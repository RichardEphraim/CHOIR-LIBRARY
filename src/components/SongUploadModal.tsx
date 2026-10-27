import React, { useState, useEffect } from 'react';
import { Song, SongOrigin, SongCategory, UserProfile } from '../types/choir';
import { validateSongPayload, SongValidationErrors } from '../utils/library';
import { X, FileMusic, Image as ImageIcon, AlertCircle, Tag, User } from 'lucide-react';

interface SongUploadModalProps {
  isOpen: boolean;
  churchId: string;
  currentUser?: UserProfile;
  songToEdit?: Song | null;
  onClose: () => void;
  onSave: (songData: Omit<Song, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => void;
}

const AVAILABLE_TAGS: SongCategory[] = [
  'Hymn',
  'Praise',
  'Worship',
  'Special Number',
  'Anthem',
  'Offertory',
  'Benediction',
];

export const SongUploadModal: React.FC<SongUploadModalProps> = ({
  isOpen,
  churchId,
  currentUser,
  songToEdit,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [broughtBy, setBroughtBy] = useState('');
  const [dateBrought, setDateBrought] = useState('');
  const [origin, setOrigin] = useState<SongOrigin>('Original');
  const [composer, setComposer] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [lyricSheetImage, setLyricSheetImage] = useState<string>('');
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [audioFileName, setAudioFileName] = useState<string>('');
  const [sheetFileName, setSheetFileName] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<SongCategory[]>(['Hymn']);
  const [keySignature, setKeySignature] = useState('G Major');
  const [tempoBpm, setTempoBpm] = useState<number>(84);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<SongValidationErrors>({});

  useEffect(() => {
    if (songToEdit) {
      setTitle(songToEdit.title);
      setBroughtBy(songToEdit.broughtBy);
      setDateBrought(songToEdit.dateBrought);
      setOrigin(songToEdit.origin);
      setComposer(songToEdit.composer || '');
      setLyrics(songToEdit.lyrics || '');
      setLyricSheetImage(songToEdit.lyricSheetImage || '');
      setAudioUrl(songToEdit.audioUrl || '');
      setSelectedTags(songToEdit.tags || ['Hymn']);
      setKeySignature(songToEdit.keySignature || 'G Major');
      setTempoBpm(songToEdit.tempoBpm || 84);
      setNotes(songToEdit.notes || '');
      setSheetFileName(songToEdit.lyricSheetImage ? 'Attached sheet scan' : '');
      setAudioFileName(songToEdit.audioUrl ? 'Attached audio track' : '');
    } else {
      setTitle('');
      // Auto-tag with current user's username
      const defaultTag = currentUser?.username
        ? `@${currentUser.username}`
        : currentUser?.name || '';
      setBroughtBy(defaultTag);
      setDateBrought(new Date().toISOString().split('T')[0]);
      setOrigin('Original');
      setComposer('');
      setLyrics('');
      setLyricSheetImage('');
      setAudioUrl('');
      setAudioFileName('');
      setSheetFileName('');
      setSelectedTags(['Hymn']);
      setKeySignature('G Major');
      setTempoBpm(84);
      setNotes('');
    }
    setErrors({});
  }, [songToEdit, isOpen, currentUser]);

  if (!isOpen) return null;

  const handleToggleTag = (tag: SongCategory) => {
    if (selectedTags.includes(tag)) {
      if (selectedTags.length > 1) {
        setSelectedTags(selectedTags.filter((t) => t !== tag));
      }
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSheetFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSheetFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setLyricSheetImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAudioFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setAudioUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanBroughtBy = broughtBy.trim() || (currentUser?.username ? `@${currentUser.username}` : 'Chorister');

    const payload = {
      churchId,
      title,
      uploadedByUserId: songToEdit?.uploadedByUserId || currentUser?.id,
      broughtByName: currentUser?.username || songToEdit?.broughtByName,
      broughtBy: cleanBroughtBy,
      dateBrought,
      origin,
      composer,
      lyrics,
      lyricSheetImage,
      audioUrl,
      audioDuration: 180,
      tags: selectedTags,
      keySignature,
      tempoBpm: Number(tempoBpm) || 84,
      notes,
    };

    const validation = validateSongPayload(payload);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    onSave({
      ...payload,
      ...(songToEdit ? { id: songToEdit.id } : {}),
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl my-6 flex flex-col rounded-2xl border border-neutral-200 bg-white text-neutral-900 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-200 bg-neutral-50/50">
          <div>
            <h2 id="upload-modal-title" className="font-cinzel text-lg sm:text-xl font-bold text-neutral-900">
              {songToEdit ? 'Edit Song Metadata' : 'Add Song to Choir Library'}
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Choirmaster Cataloging · Church: {churchId}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto max-h-[75vh]">
          {/* General Errors Banner */}
          {Object.keys(errors).length > 0 && (
            <div className="p-3 rounded-lg border border-neutral-300 bg-neutral-50 text-neutral-800 text-xs flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-neutral-700 mt-0.5" />
              <div>
                <p className="font-semibold">Please complete required fields:</p>
                <ul className="list-disc pl-4 mt-0.5 space-y-0.5">
                  {Object.values(errors).map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Row 1: Title & Classification (Origin) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Song Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. O Come, All Ye Faithful"
                className={`w-full px-3 py-2 rounded-lg bg-neutral-50 border text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:bg-white ${
                  errors.title ? 'border-red-500' : 'border-neutral-200 focus:border-neutral-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Classification *
              </label>
              <select
                value={origin}
                onChange={(e) => setOrigin(e.target.value as SongOrigin)}
                className="w-full px-3 py-2 rounded-lg bg-neutral-50 border border-neutral-200 text-sm text-neutral-800 focus:outline-none focus:border-neutral-900 cursor-pointer"
              >
                <option value="Original">Original (Chorister)</option>
                <option value="External">External (Hymn)</option>
              </select>
            </div>
          </div>

          {/* Row 2: Brought By & Date Brought & Composer */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Brought By *
              </label>
              <input
                type="text"
                value={broughtBy}
                onChange={(e) => setBroughtBy(e.target.value)}
                placeholder="e.g. Sister Sarah Jenkins"
                className={`w-full px-3 py-2 rounded-lg bg-neutral-50 border text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:bg-white ${
                  errors.broughtBy ? 'border-red-500' : 'border-neutral-200 focus:border-neutral-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Date Introduced *
              </label>
              <input
                type="date"
                value={dateBrought}
                onChange={(e) => setDateBrought(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-neutral-50 border border-neutral-200 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900 font-mono-num cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Composer / Author
              </label>
              <input
                type="text"
                value={composer}
                onChange={(e) => setComposer(e.target.value)}
                placeholder="e.g. Fanny Crosby"
                className="w-full px-3 py-2 rounded-lg bg-neutral-50 border border-neutral-200 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900"
              />
            </div>
          </div>

          {/* Row 3: Key Signature & BPM */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Key Signature
              </label>
              <input
                type="text"
                value={keySignature}
                onChange={(e) => setKeySignature(e.target.value)}
                placeholder="e.g. G Major, D Minor"
                className="w-full px-3 py-2 rounded-lg bg-neutral-50 border border-neutral-200 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 font-mono-num"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Tempo (BPM)
              </label>
              <input
                type="number"
                min="40"
                max="240"
                value={tempoBpm}
                onChange={(e) => setTempoBpm(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-neutral-50 border border-neutral-200 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 font-mono-num"
              />
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Category Tags
            </label>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => handleToggleTag(tag)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-neutral-900 text-white'
                        : 'bg-neutral-100 border border-neutral-200 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Typed Lyrics */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Typed Lyrics & Section Cues
            </label>
            <textarea
              rows={5}
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              placeholder="[Verse 1]&#10;Enter lyrics here..."
              className="w-full p-2.5 rounded-lg bg-neutral-50 border border-neutral-200 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:bg-white focus:border-neutral-900 font-mono leading-relaxed"
            />
          </div>

          {/* File dropzones */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Sheet Music Upload */}
            <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50/60 p-3.5 text-center">
              <ImageIcon className="h-5 w-5 text-neutral-500 mx-auto mb-1.5" />
              <div className="text-xs font-medium text-neutral-800">
                Scanned Sheet Music / Manuscript
              </div>
              <label className="mt-2.5 inline-block cursor-pointer px-3 py-1 rounded-md bg-white border border-neutral-300 text-xs text-neutral-700 hover:bg-neutral-100">
                <span>{sheetFileName ? 'Replace' : 'Upload Image'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSheetFileUpload}
                  className="hidden"
                />
              </label>
              {sheetFileName && (
                <div className="mt-1 text-[11px] text-neutral-700 truncate">
                  ✓ {sheetFileName}
                </div>
              )}
            </div>

            {/* Rehearsal Audio File */}
            <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50/60 p-3.5 text-center">
              <FileMusic className="h-5 w-5 text-neutral-500 mx-auto mb-1.5" />
              <div className="text-xs font-medium text-neutral-800">
                Rehearsal Audio Track
              </div>
              <label className="mt-2.5 inline-block cursor-pointer px-3 py-1 rounded-md bg-white border border-neutral-300 text-xs text-neutral-700 hover:bg-neutral-100">
                <span>{audioFileName ? 'Replace' : 'Upload Audio'}</span>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioFileUpload}
                  className="hidden"
                />
              </label>
              {audioFileName && (
                <div className="mt-1 text-[11px] text-neutral-700 truncate">
                  ✓ {audioFileName}
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Performance Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Slower tempo on verse 3"
              className="w-full px-3 py-2 rounded-lg bg-neutral-50 border border-neutral-200 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold cursor-pointer"
            >
              {songToEdit ? 'Save Changes' : 'Add to Repertoire'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
