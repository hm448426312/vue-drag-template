import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import DragDemo from '@/pages/drag-demo'
import DragDemo1 from '@/pages/drag-demo1'
import Index from '@/pages/index'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: '拖拽',
      component: DragDemo
    },
    {
      path: '/demo',
      name: '拖拽',
      component: DragDemo1
    }
  ]
})
