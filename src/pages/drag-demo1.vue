<template>
    <div class="drag-box">
        <div class="drag-component">
            <h1>布局区域</h1>
            <div class="layout-ui">
                <div @dragstart="layoutDragStartEvent($event, [1])" draggable="true">1</div>
                <div @dragstart="layoutDragStartEvent($event, [1,1])" draggable="true">1:1</div>
                <div @dragstart="layoutDragStartEvent($event, [1,1,1])" draggable="true">1:1:1</div>
                <div @dragstart="layoutDragStartEvent($event, [1,2,1])" draggable="true">1:2:1</div>
                <div @dragstart="layoutDragStartEvent($event, [1,2,2,1])" draggable="true">1:2:2:1</div>
            </div>
            <h1>组件区域</h1>
            <div class="content-ui">
                <div @dragstart="componentDragStartEvent($event, 'image')" draggable="true">图片</div>
                <div @dragstart="componentDragStartEvent($event, 'divider')" draggable="true">分割线</div>
                <div @dragstart="componentDragStartEvent($event, 'textarea')" draggable="true">文本</div>
                <div @dragstart="componentDragStartEvent($event, 'editor')" draggable="true">富文本</div>
            </div>
            <template v-if="selectedItem && selectedItem.data && selectedItem.data.style">
                <h1>样式设置区域</h1>
                <div class="style-ui">
                    <div>组件名称：{{selectedItem.data.type}}</div>
                    <template v-for="key of theObject.keys(selectedItem.data.style)">
                        <div>
                            <label>{{key}}：</label>
                            <input v-model="selectedItem.data.style[key]"/>
                        </div>
                    </template>
                </div>
            </template>
        </div>
        <div class="drag-preview">
            <h1>预览区域</h1>
            <div>
                <template v-for="item of content">
                    <div class="preview-row clearFix">
                        <template v-for="(colItem, cIndex) of item.children">
                            <div class="preview-col"
                                 :style="{width: getColWidth(item.col, cIndex)}"
                            >
                                <template v-if="colItem.data && colItem.data.type === 'image'">
                                    <img :style="[getStyle(colItem.data.style)]" :src="colItem.data.content">
                                </template>
                                <template v-else-if="colItem.data && colItem.data.type === 'editor'">
                                    <div :style="[getStyle(colItem.data.style)]" v-html="colItem.data.content"></div>
                                </template>
                                <template v-else-if="colItem.data && colItem.data.type === 'divider'">
                                    <div :style="[getStyle(colItem.data.style)]" class="drop-divider"></div>
                                </template>
                                <template v-else-if="colItem.data && colItem.data.type === 'textarea'">
                                    <pre :style="[getStyle(colItem.data.style)]">{{colItem.data.content}}</pre>
                                </template>
                                <template v-else-if="colItem.data && colItem.data.style">
                                    <div :style="[getStyle(colItem.data.style)]">
                                        {{colItem.data.content}}
                                    </div>
                                </template>
                            </div>
                        </template>
                    </div>
                </template>
            </div>
        </div>
        <div class="drop-area"
             @dragover="areaDragOverEvent($event)"
             @drop="areaDropEvent($event)"
        >
            <h1>编辑区域</h1>
            <template v-for="(item, index) of content">
                <div v-if="item.dragOver" class="drop-enable"
                     @drop="rowDropEvent($event, item, index)"
                     @dragover="$event.preventDefault();$event.stopPropagation();"></div>
                <div class="drop-row clearFix"
                     :class="{'drop-row': true,'selected-row': item === selectedItem}"
                     @click="clickRowItemEvent($event, item, index)"
                     @dragover="rowDragOverEvent($event, item, index)"
                     @drop="rowDropEvent($event, item, index)"
                >
                    <span draggable="true"
                          @dragstart="rowDragStartEvent($event, item, index)"
                          class="drop-drag-block"></span>
                    <div class="drop-action" @click="deleteRow($event, item, index)">删除</div>
                    <template v-for="(colItem, cIndex) of item.children">
                        <div @click="clickColItemEvent($event, colItem, index, cIndex)"
                             :class="{'drop-row-col': true,'selected-row': colItem === selectedItem}"
                             @dragover="colDragOverEvent($event, colItem, index, cIndex)"
                             @drop="colDropEvent($event,item.children,  colItem, index, cIndex)"
                             :style="{width: getColWidth(item.col, cIndex)}"
                        >
                            <span v-if="item.children.length > 1" draggable="true"
                                  @dragstart="colDragStartEvent($event, item.children, colItem, index, cIndex)"
                                  class="drop-drag-block"></span>
                            <div v-if="colItem.data" class="drop-action"
                                 @click="clearCol($event, item.children, colItem, index, cIndex)">
                                清空
                            </div>
                            <div>

                            </div>
                            <template v-if="colItem.data">
                                <div :class="{'drop-enable': colItem.dragOver}">
                                    <template v-if="colItem.data.type === 'image'">
                                        <img :style="[getStyle(colItem.data.style)]" :src="colItem.data.content">
                                    </template>
                                    <template v-else-if="colItem.data.type === 'textarea'">
                                        <textarea :style="[getStyle(colItem.data.style)]"
                                                  v-model="colItem.data.content"></textarea>
                                    </template>
                                    <template v-else-if="colItem.data.type === 'editor'">
                                        <div :style="[getStyle(colItem.data.style)]">
                                            <my-quill-editor v-model="colItem.data.content"></my-quill-editor>
                                        </div>
                                    </template>
                                    <template v-else-if="colItem.data.type === 'divider'">
                                        <div :style="[getStyle(colItem.data.style)]" class="drop-divider"></div>
                                    </template>
                                </div>
                            </template>
                            <template v-else>
                                <div :class="{'drop-enable': colItem.dragOver}" class="drop-row-col-blank">插入内容（从右侧拖入）
                                </div>
                            </template>
                        </div>
                    </template>
                </div>
            </template>
            <div v-if="dragOverObj && dragOverObj.dropArea" class="drop-enable"></div>
        </div>
    </div>
