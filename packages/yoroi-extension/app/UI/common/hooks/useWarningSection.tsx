import { Warning } from '../../components/Warning/Warning';

export const useWarningSection = ({ warning, title, content }) => {
  if (!warning || !warning.kind) {
    return null;
  }
  switch (warning.kind) {
    case 'undelegate':
      return <Warning title={title} content={content} />;

    default:
      return null;
  }
};
