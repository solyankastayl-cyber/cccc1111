# Fractal Module - PRD

## Дата: 2026-02-23

## Original Problem Statement
- Клонировать репозиторий https://github.com/solyankastayl-cyber/ooooo
- Поднять фронт, бэк, админку
- Работать только с модулем Fractal
- Продолжить недоработанную логику обновления по фронту

## Architecture
- **Backend**: Node.js + TypeScript + Fastify (порт 8002, проксируется через Python на 8001)
- **Frontend**: React + Tailwind CSS (порт 3000)
- **Database**: MongoDB
- **Proxy**: Python FastAPI на порту 8001 проксирует запросы к TypeScript backend

## What Was Implemented (Previously)

### Symmetric Chart for Replay Mode
**Problem**: При переключении horizon (30D, 180D, 365D) левая часть графика оставалась фиксированной (60 дней), а менялась только правая (aftermath).

**Fix**:
- Добавлен параметр `displayWindow` в backend API для симметричного отображения
- Frontend передает `displayWindow=horizonDays` для получения симметричных данных
- Поиск паттернов использует `windowLen` (ограничение движка), но данные расширяются до `displayWindow`

**Результат**:
- NOW всегда по центру графика
- Левая часть = horizonDays дней реальной цены + найденный фрактал
- Правая часть = horizonDays дней aftermath (прогноз)

### UI Renaming (Recent Changes)
- P10/P25/P50/P75/P90 → Bear Case / Base Case / Bull Case
- Avg Max DD → Avg Drawdown
- Tail Risk (P95) → Worst-case (5%)

### Files Modified
- `/app/backend/src/modules/fractal/api/fractal.overlay.routes.ts` - displayWindow support
- `/app/frontend/src/components/fractal/hooks/useFractalOverlay.js` - передача displayWindow
- `/app/frontend/src/pages/FractalPage.js` - переименование полей
- `/app/frontend/src/components/fractal/RiskBox.jsx` - переименование полей

## Tested (2026-02-23)
- ✅ Backend API /api/fractal/v2.1/focus-pack - все horizons (7d, 14d, 30d, 90d, 180d, 365d)
- ✅ Backend API /api/fractal/v2.1/overlay - симметричный windowLen = displayWindow
- ✅ Backend API /api/fractal/v2.1/terminal - полные данные терминала
- ✅ Симметричность графика для всех horizons
- ✅ Backend тесты: 100% (10/10)

## P0 (Critical) - DONE
- [x] Симметричный график вокруг NOW для всех horizons
- [x] Переименование P10/P25/P50/P75/P90 в Bear/Bull Case

## User Personas
- Трейдеры криптовалют, использующие фрактальный анализ
- Аналитики, изучающие исторические паттерны BTC

## Core Requirements (Static)
- Fractal overlay mode для сравнения текущей цены с историческими паттернами
- Симметричный график с NOW по центру
- Поддержка множества horizons (7d - 365d)

## Next Action Items
- Мониторинг стабильности TypeScript backend
- Frontend UI тестирование когда preview станет доступен

## Backlog
- P1: Улучшение UI/UX визуализации фракталов
- P2: Добавление экспорта данных
