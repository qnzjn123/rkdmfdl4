<template>
  <div class="search-page">
    <!-- 네비게이션 -->
    <nav class="navbar">
      <div class="nav-container">
        <div class="nav-left">
          <span class="blog-title">임가을 블로그</span>
        </div>
        <div class="nav-menu">
          <router-link to="/" class="nav-link">홈</router-link>
          <router-link to="/freeboard" class="nav-link">자유게시판</router-link>
          <router-link to="/search" class="nav-link active">검색</router-link>
        </div>
        <div class="nav-right">
          <div v-if="!isLoggedIn" class="auth-buttons">
            <button @click="showLoginModal" class="auth-btn login-btn">로그인</button>
            <button @click="showSignUpModal" class="auth-btn signup-btn">회원가입</button>
          </div>
          <div v-else class="user-profile">
            <div class="profile-dropdown" @click="toggleProfileMenu">
              <div class="profile-avatar">
                <span>{{ currentUser.nickname.charAt(0) }}</span>
              </div>
              <span class="profile-name">{{ currentUser.nickname }}</span>
              <span class="dropdown-arrow">▼</span>
            </div>
            <div v-if="showProfileMenu" class="profile-menu">
              <div class="profile-info">
                <div class="profile-name-full">{{ currentUser.nickname }}</div>
                <div class="profile-email">{{ currentUser.email }}</div>
              </div>
              <hr class="profile-divider">
              <a href="#" @click="logout" class="profile-menu-item">로그아웃</a>
              <a href="#" @click="showWithdrawModal" class="profile-menu-item withdraw-item">회원탈퇴</a>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- 검색 헤더 -->
    <div class="search-header">
      <div class="container">
        <h1 class="search-title">게시글 검색</h1>
        <p class="search-subtitle">제목, 내용, 카테고리, 태그로 검색하실 수 있습니다.</p>
      </div>
    </div>

    <!-- 검색바 -->
    <div class="search-section">
      <div class="container">
        <div class="search-bar">
          <div class="search-input-wrapper">
            <input 
              type="text" 
              v-model="searchQuery" 
              @input="handleSearch"
              @keyup.enter="handleSearch"
              placeholder="검색어를 입력하세요..." 
              class="search-input"
              ref="searchInput"
            >
            <button @click="handleSearch" class="search-btn">
              🔍 검색
            </button>
            <button 
              v-if="isSearchActive" 
              @click="clearSearch" 
              class="clear-search-btn"
              title="검색 초기화"
            >
              ✕ 초기화
            </button>
          </div>
        </div>

        <!-- 검색 필터 -->
        <div class="search-filters">
          <div class="filter-group">
            <label>카테고리:</label>
            <select v-model="selectedCategory" @change="handleSearch" class="filter-select">
              <option value="">전체</option>
              <option v-for="category in availableCategories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </div>
          <div class="filter-group">
            <label>정렬:</label>
            <select v-model="sortBy" @change="handleSort" class="filter-select">
              <option value="date">최신순</option>
              <option value="views">조회수순</option>
              <option value="likes">좋아요순</option>
              <option value="title">제목순</option>
            </select>
          </div>
        </div>

        <!-- 검색 결과 정보 -->
        <div v-if="isSearchActive || selectedCategory" class="search-info">
          <div class="search-result-info">
            <span class="search-result-count">
              총 {{ filteredPosts.length }}개의 게시글이 검색되었습니다.
            </span>
            <span v-if="searchQuery" class="search-query">
              검색어: "{{ searchQuery }}"
            </span>
            <span v-if="selectedCategory" class="search-category">
              카테고리: "{{ selectedCategory }}"
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 검색 결과 -->
    <div class="search-results">
      <div class="container">
        <div v-if="filteredPosts.length > 0" class="posts-grid">
          <div v-for="post in sortedPosts" :key="post.id" class="post-card" @click="viewPostDetail(post)">
            <div class="post-image">
              <img 
                v-if="post.images && post.images.length > 0" 
                :src="post.images[0].url" 
                :alt="post.title" 
                class="card-image"
              />
              <div v-else class="no-image">
                <span>📝</span>
              </div>
            </div>
            <div class="post-content">
              <div class="post-category">{{ post.category }}</div>
              <h3 class="post-title">{{ highlightSearchTerm(post.title) }}</h3>
              <p class="post-excerpt" v-html="highlightSearchTerm(getExcerpt(post.content))"></p>
              <div class="post-meta">
                <span class="post-date">{{ formatDate(post.date) }}</span>
                <span class="post-views">조회 {{ post.views }}</span>
                <span class="post-likes">좋아요 {{ post.likes || 0 }}</span>
              </div>
              <div v-if="post.tags && post.tags.length > 0" class="post-tags">
                <span v-for="tag in post.tags.slice(0, 3)" :key="tag" class="tag">
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 검색 결과가 없을 때 -->
        <div v-else-if="isSearchActive || selectedCategory" class="no-results">
          <div class="no-results-icon">🔍</div>
          <h3>검색 결과가 없습니다</h3>
          <p v-if="searchQuery">
            "{{ searchQuery }}"에 대한 검색 결과를 찾을 수 없습니다.
          </p>
          <p v-else-if="selectedCategory">
            "{{ selectedCategory }}" 카테고리에 게시글이 없습니다.
          </p>
          <div class="no-results-actions">
            <button @click="clearSearch" class="clear-search-button">
              검색 조건 초기화
            </button>
            <router-link to="/" class="back-home-button">
              홈으로 돌아가기
            </router-link>
          </div>
        </div>

        <!-- 초기 상태 (검색하지 않았을 때) -->
        <div v-else class="search-welcome">
          <div class="welcome-icon">🔍</div>
          <h3>게시글을 검색해보세요</h3>
          <p>제목, 내용, 카테고리, 태그로 원하는 게시글을 찾을 수 있습니다.</p>
          <div class="search-tips">
            <h4>검색 팁:</h4>
            <ul>
              <li>키워드를 입력하고 Enter를 누르거나 검색 버튼을 클릭하세요</li>
              <li>카테고리 필터를 사용해 특정 주제의 글만 찾아보세요</li>
              <li>정렬 옵션으로 원하는 순서로 결과를 확인하세요</li>
            </ul>
          </div>
          <div class="quick-links">
            <router-link to="/" class="quick-link">전체 게시글 보기</router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- 인증 모달들 -->
    <div v-if="loginModalVisible" class="modal-overlay" @click="closeLoginModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>로그인</h2>
          <button @click="closeLoginModal" class="close-btn">×</button>
        </div>
        <form @submit.prevent="handleLogin" class="auth-form">
          <div class="form-group">
            <label for="loginEmail">이메일</label>
            <input 
              type="email" 
              id="loginEmail" 
              v-model="loginForm.email" 
              required
              placeholder="이메일을 입력하세요"
            >
          </div>
          <div class="form-group">
            <label for="loginPassword">비밀번호</label>
            <input 
              type="password" 
              id="loginPassword" 
              v-model="loginForm.password" 
              required
              placeholder="비밀번호를 입력하세요"
            >
          </div>
          <div v-if="loginError" class="error-message">{{ loginError }}</div>
          <button type="submit" class="submit-btn">로그인</button>
        </form>
        <div class="modal-footer">
          <p>계정이 없으신가요? <a href="#" @click="switchToSignUp">회원가입</a></p>
          <p><a href="#" @click="showEmailFindModal">이메일 찾기</a> | <a href="#" @click="showPasswordResetModal">비밀번호 찾기</a></p>
        </div>
      </div>
    </div>

    <div v-if="signUpModalVisible" class="modal-overlay" @click="closeSignUpModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>회원가입</h2>
          <button @click="closeSignUpModal" class="close-btn">×</button>
        </div>
        <form @submit.prevent="handleSignUp" class="auth-form">
          <div class="form-group">
            <label for="signUpNickname">닉네임</label>
            <div class="nickname-input-wrapper">
              <input 
                type="text" 
                id="signUpNickname" 
                v-model="signUpForm.nickname" 
                required
                placeholder="닉네임을 입력하세요"
                @input="resetNicknameCheck"
                minlength="2"
                maxlength="20"
              >
              <button 
                type="button" 
                class="nickname-check-btn"
                @click="checkNicknameDuplicate"
                :disabled="!signUpForm.nickname || signUpForm.nickname.length < 2"
              >
                중복확인
              </button>
            </div>
            <div v-if="nicknameCheckMessage" :class="['nickname-message', isNicknameAvailable ? 'success' : 'error']">
              {{ nicknameCheckMessage }}
            </div>
          </div>
          <div class="form-group">
            <label for="signUpEmail">이메일</label>
            <div class="email-input-wrapper">
              <input 
                type="email" 
                id="signUpEmail" 
                v-model="signUpForm.email" 
                required
                placeholder="이메일을 입력하세요"
                @input="resetEmailCheck"
              >
              <button 
                type="button" 
                class="email-check-btn"
                @click="checkEmailDuplicate"
                :disabled="!signUpForm.email || !isValidEmail(signUpForm.email)"
              >
                중복확인
              </button>
            </div>
            <div v-if="emailCheckMessage" :class="['email-message', isEmailAvailable ? 'success' : 'error']">
              {{ emailCheckMessage }}
            </div>
          </div>
          <div class="form-group">
            <label for="signUpPassword">비밀번호</label>
            <input 
              type="password" 
              id="signUpPassword" 
              v-model="signUpForm.password" 
              required
              placeholder="비밀번호를 입력하세요"
              minlength="6"
            >
          </div>
          <div class="form-group">
            <label for="confirmPassword">비밀번호 확인</label>
            <input 
              type="password" 
              id="confirmPassword" 
              v-model="signUpForm.confirmPassword" 
              required
              placeholder="비밀번호를 다시 입력하세요"
            >
          </div>
          <div v-if="signUpError" class="error-message">{{ signUpError }}</div>
          <button type="submit" class="submit-btn">회원가입</button>
        </form>
        <div class="modal-footer">
          <p>이미 계정이 있으신가요? <a href="#" @click="switchToLogin">로그인</a></p>
        </div>
      </div>
    </div>

    <!-- 이메일 찾기 모달 -->
    <div v-if="emailFindModalVisible" class="modal-overlay" @click="closeEmailFindModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>이메일 찾기</h2>
          <button @click="closeEmailFindModal" class="close-btn">×</button>
        </div>
        <div class="email-find-content">
          <p class="email-find-description">등록된 이메일 목록입니다.</p>
          <div v-if="users.length === 0" class="no-emails">
            <p>등록된 이메일이 없습니다.</p>
          </div>
          <div v-else class="email-list">
            <div v-for="user in users" :key="user.id" class="email-item">
              <div class="email-info">
                <div class="email-address">{{ user.email }}</div>
                <div class="user-nickname">{{ user.nickname }}</div>
                <div class="registration-date">가입일: {{ formatDate(user.createdAt) }}</div>
              </div>
              <button @click="selectEmail(user.email)" class="select-email-btn">
                선택
              </button>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <p><a href="#" @click="backToLogin">로그인으로 돌아가기</a></p>
        </div>
              </div>
      </div>
    </div>

    <!-- 비밀번호 찾기 모달 -->
    <div v-if="passwordResetModalVisible" class="modal-overlay" @click="closePasswordResetModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>비밀번호 찾기</h2>
          <button @click="closePasswordResetModal" class="close-btn">×</button>
        </div>
        <div v-if="!tempPasswordGenerated" class="password-reset-content">
          <p class="password-reset-description">등록된 이메일을 입력하시면 임시 비밀번호를 생성해드립니다.</p>
          <form @submit.prevent="generateTempPassword" class="password-reset-form">
            <div class="form-group">
              <label for="resetEmail">이메일</label>
              <input 
                type="email" 
                id="resetEmail" 
                v-model="resetEmail" 
                required
                placeholder="등록된 이메일을 입력하세요"
              >
            </div>
            <div v-if="resetError" class="error-message">{{ resetError }}</div>
            <button type="submit" class="submit-btn">임시 비밀번호 생성</button>
          </form>
        </div>
        <div v-else class="temp-password-result">
          <div class="success-icon">🔑</div>
          <h3>임시 비밀번호가 생성되었습니다!</h3>
          <div class="temp-password-box">
            <div class="temp-password-label">임시 비밀번호</div>
            <div class="temp-password-value">{{ tempPassword }}</div>
            <button @click="copyTempPassword" class="copy-btn">
              {{ passwordCopied ? '복사완료!' : '복사하기' }}
            </button>
          </div>
          <div class="temp-password-notice">
            <p>⚠️ <strong>보안을 위해 로그인 후 비밀번호를 변경해주세요.</strong></p>
            <p>• 이 임시 비밀번호는 한 번만 표시됩니다</p>
            <p>• 창을 닫기 전에 복사해두세요</p>
          </div>
          <button @click="goToLoginWithEmail" class="login-with-temp-btn">
            이 이메일로 로그인하기
          </button>
        </div>
        <div class="modal-footer">
          <p><a href="#" @click="backToLoginFromReset">로그인으로 돌아가기</a></p>
        </div>
      </div>
    </div>

    <!-- 회원탈퇴 확인 모달 -->
    <div v-if="withdrawModalVisible" class="modal-overlay" @click="closeWithdrawModal">
      <div class="modal-content withdraw-modal" @click.stop>
        <div class="modal-header">
          <h2>회원탈퇴</h2>
          <button @click="closeWithdrawModal" class="close-btn">×</button>
        </div>
        <div class="withdraw-content">
          <div class="warning-icon">⚠️</div>
          <h3>정말로 탈퇴하시겠습니까?</h3>
          <div class="withdraw-warnings">
            <p><strong>탈퇴 시 다음 정보가 모두 삭제됩니다:</strong></p>
            <ul>
              <li>계정 정보 (이메일, 닉네임 등)</li>
              <li>작성한 모든 게시글과 댓글</li>
              <li>좋아요 및 활동 기록</li>
            </ul>
            <p class="withdraw-notice">
              <strong>⚠️ 탈퇴 후에는 데이터 복구가 불가능합니다.</strong>
            </p>
          </div>
          <div class="withdraw-confirmation">
            <p>탈퇴를 진행하시려면 아래에 <strong>"탈퇴합니다"</strong>를 입력하세요:</p>
            <input 
              type="text" 
              v-model="withdrawConfirmText" 
              placeholder="탈퇴합니다"
              class="withdraw-input"
            >
          </div>
          <div v-if="withdrawError" class="error-message">{{ withdrawError }}</div>
        </div>
        <div class="withdraw-actions">
          <button @click="closeWithdrawModal" class="cancel-btn">취소</button>
          <button 
            @click="handleWithdraw" 
            :disabled="withdrawConfirmText !== '탈퇴합니다'"
            class="withdraw-btn"
          >
            회원탈퇴
          </button>
        </div>
      </div>
    </div>
  </template>

