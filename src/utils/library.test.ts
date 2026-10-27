import test from 'node:test';
import assert from 'node:assert/strict';
import {
  filterSongsByChurch,
  filterAndSortSongs,
  isSongFavorite,
  toggleFavoriteRecord,
  validateSongPayload,
  extractFilterFacets,
} from './library';
import { Song, FavoriteRecord, SearchFilterState } from '../types/choir';

const mockSongs: Song[] = [
  {
    id: 'song-1',
    churchId: 'church-alpha',
    title: 'Blessed Assurance',
    broughtBy: 'Sister Sarah Jenkins',
    dateBrought: '2023-04-12',
    origin: 'External',
    composer: 'Fanny Crosby',
    lyrics: 'Blessed assurance, Jesus is mine! Oh, what a foretaste of glory divine!',
    tags: ['Hymn', 'Worship'],
    createdAt: '2023-04-12T10:00:00Z',
    updatedAt: '2023-04-12T10:00:00Z',
  },
  {
    id: 'song-2',
    churchId: 'church-alpha',
    title: 'Streams in the Desert',
    broughtBy: 'Bro Marcus Adeleke',
    dateBrought: '2024-01-18',
    origin: 'Original',
    composer: 'Marcus Adeleke',
    lyrics: 'He makes a way in the wilderness, streams in the desert flow.',
    tags: ['Praise', 'Anthem'],
    createdAt: '2024-01-18T14:00:00Z',
    updatedAt: '2024-01-18T14:00:00Z',
  },
  {
    id: 'song-3',
    churchId: 'church-beta',
    title: 'Total Praise',
    broughtBy: 'Choirmaster David',
    dateBrought: '2023-09-05',
    origin: 'External',
    composer: 'Richard Smallwood',
    lyrics: 'Lord, I will lift mine eyes to the hills.',
    tags: ['Anthem', 'Worship'],
    createdAt: '2023-09-05T18:00:00Z',
    updatedAt: '2023-09-05T18:00:00Z',
  },
];

test('filterSongsByChurch enforces strict tenant isolation', () => {
  const alphaSongs = filterSongsByChurch(mockSongs, 'church-alpha');
  assert.equal(alphaSongs.length, 2);
  assert.ok(alphaSongs.every((s) => s.churchId === 'church-alpha'));

  const betaSongs = filterSongsByChurch(mockSongs, 'church-beta');
  assert.equal(betaSongs.length, 1);
  assert.equal(betaSongs[0].title, 'Total Praise');

  const empty = filterSongsByChurch(mockSongs, 'church-gamma');
  assert.equal(empty.length, 0);
});

test('filterAndSortSongs filters by origin, composer, and text search', () => {
  const defaultFilters: SearchFilterState = {
    searchQuery: '',
    origin: 'all',
    tag: 'all',
    broughtBy: 'all',
    composer: 'all',
    yearBrought: 'all',
    sortBy: 'title-asc',
  };

  // Origin filter
  const originalOnly = filterAndSortSongs(mockSongs, { ...defaultFilters, origin: 'Original' });
  assert.equal(originalOnly.length, 1);
  assert.equal(originalOnly[0].title, 'Streams in the Desert');

  // Text search in lyrics
  const lyricsSearch = filterAndSortSongs(mockSongs, { ...defaultFilters, searchQuery: 'wilderness' });
  assert.equal(lyricsSearch.length, 1);
  assert.equal(lyricsSearch[0].id, 'song-2');

  // Year filter
  const year2024 = filterAndSortSongs(mockSongs, { ...defaultFilters, yearBrought: '2024' });
  assert.equal(year2024.length, 1);
  assert.equal(year2024[0].id, 'song-2');
});

test('toggleFavoriteRecord correctly adds and removes favorites within tenant boundary', () => {
  const initialFavorites: FavoriteRecord[] = [
    {
      userId: 'user-1',
      churchId: 'church-alpha',
      songId: 'song-1',
      createdAt: '2024-01-01',
    },
  ];

  assert.equal(isSongFavorite(initialFavorites, 'user-1', 'church-alpha', 'song-1'), true);
  assert.equal(isSongFavorite(initialFavorites, 'user-1', 'church-alpha', 'song-2'), false);

  // Add favorite
  const updated = toggleFavoriteRecord(initialFavorites, 'user-1', 'church-alpha', 'song-2');
  assert.equal(updated.length, 2);
  assert.equal(isSongFavorite(updated, 'user-1', 'church-alpha', 'song-2'), true);

  // Remove favorite
  const toggledOff = toggleFavoriteRecord(updated, 'user-1', 'church-alpha', 'song-1');
  assert.equal(toggledOff.length, 1);
  assert.equal(isSongFavorite(toggledOff, 'user-1', 'church-alpha', 'song-1'), false);
});

test('validateSongPayload enforces required fields', () => {
  const invalid = validateSongPayload({});
  assert.equal(invalid.isValid, false);
  assert.ok(invalid.errors.title);
  assert.ok(invalid.errors.broughtBy);
  assert.ok(invalid.errors.dateBrought);
  assert.ok(invalid.errors.lyricsOrSheet);

  const valid = validateSongPayload({
    title: 'Hallelujah Chorus',
    broughtBy: 'Choir Master George',
    dateBrought: '2024-12-01',
    origin: 'External',
    lyrics: 'Hallelujah, Hallelujah, for the Lord God omnipotent reigneth!',
  });
  assert.equal(valid.isValid, true);
  assert.equal(Object.keys(valid.errors).length, 0);
});

test('extractFilterFacets retrieves unique faceted filters', () => {
  const facets = extractFilterFacets(mockSongs);
  assert.ok(facets.broughtByOptions.includes('Sister Sarah Jenkins'));
  assert.ok(facets.yearOptions.includes('2023'));
  assert.ok(facets.yearOptions.includes('2024'));
  assert.ok(facets.tagOptions.includes('Hymn'));
});
