import { useTranslation } from 'react-i18next'
import { PagePlaceholder } from '../components/ui/PagePlaceholder'

export default function Pratica() {
  const { t } = useTranslation()
  return (
    <PagePlaceholder
      title={t('sections.pratica.title')}
      subtitle={t('sections.pratica.subtitle')}
      phase="Fase 4"
    />
  )
}
