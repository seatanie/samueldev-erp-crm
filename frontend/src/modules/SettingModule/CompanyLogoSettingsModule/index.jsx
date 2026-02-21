import SetingsSection from '../components/SetingsSection';
import AppSettingForm from './forms/AppSettingForm';

import useLanguage from '@/locale/useLanguage';

export default function CompanyLogoSettingsModule({ config }) {
  const translate = useLanguage();
  return (
    <SetingsSection
      title={translate('Company Logo')}
      description={translate('Update Company logo')}
    >
      <AppSettingForm />
    </SetingsSection>
  );
}
