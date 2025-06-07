<template>
  <div class="free-board">
    <!-- 네비게이션 바 -->
    <nav class="navbar">
      <div class="nav-container">
        <div class="nav-left">
          <span class="blog-title">임가을 블로그</span>
        </div>
        <div class="nav-menu">
          <router-link to="/" class="nav-link">홈</router-link>
          <router-link to="/freeboard" class="nav-link active">자유게시판</router-link>
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

    <!-- 헤더 섹션 -->
    <div class="board-header">
      <div class="container">
        <div class="header-content">
          <h1 class="board-title">💬 자유게시판</h1>
          <p class="board-description">자유롭게 소통하고 이야기를 나누는 공간입니다</p>
          <button @click="openWriteModal" class="write-btn">
            ✍️ 글쓰기
          </button>
        </div>
      </div>
    </div>

    <!-- 게시판 컨텐츠 -->
    <div class="board-content">
      <div class="container">
        <!-- 필터 및 정렬 -->
        <div class="board-controls">
          <div class="filter-section">
            <select v-model="selectedCategory" class="category-filter">
              <option value="">전체 카테고리</option>
              <option value="일상">일상</option>
              <option value="질문">질문</option>
              <option value="정보">정보</option>
              <option value="토론">토론</option>
              <option value="기타">기타</option>
            </select>
            <select v-model="sortBy" class="sort-filter">
              <option value="latest">최신순</option>
              <option value="popular">인기순</option>
              <option value="comments">댓글순</option>
            </select>
          </div>
          <div class="search-section">
            <input 
              v-model="searchQuery" 
              @keyup.enter="searchPosts"
              placeholder="제목, 내용, 작성자로 검색..."
              class="search-input"
            >
            <button @click="searchPosts" class="search-btn">🔍</button>
          </div>
        </div>

        <!-- 게시글 목록 -->
        <div class="posts-container">
          <div class="posts-header">
            <div class="header-item number">번호</div>
            <div class="header-item category">분류</div>
            <div class="header-item title">제목</div>
            <div class="header-item author">작성자</div>
            <div class="header-item date">작성일</div>
            <div class="header-item views">조회</div>
            <div class="header-item likes">추천</div>
          </div>

          <!-- 공지사항 (상단 고정) -->
          <div v-for="notice in notices" :key="notice.id" class="post-item notice">
            <div class="post-number">📌</div>
            <div class="post-category notice-badge">공지</div>
            <div class="post-title" @click="viewPost(notice)">
              <span class="title-text">{{ notice.title }}</span>
              <span v-if="notice.comments > 0" class="comment-count">[{{ notice.comments }}]</span>
            </div>
            <div class="post-author">관리자</div>
            <div class="post-date">{{ formatDate(notice.date) }}</div>
            <div class="post-views">{{ notice.views }}</div>
            <div class="post-likes">{{ notice.likes }}</div>
          </div>

          <!-- 일반 게시글 -->
          <div v-for="(post, index) in displayPosts" :key="post.id" class="post-item">
            <div class="post-number">{{ getTotalPostNumber(index) }}</div>
            <div class="post-category" :class="`category-${post.category}`">
              {{ post.category }}
            </div>
            <div class="post-title" @click="viewPost(post)">
              <span class="title-text">{{ post.title }}</span>
              <span v-if="post.isNew" class="new-badge">NEW</span>
              <span v-if="post.isHot" class="hot-badge">🔥</span>
              <span v-if="post.comments > 0" class="comment-count">[{{ post.comments }}]</span>
            </div>
            <div class="post-author">{{ post.author }}</div>
            <div class="post-date">{{ formatDate(post.date) }}</div>
            <div class="post-views">{{ post.views }}</div>
            <div class="post-likes">{{ post.likes }}</div>
          </div>

          <!-- 게시글이 없을 때 -->
          <div v-if="displayPosts.length === 0" class="no-posts">
            <div class="empty-state">
              <div class="empty-icon">📝</div>
              <h3>게시글이 없습니다</h3>
              <p>첫 번째 글을 작성해보세요!</p>
              <button @click="openWriteModal" class="write-first-btn">
                글쓰기
              </button>
            </div>
          </div>
        </div>

        <!-- 페이지네이션 -->
        <div v-if="totalPages > 1" class="pagination">
          <button 
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="page-btn prev-btn"
          >
            ‹ 이전
          </button>
          
          <button 
            v-for="page in visiblePages" 
            :key="page"
            @click="goToPage(page)"
            :class="['page-btn', { active: page === currentPage }]"
          >
            {{ page }}
          </button>
          
          <button 
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="page-btn next-btn"
          >
            다음 ›
          </button>
        </div>
      </div>
    </div>

    <!-- 글쓰기 모달 -->
    <div v-if="showWriteModal" class="modal-overlay" @click="closeWriteModal">
      <div class="modal-content write-modal" @click.stop>
        <div class="modal-header">
          <h2>새 글 작성</h2>
          <button @click="closeWriteModal" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitPost" class="write-form">
            <div class="form-row">
              <div class="form-group">
                <label>카테고리</label>
                <select v-model="newPost.category" required class="form-select">
                  <option value="">카테고리 선택</option>
                  <option value="일상">일상</option>
                  <option value="질문">질문</option>
                  <option value="정보">정보</option>
                  <option value="토론">토론</option>
                  <option value="기타">기타</option>
                </select>
              </div>
              <div class="form-group">
                <label>작성자</label>
                <input 
                  v-model="newPost.author" 
                  required 
                  :placeholder="isLoggedIn ? currentUser.nickname : '닉네임을 입력하세요'" 
                  :readonly="isLoggedIn"
                  class="form-input"
                >
              </div>
            </div>
            <div class="form-group">
              <label>제목</label>
              <input v-model="newPost.title" required placeholder="제목을 입력하세요" class="form-input">
            </div>
            <div class="form-group">
              <label>내용</label>
              <textarea 
                v-model="newPost.content" 
                required 
                placeholder="내용을 입력하세요..."
                rows="10"
                class="form-textarea"
              ></textarea>
            </div>
            <div class="form-actions">
              <button type="button" @click="closeWriteModal" class="cancel-btn">취소</button>
              <button type="submit" class="submit-btn">게시하기</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 로그인 모달 -->
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
        </div>
      </div>
    </div>

    <!-- 회원가입 모달 -->
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
  </div>
