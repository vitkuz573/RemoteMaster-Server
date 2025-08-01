# Extensible Health Check System

Система мониторинга здоровья приложения с возможностью легкого добавления любых проверок.

## 🚀 Возможности

- **Модульная архитектура** - легко добавлять новые проверки
- **Кэширование результатов** - производительность без потери актуальности
- **Критические и некритические проверки** - гибкая настройка важности
- **Таймауты** - защита от зависших проверок
- **Детальная информация** - полная диагностика проблем
- **Автоматическая инициализация** - работает из коробки

## 📋 Встроенные проверки

### Системные проверки
- **API Endpoint** - проверка основного API
- **Memory Usage** - использование памяти (порог 80%)
- **File System** - доступность файловой системы
- **Environment** - проверка переменных окружения

### Дополнительные проверки (примеры)
- **CPU Usage** - использование процессора
- **Disk Space** - свободное место на диске
- **Network Connectivity** - сетевая связность
- **SSL Certificates** - валидность SSL сертификатов
- **Database** - подключение к базе данных
- **Redis** - подключение к кэшу
- **External APIs** - внешние сервисы

## 🔧 Как добавить новую проверку

### 1. Создание плагина проверки

```typescript
import { HealthCheckPlugin, HealthCheckResult } from '@/lib/system-status';

export class MyCustomHealthCheckPlugin implements HealthCheckPlugin {
  name = 'my-service';
  description = 'My custom service health check';
  critical = false; // true = критическая проверка
  timeout = 3000; // таймаут в миллисекундах

  async check(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      // Ваша логика проверки здесь
      const isHealthy = await this.performCheck();
      
      const responseTime = Date.now() - startTime;
      
      return {
        healthy: isHealthy,
        responseTime,
        details: {
          // Дополнительная информация
          customField: 'value'
        },
        error: isHealthy ? undefined : 'Описание ошибки'
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        healthy: false,
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async performCheck(): Promise<boolean> {
    // Реализация проверки
    return true;
  }
}
```

### 2. Регистрация проверки

```typescript
import { addHealthCheck } from '@/lib/system-status';
import { MyCustomHealthCheckPlugin } from './my-custom-health-check';

// Добавить проверку
addHealthCheck(new MyCustomHealthCheckPlugin());
```

### 3. Удаление проверки

```typescript
import { removeHealthCheck } from '@/lib/system-status';

// Удалить проверку по имени
removeHealthCheck('my-service');
```

## 📊 Типы проверок

### HTTP Health Check
```typescript
import { HttpHealthCheckPlugin } from '@/lib/system-status';

const httpCheck = new HttpHealthCheckPlugin(
  'external-api',
  'https://api.example.com/health',
  true, // критическая
  5000, // таймаут
  'External API health check'
);

addHealthCheck(httpCheck);
```

### External API Check
```typescript
import { ExternalApiHealthCheckPlugin } from '@/lib/health-check-plugins';

const apiCheck = new ExternalApiHealthCheckPlugin(
  'payment-service',
  'https://api.stripe.com/health',
  true, // критическая
  5000,
  'Stripe payment service check',
  200 // ожидаемый статус код
);

addHealthCheck(apiCheck);
```

### Database Check (PostgreSQL)
```typescript
import { PostgresHealthCheckPlugin } from '@/lib/health-check-plugins';

// Реализуйте проверку в классе
class MyPostgresCheck extends PostgresHealthCheckPlugin {
  async check(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      // Ваша логика подключения к PostgreSQL
      const { Client } = require('pg');
      const client = new Client(process.env.DATABASE_URL);
      await client.connect();
      const result = await client.query('SELECT 1');
      await client.end();
      
      const responseTime = Date.now() - startTime;
      
      return {
        healthy: true,
        responseTime,
        details: {
          connected: true,
          type: 'postgresql'
        }
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        healthy: false,
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

addHealthCheck(new MyPostgresCheck());
```

## 🎯 Логика статусов

### Критические проверки
- **Один сбой** = система **Offline**
- Влияют на общий статус приложения

### Некритические проверки
- **Один сбой** = система **Degraded**
- **Несколько сбоев** = система **Degraded**
- Не влияют на критическую функциональность

### Статусы системы
- 🟢 **Online** - все проверки прошли успешно
- 🟡 **Degraded** - некоторые некритические проверки не прошли
- 🔴 **Offline** - критическая проверка не прошла
- 🔵 **Maintenance** - режим обслуживания

