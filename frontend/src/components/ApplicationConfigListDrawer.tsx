import { Drawer } from 'antd';
import { Application, AppEnvironmentConfig } from '../api/types';

interface ApplicationConfigListDrawerProps {
  open: boolean;
  application: Application | null;
  configs: AppEnvironmentConfig[];
  onClose: () => void;
  onAddNew: () => void;
  onEdit: (config: AppEnvironmentConfig) => void;
  onDelete: (config: AppEnvironmentConfig) => void;
}

export function ApplicationConfigListDrawer({
  open,
  application,
  configs,
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
        <button onClick={onAddNew}>+ New configuration</button>
      </div>

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
                  <button onClick={() => onEdit(config)}>Edit</button>
                  <button className="danger" onClick={() => onDelete(config)}>
                    Delete
                  </button>
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
    </Drawer>
  );
}
