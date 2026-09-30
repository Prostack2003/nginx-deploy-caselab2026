# Case Lab 3 — REST API обслуживания оборудования

REST API на Node.js, Express, PostgreSQL и Sequelize для учёта энергетических площадок, оборудования и заявок на техническое обслуживание.

Проект реализован в рамках третьего Case Lab. Данные хранятся в PostgreSQL, структура базы управляется миграциями Sequelize CLI, а демонстрационный набор загружается сидами.

## Возможности

- учёт площадок и установленного на них оборудования;
- хранение паспортов оборудования;
- создание, просмотр, фильтрация и редактирование заявок;
- управление командой исполнителей заявки;
- контролируемая смена статусов с сохранением истории;
- защита смены статуса от конкурентных запросов;
- сводная статистика по площадке;
- SQL-отчёт по загрузке оборудования;
- прогноз погоды для места установки оборудования;
- единый формат ошибок и Request ID;
- PostgreSQL в Docker Compose;
- готовая Postman-коллекция.

## Технологии

- Node.js 20+;
- Express 5;
- PostgreSQL 17;
- Sequelize 6 и Sequelize CLI;
- Zod;
- Pino;
- Docker Compose;
- Helmet, CORS и express-rate-limit;
- Open-Meteo API;
- Node.js Test Runner;
- ESLint и Prettier;
- Postman.

## Требования

Для запуска необходимы:

- Node.js 20 или новее;
- npm;
- Docker с поддержкой Docker Compose;
- свободные порты 3000 и 5432;
- доступ к интернету для погодного маршрута;
- Postman — необязательно, только для запуска коллекции.

Проверка версий:

```bash
node --version
npm --version
docker --version
docker compose version
```

## Быстрый запуск

### 1. Клонирование и установка зависимостей

```bash
git clone git@github.com:Prostack2003/SQL-restapi-webcaselab2026.git
cd SQL-restapi-webcaselab2026
npm ci
```

### 2. Настройка окружения

```bash
cp .env.example .env
```

Укажите пароль PostgreSQL в <code>.env</code>:

```dotenv
DB_HOST=localhost
DB_PORT=5432
DB_NAME=caselab
DB_USER=caselab
DB_PASSWORD=your_password
```

Одинаковые <code>DB_NAME</code>, <code>DB_USER</code>, <code>DB_PASSWORD</code> и <code>DB_PORT</code> используются приложением, Sequelize CLI и Docker Compose.

Файл <code>.env</code> содержит локальные настройки и не должен попадать в Git.

### 3. Запуск PostgreSQL

```bash
docker compose up -d
```

В контейнере запускается только PostgreSQL. Node.js-приложение работает локально и подключается к опубликованному порту базы данных.

Проверка контейнера:

```bash
docker compose ps
```

Проверка подключения внутри контейнера:

```bash
docker compose exec postgres sh -c \
  'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT current_database(), current_user;"'
```

### 4. Применение миграций

```bash
npx sequelize-cli --options-path sequelize-paths.cjs db:migrate
```

Проверка состояния:

```bash
npx sequelize-cli --options-path sequelize-paths.cjs db:migrate:status
```

### 5. Загрузка демонстрационных данных

```bash
npx sequelize-cli --options-path sequelize-paths.cjs db:seed:all
```

Сиды добавляют:

- 2 площадки;
- 6 единиц оборудования;
- 6 паспортов;
- 5 специалистов;
- 20 заявок;
- 20 записей истории;
- 20 назначений специалистов.

### 6. Запуск API

```bash
npm start
```

Режим разработки:

```bash
npm run dev
```

API доступен по адресу:

```text
http://localhost:3000/api
```

Проверка:

```bash
curl -i http://localhost:3000/api/health
```

Ожидаемое тело:

```json
{
    "data": {
        "status": "ok"
    }
}
```

При запуске приложение сначала проверяет соединение с PostgreSQL. Если база недоступна или не задан <code>DB_PASSWORD</code>, HTTP-сервер не запускается.

## Остановка

Сигнал <code>Ctrl+C</code> завершает HTTP-сервер и закрывает соединение Sequelize.

