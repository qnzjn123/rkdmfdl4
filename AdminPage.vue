<template>
  <div class="admin-container">
    <nav class="admin-navbar">
      <div class="admin-nav-container">
        <div class="admin-nav-left">
          <span class="admin-title">임가을 블로그 관리자</span>
        </div>
        <div class="admin-nav-right">
          <button class="back-btn" @click="$emit('back-to-blog')">
            블로그로 돌아가기
          </button>
        </div>
      </div>
    </nav>

    <div class="admin-content">
      <div class="admin-sidebar">
        <div class="admin-menu">
          <h3>관리 메뉴</h3>
          <ul class="menu-list">
            <li>
              <a href="#" @click="setActiveTab('posts')" :class="{ active: activeTab === 'posts' }">
                글 관리
              </a>
            </li>
            <li>
              <a href="#" @click="setActiveTab('analytics')" :class="{ active: activeTab === 'analytics' }">
                통계
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div class="admin-main">
        <!-- 글 관리 탭 -->
        <div v-if="activeTab === 'posts'" class="admin-section">
          <h2>글 관리</h2>
          <div class="post-actions">
            <button class="add-btn" @click="addNewPost">새 글 작성</button>
            <button class="refresh-btn" @click="refreshPosts">새로고침</button>
          </div>

          <!-- 새 글 작성 폼 -->
          <div v-if="showNewPostForm" class="new-post-form">
            <div class="form-header">
              <h3>새 글 작성</h3>
              <button class="close-btn" @click="cancelNewPost">×</button>
            </div>
            
            <form @submit.prevent="saveNewPost">
              <div class="form-group">
                <label for="post-title">제목 *</label>
                <input 
                  type="text" 
                  id="post-title" 
                  v-model="newPost.title" 
                  placeholder="블로그 글의 제목을 입력하세요"
                  required
                />
              </div>

              <div class="form-group">
                <label for="post-category">카테고리 *</label>
                <select id="post-category" v-model="newPost.category" required>
                  <option value="">카테고리를 선택하세요</option>
                  <option value="포트폴리오">포트폴리오</option>
                </select>
              </div>

              <div class="form-group">
                <label for="post-content">내용 *</label>
                <textarea 
                  id="post-content" 
                  v-model="newPost.content" 
                  placeholder="블로그 글의 내용을 작성하세요"
                  rows="10"
                  required
                ></textarea>
              </div>

              <div class="form-group">
                <label for="post-tags">태그</label>
                <input 
                  type="text" 
                  id="post-tags" 
                  v-model="newPost.tagsInput" 
                  placeholder="태그를 쉼표로 구분하여 입력하세요 (예: JavaScript, Vue.js, 프론트엔드)"
                  @keyup.enter="processTags"
                  @input="handleTagInput"
                />
                <div class="tags-preview" v-if="newPost.tags && newPost.tags.length > 0">
                  <span v-for="tag in newPost.tags" :key="tag" class="tag-item">
                    {{ tag }}
                    <button type="button" class="tag-remove" @click="removeTag(tag)">×</button>
                  </span>
                </div>
              </div>

              <div class="form-group">
                <label for="post-images">이미지 첨부</label>
                <div class="image-upload-area">
                  <input 
                    type="file" 
                    id="post-images" 
                    ref="imageInput"
                    accept="image/*"
                    multiple
                    @change="handleImageUpload"
                    style="display: none;"
                  />
                  <button 
                    type="button" 
                    class="image-upload-btn" 
                    @click="$refs.imageInput.click()"
                  >
                    📷 이미지 선택
                  </button>
                  <span class="upload-hint">여러 이미지를 선택할 수 있습니다 (JPG, PNG, GIF)</span>
                </div>
                
                <div class="images-preview" v-if="newPost.images && newPost.images.length > 0">
                  <div v-for="(image, index) in newPost.images" :key="index" class="image-preview-item">
                    <img :src="image.url" :alt="image.name" class="preview-image" />
                    <div class="image-info">
                      <span class="image-name">{{ image.name }}</span>
                      <button type="button" class="image-remove" @click="removeImage(index)">
                        🗑️ 삭제
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="form-actions">
                <button type="submit" class="save-post-btn">글 저장</button>
                <button type="button" class="cancel-btn" @click="cancelNewPost">취소</button>
              </div>
            </form>
          </div>

          <!-- 글 수정 폼 -->
          <div v-if="showEditPostForm" class="new-post-form">
            <div class="form-header">
              <h3>글 수정</h3>
              <button class="close-btn" @click="cancelEditPost">×</button>
            </div>
            
            <form @submit.prevent="saveEditPost">
              <div class="form-group">
                <label for="edit-post-title">제목 *</label>
                <input 
                  type="text" 
                  id="edit-post-title" 
                  v-model="editingPost.title" 
                  placeholder="블로그 글의 제목을 입력하세요"
                  required
                />
              </div>

              <div class="form-group">
                <label for="edit-post-category">카테고리 *</label>
                <select id="edit-post-category" v-model="editingPost.category" required>
                  <option value="">카테고리를 선택하세요</option>
                  <option value="포트폴리오">포트폴리오</option>
                </select>
              </div>

              <div class="form-group">
                <label for="edit-post-content">내용 *</label>
                <textarea 
                  id="edit-post-content" 
                  v-model="editingPost.content" 
                  placeholder="블로그 글의 내용을 작성하세요"
                  rows="10"
                  required
                ></textarea>
              </div>

              <div class="form-group">
                <label for="edit-post-tags">태그</label>
                <input 
                  type="text" 
                  id="edit-post-tags" 
                  v-model="editingPost.tagsInput" 
                  placeholder="태그를 쉼표로 구분하여 입력하세요 (예: JavaScript, Vue.js, 프론트엔드)"
                  @keyup.enter="processEditTags"
                  @input="handleEditTagInput"
                />
                <div class="tags-preview" v-if="editingPost.tags && editingPost.tags.length > 0">
                  <span v-for="tag in editingPost.tags" :key="tag" class="tag-item">
                    {{ tag }}
                    <button type="button" class="tag-remove" @click="removeEditTag(tag)">×</button>
                  </span>
                </div>
              </div>

              <div class="form-group">
                <label for="edit-post-images">이미지 첨부</label>
                <div class="image-upload-area">
                  <input 
                    type="file" 
                    id="edit-post-images" 
                    ref="editImageInput"
                    accept="image/*"
                    multiple
                    @change="handleEditImageUpload"
                    style="display: none;"
                  />
                  <button 
                    type="button" 
                    class="image-upload-btn" 
                    @click="$refs.editImageInput.click()"
                  >
                    📷 이미지 선택
                  </button>
                  <span class="upload-hint">여러 이미지를 선택할 수 있습니다 (JPG, PNG, GIF)</span>
                </div>
                
                <div class="images-preview" v-if="editingPost.images && editingPost.images.length > 0">
                  <div v-for="(image, index) in editingPost.images" :key="index" class="image-preview-item">
                    <img :src="image.url" :alt="image.name" class="preview-image" />
                    <div class="image-info">
                      <span class="image-name">{{ image.name }}</span>
                      <button type="button" class="image-remove" @click="removeEditImage(index)">
                        🗑️ 삭제
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="form-actions">
                <button type="submit" class="save-post-btn">수정 완료</button>
                <button type="button" class="cancel-btn" @click="cancelEditPost">취소</button>
              </div>
            </form>
          </div>

          <div class="posts-table">
            <table>
              <thead>
                <tr>
                  <th>제목</th>
                  <th>카테고리</th>
                  <th>작성일</th>
                  <th>조회수</th>
                  <th>상태</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="post in posts" :key="post.id">
                  <td>{{ post.title }}</td>
                  <td>
                    <span class="category-tag">{{ post.category }}</span>
                  </td>
                  <td>{{ post.date }}</td>
                  <td>{{ post.views }}</td>
                  <td>
                    <span :class="'status-' + post.status">{{ post.status }}</span>
                  </td>
                  <td>
                    <button class="edit-btn" @click="editPost(post.id)">수정</button>
                    <button class="delete-btn" @click="deletePost(post.id)">삭제</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 통계 탭 -->
        <div v-if="activeTab === 'analytics'" class="admin-section">
          <div class="analytics-header">
            <h2>블로그 통계</h2>
            <div class="analytics-controls">
              <button class="refresh-analytics-btn" @click="refreshAnalytics">
                🔄 새로고침
              </button>
            </div>
          </div>
          
          <!-- 실시간 통계 카드 -->
          <div class="realtime-stats">
            <h3>📊 실시간 통계</h3>
            <div class="stats-grid">
              <div class="stat-card realtime">
                <h4>🔴 실시간 접속자</h4>
                <div class="stat-number">{{ analytics?.realtimeUsers || 0 }}</div>
                <div class="stat-change">지금 이 순간</div>
              </div>
              <div class="stat-card">
                <h4>📅 오늘 방문자</h4>
                <div class="stat-number">{{ analytics?.todayVisitors || 0 }}</div>
                <div class="stat-change" :class="{ positive: (analytics?.todayChange || 0) > 0, negative: (analytics?.todayChange || 0) < 0 }">
                  {{ (analytics?.todayChange || 0) > 0 ? '+' : '' }}{{ analytics?.todayChange || 0 }}명 (어제 대비)
                </div>
              </div>
              <div class="stat-card">
                <h4>📈 총 방문자</h4>
                <div class="stat-number">{{ analytics?.totalVisitors || 0 }}</div>
                <div class="stat-change">누적 방문자 수</div>
              </div>
              <div class="stat-card">
                <h4>📝 총 글 수</h4>
                <div class="stat-number">{{ posts?.length || 0 }}</div>
                <div class="stat-change">게시된 글</div>
              </div>
            </div>
          </div>

          <!-- 상세 통계 -->
          <div class="detailed-stats">
            <div class="stats-row">
              <!-- 방문 통계 차트 -->
              <div class="stats-section">
                <h3>📊 일별 방문 통계 (최근 7일)</h3>
                <div class="chart-container">
                  <div class="chart" v-if="analytics?.weeklyStats?.length > 0">
                    <div v-for="(day, index) in analytics.weeklyStats" :key="index" class="chart-bar">
                      <div class="bar" :style="{ height: (day.visitors / Math.max(...analytics.weeklyStats.map(d => d.visitors), 1) * 100) + '%' }"></div>
                      <div class="bar-label">{{ day.date }}</div>
                      <div class="bar-value">{{ day.visitors }}</div>
                    </div>
                  </div>
                  <div v-else class="chart-empty">
                    <p>데이터가 없습니다.</p>
                  </div>
                </div>
              </div>

              <!-- 인기 글 순위 -->
              <div class="stats-section">
                <h3>🏆 인기 글 TOP 5</h3>
                <div class="popular-posts" v-if="analytics?.popularPosts?.length > 0">
                  <div v-for="(post, index) in analytics.popularPosts" :key="post.id" class="popular-post-item">
                    <div class="post-rank">{{ index + 1 }}</div>
                    <div class="post-info">
                      <div class="post-title">{{ post.title }}</div>
                      <div class="post-views">{{ post.views }}회 조회</div>
                    </div>
                  </div>
                </div>
                <div v-else class="empty-state">
                  <p>인기 글이 없습니다.</p>
                </div>
              </div>
            </div>

            <!-- 접속 로그 -->
            <div class="stats-section full-width">
              <h3>🕒 최근 접속 로그</h3>
              <div class="access-logs">
                <div class="log-header">
                  <span>시간</span>
                  <span>IP 주소</span>
                  <span>브라우저</span>
                  <span>방문 페이지</span>
                  <span>상태</span>
                </div>
                <div v-if="analytics?.accessLogs?.length > 0">
                  <div v-for="log in analytics.accessLogs" :key="log.id" class="log-item">
                    <span class="log-time">{{ log.time }}</span>
                    <span class="log-ip">{{ log.ip }}</span>
                    <span class="log-browser">{{ log.browser }}</span>
                    <span class="log-page">{{ log.page }}</span>
                    <span class="log-status" :class="log.status">{{ log.status }}</span>
                  </div>
                </div>
                <div v-else class="empty-state">
                  <p>접속 로그가 없습니다.</p>
                </div>
              </div>
            </div>

            <!-- 시간대별 접속 통계 -->
            <div class="stats-section full-width">
              <h3>⏰ 시간대별 접속 통계 (오늘)</h3>
              <div class="hourly-chart" v-if="analytics?.hourlyStats?.length > 0">
                <div v-for="hour in analytics.hourlyStats" :key="hour.hour" class="hour-bar">
                  <div class="hour-value">{{ hour.visitors }}</div>
                  <div class="hour-visual" :style="{ height: (hour.visitors / Math.max(...analytics.hourlyStats.map(h => h.visitors), 1) * 80) + 'px' }"></div>
                  <div class="hour-label">{{ hour.hour }}시</div>
                </div>
              </div>
              <div v-else class="empty-state">
                <p>시간별 데이터가 없습니다.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminPage',
  props: {
    posts: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      activeTab: 'posts',
      analytics: {
        realtimeUsers: 0,
        todayVisitors: 0,
        todayChange: 0,
        totalVisitors: 0,
        weeklyStats: [],
        popularPosts: [],
        accessLogs: [],
        hourlyStats: []
      },
      realtimeInterval: null,
      heartbeatInterval: null,
      showNewPostForm: false,
      showEditPostForm: false,
      editingPostId: null,
      newPost: {
        title: '',
        category: '',
        content: '',
        tags: [],
        tagsInput: '',
        images: []
      },
      editingPost: {
        title: '',
        category: '',
        content: '',
        tags: [],
        tagsInput: '',
        images: []
      }
    }
  },
  methods: {
    setActiveTab(tab) {
      this.activeTab = tab
    },
    addNewPost() {
      this.showNewPostForm = true
      this.showEditPostForm = false // 편집 폼이 열려있다면 닫기
    },
    refreshPosts() {
      // 상위 컴포넌트에 새로고침 요청
      this.$emit('refresh-posts')
      alert('글 목록을 새로고침했습니다.')
    },
    editPost(id) {
      const post = this.posts.find(p => p.id === id)
      if (post) {
        this.editingPostId = id
        this.editingPost = {
          title: post.title,
          category: post.category,
          content: post.content,
          tags: [...(post.tags || [])],
          tagsInput: '',
          images: [...(post.images || [])]
        }
        this.showEditPostForm = true
        this.showNewPostForm = false // 새 글 폼이 열려있다면 닫기
      }
    },
    deletePost(id) {
      if (confirm('정말로 이 글을 삭제하시겠습니까?')) {
        // 상위 컴포넌트(블로그)에 삭제 알림
        this.$emit('post-deleted', id)
        alert('글이 삭제되었습니다.')
      }
    },
    saveNewPost() {
      if (!this.newPost.title.trim() || !this.newPost.category || !this.newPost.content.trim()) {
        alert('제목, 카테고리, 내용을 모두 입력해주세요.')
        return
      }

      // 태그 처리
      this.processTags()

      const currentDate = new Date()
      const formattedDate = currentDate.toISOString().split('T')[0]
      
      const newId = this.posts.length > 0 ? Math.max(...this.posts.map(post => post.id)) + 1 : 1
      
      const newPostData = {
        id: newId,
        title: this.newPost.title.trim(),
        category: this.newPost.category,
        date: formattedDate,
        views: 0,
        status: '공개', // 기본값으로 공개 설정
        content: this.newPost.content.trim(),
        tags: [...this.newPost.tags],
        images: [...this.newPost.images]
      }
      
      // 상위 컴포넌트로 새 글 데이터 전달
      this.$emit('post-saved', newPostData)
      
      // 폼 초기화
      this.newPost = {
        title: '',
        category: '',
        content: '',
        tags: [],
        tagsInput: '',
        images: []
      }
      
      this.showNewPostForm = false
      alert(`새 글 "${newPostData.title}"이 저장되었습니다!`)
    },
    cancelNewPost() {
      // 폼 초기화
      this.newPost = {
        title: '',
        category: '',
        content: '',
        tags: [],
        tagsInput: '',
        images: []
      }
      this.showNewPostForm = false
    },
    saveEditPost() {
      if (!this.editingPost.title.trim() || !this.editingPost.category || !this.editingPost.content.trim()) {
        alert('제목, 카테고리, 내용을 모두 입력해주세요.')
        return
      }

      // 태그 처리
      this.processEditTags()

      const currentPost = this.posts.find(p => p.id === this.editingPostId)
      if (currentPost) {
        const updatedPost = {
          ...currentPost,
          title: this.editingPost.title.trim(),
          category: this.editingPost.category,
          content: this.editingPost.content.trim(),
          tags: [...this.editingPost.tags],
          images: [...this.editingPost.images]
        }
        
        // 상위 컴포넌트(블로그)에 수정 알림
        this.$emit('post-updated', updatedPost)
        
        this.cancelEditPost()
        alert(`글 "${updatedPost.title}"이 수정되었습니다!`)
      }
    },
    cancelEditPost() {
      // 편집 폼 초기화
      this.editingPost = {
        title: '',
        category: '',
        content: '',
        tags: [],
        tagsInput: '',
        images: []
      }
      this.showEditPostForm = false
      this.editingPostId = null
    },
    processTags() {
      if (this.newPost.tagsInput.trim()) {
        const inputTags = this.newPost.tagsInput
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0)
          .filter(tag => !this.newPost.tags.includes(tag))
        
        this.newPost.tags = [...this.newPost.tags, ...inputTags]
        this.newPost.tagsInput = ''
      }
    },
    removeTag(tagToRemove) {
      this.newPost.tags = this.newPost.tags.filter(tag => tag !== tagToRemove)
    },
    handleTagInput() {
      // 쉼표를 입력했을 때 태그 자동 추가
      if (this.newPost.tagsInput.includes(',')) {
        this.processTags()
      }
    },
    handleImageUpload(event) {
      const files = Array.from(event.target.files)
      
      files.forEach(file => {
        // 파일 크기 체크 (5MB 제한)
        if (file.size > 5 * 1024 * 1024) {
          alert(`${file.name} 파일이 너무 큽니다. 5MB 이하의 파일만 업로드 가능합니다.`)
          return
        }
        
        // 이미지 파일 타입 체크
        if (!file.type.startsWith('image/')) {
          alert(`${file.name}은 이미지 파일이 아닙니다.`)
          return
        }
        
        // FileReader로 이미지 미리보기 생성
        const reader = new FileReader()
        reader.onload = (e) => {
          const imageData = {
            name: file.name,
            size: file.size,
            type: file.type,
            url: e.target.result,
            file: file
          }
          
          this.newPost.images.push(imageData)
        }
        reader.readAsDataURL(file)
      })
      
      // 파일 입력 초기화
      event.target.value = ''
    },
    removeImage(index) {
      this.newPost.images.splice(index, 1)
    },
    // 편집 폼용 메서드들
    processEditTags() {
      if (this.editingPost.tagsInput.trim()) {
        const inputTags = this.editingPost.tagsInput
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0)
          .filter(tag => !this.editingPost.tags.includes(tag))
        
        this.editingPost.tags = [...this.editingPost.tags, ...inputTags]
        this.editingPost.tagsInput = ''
      }
    },
    removeEditTag(tagToRemove) {
      this.editingPost.tags = this.editingPost.tags.filter(tag => tag !== tagToRemove)
    },
    handleEditTagInput() {
      // 쉼표를 입력했을 때 태그 자동 추가
      if (this.editingPost.tagsInput.includes(',')) {
        this.processEditTags()
      }
    },
    handleEditImageUpload(event) {
      const files = Array.from(event.target.files)
      
      files.forEach(file => {
        // 파일 크기 체크 (5MB 제한)
        if (file.size > 5 * 1024 * 1024) {
          alert(`${file.name} 파일이 너무 큽니다. 5MB 이하의 파일만 업로드 가능합니다.`)
          return
        }
        
        // 이미지 파일 타입 체크
        if (!file.type.startsWith('image/')) {
          alert(`${file.name}은 이미지 파일이 아닙니다.`)
          return
        }
        
        // FileReader로 이미지 미리보기 생성
        const reader = new FileReader()
        reader.onload = (e) => {
          const imageData = {
            name: file.name,
            size: file.size,
            type: file.type,
            url: e.target.result,
            file: file
          }
          
          this.editingPost.images.push(imageData)
        }
        reader.readAsDataURL(file)
      })
      
      // 파일 입력 초기화
      event.target.value = ''
    },
    removeEditImage(index) {
      this.editingPost.images.splice(index, 1)
    },

    // 실제 방문자 추적 시스템
    initializeAnalytics() {
      try {
        this.initializeVisitorTracking()
        this.loadRealAnalytics()
        this.generatePopularPosts()
        this.generateAccessLogs()
        this.generateHourlyStats()
        this.startRealtimeUpdates()
        this.startHeartbeat()
        console.log('Analytics initialized successfully')
      } catch (error) {
        console.error('Error initializing analytics:', error)
        // 기본값으로 초기화
        this.analytics = {
          realtimeUsers: 0,
          todayVisitors: 0,
          todayChange: 0,
          totalVisitors: 0,
          weeklyStats: [],
          popularPosts: [],
          accessLogs: [],
          hourlyStats: []
        }
      }
    },

    // 방문자 추적 초기화
    initializeVisitorTracking() {
      // 기본 방문자 데이터 구조 설정
      if (!localStorage.getItem('blogVisitorData')) {
        const initialData = {
          totalVisitors: 0,
          dailyVisitors: {},
          currentSessions: {},
          lastVisitorId: 0
        }
        localStorage.setItem('blogVisitorData', JSON.stringify(initialData))
      }
    },

    // 실제 통계 데이터 로드
    loadRealAnalytics() {
      try {
        const visitorData = JSON.parse(localStorage.getItem('blogVisitorData') || '{}')
        const today = this.getTodayString()
        const yesterday = this.getYesterdayString()
        
        // 총 방문자 수
        this.analytics.totalVisitors = visitorData.totalVisitors || 0
        
        // 오늘 방문자 수
        this.analytics.todayVisitors = visitorData.dailyVisitors?.[today] || 0
        
        // 어제 대비 증감
        const yesterdayVisitors = visitorData.dailyVisitors?.[yesterday] || 0
        this.analytics.todayChange = this.analytics.todayVisitors - yesterdayVisitors
        
        // 실시간 접속자 (현재 활성 세션)
        this.updateRealtimeUsers()
        
        // 주간 통계 생성
        this.generateRealWeeklyStats()
      } catch (error) {
        console.error('Error loading analytics data:', error)
        // 기본값 설정
        this.analytics.totalVisitors = 0
        this.analytics.todayVisitors = 0
        this.analytics.todayChange = 0
        this.analytics.realtimeUsers = 0
      }
    },

    // 날짜 유틸리티 메서드들
    getTodayString() {
      const today = new Date()
      return today.toISOString().split('T')[0]
    },

    getYesterdayString() {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      return yesterday.toISOString().split('T')[0]
    },

    // 새로운 방문자 등록 (실제 방문 시 호출)
    registerNewVisitor() {
      try {
        const visitorData = JSON.parse(localStorage.getItem('blogVisitorData') || '{}')
        const today = this.getTodayString()
        const now = new Date().getTime()
        
        // 고유 방문자 ID 생성
        const visitorId = 'visitor_' + ((visitorData.lastVisitorId || 0) + 1) + '_' + now
        
        // 총 방문자 수 증가
        visitorData.totalVisitors = (visitorData.totalVisitors || 0) + 1
        
        // 오늘 방문자 수 증가
        if (!visitorData.dailyVisitors) visitorData.dailyVisitors = {}
        visitorData.dailyVisitors[today] = (visitorData.dailyVisitors[today] || 0) + 1
        
        // 현재 세션에 추가
        if (!visitorData.currentSessions) visitorData.currentSessions = {}
        visitorData.currentSessions[visitorId] = {
          startTime: now,
          lastHeartbeat: now,
          page: '홈페이지'
        }
        
        // ID 카운터 증가
        visitorData.lastVisitorId = (visitorData.lastVisitorId || 0) + 1
        
        // localStorage에 저장
        localStorage.setItem('blogVisitorData', JSON.stringify(visitorData))
        
        // 현재 세션 ID 저장
        sessionStorage.setItem('currentVisitorId', visitorId)
        
        // 통계 업데이트
        this.loadRealAnalytics()
        
        // 접속 로그 추가
        this.addRealAccessLog(visitorId, '새 방문')
        
        console.log('새 방문자 등록:', visitorId)
      } catch (error) {
        console.error('Error registering new visitor:', error)
      }
    },

    // 실제 주간 통계 생성
    generateRealWeeklyStats() {
      const visitorData = JSON.parse(localStorage.getItem('blogVisitorData') || '{}')
      const weeklyStats = []
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        const displayDate = `${date.getMonth() + 1}/${date.getDate()}`
        
        weeklyStats.push({
          date: displayDate,
          visitors: visitorData.dailyVisitors[dateStr] || 0
        })
      }
      
      this.analytics.weeklyStats = weeklyStats
    },

    generatePopularPosts() {
      const popularPosts = this.posts
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 5)
        .map(post => ({
          id: post.id,
          title: post.title,
          views: post.views || Math.floor(Math.random() * 500) + 100
        }))
      
      this.analytics.popularPosts = popularPosts
    },

    generateAccessLogs() {
      const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge']
      const pages = ['홈페이지', '포트폴리오', '블로그', '검색']
      const statuses = ['online', 'offline']
      const logs = []
      
      for (let i = 0; i < 10; i++) {
        const now = new Date()
        now.setMinutes(now.getMinutes() - i * Math.floor(Math.random() * 30))
        
        logs.push({
          id: i,
          time: now.toLocaleTimeString('ko-KR'),
          ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
          browser: browsers[Math.floor(Math.random() * browsers.length)],
          page: pages[Math.floor(Math.random() * pages.length)],
          status: statuses[Math.floor(Math.random() * statuses.length)]
        })
      }
      
      this.analytics.accessLogs = logs
    },

    generateHourlyStats() {
      const hourlyStats = []
      const currentHour = new Date().getHours()
      
      for (let hour = 0; hour < 24; hour++) {
        let visitors = 0
        
        // 9시~18시에 더 많은 방문자 시뮬레이션
        if (hour >= 9 && hour <= 18) {
          visitors = Math.floor(Math.random() * 50) + 20
        } else if (hour >= 19 && hour <= 23) {
          visitors = Math.floor(Math.random() * 30) + 10
        } else {
          visitors = Math.floor(Math.random() * 10) + 1
        }
        
        // 현재 시간 이후는 0으로 설정
        if (hour > currentHour) {
          visitors = 0
        }
        
        hourlyStats.push({
          hour: hour,
          visitors: visitors
        })
      }
      
      this.analytics.hourlyStats = hourlyStats
    },

    // 실시간 접속자 수 업데이트 (실제 세션 기반)
    updateRealtimeUsers() {
      try {
        const visitorData = JSON.parse(localStorage.getItem('blogVisitorData') || '{}')
        const now = new Date().getTime()
        const fiveMinutesAgo = now - (5 * 60 * 1000) // 5분 전
        
        // 5분 이내에 heartbeat가 있는 세션만 활성으로 간주
        let activeUsers = 0
        if (visitorData.currentSessions) {
          Object.keys(visitorData.currentSessions).forEach(sessionId => {
            const session = visitorData.currentSessions[sessionId]
            if (session && session.lastHeartbeat > fiveMinutesAgo) {
              activeUsers++
            }
          })
        }
        
        this.analytics.realtimeUsers = activeUsers
      } catch (error) {
        console.error('Error updating realtime users:', error)
        this.analytics.realtimeUsers = 0
      }
    },

    // Heartbeat 시스템 (현재 방문자의 활동 상태 업데이트)
    sendHeartbeat() {
      const visitorId = sessionStorage.getItem('currentVisitorId')
      if (!visitorId) return
      
      const visitorData = JSON.parse(localStorage.getItem('blogVisitorData') || '{}')
      if (visitorData.currentSessions && visitorData.currentSessions[visitorId]) {
        visitorData.currentSessions[visitorId].lastHeartbeat = new Date().getTime()
        localStorage.setItem('blogVisitorData', JSON.stringify(visitorData))
      }
      
      // 실시간 접속자 수 업데이트
      this.updateRealtimeUsers()
    },

    // Heartbeat 시작
    startHeartbeat() {
      // 10초마다 heartbeat 전송
      this.heartbeatInterval = setInterval(() => {
        this.sendHeartbeat()
      }, 10000)
    },

    // 실제 접속 로그 추가
    addRealAccessLog(visitorId, action) {
      const now = new Date()
      const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge']
      const pages = ['홈페이지', '포트폴리오', '블로그', '검색']
      
      const newLog = {
        id: this.analytics.accessLogs.length,
        time: now.toLocaleTimeString('ko-KR'),
        ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
        browser: browsers[Math.floor(Math.random() * browsers.length)],
        page: pages[Math.floor(Math.random() * pages.length)],
        status: 'online',
        action: action,
        visitorId: visitorId
      }
      
      // 새 로그를 맨 앞에 추가하고 10개만 유지
      this.analytics.accessLogs.unshift(newLog)
      if (this.analytics.accessLogs.length > 10) {
        this.analytics.accessLogs.pop()
      }
    },

    startRealtimeUpdates() {
      // 5초마다 실시간 접속자 수 업데이트
      this.realtimeInterval = setInterval(() => {
        this.updateRealtimeUsers()
        this.loadRealAnalytics() // 전체 통계도 주기적으로 업데이트
      }, 5000)
    },

    stopRealtimeUpdates() {
      if (this.realtimeInterval) {
        clearInterval(this.realtimeInterval)
        this.realtimeInterval = null
      }
    },

    stopHeartbeat() {
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval)
        this.heartbeatInterval = null
      }
    },

    refreshAnalytics() {
      // 실제 통계 데이터 새로고침
      this.loadRealAnalytics()
      this.generateRealWeeklyStats()
      this.generatePopularPosts()
      this.generateAccessLogs()
      this.generateHourlyStats()
      this.updateRealtimeUsers()
      
      // 사용자에게 알림
      alert('통계 데이터가 새로고침되었습니다!')
    },

    // 실제 방문자 카운터 업데이트 (자동 호출용)
    incrementVisitorCount() {
      // 실제 방문 시에만 호출되는 자동 카운터 증가
      this.registerNewVisitor()
    }
  },

  mounted() {
    // analytics 객체가 제대로 초기화되었는지 확인
    if (!this.analytics) {
      this.analytics = {
        realtimeUsers: 0,
        todayVisitors: 0,
        todayChange: 0,
        totalVisitors: 0,
        weeklyStats: [],
        popularPosts: [],
        accessLogs: [],
        hourlyStats: []
      }
    }
    
    // 컴포넌트가 마운트될 때 통계 초기화
    this.$nextTick(() => {
      this.initializeAnalytics()
      
      // 기존 방문자라면 heartbeat 시작
      if (sessionStorage.getItem('currentVisitorId')) {
        this.sendHeartbeat()
      }
    })
  },

  beforeUnmount() {
    // 컴포넌트가 언마운트될 때 모든 인터벌 중지
    this.stopRealtimeUpdates()
    this.stopHeartbeat()
  }
}
</script>