<script>
export default {
  name: 'SearchPage',
  data() {
    return {
      searchQuery: '',
      selectedCategory: '',
      sortBy: 'date',
      isSearchActive: false,
      filteredPosts: [],
      blogPosts: [],
      // 인증 관련
      isLoggedIn: false,
      currentUser: null,
      showProfileMenu: false,
      loginModalVisible: false,
      signUpModalVisible: false,
      emailFindModalVisible: false,
      passwordResetModalVisible: false,
      // 폼 데이터
      loginForm: {
        email: '',
        password: ''
      },
      signUpForm: {
        nickname: '',
        email: '',
        password: '',
        confirmPassword: ''
      },
      // 닉네임 중복 검사 관련
      isNicknameChecked: false,
      isNicknameAvailable: false,
      nicknameCheckMessage: '',
      // 이메일 중복 검사 관련
      isEmailChecked: false,
      isEmailAvailable: false,
      emailCheckMessage: '',
      // 에러 메시지
      loginError: '',
      signUpError: '',
      // 비밀번호 찾기 관련
      resetEmail: '',
      resetError: '',
      tempPassword: '',
      tempPasswordGenerated: false,
      passwordCopied: false,
      // 사용자 데이터
      users: [],
      // 회원탈퇴 관련
      withdrawModalVisible: false,
      withdrawConfirmText: '',
      withdrawError: ''
    }
  },
  computed: {
    availableCategories() {
      const categories = [...new Set(this.blogPosts.map(post => post.category))]
      return categories.filter(cat => cat)
    },
    sortedPosts() {
      if (!this.filteredPosts.length) return []
      
      const posts = [...this.filteredPosts]
      switch (this.sortBy) {
        case 'views':
          return posts.sort((a, b) => (b.views || 0) - (a.views || 0))
        case 'likes':
          return posts.sort((a, b) => (b.likes || 0) - (a.likes || 0))
        case 'title':
          return posts.sort((a, b) => a.title.localeCompare(b.title))
        case 'date':
        default:
          return posts.sort((a, b) => new Date(b.date) - new Date(a.date))
      }
    }
  },
  mounted() {
    this.loadPosts()
    this.loadUsersFromStorage()
    this.loadAuthState()
    
    // URL 쿼리 파라미터에서 검색어 가져오기
    const query = this.$route.query.q
    if (query) {
      this.searchQuery = query
      this.handleSearch()
    }
    
    if (this.$refs.searchInput) {
      this.$refs.searchInput.focus()
    }
  },
  methods: {
    loadPosts() {
      try {
        const savedPosts = localStorage.getItem('blogPosts')
        if (savedPosts) {
          this.blogPosts = JSON.parse(savedPosts)
        }
      } catch (error) {
        console.error('게시글 로드 중 오류:', error)
      }
    },
    loadAuthState() {
      try {
        const savedUser = localStorage.getItem('currentUser')
        const isLoggedIn = localStorage.getItem('isLoggedIn')
        if (savedUser && isLoggedIn === 'true') {
          this.currentUser = JSON.parse(savedUser)
          // 기존 사용자 데이터 마이그레이션 (name -> nickname)
          if (!this.currentUser.nickname && this.currentUser.name) {
            this.currentUser.nickname = this.currentUser.name
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser))
          }
          this.isLoggedIn = true
        }
      } catch (error) {
        console.error('인증 상태 로드 중 오류:', error)
      }
    },
    handleSearch() {
      const query = this.searchQuery.trim().toLowerCase()
      const category = this.selectedCategory

      if (!query && !category) {
        this.clearSearch()
        return
      }

      this.isSearchActive = true
      this.filteredPosts = this.blogPosts.filter(post => {
        let matchesQuery = true
        let matchesCategory = true

        if (query) {
          matchesQuery = 
            post.title.toLowerCase().includes(query) ||
            post.content.toLowerCase().includes(query) ||
            (post.tags && post.tags.some(tag => tag.toLowerCase().includes(query))) ||
            post.category.toLowerCase().includes(query)
        }

        if (category) {
          matchesCategory = post.category === category
        }

        return matchesQuery && matchesCategory
      })
    },
    handleSort() {
      // 정렬은 computed에서 처리됩니다
    },
    clearSearch() {
      this.searchQuery = ''
      this.selectedCategory = ''
      this.isSearchActive = false
      this.filteredPosts = []
    },
    highlightSearchTerm(text) {
      if (!this.searchQuery || !text) return text
      
      const query = this.searchQuery.trim()
      if (!query) return text
      
      const regex = new RegExp(`(${query})`, 'gi')
      return text.replace(regex, '<mark>$1</mark>')
    },
    viewPostDetail(post) {
      this.$router.push(`/post/${post.id}`)
    },
    getExcerpt(content) {
      return content.length > 100 ? content.substring(0, 100) + '...' : content
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('ko-KR')
    },
    toggleProfileMenu() {
      this.showProfileMenu = !this.showProfileMenu
    },
    showLoginModal() {
      this.loginModalVisible = true
      this.signUpModalVisible = false
      this.loginError = ''
    },
    showSignUpModal() {
      this.signUpModalVisible = true
      this.loginModalVisible = false
      this.signUpError = ''
    },
    closeLoginModal() {
      this.loginModalVisible = false
      this.loginForm = { email: '', password: '' }
      this.loginError = ''
    },
    closeSignUpModal() {
      this.signUpModalVisible = false
      this.signUpForm = { nickname: '', email: '', password: '', confirmPassword: '' }
      this.signUpError = ''
      this.resetNicknameCheck()
      this.resetEmailCheck()
    },
    switchToSignUp() {
      this.closeLoginModal()
      this.showSignUpModal()
    },
    switchToLogin() {
      this.closeSignUpModal()
      this.showLoginModal()
    },
    // 이메일 찾기 모달 관련 메서드들
    showEmailFindModal() {
      this.closeLoginModal()
      this.emailFindModalVisible = true
    },
    closeEmailFindModal() {
      this.emailFindModalVisible = false
    },
    selectEmail(email) {
      this.loginForm.email = email
      this.closeEmailFindModal()
      this.showLoginModal()
    },
    backToLogin() {
      this.closeEmailFindModal()
      this.showLoginModal()
    },
    // 비밀번호 찾기 모달 관련 메서드들
    showPasswordResetModal() {
      this.closeLoginModal()
      this.passwordResetModalVisible = true
      this.resetPasswordForm()
    },
    closePasswordResetModal() {
      this.passwordResetModalVisible = false
      this.resetPasswordForm()
    },
    resetPasswordForm() {
      this.resetEmail = ''
      this.resetError = ''
      this.tempPassword = ''
      this.tempPasswordGenerated = false
      this.passwordCopied = false
    },
    generateTempPassword() {
      this.resetError = ''
      
      try {
        // 등록된 이메일인지 확인
        const user = this.users.find(u => u.email === this.resetEmail)
        
        if (!user) {
          this.resetError = '등록되지 않은 이메일입니다.'
          return
        }
        
        // 임시 비밀번호 생성 (8자리: 대문자, 소문자, 숫자, 특수문자 포함)
        const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz'
        const numberChars = '0123456789'
        const specialChars = '!@#$%^&*'
        
        let tempPassword = ''
        tempPassword += uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)]
        tempPassword += lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)]
        tempPassword += numberChars[Math.floor(Math.random() * numberChars.length)]
        tempPassword += specialChars[Math.floor(Math.random() * specialChars.length)]
        
        // 나머지 4자리는 랜덤하게
        const allChars = uppercaseChars + lowercaseChars + numberChars + specialChars
        for (let i = 0; i < 4; i++) {
          tempPassword += allChars[Math.floor(Math.random() * allChars.length)]
        }
        
        // 임시 비밀번호 섞기
        this.tempPassword = tempPassword.split('').sort(() => Math.random() - 0.5).join('')
        
        // 사용자 데이터베이스에 임시 비밀번호 저장
        const userIndex = this.users.findIndex(u => u.email === this.resetEmail)
        if (userIndex !== -1) {
          this.users[userIndex].password = this.tempPassword
          this.saveUsersToStorage()
        }
        
        this.tempPasswordGenerated = true
        console.log(`${user.nickname}님의 임시 비밀번호가 생성되었습니다.`)
        
      } catch (error) {
        console.error('임시 비밀번호 생성 중 오류:', error)
        this.resetError = '임시 비밀번호 생성 중 오류가 발생했습니다.'
      }
    },
    copyTempPassword() {
      try {
        navigator.clipboard.writeText(this.tempPassword).then(() => {
          this.passwordCopied = true
          setTimeout(() => {
            this.passwordCopied = false
          }, 2000)
        }).catch(() => {
          // 클립보드 API가 지원되지 않는 경우 fallback
          const textArea = document.createElement('textarea')
          textArea.value = this.tempPassword
          document.body.appendChild(textArea)
          textArea.select()
          document.execCommand('copy')
          document.body.removeChild(textArea)
          this.passwordCopied = true
          setTimeout(() => {
            this.passwordCopied = false
          }, 2000)
        })
      } catch (error) {
        console.error('복사 중 오류:', error)
        alert('복사에 실패했습니다. 수동으로 복사해주세요.')
      }
    },
    goToLoginWithEmail() {
      this.loginForm.email = this.resetEmail
      this.loginForm.password = ''
      this.closePasswordResetModal()
      this.showLoginModal()
    },
    backToLoginFromReset() {
      this.closePasswordResetModal()
      this.showLoginModal()
    },
    handleLogin() {
      this.loginError = ''
      
      try {
        const user = this.users.find(u => u.email === this.loginForm.email)
        
        if (!user) {
          this.loginError = '등록되지 않은 이메일입니다.'
          return
        }
        
        if (user.password !== this.loginForm.password) {
          this.loginError = '비밀번호가 일치하지 않습니다.'
          return
        }
        
        this.currentUser = user
        this.isLoggedIn = true
        this.saveAuthState()
        this.closeLoginModal()
        
        console.log('로그인 성공:', user.nickname)
      } catch (error) {
        console.error('로그인 처리 중 오류:', error)
        this.loginError = '로그인 중 오류가 발생했습니다.'
      }
    },
    handleSignUp() {
      this.signUpError = ''
      
      try {
        if (!this.signUpForm.nickname || this.signUpForm.nickname.length < 2) {
          this.signUpError = '닉네임은 2자 이상이어야 합니다.'
          return
        }
        
        if (this.signUpForm.nickname.length > 20) {
          this.signUpError = '닉네임은 20자 이하여야 합니다.'
          return
        }
        
        if (!this.isNicknameChecked) {
          this.signUpError = '닉네임 중복 확인을 완료해주세요.'
          return
        }
        
        if (!this.isNicknameAvailable) {
          this.signUpError = '사용할 수 없는 닉네임입니다.'
          return
        }
        
        if (!this.isEmailChecked) {
          this.signUpError = '이메일 중복 확인을 완료해주세요.'
          return
        }
        
        if (!this.isEmailAvailable) {
          this.signUpError = '사용할 수 없는 이메일입니다.'
          return
        }
        
        if (this.signUpForm.password !== this.signUpForm.confirmPassword) {
          this.signUpError = '비밀번호가 일치하지 않습니다.'
          return
        }
        
        if (this.signUpForm.password.length < 6) {
          this.signUpError = '비밀번호는 6자 이상이어야 합니다.'
          return
        }
        
        const newUser = {
          id: Date.now(),
          nickname: this.signUpForm.nickname,
          email: this.signUpForm.email,
          password: this.signUpForm.password,
          createdAt: new Date()
        }
        
        this.users.push(newUser)
        this.saveUsersToStorage()
        
        this.currentUser = newUser
        this.isLoggedIn = true
        this.saveAuthState()
        this.closeSignUpModal()
        
        console.log('회원가입 성공:', newUser.nickname)
      } catch (error) {
        console.error('회원가입 처리 중 오류:', error)
        this.signUpError = '회원가입 중 오류가 발생했습니다.'
      }
    },
    checkNicknameDuplicate() {
      if (!this.signUpForm.nickname || this.signUpForm.nickname.length < 2) {
        this.nicknameCheckMessage = '닉네임을 2자 이상 입력해주세요.'
        this.isNicknameAvailable = false
        this.isNicknameChecked = false
        return
      }
      
      const nicknameRegex = /^[가-힣a-zA-Z0-9]+$/
      if (!nicknameRegex.test(this.signUpForm.nickname)) {
        this.nicknameCheckMessage = '닉네임은 한글, 영문, 숫자만 사용할 수 있습니다.'
        this.isNicknameAvailable = false
        this.isNicknameChecked = false
        return
      }
      
      const isDuplicate = this.users.some(user => user.nickname === this.signUpForm.nickname)
      
      if (isDuplicate) {
        this.nicknameCheckMessage = '이미 사용 중인 닉네임입니다.'
        this.isNicknameAvailable = false
        this.isNicknameChecked = true
      } else {
        this.nicknameCheckMessage = '사용할 수 있는 닉네임입니다.'
        this.isNicknameAvailable = true
        this.isNicknameChecked = true
      }
    },
    resetNicknameCheck() {
      this.isNicknameChecked = false
      this.isNicknameAvailable = false
      this.nicknameCheckMessage = ''
    },
    checkEmailDuplicate() {
      if (!this.signUpForm.email) {
        this.emailCheckMessage = '이메일을 입력해주세요.'
        this.isEmailAvailable = false
        this.isEmailChecked = false
        return
      }
      
      if (!this.isValidEmail(this.signUpForm.email)) {
        this.emailCheckMessage = '올바른 이메일 형식이 아닙니다.'
        this.isEmailAvailable = false
        this.isEmailChecked = false
        return
      }
      
      const isDuplicate = this.users.some(user => user.email === this.signUpForm.email)
      
      if (isDuplicate) {
        this.emailCheckMessage = '이미 등록된 이메일입니다.'
        this.isEmailAvailable = false
        this.isEmailChecked = true
      } else {
        this.emailCheckMessage = '사용할 수 있는 이메일입니다.'
        this.isEmailAvailable = true
        this.isEmailChecked = true
      }
    },
    resetEmailCheck() {
      this.isEmailChecked = false
      this.isEmailAvailable = false
      this.emailCheckMessage = ''
    },
    isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(email)
    },
    logout() {
      this.isLoggedIn = false
      this.currentUser = null
      this.showProfileMenu = false
      localStorage.removeItem('currentUser')
      localStorage.removeItem('isLoggedIn')
      console.log('로그아웃 완료')
    },
    saveAuthState() {
      try {
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser))
        localStorage.setItem('isLoggedIn', 'true')
      } catch (error) {
        console.error('인증 상태 저장 중 오류:', error)
      }
    },
    saveUsersToStorage() {
      try {
        localStorage.setItem('users', JSON.stringify(this.users))
      } catch (error) {
        console.error('사용자 데이터 저장 중 오류:', error)
      }
    },
    loadUsersFromStorage() {
      try {
        const savedUsers = localStorage.getItem('users')
        if (savedUsers) {
          this.users = JSON.parse(savedUsers)
        }
      } catch (error) {
        console.error('사용자 데이터 로드 중 오류:', error)
      }
    },
    // 회원탈퇴 관련 메서드들
    showWithdrawModal() {
      this.withdrawModalVisible = true
      this.showProfileMenu = false
      this.withdrawConfirmText = ''
      this.withdrawError = ''
    },
    closeWithdrawModal() {
      this.withdrawModalVisible = false
      this.withdrawConfirmText = ''
      this.withdrawError = ''
    },
    handleWithdraw() {
      this.withdrawError = ''
      
      if (this.withdrawConfirmText !== '탈퇴합니다') {
        this.withdrawError = '탈퇴 확인 문구를 정확히 입력해주세요.'
        return
      }
      
      try {
        // 현재 사용자의 ID 저장
        const currentUserId = this.currentUser.id
        
        // 사용자 목록에서 현재 사용자 제거
        this.users = this.users.filter(user => user.id !== currentUserId)
        this.saveUsersToStorage()
        
        // 해당 사용자가 작성한 게시글 삭제
        this.deleteUserPosts(currentUserId)
        
        // 로그아웃 처리
        this.isLoggedIn = false
        this.currentUser = null
        localStorage.removeItem('currentUser')
        localStorage.removeItem('isLoggedIn')
        
        // 모달 닫기
        this.closeWithdrawModal()
        
        // 홈페이지로 이동
        this.$router.push('/')
        
        // 탈퇴 완료 알림
        alert('회원탈퇴가 완료되었습니다. 그동안 이용해주셔서 감사합니다.')
        
        console.log('회원탈퇴 완료')
      } catch (error) {
        console.error('회원탈퇴 처리 중 오류:', error)
        this.withdrawError = '회원탈퇴 처리 중 오류가 발생했습니다.'
      }
    },
    deleteUserPosts(userId) {
      try {
        // 게시글 데이터 로드
        const savedPosts = localStorage.getItem('blogPosts')
        if (savedPosts) {
          let posts = JSON.parse(savedPosts)
          
          // 현재 사용자가 작성한 게시글 필터링해서 제거
          // 작성자 정보가 있는 경우에만 필터링 (기존 데이터 호환성 고려)
          posts = posts.filter(post => {
            if (post.authorId) {
              return post.authorId !== userId
            }
            if (post.author && this.currentUser && post.author === this.currentUser.nickname) {
              return false
            }
            return true
          })
          
          // 업데이트된 게시글 목록 저장
          localStorage.setItem('blogPosts', JSON.stringify(posts))
          this.blogPosts = posts
          
          console.log('사용자 게시글 삭제 완료')
        }
      } catch (error) {
        console.error('사용자 게시글 삭제 중 오류:', error)
      }
    }
  }
}
</script>

