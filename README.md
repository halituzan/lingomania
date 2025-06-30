## Lingomania Word Game

# Socket.IO Server Kurulumu

Bu proje artık ayrı bir Socket.IO sunucusu kullanmaktadır. Vercel WebSocket desteklemediği için Socket.IO sunucusu Heroku'da barındırılmaktadır.

## Socket Server Deploy Etme

1. **socket-server** klasörüne gidin ve README.md dosyasındaki adımları takip edin
2. Heroku'ya deploy ettikten sonra URL'nizi kopyalayın
3. Ana projede environment variable ayarlayın:

```bash
# Vercel'de environment variable olarak ekleyin:
NEXT_PUBLIC_SOCKET_URL=https://your-render-app-name.onrender.com
```

## Local Development

1. Socket server'ı ayri terminal'de çalıştırın:
```bash
cd socket-server
npm install
npm run dev
```

2. Ana projeyi çalıştırın:
```bash
npm run dev
```

Socket server http://localhost:3001 adresinde çalışacaktır.

## Environment Variables

Vercel Dashboard'da şu environment variable'ı ekleyin:
- `NEXT_PUBLIC_SOCKET_URL`: Heroku'daki Socket.IO server URL'niz

Yerel development için `.env.local` dosyası oluşturabilirsiniz:
```
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

---

# Lingomania
