# Interaktywna Tablica Online

## 📝 Opis
Interaktywna tablica to aplikacja webowa umożliwiająca współdzielone rysowanie w czasie rzeczywistym. Użytkownicy mogą wspólnie tworzyć rysunki, diagramy i notatki na współdzielonej przestrzeni roboczej.

## 🚀 Funkcje
- Różnorodne narzędzia do rysowania:
  - 🖌️ Pędzel
  - 💨 Spray
  - 🧹 Gumka
  - 📏 Linia
  - ⬜ Prostokąt
  - ⭕ Okrąg
  - 📝 Tekst
- Wybór koloru i rozmiaru narzędzi
- Współdzielenie rysunku w czasie rzeczywistym
- Intuicyjny interfejs użytkownika

## 💻 Wymagania
- Node.js
- Przeglądarka internetowa z obsługą HTML5 Canvas

## 🛠️ Instalacja
1. Sklonuj repozytorium
2. Zainstaluj zależności:
```bash
npm install
```
3. Uruchom serwer:
```bash
node server.js
```
4. Otwórz przeglądarkę i przejdź pod adres:
```
http://localhost:3000
```

## 🎨 Jak używać
1. Wybierz narzędzie z dostępnego menu (pędzel, spray, gumka, itp.)
2. Ustaw kolor i rozmiar narzędzia
3. Rysuj na płótnie używając myszy
4. Użyj przycisku "Wyczyść" aby zresetować tablicę

## 🔧 Technologie
- HTML5 Canvas
- JavaScript
- Node.js
- WebSocket

## 📌 Uwagi
- Aplikacja automatycznie synchronizuje rysunki między wszystkimi połączonymi użytkownikami
- Wszelkie zmiany są widoczne w czasie rzeczywistym dla wszystkich uczestników
- Stan tablicy jest współdzielony między wszystkimi użytkownikami