<style scoped>
.search-page {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.navbar {
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
}

.blog-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
}

.nav-menu {
  display: flex;
  gap: 30px;
}

.nav-link {
  text-decoration: none;
  color: #666;
  font-weight: 500;
  transition: color 0.3s;
  padding: 8px 16px;
  border-radius: 6px;
}

.nav-link:hover,
.nav-link.active {
  color: #3498db;
  background-color: #f8f9fa;
}

.search-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 60px 0;
  text-align: center;
}

.search-title {
  font-size: 2.5rem;
  margin-bottom: 10px;
  font-weight: 700;
}

.search-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
}

.search-section {
  padding: 40px 0;
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.search-bar {
  margin-bottom: 30px;
}

.search-input-wrapper {
  display: flex;
  gap: 12px;
  max-width: 800px;
  margin: 0 auto;
}

.search-input {
  flex: 1;
  padding: 15px 20px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 1.1rem;
  transition: border-color 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #3498db;
}

.search-btn {
  padding: 15px 30px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.search-btn:hover {
  background: #2980b9;
}

.clear-search-btn {
  padding: 15px 20px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.3s;
}

.clear-search-btn:hover {
  background: #c0392b;
}

.search-filters {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-group label {
  font-weight: 600;
  color: #555;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem;
}

.search-info {
  text-align: center;
  margin-top: 20px;
}

.search-result-info {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  display: inline-block;
}

.search-result-count {
  font-weight: 600;
  color: #2c3e50;
}

.search-query,
.search-category {
  margin-left: 10px;
  color: #666;
}

.search-results {
  padding: 40px 0;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.post-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
}

.post-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.post-image {
  height: 200px;
  overflow: hidden;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  height: 100%;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
}

.post-content {
  padding: 20px;
}

.post-category {
  color: #3498db;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.post-title {
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 10px;
  color: #2c3e50;
  line-height: 1.3;
}

.post-excerpt {
  color: #666;
  line-height: 1.5;
  margin-bottom: 15px;
}

.post-meta {
  display: flex;
  gap: 15px;
  font-size: 0.9rem;
  color: #999;
  margin-bottom: 10px;
}

.post-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag {
  background: #f1f3f4;
  color: #666;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
}

.no-results,
.search-welcome {
  text-align: center;
  padding: 60px 20px;
  max-width: 600px;
  margin: 0 auto;
}

.no-results-icon,
.welcome-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.no-results h3,
.search-welcome h3 {
  font-size: 1.8rem;
  color: #2c3e50;
  margin-bottom: 15px;
}

.no-results p,
.search-welcome p {
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 30px;
}

.no-results-actions,
.quick-links {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.clear-search-button,
.back-home-button,
.quick-link {
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: background 0.3s;
}

.clear-search-button {
  background: #3498db;
  color: white;
  border: none;
  cursor: pointer;
}

.clear-search-button:hover {
  background: #2980b9;
}

.back-home-button,
.quick-link {
  background: #95a5a6;
  color: white;
}

.back-home-button:hover,
.quick-link:hover {
  background: #7f8c8d;
}

.search-tips {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin: 30px 0;
  text-align: left;
}

.search-tips h4 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.search-tips ul {
  color: #666;
  line-height: 1.6;
}

.search-tips li {
  margin-bottom: 5px;
}

mark {
  background: #fff3cd;
  color: #856404;
  padding: 2px 4px;
  border-radius: 3px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.auth-buttons {
  display: flex;
  gap: 10px;
}

.auth-btn {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s;
}

.login-btn {
  background: transparent;
  color: #3498db;
  border: 1px solid #3498db;
}

.login-btn:hover {
  background: #3498db;
  color: white;
}

.signup-btn {
  background: #3498db;
  color: white;
}

.signup-btn:hover {
  background: #2980b9;
}

/* 사용자 프로필 스타일 */
.user-profile {
  position: relative;
}

.profile-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: background-color 0.3s;
}

.profile-dropdown:hover {
  background-color: #f8f9fa;
}

.profile-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #3498db;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
}

.profile-name {
  font-weight: 500;
  color: #2c3e50;
}

.dropdown-arrow {
  font-size: 0.7rem;
  color: #666;
  transition: transform 0.3s;
}

.profile-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 0;
  min-width: 200px;
  z-index: 1000;
  border: 1px solid #e9ecef;
  margin-top: 8px;
}

.profile-info {
  padding: 16px;
}

.profile-name-full {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.profile-email {
  font-size: 0.85rem;
  color: #666;
}

.profile-divider {
  margin: 0;
  border: none;
  border-top: 1px solid #e9ecef;
}

.profile-menu-item {
  display: block;
  padding: 12px 16px;
  color: #666;
  text-decoration: none;
  transition: all 0.3s;
  font-size: 0.9rem;
}

.profile-menu-item:hover {
  background-color: #f8f9fa;
  color: #2c3e50;
}

/* 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 0;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  color: #2c3e50;
  font-size: 1.3rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.3s;
}

.close-btn:hover {
  background: #f8f9fa;
  color: #666;
}

.auth-form {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  color: #555;
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #3498db;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 16px;
  font-size: 0.9rem;
}

.submit-btn {
  width: 100%;
  background: #3498db;
  color: white;
  border: none;
  padding: 14px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.submit-btn:hover {
  background: #2980b9;
}

.modal-footer {
  padding: 16px 24px;
  text-align: center;
  background: #f8f9fa;
  border-radius: 0 0 12px 12px;
}

.modal-footer p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.modal-footer a {
  color: #3498db;
  text-decoration: none;
  font-weight: 600;
}

.modal-footer a:hover {
  text-decoration: underline;
}

/* 닉네임/이메일 중복 검사 스타일 */
.nickname-input-wrapper,
.email-input-wrapper {
  display: flex;
  gap: 8px;
  align-items: center;
}

.nickname-input-wrapper input,
.email-input-wrapper input {
  flex: 1;
}

.nickname-check-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
  min-width: 80px;
}

.nickname-check-btn:hover:not(:disabled) {
  background: #2980b9;
}

.nickname-check-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.email-check-btn {
  background: #27ae60;
  color: white;
  border: none;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
  min-width: 80px;
}

.email-check-btn:hover:not(:disabled) {
  background: #219a52;
}

.email-check-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.nickname-message,
.email-message {
  margin-top: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
}

.nickname-message.success,
.email-message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.nickname-message.error,
.email-message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.profile-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: background-color 0.3s;
}

.profile-dropdown:hover {
  background-color: #f8f9fa;
}

.profile-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #3498db;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.profile-name {
  font-weight: 500;
  color: #2c3e50;
}

  .dropdown-arrow {
    font-size: 0.8rem;
    color: #666;
  }