Остановить PostgreSQL:

```bash
docker compose down
```

Данные сохраняются в Docker volume. Полное удаление контейнера вместе с данными:

```bash
docker compose down -v
```

Последняя команда необратимо удаляет локальную базу проекта.

## Переменные окружения

### Приложение

| Переменная                        | Назначение                       | По умолчанию                       |
| --------------------------------- | -------------------------------- | ---------------------------------- |
| <code>PORT</code>                 | Порт HTTP-сервера                | <code>3000</code>                  |
| <code>NODE_ENV</code>             | Режим приложения                 | <code>development</code>           |
| <code>LOG_LEVEL</code>            | Уровень Pino                     | <code>info</code>                  |
| <code>JSON_BODY_LIMIT</code>      | Максимальный размер JSON         | <code>100kb</code>                 |
| <code>CORS_ORIGINS</code>         | Разрешённые origin через запятую | <code>http://localhost:5173</code> |
| <code>RATE_LIMIT_WINDOW_MS</code> | Окно rate limit, мс              | <code>60000</code>                 |
| <code>RATE_LIMIT_MAX</code>       | Максимум запросов за окно        | <code>100</code>                   |

### PostgreSQL и пул соединений

| Переменная                      | Назначение               | По умолчанию           |
| ------------------------------- | ------------------------ | ---------------------- |
| <code>DB_HOST</code>            | Хост PostgreSQL          | <code>localhost</code> |
| <code>DB_PORT</code>            | Порт PostgreSQL          | <code>5432</code>      |
| <code>DB_NAME</code>            | Имя базы                 | <code>caselab</code>   |
| <code>DB_USER</code>            | Пользователь             | <code>caselab</code>   |
| <code>DB_PASSWORD</code>        | Пароль                   | обязательное значение  |
| <code>DB_POOL_MIN</code>        | Минимум соединений       | <code>0</code>         |
| <code>DB_POOL_MAX</code>        | Максимум соединений      | <code>10</code>        |
| <code>DB_POOL_IDLE_MS</code>    | Время простоя, мс        | <code>10000</code>     |
| <code>DB_POOL_ACQUIRE_MS</code> | Получение соединения, мс | <code>30000</code>     |

### Open-Meteo

| Переменная                         | Назначение          | По умолчанию                                      |
| ---------------------------------- | ------------------- | ------------------------------------------------- |
| <code>GEOCODING_BASE_URL</code>    | URL геокодирования  | <code>https://geocoding-api.open-meteo.com</code> |
| <code>FORECAST_BASE_URL</code>     | URL прогноза        | <code>https://api.open-meteo.com</code>           |
| <code>REQUEST_TIMEOUT_MS</code>    | Тайм-аут, мс        | <code>5000</code>                                 |
| <code>TEMPERATURE_UNIT</code>      | Единица температуры | <code>celsius</code>                              |
| <code>PRECIPITATION_UNIT</code>    | Единица осадков     | <code>mm</code>                                   |
| <code>MAX_WIND_SPEED_KMH</code>    | Допустимый ветер    | <code>20</code>                                   |
| <code>MAX_PRECIPITATION_MM</code>  | Допустимые осадки   | <code>0</code>                                    |
| <code>WEATHER_FORECAST_DAYS</code> | Дней прогноза       | <code>3</code>                                    |

Несколько CORS-origin перечисляются через запятую:

```dotenv
CORS_ORIGINS=http://localhost:5173,https://example.com
```

## Sequelize CLI

Пути CLI собраны в <code>sequelize-paths.cjs</code>. Подключение загружается из <code>src/database/migration-config.cjs</code> и использует тот же <code>.env</code>, что приложение.

Применить миграции:

```bash
npx sequelize-cli --options-path sequelize-paths.cjs db:migrate
```

Показать статус:

```bash
npx sequelize-cli --options-path sequelize-paths.cjs db:migrate:status
```

Откатить последнюю или все миграции:

```bash
npx sequelize-cli --options-path sequelize-paths.cjs db:migrate:undo
npx sequelize-cli --options-path sequelize-paths.cjs db:migrate:undo:all
```