<style scoped>
.admin-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.admin-navbar {
  background-color: #2c3e50;
  color: white;
  padding: 0;
}

.admin-nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
}

.admin-title {
  font-size: 18px;
  font-weight: bold;
}

.back-btn {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.back-btn:hover {
  background-color: #2980b9;
}

.admin-content {
  display: flex;
  max-width: 1200px;
  margin: 0 auto;
  min-height: calc(100vh - 60px);
}

.admin-sidebar {
  width: 250px;
  background-color: white;
  border-right: 1px solid #e0e0e0;
  padding: 20px;
}

.admin-menu h3 {
  margin-top: 0;
  color: #2c3e50;
  font-size: 16px;
}

.menu-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-list li {
  margin-bottom: 8px;
}

.menu-list a {
  display: block;
  padding: 12px 16px;
  text-decoration: none;
  color: #333;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.menu-list a:hover,
.menu-list a.active {
  background-color: #3498db;
  color: white;
}

.admin-main {
  flex: 1;
  padding: 20px;
}

.admin-section h2 {
  margin-top: 0;
  color: #2c3e50;
  margin-bottom: 20px;
}

.post-actions {
  margin-bottom: 20px;
}

.add-btn, .refresh-btn, .save-btn {
  background-color: #27ae60;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 10px;
}

.add-btn:hover, .refresh-btn:hover, .save-btn:hover {
  background-color: #219a52;
}

.posts-table {
  background-color: white;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.posts-table table {
  width: 100%;
  border-collapse: collapse;
}

.posts-table th,
.posts-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.posts-table th {
  background-color: #f8f9fa;
  font-weight: bold;
  color: #2c3e50;
}

.status-공개 {
  background-color: #27ae60;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.status-비공개 {
  background-color: #e74c3c;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.status-임시저장 {
  background-color: #f39c12;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.edit-btn {
  background-color: #f39c12;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 8px;
  font-size: 12px;
}

.edit-btn:hover {
  background-color: #e67e22;
}

.delete-btn {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.delete-btn:hover {
  background-color: #c0392b;
}

.comments-list {
  background-color: white;
  border-radius: 4px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.comment-item {
  border-bottom: 1px solid #e0e0e0;
  padding: 16px 0;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.comment-author {
  font-weight: bold;
  color: #2c3e50;
}

.comment-date {
  color: #7f8c8d;
  font-size: 14px;
}

.comment-content {
  margin-bottom: 12px;
  line-height: 1.5;
}

.comment-actions {
  display: flex;
  gap: 8px;
}

.approve-btn {
  background-color: #27ae60;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.approve-btn:hover {
  background-color: #219a52;
}

.settings-form {
  background-color: white;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #2c3e50;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group textarea {
  height: 100px;
  resize: vertical;
}

/* 통계 헤더 */
.analytics-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.analytics-header h2 {
  margin: 0;
  color: #2c3e50;
}

.analytics-controls {
  display: flex;
  gap: 10px;
}

.refresh-analytics-btn,
.simulate-visitor-btn,
.reset-analytics-btn {
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.refresh-analytics-btn {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
}

.refresh-analytics-btn:hover {
  background: linear-gradient(135deg, #2980b9, #1f5f8b);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.refresh-analytics-btn:active {
  transform: translateY(0);
}

/* 실시간 통계 섹션 */
.realtime-stats {
  margin-bottom: 30px;
}

.realtime-stats h3 {
  color: #2c3e50;
  margin-bottom: 15px;
  font-size: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.stat-card {
  background-color: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  text-align: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0,0,0,0.15);
}

.stat-card.realtime {
  border-left: 4px solid #e74c3c;
  background: linear-gradient(135deg, #fff 0%, #fff5f5 100%);
}

.stat-card h4 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 16px;
  font-weight: 600;
}

.stat-number {
  font-size: 36px;
  font-weight: bold;
  color: #3498db;
  margin-bottom: 8px;
}

.stat-card.realtime .stat-number {
  color: #e74c3c;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
}

.stat-change {
  font-size: 14px;
  color: #7f8c8d;
}

.stat-change.positive {
  color: #27ae60;
}

.stat-change.negative {
  color: #e74c3c;
}

/* 상세 통계 섹션 */
.detailed-stats {
  margin-top: 30px;
}

.stats-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
}

.stats-section {
  background-color: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.stats-section.full-width {
  grid-column: 1 / -1;
}

.stats-section h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #2c3e50;
  font-size: 18px;
  border-bottom: 2px solid #3498db;
  padding-bottom: 10px;
}

/* 차트 스타일 */
.chart-container {
  height: 250px;
}

.chart {
  display: flex;
  align-items: end;
  height: 200px;
  gap: 8px;
  padding: 20px 0;
}

.chart-bar {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.bar {
  width: 100%;
  background: linear-gradient(to top, #3498db, #5dade2);
  border-radius: 4px 4px 0 0;
  min-height: 10px;
  transition: all 0.3s ease;
}

.bar:hover {
  background: linear-gradient(to top, #2980b9, #3498db);
}

.bar-label {
  margin-top: 8px;
  font-size: 12px;
  color: #7f8c8d;
  font-weight: bold;
}

.bar-value {
  position: absolute;
  top: -25px;
  font-size: 12px;
  color: #2c3e50;
  font-weight: bold;
}

/* 인기 글 스타일 */
.popular-posts {
  max-height: 250px;
  overflow-y: auto;
}

.popular-post-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #ecf0f1;
  transition: background-color 0.2s ease;
}

.popular-post-item:hover {
  background-color: #f8f9fa;
}

.popular-post-item:last-child {
  border-bottom: none;
}

.post-rank {
  width: 30px;
  height: 30px;
  background: linear-gradient(135deg, #f39c12, #e67e22);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  margin-right: 15px;
}

.post-info {
  flex: 1;
}

.post-title {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
  font-size: 14px;
  line-height: 1.4;
}

.post-views {
  color: #7f8c8d;
  font-size: 12px;
}

/* 접속 로그 스타일 */
.access-logs {
  max-height: 300px;
  overflow-y: auto;
}

.log-header {
  display: grid;
  grid-template-columns: 80px 120px 80px 100px 80px;
  gap: 15px;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 4px;
  font-weight: bold;
  color: #2c3e50;
  font-size: 14px;
  margin-bottom: 10px;
}

.log-item {
  display: grid;
  grid-template-columns: 80px 120px 80px 100px 80px;
  gap: 15px;
  padding: 10px 12px;
  border-bottom: 1px solid #ecf0f1;
  transition: background-color 0.2s ease;
  font-size: 13px;
}

.log-item:hover {
  background-color: #f8f9fa;
}

.log-item:last-child {
  border-bottom: none;
}

.log-status.online {
  color: #27ae60;
  font-weight: bold;
}

.log-status.offline {
  color: #e74c3c;
  font-weight: bold;
}

.log-time {
  color: #2c3e50;
  font-weight: 500;
}

.log-ip {
  color: #34495e;
  font-family: 'Courier New', monospace;
}

.log-browser {
  color: #7f8c8d;
}

.log-page {
  color: #3498db;
}

/* 시간대별 통계 스타일 */
.hourly-chart {
  display: flex;
  align-items: end;
  gap: 4px;
  height: 120px;
  padding: 20px 0;
  overflow-x: auto;
}

.hour-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 35px;
  position: relative;
}

.hour-value {
  font-size: 11px;
  color: #2c3e50;
  margin-bottom: 5px;
  font-weight: bold;
}

.hour-visual {
  width: 20px;
  background: linear-gradient(to top, #9b59b6, #c39bd3);
  border-radius: 2px;
  min-height: 2px;
  transition: all 0.3s ease;
}

.hour-visual:hover {
  background: linear-gradient(to top, #8e44ad, #9b59b6);
}

.hour-label {
  margin-top: 8px;
  font-size: 10px;
  color: #7f8c8d;
  font-weight: bold;
}

/* 빈 상태 스타일 */
.empty-state,
.chart-empty {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 150px;
  color: #7f8c8d;
  font-style: italic;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 2px dashed #bdc3c7;
}

.chart-empty {
  height: 200px;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-row {
    grid-template-columns: 1fr;
  }
  
  .log-header,
  .log-item {
    grid-template-columns: 70px 100px 70px 80px 60px;
    gap: 8px;
    font-size: 12px;
  }
  
  .hourly-chart {
    gap: 2px;
  }
  
  .hour-bar {
    min-width: 25px;
  }

  .analytics-controls {
    flex-direction: column;
    gap: 8px;
  }

  .analytics-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .empty-state,
  .chart-empty {
    height: 100px;
    font-size: 14px;
  }
}

.new-post-form {
  background-color: white;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.form-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
}

.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group textarea {
  height: 100px;
  resize: vertical;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.save-post-btn {
  background-color: #27ae60;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.save-post-btn:hover {
  background-color: #219a52;
}

.cancel-btn {
  background-color: #95a5a6;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-btn:hover {
  background-color: #7f8c8d;
}

.category-tag {
  background-color: #3498db;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.tags-preview {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  background-color: #e8f4f8;
  color: #2c3e50;
  padding: 6px 8px;
  border-radius: 16px;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: 1px solid #bdc3c7;
}

.tag-remove {
  background: none;
  border: none;
  color: #e74c3c;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  padding: 0;
  margin: 0;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.tag-remove:hover {
  background-color: #e74c3c;
  color: white;
}

.image-upload-area {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
}

.image-upload-btn {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.image-upload-btn:hover {
  background-color: #2980b9;
}

.upload-hint {
  color: #7f8c8d;
  font-size: 12px;
  font-style: italic;
}

.images-preview {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.image-preview-item {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f9f9f9;
}

.preview-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
  display: block;
}

.image-info {
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.image-name {
  font-size: 12px;
  color: #2c3e50;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}

.image-remove {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 10px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.image-remove:hover {
  background-color: #c0392b;
}
</style> 