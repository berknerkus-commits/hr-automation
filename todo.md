# İK Otomasyon Sistemi - TODO

## Altyapı & Şema
- [x] Veritabanı şeması: job_postings, candidates, onboarding_employees, onboarding_tasks, leave_requests, leave_balances, notifications tabloları
- [x] Drizzle migration oluştur ve uygula
- [x] Global tema: elegant koyu-açık renk paleti, typography, index.css
- [x] DashboardLayout sidebar navigasyonu (Türkçe menü)
- [x] App.tsx route yapısı

## Backend API (tRPC Routers)
- [x] ATS router: iş ilanı CRUD, aday CRUD, durum güncelleme
- [x] Onboarding router: çalışan CRUD, görev CRUD, tamamlama takibi
- [x] İzin router: talep oluştur, onayla/reddet, bakiye sorgula
- [x] Bildirim router: liste, okundu işaretle
- [x] Admin router: kullanıcı rolü yönetimi

## Dashboard
- [x] Özet istatistikler: açık pozisyonlar, bekleyen onboarding, bekleyen izin talepleri
- [x] Hızlı erişim linkleri
- [x] Son aktivite akışı (izin, aday, onboarding son olayları - admin için)

## ATS (Aday Takibi)
- [x] İş ilanları listesi sayfası
- [x] İş ilanı oluşturma/düzenleme formu
- [x] Kanban pipeline görünümü (Yeni → Mülakat → Teklif → Kabul/Red)
- [x] Aday ekleme formu
- [x] Aday kartı sürükle-bırak (drag & drop) durum değiştirme

## Onboarding Yönetimi
- [x] Çalışan listesi sayfası
- [x] Yeni çalışan ekleme formu
- [x] Görev listesi/checklist oluşturma
- [x] Görev tamamlama takibi (ilerleme çubuğu)

## İzin Yönetimi
- [x] İzin talebi oluşturma formu
- [x] Admin: izin talepleri listesi (onayla/reddet)
- [x] Çalışan: kendi izin geçmişi
- [x] İzin bakiyesi görüntüleme
- [x] Takvim görünümü (onaylı izinler)

## Bildirim Sistemi
- [x] Bildirim bell ikonu (okunmamış sayacı)
- [x] Bildirim dropdown paneli
- [x] İzin onay/red bildirimi tetikleyicisi
- [x] Onboarding görev atama bildirimi

## Rol Tabanlı Erişim
- [x] Admin: tüm modüllere tam erişim
- [x] Çalışan: sadece kendi verilerine erişim
- [x] Frontend route koruması
- [x] Backend procedure koruması

## Testler
- [x] ATS router testleri
- [x] İzin router testleri
- [x] Onboarding router testleri
