/**
 * Tipos del feature `platform-admin`.
 *
 * Reexporta los tipos del service para que componentes y hooks los usen
 * directamente desde `@/features/platform-admin/types` (un solo punto de
 * entrada para el feature).
 */
export type {
  OrganizationListItem,
  OrganizationDetail,
  GlobalMetrics,
  ListOrganizationsParams,
} from './services/platform-admin.service';