Применить или откатить сиды:

```bash
npx sequelize-cli --options-path sequelize-paths.cjs db:seed:all
npx sequelize-cli --options-path sequelize-paths.cjs db:seed:undo
npx sequelize-cli --options-path sequelize-paths.cjs db:seed:undo:all
```

Сведения о применённых сидах хранятся в таблице <code>SequelizeData</code>.

### Полный контрольный цикл

```bash
npx sequelize-cli --options-path sequelize-paths.cjs db:seed:undo:all
npx sequelize-cli --options-path sequelize-paths.cjs db:migrate:undo:all
npx sequelize-cli --options-path sequelize-paths.cjs db:migrate
npx sequelize-cli --options-path sequelize-paths.cjs db:seed:all
npx sequelize-cli --options-path sequelize-paths.cjs db:migrate:status
```

Перед откатом остановите API и убедитесь, что в локальной базе нет нужных данных.

## Схема данных

В проекте семь основных таблиц.

| Таблица                             | Назначение                |
| ----------------------------------- | ------------------------- |
| <code>sites</code>                  | Площадки и координаты     |
| <code>equipment</code>              | Оборудование площадок     |
| <code>equipment_passports</code>    | Паспортные характеристики |
| <code>maintenance_requests</code>   | Заявки                    |
| <code>request_status_history</code> | История статусов          |
| <code>technicians</code>            | Специалисты               |
| <code>request_assignees</code>      | Команды и часы            |

### Ограничения базы

- идентификаторы имеют тип UUID;
- <code>sites.code</code> уникален;
- широта находится в диапазоне от -90 до 90;
- долгота — от -180 до 180;
- серийный номер оборудования уникален без учёта регистра;
- один паспорт соответствует одной единице оборудования;
- номинальная мощность больше нуля;
- табельный номер специалиста уникален без учёта регистра;
- пара <code>request_id + technician_id</code> уникальна;
- часы назначения больше нуля;
- в команде может быть только один <code>lead</code>;
- удаление заявки с историей запрещено через <code>ON DELETE RESTRICT</code>.

В JavaScript используются camelCase-поля, а в PostgreSQL — snake_case. Преобразование выполняет Sequelize с <code>underscored: true</code>.

## Доменные модели

### Оборудование

| Поле API                  | Ограничение                                                                                         |
| ------------------------- | --------------------------------------------------------------------------------------------------- |
| <code>id</code>           | UUID, создаётся сервером                                                                            |
| <code>name</code>         | От 3 до 100 символов                                                                                |
| <code>type</code>         | <code>turbine</code>, <code>inverter</code>, <code>sensor</code>, <code>substation</code>           |
| <code>serialNumber</code> | Уникальная непустая строка                                                                          |
| <code>location.lat</code> | От -90 до 90                                                                                        |
| <code>location.lon</code> | От -180 до 180                                                                                      |
| <code>status</code>       | <code>operational</code>, <code>maintenance</code>, <code>fault</code>, <code>decommissioned</code> |
| <code>installedAt</code>  | ISO-дата не позднее текущего дня                                                                    |

При создании оборудования API ищет площадку по координатам. Если её нет, площадка создаётся автоматически. Внутренний <code>siteId</code> не раскрывается: клиент получает объект <code>location</code>.

### Паспорт оборудования

Паспорт содержит производителя, модель, номинальную мощность и дату последней калибровки. Связь с оборудованием — один к одному. В текущем API паспорт возвращается как вложенная часть оборудования и заполняется сидами.

### Заявка

| Поле API                 | Ограничение                                                                          |
| ------------------------ | ------------------------------------------------------------------------------------ |
| <code>id</code>          | UUID, создаётся сервером                                                             |
| <code>equipmentId</code> | UUID существующего оборудования                                                      |
| <code>title</code>       | От 5 до 120 символов                                                                 |
| <code>description</code> | Необязательная строка до 2000 символов                                               |
| <code>priority</code>    | <code>low</code>, <code>medium</code>, <code>high</code>, <code>critical</code>      |
| <code>status</code>      | <code>new</code>, <code>in_progress</code>, <code>done</code>, <code>rejected</code> |
| <code>plannedAt</code>   | Необязательная дата и время ISO 8601                                                 |
| <code>author</code>      | При создании устанавливается <code>system</code>                                     |
| <code>assignees</code>   | Массив назначенных специалистов                                                      |

