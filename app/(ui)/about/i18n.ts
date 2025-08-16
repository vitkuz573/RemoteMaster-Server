import { headers } from 'next/headers'

type Dict = Record<string, string>

const en: Dict = {
  build: 'Build',
  build_desc: 'Versioning and deployment metadata',
  support: 'Support',
  support_desc: 'How to get help',
  links: 'Links',
  links_desc: 'Project and status pages',
  client_env: 'Client environment',
  client_env_desc: 'Browser, locale, device',
  feature_flags: 'Feature flags',
  feature_flags_desc: 'Runtime toggles',
  operational_toggles: 'Operational toggles',
  operational_toggles_desc: 'Enabled behaviors',
  operational_checks: 'Operational checks',
  operational_checks_desc: 'Live connectivity and latency',
  endpoints: 'Endpoints',
  endpoints_desc: 'Runtime service configuration',
  performance: 'Performance (Web Vitals)',
  performance_desc: 'Measured on your device',
  support_bundle: 'Support bundle',
  support_bundle_desc: 'Export diagnostics as JSON',
}

const ru: Dict = {
  build: 'Сборка',
  build_desc: 'Версионирование и метаданные деплоя',
  support: 'Поддержка',
  support_desc: 'Как получить помощь',
  links: 'Ссылки',
  links_desc: 'Проект и статус‑страницы',
  client_env: 'Окружение клиента',
  client_env_desc: 'Браузер, язык, устройство',
  feature_flags: 'Фичефлаги',
  feature_flags_desc: 'Рантайм‑переключатели',
  operational_toggles: 'Операционные переключатели',
  operational_toggles_desc: 'Включённые поведения',
  operational_checks: 'Операционные проверки',
  operational_checks_desc: 'Доступность и задержка',
  endpoints: 'Эндпоинты',
  endpoints_desc: 'Рантайм‑конфигурация сервисов',
  performance: 'Производительность (Web Vitals)',
  performance_desc: 'Измеряется на вашем устройстве',
  support_bundle: 'Пакет поддержки',
  support_bundle_desc: 'Экспорт диагностики в JSON',
}

export function getDict() {
  try {
    const h = headers()
    const url = h.get('x-next-url') || ''
    const u = new URL(url, 'http://localhost')
    const lang = (u.searchParams.get('lang') || '').toLowerCase()
    if (lang === 'ru') return ru
  } catch {}
  const accept = (headers().get('accept-language') || '').toLowerCase()
  if (accept.includes('ru')) return ru
  return en
}

