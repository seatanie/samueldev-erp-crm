import SetingsSection from '../components/SetingsSection';
import PDFSettingsForm from './forms/PDFSettingsForm';

import useLanguage from '@/locale/useLanguage';

export default function PDFSettingsModule({ config }) {
  const translate = useLanguage();
  return (
    <>
      <SetingsSection
        title={translate('PDF Configuration')}
        description={translate('Update PDF footer configuration')}
      >
        <PDFSettingsForm />
      </SetingsSection>
    </>
  );
}



