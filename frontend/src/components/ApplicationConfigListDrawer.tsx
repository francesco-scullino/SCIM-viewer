import { Drawer } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SettingOutlined } from '@ant-design/icons';
import { Application, AppEnvironmentConfig } from '../api/types';
import { IconButton } from './IconButton';
import { Loader } from './Loader';
import { EmptyState, DataError } from './EmptyState';

interface ApplicationConfigListDrawerProps {
  open: boolean;
  application: Application | null;
  configs: AppEnvironmentConfig[];
  loading?: boolean;
  error?: string;
  onRetry: () => void;
  onClose: () => void;
  onAddNew: () => void;
  onEdit: (config: AppEnvironmentConfig) => void;
  onDelete: (config: AppEnvironmentConfig) => void;
}

export function ApplicationConfigListDrawer({
  open,
  application,
  configs,
  loading,
  error,
  onRetry,
  onClose,
  onAddNew,
  onEdit,
  onDelete,
}: ApplicationConfigListDrawerProps) {
  return (
    <Drawer
      title={application ? `Configurations for ${application.name}` : 'Configurations'}
      onClose={onClose}
      open={open}
      size={960}
    >
      <p className="hint">Each environment uses its own credentials and SCIM endpoint.</p>
      <div className="section-toolbar">
        <IconButton icon={<PlusOutlined />} label="New configuration" showLabel onClick={onAddNew} />
      </div>

      {loading ? (
        <Loader />
      ) : error ? <DataError message={error} onRetry={onRetry} /> : configs.length === 0 ? <EmptyState icon={<SettingOutlined />} title="No environment configurations" description="Add credentials and a SCIM URL for the environments where this application runs." action={<IconButton icon={<PlusOutlined />} label="New configuration" showLabel onClick={onAddNew} />} /> : (
        <div className="table-scroll" role="region" aria-label="Environment configurations" tabIndex={0}>
          <table className="data-table config-table">
            <caption className="visually-hidden">Application environment configurations</caption>
            <thead>
              <tr>
                <th scope="col">Environment</th>
                <th scope="col">Client ID</th>
                <th scope="col">SCIM Base URL</th>
                <th scope="col" className="actions-heading">Actions</th>
              </tr>
            </thead>
            <tbody>
              {configs.map((config) => (
                <tr key={config.id}>
                  <td>{config.environmentName}</td>
                  <td>{config.clientId}</td>
                  <td className="endpoint">{config.scimBaseUrl}</td>
                  <td className="actions">
                    <IconButton icon={<EditOutlined />} label="Edit" onClick={() => onEdit(config)} />
                    <IconButton icon={<DeleteOutlined />} label="Delete" danger onClick={() => onDelete(config)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Drawer>
  );
}

