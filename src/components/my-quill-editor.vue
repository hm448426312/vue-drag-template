<template>
    <div>
        <quill-editor
            ref="quillEditor"
            v-model="content"
            :options="editorOptions"
            @focus="onEditorFocus($event)"
            @blur="onEditorBlur($event)"
            @change="onEditorChange($event)"
        ></quill-editor>
    </div>
</template>

<script>
  import {quillEditor} from 'vue-quill-editor' // 调用富文本编辑器
  import 'quill/dist/quill.snow.css' // 富文本编辑器外部引用样式  三种样式三选一引入即可
  // import 'quill/dist/quill.core.css'
  //import 'quill/dist/quill.bubble.css'
  import * as Quill from 'quill'; // 富文本基于quill
  export default {
    name: "my-quill-editor",
    components: {
      quillEditor
    },
    model:{
      prop: 'editorContent',
      event: 'set-content'
    },
    props: {
      'editorContent': {
        type: String,
        default: () => '请输入...'
      }
    },
    data() {
      return {
        content: '',
        editorContainer: null,
        editor: null,
        editorOptions: {
          debug: false,
          modules: {
            // toolbar: '#toolbar'
          },
          placeholder: '请输入...',
          theme: 'snow'
        }
      }
    },
    mounted() {
      this.content = this.editorContent;
    },
    methods: {
      onEditorFocus(d) {
        // console.log('focus', d);
      },
      onEditorBlur(d) {
        // console.log('blur', d);
      },
      onEditorChange(d) {
        this.$emit('set-content', d.html);
        // console.log('change', d);
      },
    }
  }
</script>

<style scoped>
</style>