## ⚡ Производительность

### Кэширование
- Результаты кэшируются на **30 секунд**
- Автоматическое обновление при истечении кэша
- Принудительное обновление через `refreshSystemStatus()`

### Таймауты
- Каждая проверка имеет свой таймаут
- По умолчанию: **5000ms**
- Защита от зависших проверок

### Параллельное выполнение
- Все проверки выполняются параллельно
- Общий таймаут = максимальный таймаут проверки

## 🔍 Мониторинг и отладка

### Получение списка проверок
```typescript
import { getHealthChecks } from '@/lib/system-status';

const checks = getHealthChecks();
console.log('Registered checks:', checks.map(c => c.name));
```

### Детальная информация
```typescript
import { getSystemStatus } from '@/lib/system-status';

const status = await getSystemStatus();
console.log('System status:', status.status);
console.log('Services:', status.services);
console.log('Message:', status.message);
```

### API Endpoint
```
GET /api/health
```

Ответ:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "version": "2.1.4",
  "responseTime": 150,
  "message": "All systems operational (150ms)",
  "services": {
    "api": {
      "status": "healthy",
      "responseTime": 50,
      "lastCheck": 1704110400000,
      "details": {
        "statusCode": 200,
        "statusText": "OK"
      }
    },
    "memory": {
      "status": "healthy",
      "responseTime": 1,
      "lastCheck": 1704110400000,
      "details": {
        "heapUsed": 45,
        "heapTotal": 100,
        "heapUsagePercent": 45,
        "threshold": 80
      }
    }
  }
}
```

## 🛠️ Конфигурация

### Переменные окружения
```env
# API endpoints
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_HEALTH_URL=http://localhost:3001/health
NEXT_PUBLIC_STATUS_URL=http://localhost:3001/status

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/db

# Redis
REDIS_URL=redis://localhost:6379
```

### Настройка в коде
```typescript
// В app/layout.tsx или другом месте инициализации
import { initializeDefaultHealthChecks } from '@/lib/system-status';

if (typeof window === 'undefined') {
  initializeDefaultHealthChecks();
}
```

## 📝 Примеры использования

### Добавление проверки внешнего сервиса
```typescript
import { ExternalApiHealthCheckPlugin } from '@/lib/health-check-plugins';
import { addHealthCheck } from '@/lib/system-status';

// Проверка платежного сервиса
addHealthCheck(new ExternalApiHealthCheckPlugin(
  'stripe',
  'https://api.stripe.com/health',
  true, // критическая
  5000,
  'Stripe payment service'
));

// Проверка email сервиса
addHealthCheck(new ExternalApiHealthCheckPlugin(
  'sendgrid',
  'https://api.sendgrid.com/health',
  false, // некритическая
  3000,
  'SendGrid email service'
));
```

### Проверка системных ресурсов
```typescript
import { 
  CpuHealthCheckPlugin,
  DiskSpaceHealthCheckPlugin,
  NetworkHealthCheckPlugin 
} from '@/lib/health-check-plugins';

addHealthCheck(new CpuHealthCheckPlugin());
addHealthCheck(new DiskSpaceHealthCheckPlugin());
addHealthCheck(new NetworkHealthCheckPlugin());
```

### Динамическое управление
```typescript
import { 
  addHealthCheck, 
  removeHealthCheck, 
  getHealthChecks 
} from '@/lib/system-status';

// Получить список всех проверок
const checks = getHealthChecks();
console.log('Active checks:', checks.map(c => c.name));

// Удалить проверку
removeHealthCheck('cpu');

// Добавить новую проверку
addHealthCheck(new MyCustomCheck());
```

## 🚨 Troubleshooting

### Проверка не выполняется
1. Проверьте правильность импорта
2. Убедитесь, что проверка зарегистрирована
3. Проверьте таймауты
4. Посмотрите логи ошибок

### Ложные срабатывания
1. Настройте пороги для проверок
2. Увеличьте таймауты
3. Добавьте retry логику
4. Проверьте сетевые настройки

### Производительность
1. Уменьшите частоту проверок
2. Оптимизируйте логику проверок
3. Используйте кэширование
4. Настройте таймауты

## 📚 Дополнительные ресурсы

- [Примеры плагинов](./lib/health-check-plugins.ts)
- [Примеры использования](./lib/health-check-examples.ts)
- [API документация](./lib/system-status.ts)
- [Health endpoint](./app/api/health/route.ts) 