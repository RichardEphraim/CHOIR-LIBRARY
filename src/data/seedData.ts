import { ChurchTenant, Song, UserProfile, RepertoireSetlist } from '../types/choir';

export const ASSETS = {
  sheetMusic: '/src/assets/images/sheet_music_manuscript_1792754663166.jpg',
  churchSeal: '/src/assets/images/grace_cathedral_seal_1792754663654.jpg',
  choirSanctuary: '/src/assets/images/choir_sanctuary_banner_1792754664927.jpg',
};

export const INITIAL_TENANTS: ChurchTenant[] = [
  {
    id: 'grace-cathedral',
    name: 'Grace Cathedral Choral Guild',
    roomCode: 'GC-1042',
    city: 'St. Louis, MO',
    denomination: 'Anglican / Episcopal Tradition',
    logoUrl: ASSETS.churchSeal,
    memberCount: 42,
    choirMasterName: 'Dr. Alistair Sterling',
    motto: 'Soli Deo Gloria through Sacred Harmony',
    inviteCode: 'GC-1042',
    createdAt: '2023-01-01T00:00:00Z',
  },
  {
    id: 'st-jude-gospel',
    name: 'St. Jude Gospel Sanctuary Ensemble',
    roomCode: 'SJ-2045',
    city: 'Atlanta, GA',
    denomination: 'Gospel & Contemporary Praise',
    logoUrl: ASSETS.churchSeal,
    memberCount: 35,
    choirMasterName: 'Minister Danielle Washington',
    motto: 'Lifting Every Voice in Joyful Praise',
    inviteCode: 'SJ-2045',
    createdAt: '2023-01-10T00:00:00Z',
  },
  {
    id: 'holy-trinity-youth',
    name: 'Holy Trinity Youth & Campus Choir',
    roomCode: 'HT-3098',
    city: 'Chicago, IL',
    denomination: 'Interdenominational Fellowship',
    logoUrl: ASSETS.churchSeal,
    memberCount: 24,
    choirMasterName: 'Brother Marcus Chen',
    motto: 'Renewing the Church with Living Songs',
    inviteCode: 'HT-3098',
    createdAt: '2023-02-01T00:00:00Z',
  },
];

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user-admin-grace',
    name: 'Dr. Alistair Sterling',
    fullName: 'Dr. Alistair Sterling',
    username: 'admin_grace',
    email: 'choirmaster@gracecathedral.org',
    role: 'ADMIN',
    status: 'APPROVED',
    voicePart: 'Director',
    churchId: 'grace-cathedral',
    createdAt: '2023-01-01T00:00:00Z',
  },
  {
    id: 'user-chorister-grace',
    name: 'Eleanor Vance',
    fullName: 'Eleanor Vance',
    username: 'soprano_eleanor',
    email: 'eleanor.v@gracecathedral.org',
    role: 'MEMBER',
    status: 'APPROVED',
    voicePart: 'Soprano',
    churchId: 'grace-cathedral',
    createdAt: '2023-02-15T00:00:00Z',
  },
  {
    id: 'user-pending-grace',
    name: 'Solomon Davies',
    fullName: 'Solomon Davies',
    username: 'solomon_tenor',
    email: 'solomon.d@gracecathedral.org',
    role: 'MEMBER',
    status: 'PENDING',
    voicePart: 'Tenor',
    churchId: 'grace-cathedral',
    createdAt: '2026-10-25T14:30:00Z',
  },
  {
    id: 'user-admin-stjude',
    name: 'Minister Danielle Washington',
    fullName: 'Minister Danielle Washington',
    username: 'admin_danielle',
    email: 'danielle@stjudegospel.org',
    role: 'ADMIN',
    status: 'APPROVED',
    voicePart: 'Director',
    churchId: 'st-jude-gospel',
    createdAt: '2023-01-10T00:00:00Z',
  },
  {
    id: 'user-chorister-stjude',
    name: 'Jeremiah Brooks',
    fullName: 'Jeremiah Brooks',
    username: 'jeremiah_tenor',
    email: 'jeremiah@stjudegospel.org',
    role: 'MEMBER',
    status: 'APPROVED',
    voicePart: 'Tenor',
    churchId: 'st-jude-gospel',
    createdAt: '2023-02-01T00:00:00Z',
  },
  {
    id: 'user-pending-stjude',
    name: 'Miriam O\'Connor',
    fullName: 'Miriam O\'Connor',
    username: 'miriam_alto',
    email: 'miriam.alto@stjudegospel.org',
    role: 'MEMBER',
    status: 'PENDING',
    voicePart: 'Alto',
    churchId: 'st-jude-gospel',
    createdAt: '2026-10-26T09:15:00Z',
  },
];

