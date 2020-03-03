<template>
    <div class="notice-temp-box clearFix">
        <div v-if="showComponents" :style="[calcBoxStyle('components')]" class="temp-components">
            <h1>布局区域</h1>
            <div class="layout-ui">
                <template v-for="(item, index) of layouts">
                    <div class="layout-ui-list"
                         :key="index"
                         @dragstart="layoutDragStartEvent($event, item)"
                         draggable="true"
                    >
                        <template v-for="(cItem, cIndex) of item">
                            <div class="layout-ui-list-col" :key="cIndex"
                                 :style="[calcLayoutStyle(item, cItem, cIndex)]"></div>
                        </template>
                    </div>
                </template>
            </div>
            <h1>组件区域</h1>
            <div class="component-ui">
                <template v-for="(item, index) of components">
                    <div class="component-ui-item"
                         :key="index"
                         @dragstart="componentDragStartEvent($event, item)"
                         draggable="true">
                        {{item}}
                    </div>
                </template>
            </div>
            <template v-if="calcShowStylesRef()">
                <h1>样式设置区域</h1>
                <div class="style-ui">
                    <div>组件名称：{{selectedItem.data.type}}</div>
                    <button @click="setStyle(selectedItem)">确定</button>
                    <template v-for="(item, index) of selectedItem.data.style">
                        <template v-if="item.config">
                            <div>
                                <label>{{item.title}}：</label>
                                <input v-model="item.value"/>
                            </div>
                        </template>
                    </template>
                </div>
            </template>
        </div>
        <div v-if="showPreview" :style="[calcBoxStyle('preview')]" class="temp-preview">
            2
        </div>
        <div v-if="showContent" :style="[calcBoxStyle('content')]" class="temp-content">
            <div class="content-drop-box"
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
                                            <img :style="[getStyle(colItem.data.showStyle)]"
                                                 :src="colItem.data.content">
                                        </template>
                                        <template v-else-if="colItem.data.type === 'textArea'">
                                        <textarea :style="[getStyle(colItem.data.showStyle)]"
                                                  v-model="colItem.data.content"></textarea>
                                        </template>
                                        <template v-else-if="colItem.data.type === 'richText'">
                                            <div :style="[getStyle(colItem.data.showStyle)]">
                                                <my-quill-editor v-model="colItem.data.content"></my-quill-editor>
                                            </div>
                                        </template>
                                        <template v-else-if="colItem.data.type === 'divider'">
                                            <div :style="[getStyle(colItem.data.showStyle)]" class="drop-divider"></div>
                                        </template>
                                        <template v-else-if="colItem.data.type === 'input'">
                                            <input :style="[getStyle(colItem.data.showStyle)]"
                                                   v-model="colItem.data.content"/>
                                        </template>
                                    </div>
                                </template>
                                <template v-else>
                                    <div :class="{'drop-enable': colItem.dragOver}" class="drop-row-col-blank">
                                        插入内容（从右侧拖入）
                                    </div>
                                </template>
                            </div>
                        </template>
                    </div>
                </template>
                <div v-if="dragOverObj && dragOverObj.dropArea" class="drop-enable"></div>
            </div>
        </div>
    </div>
</template>

