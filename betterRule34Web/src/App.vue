<template>
  <div class="container">
    <div class="header-area">
      <img src="./assets/rule341.png" alt="">
      <span>BetterRule34WebViewer</span>
    </div>
    <div class="search-area">
      <div class="search-input">
        <input type="text" name="" id="" v-model="keyword">
        <button class="search-btn" @click="search">
          Search
        </button>
        <div class="menu-btn">
          <svg t="1632380840843" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
            p-id="1925" width="32" height="32">
            <path
              d="M64 213.333333h896v85.333334H64v-85.333334z m0 341.333334h896v85.333333H64v-85.333333z m0 341.333333h896v85.333334H64v-85.333334z"
              fill="#FFFFFF" p-id="1926"></path>
          </svg>
        </div>
      </div>
      <div class="search-options">
        <div class="type-options">
          <span :style="{ color: type === 'video' ? '#5252f8' : '#000' }" @click="type = 'video', search()">视频</span>
          <span :style="{ color: type === 'image' ? '#5252f8' : '#000' }" @click="type = 'image'; search()">图片</span>
        </div>
        <div class="sort-options">
          <span :style="{ color: sort === 'newest' ? '#5252f8' : '#000' }" @click="sort = 'newest'; search()">最新</span>
          <span :style="{ color: sort === 'popular' ? '#5252f8' : '#000' }"
            @click="sort = 'popular'; search()">最热</span>
        </div>
      </div>

    </div>
    <div class="result-area" ref="scrollRef" @scroll="onScroll">
      <div v-masonry an item-selector=".item" transition-duration="0" class="masonry-container">
        <div v-masonry-tile class="item" :key="index" v-for="(item, index) in posts">
          <img :src="item.preview_url" alt="" @click="openView(item)">
        </div>
      </div>
      <div class="loading" v-if="loading">
        <div class="i"></div>
      </div>
      <div class="isend" v-if="isEnd">
        <span>没有更多了</span>
      </div>
      <div class="back-top">
        <button @click="backTop">Back Top</button>
      </div>
    </div>
  </div>

  <div class="video-view" v-if="viewOpen">
    <!-- <div class="close-btn"> -->
    <!-- <button @click="viewClose">Close</button> -->
    <!-- </div> -->
    <video v-if="viewInfo.file_url.endsWith('.mp4')" controls :src="viewInfo.file_url"></video>
    <img v-else :src="viewInfo.file_url" alt="">
    <div class="tags">
      <div class="tag-group" v-if="viewInfo.tags.Artist">
        Artist
        <ul>
          <li v-for="tag in viewInfo.tags.Artist" @click="clickTag(tag.tag)">{{ tag.tag }}</li>
        </ul>
      </div>
      <div class="tag-group" v-if="viewInfo.tags.Character">
        Character
        <ul>
          <li v-for="tag in viewInfo.tags.Character" @click="clickTag(tag.tag)">{{ tag.tag }}</li>
        </ul>
      </div>
      <div class="tag-group" v-if="viewInfo.tags.General">
        General
        <ul>
          <li v-for="tag in viewInfo.tags.General" @click="clickTag(tag.tag)">{{ tag.tag }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getPostsApi, getTagInfoApi } from './api';
import { ref, onMounted, watchEffect } from 'vue';
const scrollRef = ref(null);
const loading = ref(true);
const isEnd = ref(false);
const page = ref(1);
const pageSize = ref(20);
const bannedTags = ref(['-male_only', '-farts', '-gay', '-yaoi', '-scat', '-guro', '-futanari', '-ai_generated']);
const tags = ref([]);
const type = ref('video');
const sort = ref('newest');
const keyword = ref('');
const posts = ref([]);
const back = ref(true)
const viewOpen = ref(false)
const viewLoading = ref(false)
const viewInfo = ref({
  file_url: '',
  tags: {
    // Artist: [],
    // General: [],
    // Character: [],
    // Species: [],
    // Meta: [],
    // 'Copy Right': [],
  }
});

const onScroll = () => {
  if (loading.value || isEnd.value) return;
  if (scrollRef.value.scrollHeight - scrollRef.value.scrollTop - scrollRef.value.clientHeight < 200) {
    console.log('loading more');
    page.value++;
    loading.value = true;
    getPosts();
  }
};

const getPosts = async () => {
  tags.value = tags.value.concat(bannedTags.value);
  tags.value = tags.value.concat(sort.value === 'newest' ? [''] : ['sort:score:desc']);
  tags.value = tags.value.concat(type.value === 'video' ? ['video', 'sound'] : ['-video']);
  tags.value = tags.value.filter((tag) => tag !== '');

  const newPosts = await getPostsApi(page.value, pageSize.value, tags.value, type.value);
  if (newPosts.length === 0) {
    isEnd.value = true;
  } else {
    posts.value = [...posts.value, ...newPosts];
  }
  loading.value = false;
};

const backTop = () => {
  scrollRef.value.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
};
// aelion_draws
const search = () => {
  tags.value = [];
  page.value = 1;
  posts.value = [];
  isEnd.value = false;
  loading.value = true;
  tags.value = keyword.value.split(' ');
  getPosts();
};


const clickTag = (tag) => {
  // 新开一个页面 打开当前地址 + tag
  window.open(`?tag=${tag}`);
};

const tagTypeMap = {
  1: 'Artist',
  0: 'General',
  3: 'Character',
  4: 'Species',
  5: 'Meta',
  2: 'Copyright',
}