</template>

<script>
export default {
  name: 'FreeBoardPage',
  data() {
    return {
      searchQuery: '',
      selectedCategory: '',
      sortBy: 'latest',
      currentPage: 1,
      postsPerPage: 15,
      showWriteModal: false,
      newPost: {
        category: '',
        title: '',
        content: '',
        author: ''
      },
      // 로그인 관련 상태
      isLoggedIn: false,
      currentUser: null,
      showProfileMenu: false,
      loginModalVisible: false,
      signUpModalVisible: false,
      emailFindModalVisible: false,
      passwordResetModalVisible: false,
      withdrawModalVisible: false,
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
      // 중복 검사 관련
      isNicknameChecked: false,
      isNicknameAvailable: false,
      nicknameCheckMessage: '',
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
      // 회원탈퇴 관련
      withdrawConfirmText: '',
      withdrawError: '',
      // 사용자 데이터
      users: [],
      notices: [
        {
          id: 'notice1',
          title: '자유게시판 이용규칙 안내',
          author: '관리자',
          date: new Date('2024-01-15'),
          views: 1234,
          likes: 45,
          comments: 12
        },
        {
          id: 'notice2', 
          title: '욕설 및 비방 글 작성 시 제재 안내',
          author: '관리자',
          date: new Date('2024-01-10'),
          views: 987,
          likes: 32,
          comments: 8
        }
      ],
      posts: []
    }
  },
  computed: {
    filteredPosts() {
      let filtered = [...this.posts];
      
      // 카테고리 필터
      if (this.selectedCategory) {
        filtered = filtered.filter(post => post.category === this.selectedCategory);
      }
      
      // 검색 필터
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(post => 
          post.title.toLowerCase().includes(query) ||
          post.content.toLowerCase().includes(query) ||
          post.author.toLowerCase().includes(query)
        );
      }
      
      // 정렬
      switch (this.sortBy) {
        case 'popular':
          filtered.sort((a, b) => b.likes - a.likes);
          break;
        case 'comments':
          filtered.sort((a, b) => b.comments - a.comments);
          break;
        default:
          filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
      }
      
      return filtered;
    },
    totalPages() {
      return Math.ceil(this.filteredPosts.length / this.postsPerPage);
    },
    displayPosts() {
      const start = (this.currentPage - 1) * this.postsPerPage;
      const end = start + this.postsPerPage;
      return this.filteredPosts.slice(start, end);
    },
    visiblePages() {
      const pages = [];
      const maxVisible = 5;
      let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
      let end = Math.min(this.totalPages, start + maxVisible - 1);
      
      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    }
  },
  mounted() {
    this.loadUsersFromStorage()
    this.loadAuthState()
    
    // 로그인 상태 실시간 동기화
    window.addEventListener('storage', this.handleStorageChange)
  },
  beforeUnmount() {
    window.removeEventListener('storage', this.handleStorageChange)
  },
  methods: {
    searchPosts() {
      this.currentPage = 1;
    },
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
    getTotalPostNumber(index) {
      return this.filteredPosts.length - (this.currentPage - 1) * this.postsPerPage - index;
    },
    formatDate(date) {
      const now = new Date();
      const diff = now - date;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      
      if (days === 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours === 0) {
          const minutes = Math.floor(diff / (1000 * 60));
          return `${minutes}분 전`;
        }
        return `${hours}시간 전`;
      } else if (days === 1) {
        return '어제';
      } else if (days < 7) {
        return `${days}일 전`;
      } else {
        return date.toLocaleDateString();
      }
    },
    viewPost(post) {
      // 게시글 상세보기 로직
      console.log('게시글 보기:', post);
      post.views++;
    },
    openWriteModal() {
      if (!this.isLoggedIn) {
        this.showLoginModal()
        return
      }
      this.showWriteModal = true
      this.newPost.author = this.currentUser.nickname
    },
    closeWriteModal() {
      this.showWriteModal = false;
      this.newPost = {
        category: '',
        title: '',
        content: '',
        author: ''
      };
    },
    submitPost() {
      const post = {
        id: Date.now(),
        ...this.newPost,
        date: new Date(),
        views: 0,
        likes: 0,
        comments: 0,
        isNew: true
      };
      
      this.posts.unshift(post);
      this.closeWriteModal();
      
      // 새글 표시 일정 시간 후 제거
      setTimeout(() => {
        post.isNew = false;
      }, 24 * 60 * 60 * 1000); // 24시간
    },
    // 로그인 관련 메서드들
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
    logout() {
      this.isLoggedIn = false
      this.currentUser = null
      this.showProfileMenu = false
      localStorage.removeItem('currentUser')
      localStorage.removeItem('isLoggedIn')
      console.log('로그아웃 완료')
    },
    // 중복 검사 관련 메서드들
    checkNicknameDuplicate() {
      this.nicknameCheckMessage = ''
      
      try {
        if (!this.signUpForm.nickname || this.signUpForm.nickname.length < 2) {
          this.nicknameCheckMessage = '닉네임은 2자 이상이어야 합니다.'
          this.isNicknameAvailable = false
          return
        }
        
        const isDuplicate = this.users.some(user => user.nickname === this.signUpForm.nickname)
        
        if (isDuplicate) {
          this.nicknameCheckMessage = '이미 사용 중인 닉네임입니다.'
          this.isNicknameAvailable = false
        } else {
          this.nicknameCheckMessage = '사용 가능한 닉네임입니다.'
          this.isNicknameAvailable = true
        }
        
        this.isNicknameChecked = true
      } catch (error) {
        console.error('닉네임 중복 검사 중 오류:', error)
        this.nicknameCheckMessage = '중복 검사 중 오류가 발생했습니다.'
        this.isNicknameAvailable = false
      }
    },
    checkEmailDuplicate() {
      this.emailCheckMessage = ''
      
      try {
        if (!this.signUpForm.email || !this.isValidEmail(this.signUpForm.email)) {
          this.emailCheckMessage = '올바른 이메일 형식이 아닙니다.'
          this.isEmailAvailable = false
          return
        }
        
        const isDuplicate = this.users.some(user => user.email === this.signUpForm.email)
        
        if (isDuplicate) {
          this.emailCheckMessage = '이미 사용 중인 이메일입니다.'
          this.isEmailAvailable = false
        } else {
          this.emailCheckMessage = '사용 가능한 이메일입니다.'
          this.isEmailAvailable = true
        }
        
        this.isEmailChecked = true
      } catch (error) {
        console.error('이메일 중복 검사 중 오류:', error)
        this.emailCheckMessage = '중복 검사 중 오류가 발생했습니다.'
        this.isEmailAvailable = false
      }
    },
    resetNicknameCheck() {
      this.isNicknameChecked = false
      this.isNicknameAvailable = false
      this.nicknameCheckMessage = ''
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
    showWithdrawModal() {
      this.withdrawModalVisible = true
      this.showProfileMenu = false
    },
    closeWithdrawModal() {
      this.withdrawModalVisible = false
      this.withdrawConfirmText = ''
      this.withdrawError = ''
    },
    handleWithdraw() {
      this.withdrawError = ''
      
      if (this.withdrawConfirmText !== '탈퇴합니다') {
        this.withdrawError = '"탈퇴합니다"를 정확히 입력해주세요.'
        return
      }
      
      try {
        // 사용자 목록에서 현재 사용자 제거
        this.users = this.users.filter(user => user.id !== this.currentUser.id)
        this.saveUsersToStorage()
        
        // 로그아웃 처리
        this.logout()
        this.closeWithdrawModal()
        
        console.log('회원탈퇴 완료')
      } catch (error) {
        console.error('회원탈퇴 처리 중 오류:', error)
        this.withdrawError = '탈퇴 처리 중 오류가 발생했습니다.'
      }
    },
    // 로컬스토리지 관련 메서드들
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
        this.users = []
      }
    },
    saveAuthState() {
      try {
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser))
        localStorage.setItem('isLoggedIn', this.isLoggedIn.toString())
      } catch (error) {
        console.error('인증 상태 저장 중 오류:', error)
      }
    },
    loadAuthState() {
      try {
        const savedUser = localStorage.getItem('currentUser')
        const isLoggedIn = localStorage.getItem('isLoggedIn')
        
        if (savedUser && isLoggedIn === 'true') {
          this.currentUser = JSON.parse(savedUser)
          this.isLoggedIn = true
          console.log('로그인 상태 복원:', this.currentUser.nickname)
        }
      } catch (error) {
        console.error('인증 상태 로드 중 오류:', error)
        this.isLoggedIn = false
        this.currentUser = null
      }
    },
    // 로그인 상태 실시간 동기화
    handleStorageChange(event) {
      if (event.key === 'isLoggedIn' || event.key === 'currentUser') {
        console.log('로그인 상태 변경 감지, 상태 동기화 중...')
        this.loadAuthState()
      }
    }
  },
  watch: {
    selectedCategory() {
      this.currentPage = 1;
    },
    sortBy() {
      this.currentPage = 1;
    }
  }
}
</script>

