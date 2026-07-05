# Katalog proizvoda — Frontend Akademija

Single-page aplikacija za pregled kataloga proizvoda s pretragom, filtriranjem, paginacijom i detaljima proizvoda. Podaci dolaze iz [DummyJSON](https://dummyjson.com) REST API-ja.

**Live demo:** [https://solution-david-bulat.vercel.app/](https://solution-david-bulat.vercel.app/)

## Tehnologije

- React 19 + TypeScript (strict)
- Vite + React Router 8
- TanStack Query (dohvat i caching podataka)
- Tailwind CSS + shadcn/ui komponente
- Vitest + React Testing Library

## Preduvjeti

- Node.js **22.22.0 ili noviji** (React Router 8 to zahtijeva)
- npm

## Instalacija

```bash
git clone <url-repozitorija>
cd frontend-dev-task
npm install
```

## Konfiguracija okruženja

Kopiraj `.env` u root projekta (ili kreiraj ga ručno):

```env
VITE_API_URL=https://dummyjson.com
VITE_AUTH_LOGIN_URL=/auth/login
VITE_AUTH_USER_URL=/auth/me
VITE_AUTH_REFRESH_URL=/route/refresh
```

| Varijabla | Opis |
|-----------|------|
| `VITE_API_URL` | Bazni URL DummyJSON API-ja |
| `VITE_AUTH_LOGIN_URL` | Endpoint za prijavu |
| `VITE_AUTH_USER_URL` | Endpoint za dohvat trenutnog korisnika |
| `VITE_AUTH_REFRESH_URL` | Endpoint za osvježavanje tokena |

## Pokretanje aplikacije

### Development

```bash
npm run dev
```

Aplikacija je dostupna na [http://localhost:5173](http://localhost:5173).

> **Napomena:** Pokreni testove u **novom terminalu** dok dev server radi — isti terminal ne izvršava nove naredbe dok je `npm run dev` aktivan.

### Production build

```bash
npm run build
npm start
```

### Typecheck

```bash
npm run typecheck
```

## Testovi

```bash
npm test
```

Watch mode (ponovno pokretanje pri promjenama):

```bash
npm run test:watch
```

Testovi pokrivaju:

- **Unit** — URL parametri, filteri, paginacija, navigacija (`app/utils/*.test.ts`)
- **Komponentni** — kartice proizvoda i filteri (`app/components/products/*.test.tsx`)

## Funkcionalnosti

### Lista proizvoda (`/`)

- Prikaz u obliku **kartica** ili **tablice**
- **Paginacija** ili **infinite scroll**
- Stanja: loading (skeletoni), prazan rezultat, greška

### Detalji proizvoda (`/products/:id`)

- Galerija slika, puni opis, ocjena, kategorija, zaliha, recenzije
- Povratak na listu uz očuvanje filtera (URL query parametri) i scroll pozicije

### Filtriranje i pretraga

Svi filteri su u URL-u (dijeljivo stanje, preživljava refresh):

| Parametar | Opis |
|-----------|------|
| `q` | Pretraga po nazivu (debounce 300 ms) |
| `category` | Kategorija |
| `minPrice` / `maxPrice` | Raspon cijene |
| `page` | Stranica (paginacija) |
| `limit` | Broj proizvoda po stranici (12, 24, 48) |
| `view` | `cards` ili `table` |
| `scroll` | `pages` ili `infinite` |

Primjer: `/?q=phone&category=smartphones&minPrice=100&maxPrice=500&page=1`

### Autentifikacija (`/auth`)

- Prijava preko DummyJSON `/auth/login`
- Token se sprema u `localStorage`
- Demo podaci: **emilys** / **emilyspass**
- Nakon prijave preusmjeravanje na stranicu s koje ste došli (npr. `/favorites`)

### Favoriti (`/favorites`) — zaštićena ruta

- Dostupno samo prijavljenim korisnicima
- Neautorizirani korisnici se preusmjeravaju na `/auth`
- Dodavanje/uklanjanje favorita ikonom srca na karticama i detaljima proizvoda
- Favoriti se spremaju u `localStorage` po korisniku

### Dark mode

- Toggle u navigaciji (sunce/mjesec ikona)
- Podržava light, dark i system temu

## Struktura projekta

```
app/
├── components/
│   ├── products/     # Lista, filteri, kartice, tablica, detalji
│   ├── providers/    # TanStack Query provider
│   └── ui/           # shadcn komponente
├── hooks/
│   └── use-queries.ts
├── routes/
│   ├── home.tsx           # Lista proizvoda
│   ├── product-detail.tsx # Detalji proizvoda
│   ├── favorites.tsx      # Zaštićena lista favorita
│   └── auth.tsx           # Prijava
├── utils/
│   ├── products.ts
│   ├── auth.ts
│   ├── favorites.ts
│   └── product-navigation.ts
└── lib/
    ├── query-client.ts
    └── query-keys.ts
test/
├── setup.ts
└── test-utils.tsx
```

## Docker (bonus)

```bash
docker build -t frontend-dev-task .
docker run -p 3000:3000 frontend-dev-task
```

## Korištenje AI alata

Tijekom izrade korišten je Cursor AI kao pomoć pri implementaciji
(boilerplate, refaktor, pisanje testova). Sav kod je pregledan,
prilagođen projektu i pokrenut lokalno (`npm run dev`, `npm test`).



## API izvori (DummyJSON)

- Proizvodi: `https://dummyjson.com/products`
- Kategorije: `https://dummyjson.com/products/category-list`
- Pretraga: `https://dummyjson.com/products/search?q=`
- Detalj: `https://dummyjson.com/products/:id`
- Auth: [DummyJSON Auth docs](https://dummyjson.com/docs/auth)
