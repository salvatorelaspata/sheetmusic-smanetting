import { useTranslation } from 'react-i18next'
import { PagePlaceholder } from '../components/ui/PagePlaceholder'

export default function Teoria() {
  const { t } = useTranslation()
  return (
    <PagePlaceholder
      title={t('sections.teoria.title')}
      subtitle={t('sections.teoria.subtitle')}
      phase="Fase 3"
    />
  )
}