<style scoped>
/* 전체 레이아웃 */
.free-board {
  min-height: 100vh;
  background-color: #f8f9fa;
}

/* 네비게이션 바 */
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
  transition: all 0.3s;
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

/* 헤더 섹션 */
.board-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 0;
  color: white;
  text-align: center;
}

.header-content {
  max-width: 800px;
  margin: 0 auto;
}

.board-title {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 12px;
}

.board-description {
  font-size: 1.2rem;
  margin-bottom: 24px;
  opacity: 0.9;
}

.write-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid white;
  padding: 12px 24px;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  backdrop-filter: blur(10px);
}

.write-btn:hover {
  background: white;
  color: #667eea;
}

/* 게시판 컨텐츠 */
.board-content {
  padding: 40px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 컨트롤 섹션 */
.board-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 15px;
}

.filter-section {
  display: flex;
  gap: 12px;
}

.category-filter,
.sort-filter {
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  font-size: 0.95rem;
  cursor: pointer;
}

.search-section {
  display: flex;
  gap: 8px;
}

.search-input {
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  width: 250px;
  font-size: 0.95rem;
}

.search-btn {
  padding: 10px 15px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
}

.search-btn:hover {
  background: #2980b9;
}

/* 게시글 목록 */
.posts-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.posts-header {
  display: grid;
  grid-template-columns: 80px 100px 1fr 120px 120px 80px 80px;
  background: #f8f9fa;
  padding: 15px 20px;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 2px solid #e9ecef;
}

