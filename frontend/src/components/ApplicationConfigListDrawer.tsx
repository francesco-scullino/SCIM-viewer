import { Drawer } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Application, AppEnvironmentConfig } from '../api/types';
import { IconButton } from './IconButton';
import { Loader } from './Loader';

interface ApplicationConfigListDrawerProps {
  open: boolean;
  application: Application | null;
  configs: AppEnvironmentConfig[];
  loading?: boolean;
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
      <div className="section-toolbar">
        <IconButton icon={<PlusOutlined />} label="New configuration" onClick={onAddNew} />
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="table-scroll">
          <table className="data-table config-table">
            <thead>
              <tr>
                <th>Environment</th>
                <th>Client ID</th>
                <th>SCIM Base URL</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {configs.map((config) => (
                <tr key={config.id}>
                  <td>{config.environmentName}</td>
                  <td>{config.clientId}</td>
                  <td>{config.scimBaseUrl}</td>
                  <td className="actions">
                    <IconButton icon={<EditOutlined />} label="Edit" onClick={() => onEdit(config)} />
                    <IconButton icon={<DeleteOutlined />} label="Delete" danger onClick={() => onDelete(config)} />
                  </td>
                </tr>
              ))}
              {configs.length === 0 && (
                <tr>
                  <td colSpan={4}>No configuration for this application yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </Drawer>
  );
}

