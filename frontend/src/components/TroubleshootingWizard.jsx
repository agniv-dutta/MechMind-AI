import WizardModal from './WizardModal.jsx';

// Alias matching the setup-guide filename (TroubleshootingWizard) backed by the existing modal.
export function TroubleshootingWizard(props) {
  return <WizardModal {...props} />;
}

export default TroubleshootingWizard;