Новая заявка всегда получает статус <code>new</code>. Статус нельзя изменить обычным PATCH-запросом.

### Исполнитель

| Поле                      | Ограничение                               |
| ------------------------- | ----------------------------------------- |
| <code>technicianId</code> | UUID существующего специалиста            |
| <code>role</code>         | <code>lead</code> или <code>member</code> |
| <code>hours</code>        | Положительное число до 9999.99            |

Назначение команды полностью заменяет её текущий состав. Должен присутствовать ровно один ведущий, а UUID специалистов не должны повторяться.

## Переходы статусов

```text
new ───────────> in_progress ───────────> done
 │                    │
 └──────────────> rejected <────────────┘
```

Допустимы:

- <code>new → in_progress</code>;
- <code>new → rejected</code>;
- <code>in_progress → done</code>;
- <code>in_progress → rejected</code>.

<code>done</code> и <code>rejected</code> — конечные состояния. Перевод в <code>in_progress</code> запрещён без исполнителей.

Смена статуса выполняется в транзакции:

1. заявка блокируется через <code>SELECT FOR UPDATE</code>;
2. актуальный статус проверяется после блокировки;
3. проверяется наличие исполнителя;
4. обновляется заявка;
5. создаётся запись истории;
6. транзакция фиксируется.

Поэтому два конкурентных запроса не могут успешно выполнить один переход дважды.

## Формат ответов

Одиночный ресурс:

```json
{
    "data": {}
}
```

Список:

```json
{
    "data": [],
    "meta": {
        "total": 0,
        "page": 1,
        "limit": 10
    }
}
```

Создание возвращает <code>201</code> и <code>Location</code>, удаление — <code>204</code> без тела. Каждый ответ содержит <code>X-Request-Id</code>.

## Маршруты API

### Служебный маршрут

| Метод | Маршрут                  | Назначение           |
| ----- | ------------------------ | -------------------- |
| GET   | <code>/api/health</code> | Проверка доступности |

### Оборудование

| Метод  | Маршрут                                  | Назначение          | Код |
| ------ | ---------------------------------------- | ------------------- | --- |
| GET    | <code>/api/equipment</code>              | Список              | 200 |
| POST   | <code>/api/equipment</code>              | Создание            | 201 |
| GET    | <code>/api/equipment/:id</code>          | Получение по UUID   | 200 |
| PATCH  | <code>/api/equipment/:id</code>          | Обновление          | 200 |
| DELETE | <code>/api/equipment/:id</code>          | Удаление            | 204 |
| GET    | <code>/api/equipment/:id/requests</code> | Заявки оборудования | 200 |
| GET    | <code>/api/equipment/:id/weather</code>  | Прогноз             | 200 |

Параметры списка оборудования:

| Параметр                   | Значение                                                                                                       |
| -------------------------- | -------------------------------------------------------------------------------------------------------------- |
| <code>page</code>          | От 1, по умолчанию 1                                                                                           |
| <code>limit</code>         | От 1 до 100, по умолчанию 10                                                                                   |
| <code>type</code>          | Тип                                                                                                            |
| <code>status</code>        | Статус                                                                                                         |
| <code>sortBy</code>        | <code>name</code>, <code>type</code>, <code>serialNumber</code>, <code>status</code>, <code>installedAt</code> |
| <code>order</code>         | <code>asc</code> или <code>desc</code>                                                                         |
| <code>installedFrom</code> | Начало диапазона ISO date                                                                                      |
| <code>installedTo</code>   | Конец диапазона ISO date                                                                                       |

### Заявки