</template>
<script>
  import MyQuillEditor from "../components/my-quill-editor";

  export default {
    components: {MyQuillEditor},
    name: "drag-demo1",
    data() {
      return {
        dragFlag: false,
        theObject: Object,
        selectedItem: null,
        dragObj: {
          type: null, // 拖拽的type，layout|布局，null|编辑区，**|组件
          rowIndex: null, // 拖拽的行index，null|组件、布局，**|编辑区
          colIndex: null, // 拖拽的列index，null|组件、布局、行，**|列
          item: null, // 拖拽的数据，null|组件、布局，**|行、列
          style: null, // 拖拽对象的样式，null|布局、行、列，**|组件(默认样式)
          parentItem: null, // 拖拽对象的父数组，null|组件、布局、行，**|列
          scale: null, // 拖拽对象的布局比例，null|组件、行、列，**|布局
        },
        dragOverObj: null,
        // content: [],
        content: [
          {
            col: [1, 1],
            dragOver: false,
            dropAble: false,
            children: [
              {
                data: {
                  type: 'image',
                  content: 'http://attachments.gfan.com/forum/attachments2/201301/29/125722eh9nj87bq20eq2e8.jpg',
                  style: {
                    'font-size': '18',
                    'background-color': 'blue',
                    'width': '100',
                    'height': 'auto'
                  }
                },
                dragOver: false,
                dropAble: false,
              },
              {
                data: {
                  type: 'textarea',
                  content: '1\n2',
                  style: {
                    'font-size': '18',
                    'background-color': 'blue',
                    'width': '100%',
                    'height': 'auto'
                  }
                },
                dragOver: false,
                dropAble: false,
              }
            ]
          }, {
            col: [1, 1, 1],
            dragOver: false,
            dropAble: false,
            children: [
              {
                data: {
                  type: 'textarea',
                  content: '文本域1',
                  style: {
                    'font-size': '18',
                    'background-color': 'blue',
                    'width': '100%',
                    'height': 'auto'
                  }
                },
                dragOver: false,
                dropAble: false,
              },
              {
                data: {
                  type: 'editor',
                  content: '我是你大爷，你大爷啊你大爷，你大爷啊你大爷，你大爷啊你大爷，你大爷啊你大爷，你大爷啊你大爷，',
                  style: {
                    'font-size': '18',
                    'background-color': 'blue',
                    'width': '100%',
                    'height': 'auto'
                  }
                },
                dragOver: false,
                dropAble: false,
              },
              {
                data: {
                  type: 'textarea',
                  content: '文本域2',
                  style: {
                    'font-size': '18',
                    'background-color': 'blue',
                    'width': '100%',
                    'height': 'auto'
                  }
                },
                dragOver: false,
                dropAble: false,
              }
            ]
          }
        ]
      }
    },
    mounted() {
    },
    methods: {
      // 获取当前列在行中的宽度占比
      getColWidth(colArr = [], colIndex) {
        let sum = colArr.reduce(function (total, next) {
          return total + next
        });
        let ratio = Math.floor((colArr[colIndex] / sum) * 100);
        return `${ratio}%`;
      },
      mouseOutEvent(event) {
        let ev = event || window.event;
        ev.preventDefault();
        ev.stopPropagation();
        if (this.dragFlag) {
          this.dropResetData();
          this.dragFlag = false;
        }
      },
      // 得到行内列的样式
      getStyle(style) {
        let res = {};
        if (style) {
          let keys = Object.keys(style);
          keys.forEach((key) => {
            let temp = style[key];
            switch (key) {
              case 'width':
              case 'height':
                if (temp === '' || temp === undefined || temp === 'undefined') {
                  res[key] = 'auto';
                } else if (temp !== 'auto') {
                  if (temp.indexOf('%') === -1) {
                    if (temp.indexOf('px') === -1) {
                      res[key] = temp + 'px'
                    }
                  }
                } else {
                  res[key] = temp;
                }
                break;
              case 'font-size':
                if (temp === '' || temp === undefined || temp === 'undefined') {
                  res[key] = 'auto';
                } else {
                  if (temp.indexOf('px') === -1) {
                    res[key] = temp + 'px'
                  } else {
                    res[key] = temp;
                  }
                }
                break;
            }
          });
        }
        return res
      },
      // 将对象的值赋null
      initObj(obj) {
        let keys = Object.keys(obj);
        keys.forEach(key => {
          obj[key] = null;
        })
      },
      // 清空行内列内容
      clearCol(event, parent, item, index, colIndex) {
        let ev = event || window.event;
        ev.preventDefault();
        ev.stopPropagation();
        if (window.confirm('是否清空？')) {
          item.data = null;
        }
      },
      // 删除行布局
      deleteRow(event, item, index) {
        let ev = event || window.event;
        ev.preventDefault();
        ev.stopPropagation();
        if (window.confirm('是否删除？')) {
          this.content.splice(index, 1);
        }
      },
      // drop时候，清空数据项：drag数据，dropover数据，drop数据
      dropResetData() {
        if (this.dragOverObj) {
          this.dragOverObj.dragOver = false;
        }
        this.dragOverObj = null;
        this.initObj(this.dragObj);
      },
      // 列drop事件，1、插入组件；2、调整顺序
      colDropEvent(event, parent, item, index, colIndex) {
        let ev = event || window.event;
        if (this.dragOverObj && this.dragOverObj === item) {
          ev.preventDefault();
          ev.stopPropagation();
          if (this.dragObj.type && this.dragObj.type !== 'layout') {
            // 插入组件
            let child = {
              data: {
                type: this.dragObj.type,
                content: this.dragObj.type + '_' + Math.ceil(Math.random() * 100),
                style: this.dragObj.style
              },
              dragOver: false,
              dropAble: false,
            };
            parent[colIndex] = child;
          } else {
            // 调整顺序
            let dragIndex = this.dragObj.colIndex;
            let dropIndex = colIndex;
            let dragItem = parent.slice(dragIndex, dragIndex - 0 + 1)[0];
            let dropItem = parent.slice(dropIndex, dropIndex - 0 + 1)[0];
            parent.splice(dragIndex, 1, dropItem);
            parent.splice(dropIndex, 1, dragItem);
          }
          this.dropResetData();
        }
      },
      // 行drop事件，1、插入布局；2、调整顺序
      rowDropEvent(event, item, index) {
        let ev = event || window.event;
        ev.preventDefault();
        ev.stopPropagation();
        if (this.dragOverObj && this.dragOverObj === item) {
          let dropIndex = index;
          if (this.dragObj.type === 'layout') {
            // 插入布局
            let children = [];
            for (let i = 0; i < this.dragObj.scale.length; i++) {
              let tempI = this.dragObj.scale[i];
              children.push({
                data: null,
                dragOver: false,
                dropAble: false,
              })
            }
            let temp = {
              col: this.dragObj.scale,
              dragOver: false,
              dropAble: false,
              children: children
            };
            this.content.splice(dropIndex, 0, temp);
          } else if (this.dragObj.type === null) {
            // 调整顺序
            let dragIndex = this.dragObj.rowIndex;
            let dragItem = this.content.slice(dragIndex, dragIndex + 1)[0];
            this.content.splice(dropIndex, 0, dragItem);
            if (dragIndex < dropIndex) {
              this.content.splice(dragIndex, 1);
            } else {
              this.content.splice(dragIndex + 1, 1);
            }
          }
          this.dropResetData();
        }
      },
      areaDropEvent(event) {
        let ev = event || window.event;
        ev.preventDefault();
        ev.stopPropagation();
        if (this.dragOverObj && this.dragOverObj.dropArea) {
          if (this.dragObj.type === 'layout') {
            // 插入布局
            let children = [];
            for (let i = 0; i < this.dragObj.scale.length; i++) {
              let tempI = this.dragObj.scale[i];
              children.push({
                data: null,
                dragOver: false,
                dropAble: false,
              })
            }
            let temp = {
              col: this.dragObj.scale,
              dragOver: false,
              dropAble: false,
              children: children
            };
            this.content.push(temp);
            this.dropResetData();
          } else if (this.dragObj.type === null) {
            // 调整顺序
            let spliceIndex = this.dragObj.rowIndex;
            this.content.push(this.content[spliceIndex]);
            this.content.splice(spliceIndex, 1);
            this.dropResetData();
          }
        }
      },
      /**
       * 列拖拽进入事件
       * */
      colDragOverEvent(event, item, index, colIndex) {
        let ev = event || window.event;
        if (this.dragOverObj !== null && this.dragOverObj !== item) {
          this.dragOverObj.dragOver = false;
          this.dragOverObj = null;
        }
        if (this.dragObj.type !== null &&
          this.dragObj.type !== 'layout'
        ) {
          // 拖拽组件进来，直接插入
          ev.preventDefault();
          ev.stopPropagation();
          if (this.dragObj.rowIndex !== null && this.dragObj.rowIndex !== index) {
            return false;
          }
          this.dragOverObj = item;
          this.dragOverObj.dragOver = true;
        } else {
          if (this.dragObj.type === null &&
            this.dragObj.rowIndex !== null &&
            this.dragObj.rowIndex === index &&
            this.dragObj.colIndex !== null
          ) {
            ev.preventDefault();
            ev.stopPropagation();
            if (this.dragObj.colIndex !== null && this.dragObj.colIndex === colIndex) {
              return false;
            }
            this.dragOverObj = item;
            this.dragOverObj.dragOver = true;
          }
        }
      },
      /**
       * 拖拽进入行，只考虑向前插入
       * 1、拖拽的是当前行不可插入
       * @param event
       */
      rowDragOverEvent(event, item, index) {
        let ev = event || window.event;
        ev.preventDefault();
        ev.stopPropagation();
        if (this.dragOverObj && this.dragOverObj !== item) {
          this.dragOverObj.dragOver = false;
          this.dragOverObj = null;
        }
        if (this.dragObj.type === null) {
          // 拖拽编辑区内的行，排序
          if ((this.dragObj.rowIndex !== null && this.dragObj.rowIndex === index) || this.dragObj.colIndex !== null) {
            return false;
          }
          this.dragOverObj = item;
          this.dragOverObj.dragOver = true;
        } else if (this.dragObj.type === 'layout') {
          this.dragOverObj = item;
          this.dragOverObj.dragOver = true;
        }
      },
      // 拖拽进入主区
      areaDragOverEvent(event) {
        let ev = event || window.event;
        ev.preventDefault();
        ev.stopPropagation();
        if (this.dragOverObj && !this.dragOverObj.dropArea) {
          this.dragOverObj.dragOver = false;
        }
        if ((this.dragObj.type === null && this.dragObj.colIndex === null) || this.dragObj.type === 'layout') {
          this.dragOverObj = {
            dropArea: true,
            dragOver: true
          };
        }
      },
      // 编辑区内容-整行拖拽启动
      colDragStartEvent(event, parent, item, index, colIndex) {
        let ev = event || window.event;
        // 初始化拖拽对象
        this.initObj(this.dragObj);
        this.dragObj.rowIndex = index;
        this.dragObj.colIndex = colIndex;
        this.dragObj.item = item;
        this.dragObj.parentItem = parent;
        this.dragFlag = true;
      },
      // 编辑区内容-整行拖拽启动
      rowDragStartEvent(event, item, index) {
        let ev = event || window.event;
        // 初始化拖拽对象
        this.initObj(this.dragObj);
        this.dragObj.rowIndex = index;
        this.dragObj.item = item;
        this.dragFlag = true;
      },
      // 组件拖拽启动
      componentDragStartEvent(event, type) {
        let ev = event || window.event;
        // 初始化拖拽对象
        this.initObj(this.dragObj);
        this.dragObj.type = type;
        this.dragObj.style = {
          'font-size': '18',
          'background-color': 'blue',
          'width': type === 'image' ? '100' : '100%',
          'height': type === 'divider' ? '2' : 'auto'
        };
        this.dragFlag = true;
      },
      // 布局组件拖动启动
      layoutDragStartEvent(event, scaleArr) {
        let ev = event || window.event;
        // 初始化拖拽对象
        this.initObj(this.dragObj);
        this.dragObj.type = 'layout';
        this.dragObj.scale = scaleArr;
        this.dragFlag = true;
      },
      // 判断是否空对象
      isEmptyObject(obj) {
        if (!obj) {
          return true
        }
        let keys = Object.keys(obj);
        if (keys.length > 0) {
          return false;
        } else {
          return true;
        }
      },
      // 点击列
      clickColItemEvent(event, item, rowIndex, colIndex) {
        let ev = event || window.event;
        ev.preventDefault();
        ev.stopPropagation();
        this.selectedItem = item;
        console.log(this.selectedItem);
      },
      // 点击行
      clickRowItemEvent(event, item, rowIndex) {
        let ev = event || window.event;
        ev.preventDefault();
        ev.stopPropagation();
        this.selectedItem = item;
      }
    },
    beforeDestroy() {
    },
    destroyed() {
    }
  }