/* 이메일 찾기 모달 스타일 */
.email-find-content {
  padding: 20px 0;
}

.email-find-description {
  margin-bottom: 20px;
  color: #666;
  text-align: center;
  font-size: 1rem;
}

.no-emails {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.email-list {
  max-height: 400px;
  overflow-y: auto;
}

.email-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  margin-bottom: 12px;
  background: #f8f9fa;
  transition: all 0.3s ease;
}

.email-item:hover {
  background: #e9ecef;
  border-color: #3498db;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.15);
}

.email-info {
  flex: 1;
}

.email-address {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.user-nickname {
  font-size: 0.95rem;
  color: #3498db;
  margin-bottom: 4px;
  font-weight: 500;
}

.registration-date {
  font-size: 0.85rem;
  color: #7f8c8d;
}

.select-email-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 80px;
}

.select-email-btn:hover {
  background: #2980b9;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(52, 152, 219, 0.3);
}

/* 비밀번호 찾기 모달 스타일 */
.password-reset-content {
  padding: 20px 0;
}

.password-reset-description {
  margin-bottom: 20px;
  color: #666;
  text-align: center;
  font-size: 1rem;
  line-height: 1.5;
}

.password-reset-form {
  padding: 0 24px;
}

.temp-password-result {
  padding: 30px 24px;
  text-align: center;
}