export const INITIAL_SONGS: Song[] = [
  // --- GRACE CATHEDRAL SONGS (churchId: 'grace-cathedral') ---
  {
    id: 'gc-song-1',
    churchId: 'grace-cathedral',
    title: 'O Come, All Ye Faithful (Adeste Fideles)',
    broughtBy: 'Sister Beatrix Holloway',
    dateBrought: '2022-11-14',
    origin: 'External',
    composer: 'John Francis Wade (arr. David Willcocks)',
    lyrics: `[Verse 1 - Unison]
O come, all ye faithful, joyful and triumphant,
O come ye, O come ye to Bethlehem;
Come and behold Him, born the King of angels:

[Refrain - Full Choir SATB]
O come, let us adore Him,
O come, let us adore Him,
O come, let us adore Him,
Christ the Lord!

[Verse 2 - Sopranos & Altos]
God of God, Light of Light,
Lo! He abhors not the Virgin's womb;
Very God, begotten not created:

[Refrain]
O come, let us adore Him...

[Verse 3 - Descant on Final Refrain]
Yea, Lord, we greet Thee, born this happy morning;
Jesus, to Thee be glory given;
Word of the Father, now in flesh appearing!`,
    lyricSheetImage: ASSETS.sheetMusic,
    audioDuration: 210,
    tags: ['Hymn', 'Anthem', 'Worship'],
    keySignature: 'G Major',
    tempoBpm: 96,
    notes: 'Descant enters on Verse 3. Organ brass fanfare on final refrain.',
    createdAt: '2022-11-14T09:00:00Z',
    updatedAt: '2024-01-10T11:20:00Z',
  },
  {
    id: 'gc-song-2',
    churchId: 'grace-cathedral',
    title: 'Light in the Cloister (Vesper Hymn)',
    broughtBy: 'Brother Julian Thorne (Tenor Section Lead)',
    dateBrought: '2023-03-21',
    origin: 'Original',
    composer: 'Julian Thorne',
    lyrics: `[Intro - Soft Hum SATB]
Mmm... Lux aeterna luceat eis...

[Stanza 1 - Solo Baritone]
When the shadows lengthen o'er the nave,
And daylight yields to evening grace,
We raise our hearts from earthly dust,
To behold Thy sacred face.

[Chorus - 4-Part Polyphony]
O Kindle now within our soul,
The flame that darkness cannot quell;
Immanuel, our peace and shield,
With Thy redeemed forever dwell.

[Stanza 2 - Full Choir]
The stone takes up our humble song,
Echoes rise to vaulted height;
Through all the watches of the night,
Thou art our everlasting Light.`,
    lyricSheetImage: ASSETS.sheetMusic,
    audioDuration: 185,
    tags: ['Anthem', 'Benediction', 'Special Number'],
    keySignature: 'D Minor',
    tempoBpm: 72,
    notes: 'Composed by Brother Julian for the 2023 Candlemas Vigil. Hold the final D minor chord for 4 full measures.',
    createdAt: '2023-03-21T16:00:00Z',
    updatedAt: '2023-03-21T16:00:00Z',
  },
  {
    id: 'gc-song-3',
    churchId: 'grace-cathedral',
    title: 'Be Thou My Vision (Slane)',
    broughtBy: 'Mrs. Clara Finch',
    dateBrought: '2021-09-08',
    origin: 'External',
    composer: 'Traditional Irish / Dallán Forgaill',
    lyrics: `[Verse 1 - A Cappella SATB]
Be Thou my Vision, O Lord of my heart;
Naught be all else to me, save that Thou art;
Thou my best thought, by day or by night,
Waking or sleeping, Thy presence my light.

[Verse 2]
Be Thou my Wisdom, and Thou my true Word;
I ever with Thee and Thou with me, Lord;
Thou my great Father, and I Thy true son,
Thou in me dwelling and I with Thee one.

[Verse 3]
Riches I heed not, nor man's empty praise;
Thou mine inheritance, now and always;
Thou and Thou only, first in my heart,
High King of Heaven, my treasure Thou art!`,
    lyricSheetImage: ASSETS.sheetMusic,
    audioDuration: 195,
    tags: ['Hymn', 'Worship'],
    keySignature: 'Eb Major',
    tempoBpm: 84,
    notes: 'Maintain fluid 3/4 lilt. Breathe strictly at punctuation marks.',
    createdAt: '2021-09-08T10:00:00Z',
    updatedAt: '2023-11-05T08:15:00Z',
  },
  {
    id: 'gc-song-4',
    churchId: 'grace-cathedral',
    title: 'Grace Abounding (Anthem of Thanksgiving)',
    broughtBy: 'Eleanor Vance',
    dateBrought: '2024-02-17',
    origin: 'Original',
    composer: 'Eleanor Vance & Alistair Sterling',
    lyrics: `[Prelude]
Praise the Lord, O my soul!

[Movement 1 - Allegro Maestoso]
From morning sun to evening sky,
Thy boundless mercy reaches high;
No sin too deep, no grief too vast,
Thy tender love redeems our past.

[Movement 2 - Adagio]
Here at the altar, bread and cup,
The broken spirit lifteth up;
O sacred chalice, crimson thread,
By which the hungry flock is fed.

[Movement 3 - Gloria Finale]
Alleluia! Amen! Alleluia!`,
    lyricSheetImage: ASSETS.sheetMusic,
    audioDuration: 240,
    tags: ['Anthem', 'Offertory', 'Worship'],
    keySignature: 'C Major',
    tempoBpm: 104,
    notes: 'Written for Eleanor Vance’s 10th year as choral scholar.',
    createdAt: '2024-02-17T14:30:00Z',
    updatedAt: '2024-02-17T14:30:00Z',
  },
  {
    id: 'gc-song-5',
    churchId: 'grace-cathedral',
    title: 'The Lord Bless You and Keep You',
    broughtBy: 'Dr. Alistair Sterling',
    dateBrought: '2020-05-10',
    origin: 'External',
    composer: 'Peter C. Lutkin',
    lyrics: `[Choral Benediction]
The Lord bless you and keep you,
The Lord lift His countenance upon you,
And give you peace, and give you peace.

The Lord make His face to shine upon you,
And be gracious unto you,
Be gracious, be gracious unto you.

[Sevenfold Amen]
Amen, Amen, Amen,
Amen, Amen, Amen, Amen!`,
    lyricSheetImage: ASSETS.sheetMusic,
    audioDuration: 130,
    tags: ['Hymn', 'Benediction'],
    keySignature: 'C Major',
    tempoBpm: 66,
    notes: 'Standard service dismissal. Ensure soft pianissimo on the final Amen.',
    createdAt: '2020-05-10T08:00:00Z',
    updatedAt: '2023-01-14T09:00:00Z',
  },

  // --- ST. JUDE GOSPEL ENSEMBLE SONGS (churchId: 'st-jude-gospel') ---
  {
    id: 'sj-song-1',
    churchId: 'st-jude-gospel',
    title: 'Total Praise',
    broughtBy: 'Minister Danielle Washington',
    dateBrought: '2023-01-15',
    origin: 'External',
    composer: 'Richard Smallwood',
    lyrics: `[Intro]
Lord, I will lift mine eyes to the hills,
Knowing my help is coming from You.
Your peace You give me in time of the storm.

[Chorus - Soprano, Alto, Tenor Build]
You are the source of my strength,
You are the strength of my life;
I lift my hands in total praise to You!

[Climax]
Amen, Amen,
Amen, Amen...
Total praise to You!`,
    lyricSheetImage: ASSETS.sheetMusic,
    audioDuration: 280,
    tags: ['Anthem', 'Worship', 'Praise'],
    keySignature: 'Db Major',
    tempoBpm: 68,
    notes: 'Full dynamics from whisper to double forte on the Amen modulation.',
    createdAt: '2023-01-15T11:00:00Z',
    updatedAt: '2023-06-20T12:00:00Z',
  },
  {
    id: 'sj-song-2',
    churchId: 'st-jude-gospel',
    title: 'Rivers in the Sanctuary',
    broughtBy: 'Jeremiah Brooks',
    dateBrought: '2024-04-03',
    origin: 'Original',
    composer: 'Jeremiah Brooks',
    lyrics: `[Call & Response]
Leader: Is there a river in this house?
Choir: Flowing from the throne of God!
Leader: Is there healing in this house?
Choir: Flowing from the Lamb of God!

[Up-tempo Vamp]
Let it flow, let it flow,
Living water heal my soul!
Let it flow, let it flow,
Make the broken spirit whole!`,
    lyricSheetImage: ASSETS.sheetMusic,
    audioDuration: 220,
    tags: ['Praise', 'Special Number'],
    keySignature: 'F Major',
    tempoBpm: 128,
    notes: 'Composed by tenor Jeremiah Brooks for Youth Sunday 2024. Drum break before vamp.',
    createdAt: '2024-04-03T19:00:00Z',
    updatedAt: '2024-04-03T19:00:00Z',
  },
  {
    id: 'sj-song-3',
    churchId: 'st-jude-gospel',
    title: 'Great Is Thy Faithfulness (Gospel Choral Arrangement)',
    broughtBy: 'Mother Estelle Robinson',
    dateBrought: '2022-08-19',
    origin: 'External',
    composer: 'Thomas Chisholm / arr. Danielle Washington',
    lyrics: `[Verse 1]
Great is Thy faithfulness, O God my Father,
There is no shadow of turning with Thee;
Thou changest not, Thy compassions, they fail not;
As Thou hast been Thou forever wilt be.

[Chorus - Swelling Harmonies]
Great is Thy faithfulness! Great is Thy faithfulness!
Morning by morning new mercies I see;
All I have needed Thy hand hath provided—
Great is Thy faithfulness, Lord, unto me!`,
    lyricSheetImage: ASSETS.sheetMusic,
    audioDuration: 250,
    tags: ['Hymn', 'Worship'],
    keySignature: 'Eb Major',
    tempoBpm: 76,
    notes: 'Organ swell on verse 3 transition.',
    createdAt: '2022-08-19T10:00:00Z',
    updatedAt: '2023-09-01T15:00:00Z',
  },

  // --- HOLY TRINITY YOUTH CHOIR SONGS (churchId: 'holy-trinity-youth') ---
  {
    id: 'ht-song-1',
    churchId: 'holy-trinity-youth',
    title: 'Living Stones on Campus',
    broughtBy: 'Brother Marcus Chen',
    dateBrought: '2024-03-12',
    origin: 'Original',
    composer: 'Marcus Chen & Campus Choristers',
    lyrics: `[Verse 1]
Not of mortar, not of clay,
We are built by grace today.
Living stones with voices clear,
Singing that the Kingdom's near!

[Chorus]
One holy temple, one living Lord,
Founded forever on His sacred Word!`,
    lyricSheetImage: ASSETS.sheetMusic,
    audioDuration: 175,
    tags: ['Praise', 'Anthem'],
    keySignature: 'A Major',
    tempoBpm: 112,
    notes: 'Youth choir original for fall campus mission week.',
    createdAt: '2024-03-12T13:00:00Z',
    updatedAt: '2024-03-12T13:00:00Z',
  },
];