watchEffect(async () => {
  if (viewInfo.value.file_url) {
    back.value = false
    history.pushState(null, '', `#${viewInfo.value.file_url}`);
  }
})


const openView = async (item) => {
  viewOpen.value = true;
  const tags = item.tags.split(' ');
  try {
    const tagResults = await Promise.all(
      tags.map(async (tag) => {
        const res = await getTagInfoApi(tag); // 获取每个 tag 的信息
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(res, "text/xml");
        return {
          tag: xmlDoc.getElementsByTagName("tag")[0].getAttribute('name'),
          type: tagTypeMap[xmlDoc.getElementsByTagName("tag")[0].getAttribute('type')],
        };
      })
    );
    // 进行tags分组
    const tagGroup = tagResults.reduce((acc, cur) => {
      if (!acc[cur.type]) {
        acc[cur.type] = [];
      }
      acc[cur.type].push(cur);
      return acc;
    }, {});

    viewInfo.value.tags = tagGroup;
    viewInfo.value.file_url = item.file_url;
    console.log('viewInfo:', viewInfo.value);

  } catch (error) {
    console.error("Error fetching tags:", error);
  }
};


const viewClose = () => {
  viewOpen.value = false;
  viewInfo.value = {
    file_url: '',
    tags: {
      // Artist: [],
      // General: [],
      // Character: [],
      // Species: [],
      // Meta: [],
      // 'Copy Right': [],
    }
  };
  history.pushState(null, '', `#`);
};




onMounted(async () => {
  const query = new URLSearchParams(window.location.search);
  const tag = query.get('tag');
  if (tag) {
    keyword.value = tag;
    search();
  } else {
    getPosts();
  }
  window.addEventListener("popstate", (event) => {
    if (!back.value) {
      viewClose();
    } else {
      back.value = true
    }
  });
});
</script>

<style lang="scss" scoped>
.container {
  width: 100vw;
  height: 100vh;
  background-color: #aae5a4;
  display: flex;
  flex-direction: column;

  .header-area {
    width: 100%;
    height: 34.6px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #0000ff7e;
    overflow: hidden;

    img {
      width: 50%;
      height: auto;
      object-fit: contain;
    }

    span {
      font-size: 1.2rem;
      width: 50%;
      text-align: center;
      color: #5252f8;
      font-weight: 700;
    }
  }

  .search-area {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    // justify-content: center;
    padding: 0 5px;
    gap: 5px;

    .search-input {
      display: flex;
      align-items: center;
      width: 100%;
      gap: 5px;
      height: 40px;


      .search-btn {
        width: 100px;
        height: 30px;
        border-radius: 5px;
        background-color: #5252f8;
        color: #fff;
        font-weight: 700;
        outline: none;
        border: none;
      }

      input {
        width: 100%;
        height: 30px;
        border-radius: 5px;
        border: 1px solid #0000ff42;
        padding: 0 10px;
        outline: none;

        &:focus {
          border: 1px solid #5252f8;
        }
      }
    }

    .search-options {
      width: 100%;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 10px;
      padding-bottom: 5px;

      div {
        display: flex;
        gap: 5px;
      }
    }

  }

  .result-area {
    width: 100%;
    height: 100%;
    overflow: auto;
    position: relative;

    .loading {
      width: 100%;
      min-height: 3px;
      background-color: red;

      .i {
        position: absolute;
        left: 0;
        width: 10%;
        height: 3px;
        background-color: blue;

        animation: loading 1s infinite;

        @keyframes loading {
          0% {
            left: 0;
          }

          100% {
            left: 100%;
          }
        }
      }
    }

    .isend {
      width: 100%;
      height: 30px;
      display: flex;
      justify-content: center;
      align-items: center;
      color: #5252f8;
    }

    .back-top {
      position: fixed;
      right: 10px;
      bottom: 10px;

      button {
        font-weight: 700;
        outline: none;
        background: none;
        border: none;
        width: 100px;
        height: 30px;
        border-radius: 5px;
        background-color: #5252f8;
        color: #fff;
      }
    }
  }
}

.item {
  width: calc(50% - 10px);
  height: auto;
  margin: 2px 5px;
  // background-color: red;


  img {
    width: 100%;
    object-fit: contain;
    border: 3px solid #6161f1;
    border-radius: 5px;
  }
}

.video-view {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #000000d3;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: auto;

  .close-btn {
    position: fixed;
    top: 10px;
    right: 10px;

    button {
      font-weight: 700;
      outline: none;
      background: none;
      border: none;
      width: 100px;
      height: 30px;
      border-radius: 5px;
      background-color: #5252f8;
      color: #fff;
    }
  }

  video {
    width: 90%;
    height: auto;
    border-radius: 5px;
  }

  img {
    width: 90%;
    height: auto;
    border-radius: 5px;
    object-fit: contain;
  }

  .tags {
    width: 100%;
    color: #fff;
    display: flex;
    flex-direction: column;
    gap: 1rem;

    .tag-group {
      display: flex;
      flex-direction: column;
      width: 100%;
      padding: .5rem;

      ul {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
        overflow: auto;
        max-height: 120px;


        li {
          padding: .3rem;
          border-radius: 3px;
          background-color: #3535df;
          color: #fff;
          list-style: none;
        }
      }
    }
  }
}
</style>