</script>
<style lang="scss" scoped>
    .clearFix {
        zoom: 1;
    }

    .clearFix:after {
        clear: both;
        height: 0;
        width: 100%;
        overflow: hidden;
        visibility: hidden;
        display: block;
        content: '.';
    }

    .drag-box {
        height: 100vh;
        .drag-preview {
            float: left;
            height: 100%;
            overflow: auto;
            width: calc(50% - 180px);
            display: flex;
            flex-direction: column;
            .preview-row {
                /*display: flex;*/
                /*flex-direction: row;*/
                .preview-col {
                    float: left;
                    min-height: 1px;
                    box-sizing: border-box;
                }
                .drop-divider {
                    height: 2px;
                    background-color: red;
                    overflow: hidden;
                    margin: 10px 0;
                }
            }
        }
        .drop-area {
            height: 100%;
            overflow: auto;
            float: left;
            width: calc(50% - 200px);
            border-left: 1px solid #ccc;
            border-right: 1px solid #ccc;
            padding: 0 10px 20px;
            margin: 0 10px;
            display: flex;
            flex-direction: column;
            .drop-enable {
                min-height: 10px;
                background-color: aquamarine;
            }
            .drop-row {
                position: relative;
                /*display: flex;*/
                /*flex-direction: row;*/
                padding: 0 10px;
                border: 1px dashed transparent;
                .drop-drag-block {
                    position: absolute;
                    right: -10px;
                    top: calc(50% - 10px);
                    width: 20px;
                    height: 20px;
                    background-color: red;
                    cursor: move;
                    display: none;
                    z-index: 10;
                }
                .drop-action {
                    position: absolute;
                    top: calc(50% + 10px);
                    height: 20px;
                    line-height: 20px;
                    right: -10px;
                    display: none;
                    cursor: pointer;
                    z-index: 10;
                }
                &:hover {
                    border: 1px dashed #ccc;
                    > .drop-drag-block {
                        display: block;
                        opacity: 0.5;
                    }
                }
                &.selected-row {
                    > .drop-action {
                        display: block;
                    }
                    > .drop-drag-block {
                        display: block;
                        opacity: 1;
                        z-index: 11;
                    }

                }
                .drop-row-col {
                    float: left;
                    border: 1px dashed transparent;
                    box-sizing: border-box;
                    position: relative;
                    .drop-drag-block {
                        position: absolute;
                        background-color: #333;
                        right: 0;
                    }
                    &:hover {
                        border: 1px dashed #ccc;
                        > .drop-drag-block {
                            display: block;
                            opacity: 0.5;
                        }
                    }
                    &.selected-row {
                        .drop-action {
                            display: block;
                        }
                        .drop-drag-block {
                            display: block;
                            opacity: 1;
                        }
                    }
                    .drop-divider {
                        height: 2px;
                        background-color: red;
                        overflow: hidden;
                        margin: 10px 0;
                    }
                    .drop-row-col-blank {
                        display: flex;
                        flex-direction: row;
                        align-items: center;
                        justify-content: center;
                        border: 1px dashed #ccc;
                        height: 40px;
                        font-size: 12px;
                    }
                }
            }
        }
        .drag-component {
            width: 300px;
            height: 100vh;
            float: right;
            overflow: auto;
            .layout-ui,
            .content-ui {
                div[draggable="true"] {
                    height: 30px;
                    cursor: move;
                    line-height: 30px;
                    &:hover {
                        background-color: #eee;
                    }
                }
            }
        }
    }
</style>
<style lang="scss">
    .drag-box {
        pre,
        p {
            margin: 0;
            padding: 0;
        }
    }
</style>