<script>
  import {defStyles} from './index.js'
  import MyQuillEditor from "../my-quill-editor";

  export default {
    components: {
      MyQuillEditor
    },
    name: "notice-template",
    props: {
      // 是否显示拖拽区（组件/布局/样式设置）
      showComponents: {
        type: Boolean,
        default: () => true
      },
      // 是否显示样编辑区
      showContent: {
        type: Boolean,
        default: () => true
      },
      // 是否显示样式预览区
      showPreview: {
        type: Boolean,
        default: () => true
      },
      // 可拖拽的组件
      components: {
        type: Array,
        default: () => ["image", "divider", "textArea", "input", "richText"]
      },
      // 可拖拽组件的默认样式
      styles: {
        type: Object,
        default: () => {
          return JSON.parse(JSON.stringify(defStyles));
        }
      },
      // 可拖拽的布局
      layouts: {
        type: Array,
        default: () => [[1], [1, 1], [1, 1, 1], [1, 2, 1]]
      },
      // 数据
      content: {
        type: Array,
        default: () => [
          {
            col: [1, 1],
            dragOver: false,
            dropAble: false,
            children: [
              {
                data: {
                  type: 'image',
                  content: 'http://attach.bbs.miui.com/forum/201111/21/205700txzuacubbcy91u99.jpg',
                  style: [
                    {
                      key: 'width', // 样式为style时的key值
                      value: '100', // 可输入的样式值
                      title: '宽度', // 显示名称
                      units: 'auto|px|%', // 所有可适配的单位
                      unit: 'px', // 默认单位
                      config: true // 是否支持用户配置
                    }
                  ]
                },
                dragOver: false,
                dropAble: false,
              },
              {
                data: {
                  type: 'textArea',
                  content: '1\n2',
                  style: [
                    {
                      key: 'width', // 样式为style时的key值
                      value: '100', // 可输入的样式值
                      title: '宽度', // 显示名称
                      units: 'auto|px|%', // 所有可适配的单位
                      unit: 'px', // 默认单位
                      config: true // 是否支持用户配置
                    }
                  ]
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
                  type: 'textArea',
                  content: '文本域1',
                  style: [
                    {
                      key: 'width', // 样式为style时的key值
                      value: '100', // 可输入的样式值
                      title: '宽度', // 显示名称
                      units: 'auto|px|%', // 所有可适配的单位
                      unit: 'px', // 默认单位
                      config: true // 是否支持用户配置
                    }
                  ]
                },
                dragOver: false,
                dropAble: false,
              },
              {
                data: {
                  type: 'richText',
                  content: '我是你大爷，你大爷啊你大爷，你大爷啊你大爷，你大爷啊你大爷，你大爷啊你大爷，你大爷啊你大爷，',
                  style: []
                },
                dragOver: false,
                dropAble: false,
              },
              {
                data: {
                  type: 'textArea',
                  content: '文本域2',
                  style: [
                    {
                      key: 'width', // 样式为style时的key值
                      value: '100', // 可输入的样式值
                      title: '宽度', // 显示名称
                      units: 'auto|px|%', // 所有可适配的单位
                      unit: 'px', // 默认单位
                      config: true // 是否支持用户配置
                    }
                  ]
                },
                dragOver: false,
                dropAble: false,
              }
            ]
          }
        ]
      }
    },
    data() {
      return {
        showContentData: [],
        defaultOpt: {
          componentWidth: 300, // 组件区默认宽度
        },

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
      }
    },
    mounted() {
      console.log(this.styles);
      this.initContentShowStyle();
    },
    methods: {
      // 初始化数据，将style赋值到showStyle
      initContentShowStyle() {
        if (this.content && this.content.length > 0) {
          this.content.forEach(item => {
            if (item.children && item.children.length > 0) {
              item.children.forEach(cItem => {
                if (cItem.data && cItem.data.style && cItem.data.style.length > 0) {
                  cItem.data.showStyle = JSON.parse(JSON.stringify(cItem.data.style));
                }
              })
            }
          })
        }
      },
      // 设置样式
      setStyle(item) {
        item.data.showStyle = JSON.parse(JSON.stringify(item.data.style));
        // 将style赋值到showStyle后，编辑区的style函数可能不会执行，可执行强制渲染
        this.$forceUpdate();
      },
      // 获取样式
      getStyle(styles = []) {
        let style = {};
        if (!styles) {
          return style;
        }
        styles.forEach((item, index) => {
          if (item.value === 'auto') {
            style[item.key] = item.value;
          } else {
            if (!item.unit) {
              style[item.key] = item.value;
            } else {
              let units = item.units || '';
              let hasUnit = false;
              units.split('|').forEach(u => {
                if (item.value.indexOf(u) !== -1) {
                  hasUnit = true;
                }
              });
              if (hasUnit) {
                // 输入了单位
                style[item.key] = item.value;
              } else {
                // 未输入单位
                style[item.key] = `${item.value}${item.unit}`;
              }
            }
          }
        })
        return style;
      },
      // 获取当前列在行中的宽度占比
      getColWidth(colArr = [], colIndex) {
        let sum = colArr.reduce(function (total, next) {
          return total + next
        });
        let ratio = Math.floor((colArr[colIndex] / sum) * 100);
        return `${ratio}%`;
      },
      // 计算当前外层容器type的样式
      calcBoxStyle(type) {
        let style = {
          'float': 'left'
        };
        if (type === 'components') {
          // 组件区，固定宽度
          if (this.showComponents) {
            style['width'] = `${this.defaultOpt.componentWidth}px`;
            style['float'] = 'right';
          }
        } else if (type === 'preview') {
          // 预览区
          if (this.showPreview) {
            if (this.showComponents && this.showContent) {
              style['width'] = `calc(50% - ${this.defaultOpt.componentWidth / 2 + 100}px)`;
            } else if (this.showComponents && !this.showContent) {
              style['width'] = `calc(100% - ${this.defaultOpt.componentWidth}px)`;
            } else if (!this.showComponents && this.showContent) {
              style['width'] = `50%`;
            } else if (!this.showComponents && !this.showContent) {
              style['width'] = `100%`;
            }
          }
        } else if (type === 'content') {
          // 编辑区
          if (this.showContent) {
            if (this.showPreview && this.showComponents) {
              style['width'] = `calc(50% - ${this.defaultOpt.componentWidth / 2 - 100}px)`;
            } else if (this.showPreview && !this.showComponents) {
              style['width'] = `50%`;
            } else if (!this.showPreview && this.showComponents) {
              style['width'] = `calc(100% - ${this.defaultOpt.componentWidth}px)`;
            } else if (!this.showPreview && !this.showComponents) {
              style['width'] = `100%`;
            }
          }
        }
        return style;
      },
      // 计算layout内部的宽度
      calcLayoutStyle(items, item, index) {
        let style = {};
        // 求和，然后根据占比计算宽度
        const sum = items.reduce((total, next) => {
          return total + next;
        });
        const ratio = (item / sum) * 100;

        style['width'] = `${ratio}%`;
        if (item.length - 1 === index) {
          style['border-right'] = `none`;
        }
        return style;
      },
      calcShowStylesRef() {
        if (this.selectedItem && this.selectedItem.data && this.selectedItem.data.style) {
          const tempStyle = this.selectedItem.data.style;
          if (tempStyle && tempStyle.length > 0) {
            let flag = false;
            for (let i = 0; i < tempStyle.length; i++) {
              if (tempStyle[i].config) {
                flag = true;
                break;
              }
            }
            return flag
          } else {
            return false;
          }
        }
        return false;
      },
      // 初始化页面数据
      initPageData() {
        //初始化显示数据
        this.showContentData = JSON.parse(JSON.stringify(this.content));
      },
      // 获取布局的数据，用于保存
      getTemplateData() {
        // todo
        return [];
      },
      // 将对象的值赋null
      initObj(obj) {
        let keys = Object.keys(obj);
        keys.forEach(key => {
          obj[key] = null;
        })
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
      // 组件拖拽启动
      componentDragStartEvent(event, type, dom) {
        let ev = event || window.event;
        // 初始化拖拽对象
        this.initObj(this.dragObj);
        this.dragObj.type = type;
        // 设置对应的样式，优先从参数中获取，参数没有则从默认值中获取
        if (this.styles[type]) {
          this.dragObj.style = this.styles[type];
        } else {
          if (defStyles[type]) {
            this.dragObj.style = defStyles[type];
          } else {
            this.dragObj.style = null
          }
        }
        /*this.dragObj.style = {
          'font-size': '18',
          'background-color': 'blue',
          'width': type === 'image' ? '100' : '100%',
          'height': type === 'divider' ? '2' : 'auto'
        };*/
        this.dragFlag = true;
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
                content: this.dragObj.type === 'image' ? 'http://attach.bbs.miui.com/forum/201111/21/205700txzuacubbcy91u99.jpg' : this.dragObj.type + '_' + Math.ceil(Math.random() * 100),
                style: this.dragObj.style,
                showStyle: JSON.parse(JSON.stringify(this.dragObj.style))
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
      },
      // 点击行
      clickRowItemEvent(event, item, rowIndex) {
        let ev = event || window.event;
        ev.preventDefault();
        ev.stopPropagation();
        this.selectedItem = item;
      }
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

    .notice-temp-box {
        .temp-components {
            padding: 0 10px;
            box-sizing: border-box;
            .layout-ui {
                .layout-ui-list {
                    margin-top: 10px;
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    cursor: move;
                    background-color: #ccc;
                    transition: .5s;
                    &:hover {
                        background-color: #333;
                    }
                    .layout-ui-list-col {
                        height: 40px;
                        border-right: 1px solid #fff;
                    }
                }
            }
            .component-ui {
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: space-between;
                flex-wrap: wrap;
                .component-ui-item {
                    width: 40%;
                    height: 40px;
                    line-height: 40px;
                    text-align: center;
                    background-color: #eee;
                    margin-top: 10px;
                    cursor: move;
                    transition: .5s;
                    &:hover {
                        color: #fff;
                        background-color: #333;
                    }
                }
            }
        }
        .temp-content {
            .content-drop-box {
                padding: 0 50px 50px;
                height: 100%;
                box-sizing: border-box;
                width: 100%;
                overflow: auto;
                float: left;
                border-left: 1px solid #ccc;
                border-right: 1px solid #ccc;
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
        }
    }
</style>
