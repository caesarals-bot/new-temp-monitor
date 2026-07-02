import { useOrganizationStore } from '@/features/organizations/store/organization.store';
import { useLocationsManagement } from '../hooks/useLocationsManagement';
import { LocationsHeader } from '../components/LocationsHeader';
import { LocationCard } from '../components/LocationCard';
import { LocationFormDialog } from '../components/LocationFormDialog';
import { DeleteLocationDialog } from '../components/DeleteLocationDialog';
import { Card, CardContent } from '@/shared/components/ui/card';
import { MapPin } from 'lucide-react';

export function LocationsPage() {
  const organization = useOrganizationStore((s) => s.organization);
  const locations = useOrganizationStore((s) => s.locations);

  const {
    canEdit, atLimit, maxLocations, planType, equipmentCountByLocation, openIncidentsByLocation,
    dialog, editingLocation, deletingLocation,
    dependencies, isLoadingDependencies, isMutating,
    formError, deleteError,
    openCreate, openEdit, openDelete, closeDialog,
    submitCreate, submitEdit, confirmDelete,
  } = useLocationsManagement();

  if (!organization) {
    return (
      <div className="flex h-[60vh] items-center justify-center p-8 text-sm text-[--color-text-secondary]">
        Cargando organización...
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <LocationsHeader
        totalLocations={locations.length}
        maxLocations={maxLocations}
        planType={planType}
        canCreate={canEdit && !atLimit}
        onCreate={openCreate}
      />

      <div className="flex-1 p-6">
        {locations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[--color-eucalyptus-bg]">
                <MapPin className="h-6 w-6 text-[--color-eucalyptus]" aria-hidden="true" />
              </div>
              <div>
                <p className="text-base font-medium text-[--color-text-primary]">
                  Aún no tienes sedes
                </p>
                <p className="mt-1 text-sm text-[--color-text-secondary]">
                  Crea tu primera sede para empezar a registrar equipos y lecturas.
                </p>
              </div>
              {canEdit && (
                <button
                  type="button"
                  onClick={openCreate}
                  className="mt-2 text-sm font-medium text-[--color-eucalyptus] hover:underline"
                >
                  Crear primera sede
                </button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            data-testid="locations-grid"
          >
            {locations.map((location) => (
              <LocationCard
                key={location.id}
                location={location}
                equipmentCount={equipmentCountByLocation.get(location.id) ?? 0}
                openIncidentCount={openIncidentsByLocation.get(location.id) ?? 0}
                canEdit={canEdit}
                onEdit={openEdit}
                onDelete={openDelete}
              />
            ))}
          </div>
        )}
      </div>

      <LocationFormDialog
        open={dialog === 'create' || dialog === 'edit'}
        mode={dialog === 'edit' ? 'edit' : 'create'}
        location={editingLocation}
        isLoading={isMutating}
        serverError={formError}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        onSubmitCreate={submitCreate}
        onSubmitEdit={submitEdit}
      />

      <DeleteLocationDialog
        open={dialog === 'delete'}
        location={deletingLocation}
        dependencies={dependencies}
        isLoadingDependencies={isLoadingDependencies}
        isDeleting={isMutating}
        serverError={deleteError}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
