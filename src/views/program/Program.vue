<script setup>
import ProgramService from '@/service/ProgramService';
import { handleAsyncError } from '@/utils/handleAsyncError';
import { useDialog } from 'primevue';
import { defineAsyncComponent, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const loading = ref(false);
// Permet de savoir si c'est en mode édition.
const isEdit = ref(false);
const errorReq = ref(null);
const nodes = ref([]);
const filters = ref({});

const currentRow = ref(null); // pour stocker la ligne sélectionnée
const items = ref([]); // pour stocker la ligne sélectionnée
const menu = ref([]);

const dialog = useDialog();
const EditProgramDialog = defineAsyncComponent(() => import('@/views/program/EditProgram.vue'));

function showEditProgram() {
    dialog.open(EditProgramDialog, {
        emits: {
            onSaved: (e) => {
                nodes.value.push({
                    key: `prog-${nodes.value.length}`,
                    data: {
                        name: e.name,
                        nodeType: 'program',
                    }
                });
            }
        },
        props: {
            header: isEdit.value ? t('UpdateProgram') : t('AddProgram'),
            style: {
                width: '30vw'
            },
            breakpoints: {
                '960px': '75vw',
                '640px': '90vw'
            },
            modal: true
        }
    });
}

const buildItems = (row) => [
    {
        items: [
            {
                label: t('btnUpdate'),
                icon: 'pi pi-pencil',
                command: () => onEdit(row)
            },
            {
                label: t('btnDel'),
                icon: 'pi pi-trash',
                command: () => onDelete(row)
            }
        ]
    }
];

// Toggle du menu
const toggle = (event, row) => {
    currentRow.value = row;
    items.value = buildItems(row);
    menu.value.toggle(event);
};

onMounted(async () => {
    await getData();
});

async function getData() {
    const { result, error } = await handleAsyncError(
        () => ProgramService.getProgramsFilter({}),
        t,
        (val) => (loading.value = val)
    );
    errorReq.value = error;
    nodes.value = mapToTreeTable(result);
}

// Méthodes pour les actions
const onEdit = (row) => {
    showEditProgram();
};

const onDelete = (row) => {
    console.log('Supprimer ligne:', row);
    // ta logique ici
};

function mapToTreeTable(programmes) {
    return programmes?.map((program, progIndex) => ({
        key: `prog-${progIndex}`,
        data: {
            name: program.name,
            type: program?.typeProgram ? program.typeProgram : '-',
            department: Array.isArray(program?.departments) && program.departments.length ? program.departments.map((d) => d.shortName).join(', ') : '-',
            nodeType: 'program'
        },
        children: program?.dates?.map((date, dateIndex) => ({
            key: `prog-${progIndex}-date-${dateIndex}`,
            data: {
                name: date.date ? new Date(date.date).toLocaleDateString() : null,
                type: `${date.nbrService} service(s)`,
                department: date.department?.name,
                nodeType: 'date'
            },
            children: date?.services.map((srv, srvIndex) => ({
                key: `prog-${progIndex}-date-${dateIndex}-srv-${srvIndex}`,
                data: {
                    name: srv.name,
                    type: srv.hours,
                    department: srv.arrivalHours ? `Heure d'arrivée ${srv.arrivalHours}` : "Pas d'heure d'arrivée",
                    nodeType: 'service'
                }
            }))
        }))
    }));
}
</script>

<template>
    <HeaderComponent :title-page="$t('Programs')" />
    <Fluid>
        <div class="card">
            <section id="search" class="flex flex-col gap-4">
                <h3>{{ $t('search') }}</h3>
                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <div class="font-semibold text-xl mb-1">{{ $t('Department') }}</div>
                        <MultiSelect
                            :emptyFilterMessage="$t('NoResultsFound')"
                            :emptyMessage="$t('FilterEmptyMessage')"
                            v-model="selectedCities"
                            :options="cities"
                            filter
                            optionLabel="name"
                            :placeholder="$t('selectDepartment')"
                            :maxSelectedLabels="3"
                            class="w-full md:w-80"
                        />
                    </div>
                    <div>
                        <div class="font-semibold text-xl mb-1">{{ $t('monthAndYear') }}</div>
                        <DatePicker v-model="date" view="month" dateFormat="mm/yy" :placeholder="$t('selectMonthAndYear')" />
                    </div>
                </div>
                <div class="self-end">
                    <Button icon="pi pi-search" :label="$t('search')" />
                </div>
            </section>

            <Divider />

            <!-- Tableau resulat-->
            <section id="result" class="mt-10 flex flex-col gap-4 border-top">
                <div class="self-start">
                    <Button icon="pi pi-plus" :label="$t('Add')" @click="showEditProgram" />
                </div>

                <TreeTable :value="nodes" :metaKeySelection="false" selectionMode="single" :filters="filters" filterMode="strict" scrollable scrollHeight="600px" tableStyle="min-width: 100rem" :loading="loading">
                    <template #header>
                        <div class="flex justify-end">
                            <IconField>
                                <InputIcon class="pi pi-search" />
                                <InputText v-model="filters['global']" placeholder="Global Search" />
                            </IconField>
                        </div>
                    </template>
                    <Column field="name" expander frozen sortable header="Nom" style="min-width: 150px" />
                    <Column field="type" sortable header="Type" style="min-width: 12rem" />
                    <Column field="department" sortable header="Départements" style="min-width: 12rem" />
                    <Column header="Action" style="min-width: 12rem">
                        <template #body="slotProps">
                            <Button type="button" @click="toggle($event, slotProps.node)" icon="pi pi-ellipsis-v" aria-haspopup="true" aria-controls="overlay_menu" />
                            <Menu ref="menu" id="overlay_menu" :model="items" :popup="true" />
                        </template>
                    </Column>
                </TreeTable>
            </section>
        </div>
    </Fluid>
    <DynamicDialog />
</template>
