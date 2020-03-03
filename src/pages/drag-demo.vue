<template>
    <div>
        <notice-template
            :components="['image', 'divider']"
            :layouts="[[1],[1,1],[2,1,2]]"
            :showPreview="true"
            :showContent="true"
            :showComponents="true"
            :styles="testOpt"
        ></notice-template>
    </div>
</template>

<script>

  import NoticeTemplate from "../components/notice-template/index.vue";

  export default {
    name: "drag-demo",
    components: {NoticeTemplate},
    computed: {},
    data() {
      return {
        testOpt: {
          'image': [
            {
              key: 'width',
              value: '200',
              title: '宽度',
              units: 'px|%',
              unit: 'px',
              config: true
            }
          ]
        }
      }
    },
    methods: {}
  }
</script>

<style lang="scss" scoped>
</style>