.post-item {
  display: grid;
  grid-template-columns: 80px 100px 1fr 120px 120px 80px 80px;
  padding: 15px 20px;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.3s;
}

.post-item:hover {
  background: #f8f9fa;
}

.post-item.notice {
  background: #fff9e6;
  border-left: 4px solid #ffc107;
}

.post-number {
  text-align: center;
  color: #666;
  font-weight: 500;
}

.post-category {
  text-align: center;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  color: white;
}

.category-일상 { background: #28a745; }
.category-질문 { background: #17a2b8; }
.category-정보 { background: #6f42c1; }
.category-토론 { background: #fd7e14; }
.category-기타 { background: #6c757d; }

.notice-badge {
  background: #ffc107 !important;
  color: #856404 !important;
}

.post-title {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #2c3e50;
  font-weight: 500;
}

.post-title:hover .title-text {
  color: #3498db;
}

.new-badge {
  background: #e74c3c;
  color: white;
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: bold;
}

.hot-badge {
  font-size: 0.9rem;
}

.comment-count {
  color: #e74c3c;
  font-weight: 600;
  font-size: 0.9rem;
}

.post-author {
  text-align: center;
  color: #666;
}

.post-date {
  text-align: center;
  color: #666;
  font-size: 0.9rem;
}

.post-views,
.post-likes {
  text-align: center;
  color: #666;
  font-size: 0.9rem;
}

/* 빈 상태 */
.no-posts {
  padding: 60px 20px;
  text-align: center;
}

.empty-state {
  max-width: 400px;
  margin: 0 auto;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state h3 {
  color: #2c3e50;
  margin-bottom: 12px;
  font-size: 1.5rem;
}

.empty-state p {
  color: #666;
  margin-bottom: 24px;
  font-size: 1.1rem;
}

.write-first-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.write-first-btn:hover {
  background: #2980b9;
}

/* 페이지네이션 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 40px;
}

.page-btn {
  padding: 10px 15px;
  border: 1px solid #ddd;
  background: white;
  color: #666;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.page-btn:hover:not(:disabled) {
  background: #f8f9fa;
  border-color: #3498db;
  color: #3498db;
}

.page-btn.active {
  background: #3498db;
  color: white;
  border-color: #3498db;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 모달 */
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
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.write-modal {
  max-width: 800px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h2 {
  color: #2c3e50;
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s;
}

.close-btn:hover {
  background: #f8f9fa;
}

.modal-body {
  padding: 20px 24px;
}

/* 글쓰기 폼 */
.write-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #2c3e50;
}

.form-input,
.form-select,
.form-textarea {
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3498db;
}

.form-textarea {
  resize: vertical;
  min-height: 150px;
  font-family: inherit;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}

.cancel-btn {
  padding: 12px 24px;
  border: 1px solid #ddd;
  background: white;
  color: #666;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.cancel-btn:hover {
  background: #f8f9fa;
}

.submit-btn {
  padding: 12px 24px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.submit-btn:hover {
  background: #2980b9;
}

/* 프로필 메뉴 스타일 */
.user-profile {
  position: relative;
}

.profile-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 8px;
  transition: background 0.3s;
}

.profile-dropdown:hover {
  background: #f8f9fa;
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
  font-weight: 600;
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
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border: 1px solid #e9ecef;
  min-width: 200px;
  z-index: 1000;
  overflow: hidden;
  margin-top: 4px;
}

.profile-info {
  padding: 16px;
  background: #f8f9fa;
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
  color: #2c3e50;
  text-decoration: none;
  transition: background 0.3s;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
}

.profile-menu-item:hover {
  background: #f8f9fa;
}

.profile-menu-item.withdraw-item {
  color: #e74c3c;
}

.profile-menu-item.withdraw-item:hover {
  background: rgba(231, 76, 60, 0.1);
}

/* 인증 폼 스타일 */
.auth-form {
  padding: 20px 0;
}

.auth-form .form-group {
  margin-bottom: 20px;
}

.auth-form label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #2c3e50;
}

.auth-form input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.auth-form input:focus {
  outline: none;
  border-color: #3498db;
}

.nickname-input-wrapper,
.email-input-wrapper {
  display: flex;
  gap: 8px;
}

.nickname-input-wrapper input,
.email-input-wrapper input {
  flex: 1;
}

.nickname-check-btn,
.email-check-btn {
  padding: 12px 16px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.3s;
}

.nickname-check-btn:hover:not(:disabled),
.email-check-btn:hover:not(:disabled) {
  background: #5a6268;
}

.nickname-check-btn:disabled,
.email-check-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.nickname-message,
.email-message {
  margin-top: 6px;
  font-size: 0.85rem;
  padding: 4px 8px;
  border-radius: 4px;
}

.nickname-message.success,
.email-message.success {
  color: #28a745;
  background: rgba(40, 167, 69, 0.1);
}

.nickname-message.error,
.email-message.error {
  color: #dc3545;
  background: rgba(220, 53, 69, 0.1);
}

.error-message {
  color: #dc3545;
  background: rgba(220, 53, 69, 0.1);
  padding: 8px 12px;
  border-radius: 6px;
  margin: 10px 0;
  font-size: 0.9rem;
}

.modal-footer {
  text-align: center;
  padding-top: 15px;
  border-top: 1px solid #e9ecef;
  margin-top: 20px;
}

.modal-footer a {
  color: #3498db;
  text-decoration: none;
}

.modal-footer a:hover {
  text-decoration: underline;
}

/* 회원탈퇴 모달 스타일 */
.withdraw-modal {
  max-width: 500px;
}

.withdraw-content {
  padding: 20px;
  text-align: center;
}

.warning-icon {
  font-size: 3rem;
  margin-bottom: 15px;
}

.withdraw-warnings {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 15px;
  margin: 20px 0;
  text-align: left;
}

.withdraw-warnings ul {
  margin: 10px 0;
  padding-left: 20px;
}

.withdraw-notice {
  color: #e74c3c;
  font-weight: 600;
  margin-top: 15px;
}

.withdraw-confirmation {
  margin: 20px 0;
}

.withdraw-input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  margin-top: 10px;
}

.withdraw-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  padding: 20px;
  border-top: 1px solid #e9ecef;
}

.withdraw-btn {
  padding: 12px 24px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.withdraw-btn:hover:not(:disabled) {
  background: #c0392b;
}

.withdraw-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .board-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-section,
  .search-section {
    justify-content: center;
  }
  
  .search-input {
    width: 200px;
  }
  
  .posts-header,
  .post-item {
    grid-template-columns: 60px 80px 1fr 80px;
  }
  
  .post-author,
  .post-views,
  .post-likes {
    display: none;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style> 