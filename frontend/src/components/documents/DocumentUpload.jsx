import UploadModal from '../UploadModal.jsx';

// Alias matching the setup-guide filename (DocumentUpload) backed by the existing modal.
export function DocumentUpload(props) {
  return <UploadModal {...props} />;
}

export default DocumentUpload;