.success-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.temp-password-result h3 {
  color: #27ae60;
  font-size: 1.3rem;
  margin-bottom: 25px;
}

.temp-password-box {
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 25px;
  position: relative;
}

.temp-password-label {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 8px;
  font-weight: 500;
}

.temp-password-value {
  font-size: 1.5rem;
  font-weight: 700;
  font-family: 'Courier New', monospace;
  color: #2c3e50;
  background: #fff;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #ddd;
  margin-bottom: 15px;
  letter-spacing: 2px;
  word-break: break-all;
}

.copy-btn {
  background: #17a2b8;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 100px;
}

.copy-btn:hover {
  background: #138496;
  transform: translateY(-1px);
}

.temp-password-notice {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 25px;
  text-align: left;
}

.temp-password-notice p {
  margin: 8px 0;
  color: #856404;
  font-size: 0.9rem;
  line-height: 1.5;
}

.temp-password-notice strong {
  color: #d68910;
}

.login-with-temp-btn {
  background: #28a745;
  color: white;
  border: none;
  padding: 14px 30px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

  .login-with-temp-btn:hover {
    background: #218838;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
  }

/* 회원탈퇴 관련 스타일 */
.withdraw-item {
  color: #e74c3c !important;
  border-top: 1px solid #f0f0f0;
  margin-top: 8px;
  padding-top: 8px;
}

.withdraw-item:hover {
  background-color: #fdf2f2 !important;
  color: #c0392b !important;
}

.withdraw-modal {
  max-width: 500px;
}

.withdraw-content {
  padding: 30px 24px;
  text-align: center;
}

.warning-icon {
  font-size: 3rem;
  color: #e74c3c;
  margin-bottom: 20px;
}

.withdraw-content h3 {
  color: #2c3e50;
  font-size: 1.4rem;
  margin-bottom: 25px;
  font-weight: 600;
}

.withdraw-warnings {
  text-align: left;
  background: #fff5f5;
  border: 1px solid #fed7d7;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 25px;
}

.withdraw-warnings p {
  margin: 10px 0;
  color: #744c4c;
  font-size: 0.95rem;
}

.withdraw-warnings ul {
  margin: 15px 0;
  padding-left: 20px;
  color: #744c4c;
}

.withdraw-warnings li {
  margin: 8px 0;
  line-height: 1.4;
}

.withdraw-notice {
  background: #fed7d7;
  color: #c53030;
  padding: 12px 16px;
  border-radius: 6px;
  margin-top: 15px;
  font-size: 0.9rem !important;
}

.withdraw-confirmation {
  margin-bottom: 20px;
}

.withdraw-confirmation p {
  color: #2c3e50;
  font-size: 1rem;
  margin-bottom: 15px;
  line-height: 1.5;
}

.withdraw-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e74c3c;
  border-radius: 8px;
  font-size: 1rem;
  text-align: center;
  font-weight: 600;
  transition: all 0.3s;
}

.withdraw-input:focus {
  outline: none;
  border-color: #c0392b;
  box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
}

.withdraw-input::placeholder {
  color: #bbb;
  font-weight: normal;
}

.withdraw-actions {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #f0f0f0;
}

.cancel-btn {
  flex: 1;
  background: #95a5a6;
  color: white;
  border: none;
  padding: 14px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.cancel-btn:hover {
  background: #7f8c8d;
  transform: translateY(-1px);
}

.withdraw-btn {
  flex: 1;
  background: #e74c3c;
  color: white;
  border: none;
  padding: 14px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.withdraw-btn:hover:not(:disabled) {
  background: #c0392b;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
}

.withdraw-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

    @media (max-width: 768px) {
  .search-input-wrapper {
    flex-direction: column;
    gap: 10px;
  }
  
  .search-filters {
    flex-direction: column;
    align-items: center;
  }
  
  .posts-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .search-title {
    font-size: 2rem;
  }
  
  .no-results-actions,
  .quick-links {
    flex-direction: column;
    align-items: center;
  }
}
</style> 