export const INITIAL_SETLISTS: RepertoireSetlist[] = [
  {
    id: 'setlist-gc-1',
    churchId: 'grace-cathedral',
    title: 'Sunday Morning Solemn High Mass',
    serviceDate: '2026-11-01',
    serviceType: 'Solemn Liturgy & Holy Communion',
    songIds: ['gc-song-1', 'gc-song-3', 'gc-song-4', 'gc-song-5'],
    notes: 'Processional: Hymn 1; Offertory Anthem: Grace Abounding; Recessional: Lutkin Benediction.',
  },
  {
    id: 'setlist-gc-2',
    churchId: 'grace-cathedral',
    title: 'Evensong & Candlemas Vigil',
    serviceDate: '2026-11-08',
    serviceType: 'Choral Evensong',
    songIds: ['gc-song-2', 'gc-song-5'],
    notes: 'A cappella rehearsal begins promptly at 4:15 PM in the chapel.',
  },
  {
    id: 'setlist-sj-1',
    churchId: 'st-jude-gospel',
    title: 'First Sunday Celebration Service',
    serviceDate: '2026-11-01',
    serviceType: 'Communion & Praise Service',
    songIds: ['sj-song-1', 'sj-song-2', 'sj-song-3'],
    notes: 'Total Praise for opening dedication. Sanctuary choir robe color: Royal Gold.',
  },
];