| Метод  | Маршрут                                          | Назначение           | Код |
| ------ | ------------------------------------------------ | -------------------- | --- |
| GET    | <code>/api/requests</code>                       | Список               | 200 |
| POST   | <code>/api/requests</code>                       | Создание             | 201 |
| GET    | <code>/api/requests/:id</code>                   | Получение            | 200 |
| PATCH  | <code>/api/requests/:id</code>                   | Обновление           | 200 |
| DELETE | <code>/api/requests/:id</code>                   | Удаление без истории | 204 |
| PATCH  | <code>/api/requests/:id/status</code>            | Смена статуса        | 200 |
| GET    | <code>/api/requests/:id/history</code>           | История              | 200 |
| POST   | <code>/api/requests/:id/assignees</code>         | Замена команды       | 200 |
| DELETE | <code>/api/requests/:id/assignees/:userId</code> | Удаление исполнителя | 204 |
| GET    | <code>/api/equipment/:id/requests</code>         | Заявки оборудования  | 200 |

Параметры списков заявок:

| Параметр                 | Значение                                                                                                           |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| <code>equipmentId</code> | UUID оборудования                                                                                                  |
| <code>status</code>      | Статус                                                                                                             |
| <code>priority</code>    | Приоритет                                                                                                          |
| <code>createdFrom</code> | Начало ISO date-time                                                                                               |
| <code>createdTo</code>   | Конец ISO date-time                                                                                                |
| <code>sortBy</code>      | <code>createdAt</code>, <code>updatedAt</code>, <code>plannedAt</code>, <code>priority</code>, <code>status</code> |
| <code>order</code>       | <code>asc</code> или <code>desc</code>                                                                             |
| <code>page</code>        | От 1                                                                                                               |
| <code>limit</code>       | От 1 до 100                                                                                                        |

### Аналитика

| Метод | Маршрут                                  | Назначение            |
| ----- | ---------------------------------------- | --------------------- |
| GET   | <code>/api/sites/:id/summary</code>      | Сводка площадки       |
| GET   | <code>/api/reports/equipment-load</code> | Загрузка оборудования |

Параметры отчёта:

| Параметр                 | Назначение                     | По умолчанию |
| ------------------------ | ------------------------------ | ------------ |
| <code>createdFrom</code> | Начало периода создания заявок | нет          |
| <code>createdTo</code>   | Конец периода создания заявок  | нет          |
| <code>minRequests</code> | Минимум заявок                 | 0            |

Границы периода передаются в ISO date-time. Начало не может быть позже окончания.

## Примеры API

### Создание оборудования

```bash
curl -i -X POST http://localhost:3000/api/equipment \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Тестовая турбина",
    "type": "turbine",
    "serialNumber": "TURBINE-001",
    "location": {"lat": 55.75, "lon": 37.62},
    "status": "operational",
    "installedAt": "2025-01-01"
  }'
```

### Создание заявки

```bash
curl -i -X POST http://localhost:3000/api/requests \
  -H "Content-Type: application/json" \
  -d '{
    "equipmentId": "20000000-0000-4000-8000-000000000001",
    "title": "Плановый осмотр турбины",
    "description": "Проверить крепления и датчики",
    "priority": "high",
    "plannedAt": "2030-09-25T10:00:00.000Z"
  }'
```

### Назначение команды

```bash
curl -i -X POST http://localhost:3000/api/requests/REQUEST_UUID/assignees \
  -H "Content-Type: application/json" \
  -d '{
    "assignees": [
      {
        "technicianId": "40000000-0000-4000-8000-000000000001",
        "role": "lead",
        "hours": 4
      },
      {
        "technicianId": "40000000-0000-4000-8000-000000000002",
        "role": "member",
        "hours": 2.5
      }
    ]
  }'
```

### Смена статуса и история

```bash
curl -i -X PATCH http://localhost:3000/api/requests/REQUEST_UUID/status \
  -H "Content-Type: application/json" \
  -d '{"status":"in_progress"}'

curl http://localhost:3000/api/requests/REQUEST_UUID/history
```

Пример истории:

