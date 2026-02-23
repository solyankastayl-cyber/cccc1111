# Fractal Module - PRD

## Дата: 2026-02-22

## Original Problem Statement
- Работать только с модулем Fractal
- Исправить проблемы:
  1. Мусор в Current History - P10/P25/P50/P75/P90, "1D • window=60..." - убран
  2. Horizon не работает - график должен быть симметричным вокруг NOW

## Architecture
- **Backend**: Node.js + TypeScript + Fastify (порт 8002, проксируется через Python на 8001)
- **Frontend**: React + Tailwind CSS (порт 3000)
- **Database**: MongoDB

## What Was Implemented

### Symmetric Chart for Replay Mode
**Problem**: При переключении horizon (30D, 180D, 365D) левая часть графика оставалась фиксированной (60 дней), а менялась только правая (aftermath).

**Fix**:
- Добавлен параметр `displayWindow` в backend API для симметричного отображения
- Frontend передает `displayWindow=horizonDays` для получения симметричных данных
- Поиск паттернов остается с `windowLen=60` (ограничение движка), но данные расширяются до `displayWindow`

**Результат**:
- NOW всегда по центру графика
- Левая часть = horizonDays дней реальной цены + найденный фрактал
- Правая часть = horizonDays дней aftermath (прогноз)

### Files Modified
- `/app/backend/src/modules/fractal/api/fractal.overlay.routes.ts` - добавлен displayWindow
- `/app/frontend/src/components/fractal/hooks/useFractalOverlay.js` - передача displayWindow

## Tested
- 30D: симметричный график ~30 дней слева и справа от NOW ✅
- 180D: симметричный график ~180 дней слева и справа от NOW ✅
- 365D: симметричный график ~365 дней слева и справа от NOW ✅

## P0 (Critical) - DONE
- [x] Симметричный график вокруг NOW для всех horizons
- [x] Мусор P10/P25... убран

## Next Action Items
- Мониторинг стабильности TypeScript backend
