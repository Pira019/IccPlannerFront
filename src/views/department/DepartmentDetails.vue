<template>
    <PageComponent :title-page="$t('liDepart')" :show-add-btn="false">
        <Card>
            <template #title>
                <h2>Simple Card</h2>
                <Tag severity="success" value="Success"></Tag>
            </template>
            <template #content>
                <div>
                    <Tag severity="secondary"> Date : 25 Janv. 2025 </Tag>
                </div>
                <div>
                    <Tag severity="secondary"> Date : 25 Janv. 2025 </Tag>
                </div>
                <div class="m-2">
                    <p class="m-0">
                        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Inventore sed consequuntur error repudiandae numquam deserunt quisquam repellat libero asperiores earum nam nobis, culpa ratione quam perferendis esse, cupiditate neque
                        quas!
                    </p>
                </div>
            </template>
        </Card>
    </PageComponent>
</template>

<script setup>
import PageComponent from '@/components/PageComponent.vue';
</script>