```json
{
    "data": [
        {
            "id": "52aa0747-73f2-4ddb-a160-acf32cf7dd4c",
            "oldStatus": "new",
            "newStatus": "in_progress",
            "changedBy": "system",
            "comment": null,
            "changedAt": "2026-09-27T12:00:00.000Z"
        }
    ]
}
```

### Сводка площадки

```bash
curl http://localhost:3000/api/sites/10000000-0000-4000-8000-000000000001/summary
```

```json
{
    "data": {
        "site": {
            "id": "10000000-0000-4000-8000-000000000001",
            "name": "Северная ветровая площадка",
            "code": "SITE-NORTH",
            "region": "Мурманская область",
            "location": {
                "lat": 68.9707,
                "lon": 33.0749
            }
        },
        "requests": {
            "total": 11,
            "byStatus": {
                "new": 3,
                "in_progress": 2,
                "done": 4,
                "rejected": 2
            },
            "byPriority": {
                "low": 4,
                "medium": 2,
                "high": 3,
                "critical": 2
            },
            "averageClosureHours": 50
        }
    }
}
```

### Отчёт по загрузке

```bash
curl "http://localhost:3000/api/reports/equipment-load?createdFrom=2020-01-01T00:00:00.000Z&createdTo=2035-12-31T23:59:59.999Z&minRequests=3"
```

```json
{
    "data": [
        {
            "id": "20000000-0000-4000-8000-000000000001",
            "name": "Ветрогенератор №1",
            "type": "turbine",
            "serialNumber": "WT-NORTH-001",
            "siteId": "10000000-0000-4000-8000-000000000001",
            "siteName": "Северная ветровая площадка",
            "requestCount": 4,
            "closedRequestCount": 2,
            "totalPlannedHours": 22,
            "lastMaintenanceAt": "2026-08-22T16:00:00.000Z"
        }
    ]
}
```

Отчёт реализован одним параметризованным raw SQL-запросом. CTE отдельно фильтруют заявки, считают статусы, суммируют часы и находят последнее обслуживание.

### Погодный прогноз

```bash
curl http://localhost:3000/api/equipment/20000000-0000-4000-8000-000000000001/weather
```

День подходит, если осадки не превышают <code>MAX_PRECIPITATION_MM</code>, а ветер — <code>MAX_WIND_SPEED_KMH</code>. Ошибка Open-Meteo возвращает <code>502</code>.

## Бизнес-правила

- серийный номер уникален без учёта регистра;
- дата установки не может быть в будущем;
- заявка создаётся только для существующего оборудования;
- новая заявка получает <code>new</code>;
- статус меняется только отдельным маршрутом;
- нельзя начать заявку без исполнителя;
- смена статуса и история атомарны;
- история не удаляется каскадно;
- команда заменяется транзакционно;
- в команде ровно один <code>lead</code>;
- оборудование с открытыми заявками не удаляется;
- заявка с историей не удаляется;
- пустой PATCH отклоняется;
- начало диапазона не может быть позже окончания.

## Ошибки

```json
{
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "Переданы некорректные данные",
        "details": [
            {
                "field": "name",
                "message": "Too small: expected string to have >=3 characters"
            }
        ],
        "requestId": "fe598c0c-2359-4772-945d-cc454b30d6e6"
    }
}
```

| HTTP | Код                                 | Причина                            |
| ---- | ----------------------------------- | ---------------------------------- |
| 400  | <code>BAD_REQUEST</code>            | Некорректный JSON                  |
| 404  | <code>NOT_FOUND</code>              | Ресурс не найден                   |
| 409  | <code>CONFLICT</code>               | Бизнес-конфликт или ограничение БД |
| 413  | <code>PAYLOAD_TOO_LARGE</code>      | Большое тело                       |
| 422  | <code>VALIDATION_ERROR</code>       | Ошибка body, params или query      |
| 429  | <code>RATE_LIMIT_EXCEEDED</code>    | Rate limit                         |
| 500  | <code>INTERNAL_ERROR</code>         | Непредвиденная ошибка              |
| 502  | <code>EXTERNAL_SERVICE_ERROR</code> | Ошибка Open-Meteo                  |

