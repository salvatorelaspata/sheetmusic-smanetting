import { useTranslation } from 'react-i18next'
import { PagePlaceholder } from '../components/ui/PagePlaceholder'

export default function Componi() {
  const { t } = useTranslation()
  return (
    <PagePlaceholder
      title={t('sections.componi.title')}
      subtitle={t('sections.componi.subtitle')}
      phase="Fase 5"
    />
  )
}
