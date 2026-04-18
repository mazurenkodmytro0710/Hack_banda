export const KOSICE_DEFAULT = {
  lat: Number(process.env.NEXT_PUBLIC_DEFAULT_LAT ?? 48.7164),
  lng: Number(process.env.NEXT_PUBLIC_DEFAULT_LNG ?? 21.2611),
  zoom: Number(process.env.NEXT_PUBLIC_DEFAULT_ZOOM ?? 14),
};

export const REQUEST_EXPIRY_MINUTES = 15;
export const NEARBY_RADIUS_METRES = 2000;
export const COMPLETION_DISTANCE_METRES = 50;
export const SAFE_NODE_RADIUS_METRES = 500;

export const SAFE_NODE_SEED = [
  {
    name: 'Apateka "Zdravie"',
    category: "pharmacy",
    location: { type: "Point", coordinates: [21.26, 48.718] as [number, number] },
    phone: "+421 55 123 4567",
    hours: "08:00-20:00",
    is_active: true,
    is_partner: true,
    language_support: ["uk", "sk", "en"],
    accessibility: { wheelchair_access: true, ramp: true, elevator: false },
  },
  {
    name: "Cafe Central",
    category: "cafe",
    location: { type: "Point", coordinates: [21.262, 48.715] as [number, number] },
    phone: "+421 55 234 5678",
    hours: "07:30-21:00",
    is_active: true,
    is_partner: true,
    language_support: ["uk", "sk", "en"],
    accessibility: { wheelchair_access: true, ramp: true, elevator: false },
  },
  {
    name: "Posta Slovakia",
    category: "post",
    location: { type: "Point", coordinates: [21.258, 48.716] as [number, number] },
    phone: "+421 55 345 6789",
    hours: "08:00-18:00",
    is_active: true,
    is_partner: false,
    language_support: ["sk", "en"],
    accessibility: { wheelchair_access: true, ramp: false, elevator: false },
  },
  {
    name: "Hospital sv. Alzbety",
    category: "hospital",
    location: { type: "Point", coordinates: [21.265, 48.72] as [number, number] },
    phone: "+421 55 456 7890",
    hours: "24/7",
    is_active: true,
    is_partner: true,
    language_support: ["uk", "sk", "en"],
    accessibility: { wheelchair_access: true, ramp: true, elevator: true },
  },
  {
    name: "Bank Tatra",
    category: "bank",
    location: { type: "Point", coordinates: [21.261, 48.717] as [number, number] },
    phone: "+421 55 567 8901",
    hours: "09:00-17:00",
    is_active: true,
    is_partner: false,
    language_support: ["sk", "en"],
    accessibility: { wheelchair_access: true, ramp: true, elevator: true },
  },
] as const;

// Ukrainian/English bilingual UI strings
export const UI = {
  needHelp: "Мені потрібна допомога",
  wantToHelp: "Я хочу допомагати",
  register: "Реєстрація",
  login: "Увійти",
  logout: "Вийти",
  signUp: "Створити акаунт",
  email: "Email",
  password: "Пароль",
  name: "Ім'я",
  phone: "Телефон",
  chooseRole: "Оберіть роль",
  recordRequest: "🎤 Записати запит",
  processing: "Обробка…",
  submit: "Надіслати",
  accept: "Допомогти",
  markComplete: "Завершено",
  rateHelper: "Оцініть помічника",
  karma: "Карма",
  noHelpersNearby: "Немає волонтерів поруч",
  safeNodesHint: "Ці місця готові допомогти",
  onlineHelpers: "Волонтери поруч",
  activeRequest: "Активний запит",
  completedRequests: "Завершені запити",
} as const;
