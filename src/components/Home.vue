<template>
  <Frame>
    <Page actionBarHidden="true">
      <StackLayout verticalAlignment="top" class="content">
        <!-- 搜索框 -->
        <SearchBar hint="Search..." class="search" />
        <!-- 内容列表 -->
        <ListView 
        class="list"
        :items="listOfItems" @itemTap="onItemTap">
          <template #default="{ item, index, even, odd }: { item: string, index: number, even: boolean, odd: boolean }">
            <Image :src="item.src" width="100%" height="100%" />
          </template>
        </ListView>
      </StackLayout>
    </Page>
  </Frame>
</template>


<script lang="ts" setup>
import {
  ref,
  computed,
  onMounted,
  onUnmounted,
  $navigateTo,
} from 'nativescript-vue';
import Details from './Details.vue';

// items 数据
const listOfItems = ref<any[]>([
  { src: 'https://picsum.photos/200/300?random=0', text: '0' },
  { src: 'https://picsum.photos/200/500?random=1', text: '1' },
  { src: 'https://picsum.photos/200/900?random=3', text: '3' },
  { src: 'https://picsum.photos/200/200?random=4', text: '4' },
  { src: 'https://picsum.photos/200/500?random=5', text: '5' },
  { src: 'https://picsum.photos/200/100?random=6', text: '6' },
  { src: 'https://picsum.photos/200/10?random=7', text: '7' },
  { src: 'https://picsum.photos/200/200?random=8', text: '8' },
  { src: 'https://picsum.photos/200/500?random=9', text: '9' },
  { src: 'https://picsum.photos/200/200?random=10', text: '10' },
  { src: 'https://picsum.photos/200/200?random=11', text: '11' },
  { src: 'https://picsum.photos/200/200?random=12', text: '12' },
  { src: 'https://picsum.photos/200/200?random=13', text: '13' },
  { src: 'https://picsum.photos/200/200?random=14', text: '14' },
  { src: 'https://picsum.photos/200/200?random=15', text: '15' },
  { src: 'https://picsum.photos/200/200?random=16', text: '16' },
  { src: 'https://picsum.photos/200/200?random=17', text: '17' },
  { src: 'https://picsum.photos/200/200?random=18', text: '18' },
  { src: 'https://picsum.photos/200/200?random=19', text: '19' },
  { src: 'https://picsum.photos/200/200?random=20', text: '20' },
]);

// 点击事件
const onItemTap = (args: any) => {
  console.log(args);
};
</script>

<style lang="scss" scoped>
.content {
  width: 100%;
  height: 100%;
  background-color: #666;
  .list {
    width: 100%;
    height: 100%;
    background-color: red;
  }
}
</style>