Внутренние сообщения PostgreSQL и stack trace клиенту не возвращаются. UNIQUE и FOREIGN KEY преобразуются в прикладные ошибки.

## Postman

Файл коллекции:

```text
docs/postman/express-rest-api-caselab.postman_collection.json
```

Порядок запуска:

1. поднять PostgreSQL;
2. применить миграции и сиды;
3. запустить API;
4. импортировать JSON;
5. запустить коллекцию целиком без изменения порядка.

Коллекция содержит 30 запросов: CRUD, валидацию, команду, историю, конфликты, сводку и отчёт. Базовый URL:

```text
http://localhost:3000/api
```

Коллекция использует UUID демонстрационных площадок и специалистов, поэтому требует применённых сидов.

## Безопасность и логирование

- Helmet добавляет защитные заголовки;
- CORS использует явный список origin;
- размер JSON ограничен;
- rate limit применяется к <code>/api</code>;
- stack trace не раскрывается;
- <code>.env</code> исключён из Git;
- cookie и аутентификация не используются.

Каждый запрос получает UUID. Он возвращается в <code>X-Request-Id</code>, входит в тело ошибки и структурированный лог Pino. Ответы 2xx/3xx логируются как <code>info</code>, 4xx — <code>warn</code>, 5xx — <code>error</code>.

## Архитектура

```text
HTTP
  ↓
middlewares
  ↓
routes
  ↓
controllers
  ↓
services
  ↓
repositories
  ↓
Sequelize
  ↓
PostgreSQL
```

- <code>middlewares</code> — Request ID, логирование, безопасность, rate limit, валидация, ошибки;
- <code>routes</code> — HTTP-методы и URL;
- <code>controllers</code> — преобразование HTTP-запросов;
- <code>services</code> — бизнес-правила;
- <code>repositories</code> — ORM, транзакции и raw SQL;
- <code>database/models</code> — модели и ассоциации;
- <code>database/migrations</code> — версия схемы;
- <code>database/seeders</code> и <code>database/fixtures</code> — демоданные;
- <code>validators</code> — Zod;
- <code>errors</code> — ошибки приложения;
- <code>api</code> — Open-Meteo.

## Структура

```text
.
├── docs
│   └── postman
└── src
    ├── api
    ├── controllers
    ├── database
    │   ├── fixtures
    │   ├── migrations
    │   ├── models
    │   └── seeders
    ├── errors
    ├── middlewares
    ├── repositories
    ├── routes
    ├── services
    ├── tests
    └── validators
```

Назначение каталогов:

- <code>docs</code> — дополнительные материалы проекта;
- <code>docs/postman</code> — готовая коллекция запросов и проверок Postman;
- <code>src/api</code> — клиент внешнего сервиса Open-Meteo;
- <code>src/controllers</code> — обработка HTTP-запросов и формирование ответов;
- <code>src/database</code> — подключение Sequelize и всё, что относится к PostgreSQL;
- <code>src/database/fixtures</code> — декомпозированные наборы демонстрационных данных;
- <code>src/database/migrations</code> — последовательные изменения схемы базы;
- <code>src/database/models</code> — модели Sequelize и их ассоциации;
- <code>src/database/seeders</code> — загрузка и удаление демонстрационных данных;
- <code>src/errors</code> — прикладные классы ошибок;
- <code>src/middlewares</code> — валидация, логирование, Request ID, безопасность и обработка ошибок;
- <code>src/repositories</code> — запросы к базе, транзакции и raw SQL;
- <code>src/routes</code> — маршруты Express;
- <code>src/services</code> — бизнес-правила приложения;
- <code>src/tests</code> — автоматические тесты;
- <code>src/validators</code> — схемы Zod для body, params и query.

## Проверка качества

```bash
npm run format
npm run format:check
npm run lint
npm test
```

## Ограничения

- аутентификация и авторизация не реализованы;
- отдельный CRUD площадок, паспортов и специалистов отсутствует;
- эти сущности создаются сидами или внутренней логикой;
- погода зависит от Open-Meteo;
- Postman создаёт тестовые записи в локальной базе.
