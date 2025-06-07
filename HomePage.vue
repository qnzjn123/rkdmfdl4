<template>
  <div>
    <!-- 관리자 페이지 -->
    <AdminPage 
      v-if="currentPage === 'admin'"
      :posts="blogPosts"
      @back-to-blog="goToBlog"
      @post-saved="handleNewPost"
      @post-deleted="handleDeletePost"
      @post-updated="handleUpdatePost"
      @refresh-posts="handleRefreshPosts"
    />
    
    <!-- 게시글 상세 페이지 -->
    <div v-else-if="currentPage === 'detail' && selectedPost">
      <nav class="navbar">
        <div class="nav-container">
          <div class="nav-left">
            <span class="blog-title">임가을 블로그</span>
          </div>
          
          <!-- 모바일 메뉴 버튼 -->
          <button @click="toggleMobileMenu" class="mobile-menu-btn" v-if="isMobile">
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
          </button>
          
          <!-- 데스크탑 메뉴 -->
          <div class="nav-menu" :class="{ 'mobile-hidden': isMobile }">
            <router-link to="/" class="nav-link">홈</router-link>
            <a href="#" class="nav-link" @click="goBack">← 목록으로</a>
          </div>
          
          <!-- 모바일 메뉴 오버레이 -->
          <div v-if="isMobile && showMobileMenu" class="mobile-menu-overlay" @click="closeMobileMenu">
            <div class="mobile-menu" @click.stop>
              <div class="mobile-menu-header">
                <span class="mobile-menu-title">메뉴</span>
                <button @click="closeMobileMenu" class="mobile-menu-close">×</button>
              </div>
              <div class="mobile-menu-items">
                <router-link to="/" class="mobile-nav-link" @click="closeMobileMenu">홈</router-link>
                <a href="#" class="mobile-nav-link" @click="goBack; closeMobileMenu">← 목록으로</a>
              </div>
            </div>
          </div>
          <!-- 인증 메뉴 -->
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

      <!-- 상세 페이지 콘텐츠 (기존 코드와 동일) -->
      <div class="detail-content">
        <div class="container">
          <article class="post-detail">
            <header class="post-header">
              <div class="post-category-detail">{{ selectedPost.category }}</div>
              <h1 class="post-title-detail">{{ selectedPost.title }}</h1>
              <div class="post-meta-detail">
                <span class="post-date-detail">{{ formatDate(selectedPost.date) }}</span>
                <span class="post-views-detail">조회 {{ selectedPost.views }}</span>
                <div class="post-actions-detail">
                  <button 
                    @click="toggleLike(selectedPost)" 
                    :class="['like-btn-detail', { 'liked': isLiked(selectedPost.id), 'not-logged-in': !isLoggedIn }]"
                    :title="isLoggedIn ? (isLiked(selectedPost.id) ? '좋아요 취소' : '좋아요') : '로그인이 필요합니다'"
                  >
                    <span class="heart-icon-detail">{{ isLiked(selectedPost.id) ? '❤️' : '🤍' }}</span>
                    <span class="like-count-detail">좋아요 {{ selectedPost.likes || 0 }}개</span>
                  </button>
                </div>
              </div>
              <div v-if="selectedPost.tags && selectedPost.tags.length > 0" class="post-tags-detail">
                <span v-for="tag in selectedPost.tags" :key="tag" class="tag-detail">
                  {{ tag }}
                </span>
              </div>
            </header>

            <div v-if="selectedPost.images && selectedPost.images.length > 0" class="post-images-container">
              <div class="post-images-grid">
                <div v-for="(image, index) in selectedPost.images" :key="index" class="post-image-item">
                  <img :src="image.url" :alt="`${selectedPost.title} 이미지 ${index + 1}`" class="post-detail-image">
                </div>
              </div>
            </div>

            <div class="post-content-detail">
              <div class="post-text" v-html="formatContent(selectedPost.content)"></div>
            </div>

            <!-- 댓글 섹션 -->
            <section class="comments-section">
              <div class="comments-header">
                <h3>댓글 {{ postComments.length }}개</h3>
              </div>

              <!-- 댓글 작성 폼 -->
              <div v-if="isLoggedIn" class="comment-form">
                <div class="comment-author-info">
                  <div class="comment-avatar">
                    <span>{{ currentUser.nickname.charAt(0) }}</span>
                  </div>
                  <span class="comment-author-name">{{ currentUser.nickname }}</span>
                </div>
                <textarea 
                  v-model="newComment" 
                  placeholder="댓글을 작성해주세요..."
                  class="comment-input"
                  rows="3"
                  @input="checkCommentValidation"
                ></textarea>
                <!-- 실시간 욕설 필터링 상태 표시 -->
                <div v-if="newComment.trim()" class="comment-validation-status">
                  <div v-if="currentCommentValidation.hasProfanity" class="validation-error">
                    ⚠️ 부적절한 언어가 포함되어 있습니다: {{ currentCommentValidation.detectedWords.join(', ') }}
                  </div>
                  <div v-else-if="newComment.trim().length > 0" class="validation-success">
                    ✅ 사용 가능한 댓글입니다
                  </div>
                </div>
                <div class="comment-form-actions">
                  <div class="comment-limit-info">
                    <span v-if="remainingComments > 0" class="remaining-comments">
                      오늘 {{ remainingComments }}개 더 작성 가능
                    </span>
                    <span v-else class="limit-reached">
                      오늘 댓글 작성 한도를 모두 사용했습니다
                    </span>
                  </div>
                  <button 
                    @click="submitComment" 
                    :disabled="!newComment.trim() || remainingComments <= 0"
                    class="comment-submit-btn"
                  >
                    댓글 작성
                  </button>
                </div>
              </div>
              
              <!-- 로그인하지 않은 경우 -->
              <div v-else class="comment-login-prompt">
                <p>댓글을 작성하려면 <button @click="showLoginModal" class="login-link">로그인</button>이 필요합니다.</p>
              </div>

              <!-- 댓글 목록 -->
              <div class="comments-list">
                <div v-if="postComments.length === 0" class="no-comments">
                  <p>첫 번째 댓글을 작성해보세요!</p>
                </div>
                
                <div v-for="comment in postComments" :key="comment.id" class="comment-item">
                  <div class="comment-header">
                    <div class="comment-author-info">
                      <div class="comment-avatar">
                        <span>{{ comment.authorNickname.charAt(0) }}</span>
                      </div>
                      <div class="comment-meta">
                        <span class="comment-author">{{ comment.authorNickname }}</span>
                        <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
                        <span v-if="comment.updatedAt && comment.updatedAt !== comment.createdAt" class="comment-edited">
                          (수정됨)
                        </span>
                      </div>
                    </div>
                    
                    <!-- 댓글 작성자만 수정/삭제 가능 -->
                    <div v-if="isLoggedIn && currentUser.id === comment.authorId" class="comment-actions">
                      <button 
                        @click="startEditComment(comment)" 
                        class="comment-edit-btn"
                        v-if="editingCommentId !== comment.id"
                      >
                        수정
                      </button>
                      <button 
                        @click="deleteComment(comment.id)" 
                        class="comment-delete-btn"
                        v-if="editingCommentId !== comment.id"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                  
                  <!-- 댓글 내용 (일반 상태) -->
                  <div v-if="editingCommentId !== comment.id" class="comment-content">
                    <p>{{ comment.content }}</p>
                  </div>
                  
                  <!-- 댓글 수정 폼 -->
                  <div v-else class="comment-edit-form">
                    <textarea 
                      v-model="editingCommentContent" 
                      class="comment-edit-input"
                      rows="3"
                    ></textarea>
                    <div class="comment-edit-actions">
                      <button 
                        @click="saveEditComment(comment.id)" 
                        :disabled="!editingCommentContent.trim()"
                        class="comment-save-btn"
                      >
                        저장
                      </button>
                      <button 
                        @click="cancelEditComment" 
                        class="comment-cancel-btn"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <footer class="post-footer">
              <button @click="goBack" class="back-to-list-btn">
                ← 목록으로 돌아가기
              </button>
            </footer>
          </article>
        </div>
      </div>
    </div>

    <!-- 블로그 페이지 -->
    <div v-else>
      <nav class="navbar">
        <div class="nav-container">
          <div class="nav-left">
            <span class="blog-title">임가을 블로그</span>
          </div>
          
          <!-- 모바일 메뉴 버튼 -->
          <button @click="toggleMobileMenu" class="mobile-menu-btn" v-if="isMobile">
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
          </button>
          
          <!-- 데스크탑 메뉴 -->
          <div class="nav-menu" :class="{ 'mobile-hidden': isMobile }">
            <router-link to="/" class="nav-link active">홈</router-link>
          </div>
          
          <!-- 모바일 메뉴 오버레이 -->
          <div v-if="isMobile && showMobileMenu" class="mobile-menu-overlay" @click="closeMobileMenu">
            <div class="mobile-menu" @click.stop>
              <div class="mobile-menu-header">
                <span class="mobile-menu-title">메뉴</span>
                <button @click="closeMobileMenu" class="mobile-menu-close">×</button>
              </div>
              <div class="mobile-menu-items">
                <router-link to="/" class="mobile-nav-link active" @click="closeMobileMenu">홈</router-link>
              </div>
            </div>
          </div>

          <!-- 인증 메뉴 -->
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


      
      <!-- 간단한 검색바 (홈페이지용) -->
      <div class="home-search-section">
        <div class="container">
          <div class="home-search-bar">
            <div class="home-search-wrapper">
              <input 
                type="text" 
                v-model="searchQuery" 
                @keyup.enter="goToSearch"
                placeholder="제목, 내용, 카테고리, 태그로 검색하세요..." 
                class="home-search-input"
              >
              <button @click="goToSearch" class="home-search-btn">
                🔍
              </button>
            </div>
            <!-- 검색 결과 정보 -->
            <div v-if="isSearchActive" class="search-info">
              <span class="search-result-count">
                "{{ searchQuery }}" 검색 결과: {{ filteredPosts.length }}개
              </span>
              <button @click="clearSearch" class="clear-search-btn-small">
                ✕ 초기화
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 인증 모달들 (기존 코드와 동일) -->
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
            <!-- 보안 정보 -->
            <div class="security-info-panel">
              <div class="security-info-title">
                🔒 보안 안내
              </div>
              <ul class="security-info-list">
                <li class="security-info-item">로그인 실패 5회 시 15분간 계정이 잠깁니다</li>
                <li class="security-info-item">30분 동안 활동이 없으면 자동 로그아웃됩니다</li>
                <li class="security-info-item">안전한 네트워크에서 접속해주세요</li>
              </ul>
            </div>
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
                minlength="8"
                @input="checkPasswordStrength"
              >
              <!-- 비밀번호 강도 표시기 -->
              <div v-if="signUpForm.password" class="password-strength">
                <div class="strength-meter">
                  <div 
                    :class="['strength-bar', passwordStrength]"
                    :style="{ width: getStrengthWidth() }"
                  ></div>
                </div>
                <div class="strength-text">
                  <span :class="['strength-label', passwordStrength]">
                    {{ getStrengthText() }}
                  </span>
                </div>
                <div v-if="passwordValidationErrors.length > 0" class="password-requirements">
                  <p class="requirements-title">비밀번호 요구사항:</p>
                  <ul>
                    <li v-for="error in passwordValidationErrors" :key="error" class="requirement-error">
                      {{ error }}
                    </li>
                  </ul>
                </div>
              </div>
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
      
      <!-- 블로그 콘텐츠 -->
      <div class="blog-content">
        <div class="container">
          <div class="blog-posts-grid">
            <div v-for="post in displayPosts" :key="post.id" class="post-card" @click="viewPostDetail(post)">
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
                <h3 class="post-title">{{ post.title }}</h3>
                <p class="post-excerpt">{{ getExcerpt(post.content) }}</p>
                <div class="post-meta">
                  <span class="post-date">{{ formatDate(post.date) }}</span>
                  <span class="post-views">조회 {{ post.views }}</span>
                  <div class="post-actions">
                    <button 
                      @click.stop="toggleLike(post)" 
                      :class="['like-btn', { 'liked': isLiked(post.id), 'not-logged-in': !isLoggedIn }]"
                      :title="isLoggedIn ? (isLiked(post.id) ? '좋아요 취소' : '좋아요') : '로그인이 필요합니다'"
                    >
                      <span class="heart-icon">{{ isLiked(post.id) ? '❤️' : '🤍' }}</span>
                      <span class="like-count">{{ post.likes || 0 }}</span>
                    </button>
                  </div>
                </div>
                <div v-if="post.tags && post.tags.length > 0" class="post-tags">
                  <span v-for="tag in post.tags.slice(0, 3)" :key="tag" class="tag">
                    {{ tag }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 글이 없을 때 또는 검색 결과가 없을 때 -->
          <div v-if="displayPosts.length === 0" class="no-posts">
            <div v-if="isSearchActive">
              <h3>검색 결과가 없습니다</h3>
              <p>"{{ searchQuery }}"에 대한 검색 결과를 찾을 수 없습니다.</p>
              <button @click="clearSearch" class="clear-search-button">
                전체 글 보기
              </button>
            </div>
            <div v-else>
              <h3>등록된 글이 없습니다</h3>
            </div>
          </div>

          <!-- 페이지네이션 -->
          <div v-if="totalPages > 1" class="pagination-container">
            <div class="pagination">
              <!-- 이전 페이지 버튼 -->
              <button 
                @click="goToPreviousPage"
                :disabled="paginationCurrentPage === 1"
                class="pagination-btn pagination-prev"
                :class="{ 'disabled': paginationCurrentPage === 1 }"
              >
                ‹ 이전
              </button>

              <!-- 페이지 번호들 -->
              <template v-for="pageNum in pageNumbers" :key="pageNum">
                <button 
                  v-if="shouldShowPageNumber(pageNum)"
                  @click="goToPage(pageNum)"
                  :class="['pagination-btn', 'pagination-number', { 'active': pageNum === paginationCurrentPage }]"
                >
                  {{ pageNum }}
                </button>
                <span v-if="shouldShowEllipsis(pageNum)" class="pagination-ellipsis">...</span>
              </template>

              <!-- 다음 페이지 버튼 -->
              <button 
                @click="goToNextPage"
                :disabled="paginationCurrentPage === totalPages"
                class="pagination-btn pagination-next"
                :class="{ 'disabled': paginationCurrentPage === totalPages }"
              >
                다음 ›
              </button>
            </div>

            <!-- 페이지 정보 -->
            <div class="pagination-info">
              <span>
                {{ (paginationCurrentPage - 1) * postsPerPage + 1 }} - 
                {{ Math.min(paginationCurrentPage * postsPerPage, allFilteredPosts.length) }} / 
                {{ allFilteredPosts.length }}개 게시글
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AdminPage from './AdminPage.vue'
import { db } from './firebase.js'
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  onSnapshot,
  orderBy,
  query,
  serverTimestamp
} from 'firebase/firestore'

export default {
  name: 'HomePage',
  components: {
    AdminPage
  },
  data() {
    return {
      currentPage: 'blog',
      blogPosts: [],
      selectedPost: null,
      searchQuery: '',
      // 모바일 관련 상태
      isMobile: false,
      showMobileMenu: false,
      // 검색 관련 상태
      isSearchActive: false,
      filteredPosts: [],
      // 페이지네이션 관련 상태
      paginationCurrentPage: 1,
      postsPerPage: 5,
      // 좋아요 관련 상태
      userLikes: {},
      // 인증 관련 상태
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
      withdrawError: '',
      // 방문자 추적 관련
      heartbeatInterval: null,
      // 댓글 관련
      comments: [], // 전체 댓글 데이터
      newComment: '', // 새 댓글 내용
      editingCommentId: null, // 현재 수정 중인 댓글 ID
      editingCommentContent: '', // 수정 중인 댓글 내용
      // 댓글 제한 관련
      commentLimits: {}, // 사용자별 일일 댓글 작성 횟수 추적 { userId: { date: '2024-01-01', count: 3 } }
      recentComments: {}, // 사용자별 최근 댓글 내용 (도배 방지용) { userId: ['댓글1', '댓글2', '댓글3'] }
      profanityWords: [
        // 기본 욕설 필터링 목록
        '바보', '멍청이', '개새끼', '씨발', '병신', '미친', '죽어', '꺼져', 
        '쓰레기', '바보같은', '멍청한', '개XX', '시X', 'XX놈', 'XX년',
        '한심한', '짜증나', '열받아', '닥쳐', '꺼지라', '죽어라',
        '개소리', '헛소리', '뻘소리', '개판', '망할', '엿먹어',
        '븅신', '또라이', '찐따', '루저', '노잼', '재미없어',
        // 추가 욕설
        '시발', '시팔', '씨팔', '시바', '개놈', '개년', '개새', '새끼',
        '지랄', '좆', '좆같은', '존나', '니미', '띠발', '개빡', '좆나',
        '개조센', '조센', 'ㅅㅂ', 'ㅆㅂ', 'ㅗ', 'ㅄ', '염병', '지랄맞은',
        '개걸레', '년놈', '새끼야', '죽일놈', '개자식', '뒤지다', 'fuck',
        'shit', 'damn', 'bitch', '개머저리', '지잡', '느금마', '니엄마'
      ],
      maxDailyComments: 3, // 하루 최대 댓글 수
      maxRecentComments: 3, // 도배 방지를 위한 최근 댓글 저장 개수
      // 실시간 댓글 검증
      currentCommentValidation: {
        hasProfanity: false,
        detectedWords: []
      },

      // 보안 관련
      loginAttempts: {}, // 로그인 시도 횟수 추적
      lockedAccounts: {}, // 잠긴 계정 목록
      sessionTimeout: 30 * 60 * 1000, // 30분 (밀리초)
      lastActivityTime: null,
      sessionTimeoutInterval: null,
      maxLoginAttempts: 5, // 최대 로그인 시도 횟수
      lockoutDuration: 15 * 60 * 1000, // 15분 잠금 (밀리초)
      // 비밀번호 강도 관련
      passwordStrength: '',
      passwordValidationErrors: [],
      
      // Firebase 관련
      isFirebaseEnabled: true,
      unsubscribePosts: null,
      unsubscribeComments: null,
      loadingPosts: false,
      firebaseError: null
    }
  },
  computed: {
    // 검색/필터링된 전체 게시글 (페이지네이션 적용 전)
    allFilteredPosts() {
      return this.isSearchActive ? this.filteredPosts : this.blogPosts
    },
    // 현재 페이지에 표시할 게시글 (페이지네이션 적용)
    displayPosts() {
      const startIndex = (this.paginationCurrentPage - 1) * this.postsPerPage
      const endIndex = startIndex + this.postsPerPage
      return this.allFilteredPosts.slice(startIndex, endIndex)
    },
    // 전체 페이지 수
    totalPages() {
      return Math.ceil(this.allFilteredPosts.length / this.postsPerPage)
    },
    // 페이지 번호 배열 (표시할 페이지 번호들)
    pageNumbers() {
      const pages = []
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i)
      }
      return pages
    },
    // 현재 게시글의 댓글만 필터링
    postComments() {
      if (!this.selectedPost) return []
      return this.comments
        .filter(comment => comment.postId === this.selectedPost.id)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    },
    // 오늘 남은 댓글 작성 수
    remainingComments() {
      if (!this.isLoggedIn || !this.currentUser) return 0
      
      const today = new Date().toDateString()
      const userId = this.currentUser.id
      
      if (!this.commentLimits[userId] || this.commentLimits[userId].date !== today) {
        return this.maxDailyComments
      }
      
      return this.maxDailyComments - this.commentLimits[userId].count
    }
  },
  async mounted() {
    // Firebase 사용 여부 확인 및 초기화
    if (this.isFirebaseEnabled) {
      await this.initializeFirebase()
    } else {
      // Firebase 미사용시 기존 방식
      this.loadPostsFromStorage()
      this.loadCommentsFromStorage()
    }
    
    await this.loadUsersFromStorage() // 비밀번호 마이그레이션을 위해 await
    this.loadAuthState()
    this.loadLikesFromStorage()
    this.loadCommentLimitsFromStorage()
    this.loadSecurityDataFromStorage()
    
    // 모바일 환경 감지
    this.checkMobileDevice()
    window.addEventListener('resize', this.checkMobileDevice)
    
    // 로그인 상태이면 세션 타임아웃 시작
    if (this.isLoggedIn) {
      this.initSessionTimeout()
    }
    
    // 실제 방문자 추적 시작
    this.initializeVisitorTracking()
    
    document.addEventListener('keydown', this.handleKeydown)
    document.addEventListener('click', this.handleOutsideClick)
    
    // 로그인 상태 실시간 동기화
    window.addEventListener('storage', this.handleStorageChange)
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleKeydown)
    document.removeEventListener('click', this.handleOutsideClick)
    window.removeEventListener('storage', this.handleStorageChange)
    window.removeEventListener('resize', this.checkMobileDevice)
    
    // Firebase 리스너 정리
    if (this.unsubscribePosts) {
      this.unsubscribePosts()
    }
    if (this.unsubscribeComments) {
      this.unsubscribeComments()
    }
    
    // 방문자 추적 정리
    this.stopHeartbeat()
    // 세션 타임아웃 정리
    this.clearSessionTimeout()
  },
  methods: {
    // Firebase 관련 메서드들
    async initializeFirebase() {
      try {
        this.loadingPosts = true
        console.log('Firebase 초기화 중...')
        
        // 데모 설정인 경우 Firebase 비활성화
        if (db._delegate && db._delegate._databaseId && db._delegate._databaseId.projectId === 'demo-project-id') {
          console.log('데모 설정 감지됨. localStorage 모드로 전환합니다.')
          this.isFirebaseEnabled = false
          this.loadPostsFromStorage()
          this.loadCommentsFromStorage()
          return
        }
        
        // Firebase 연결 테스트
        await getDocs(query(collection(db, 'posts'), orderBy('date', 'desc')))
        
        // 게시글 실시간 리스너 설정
        const postsQuery = query(collection(db, 'posts'), orderBy('date', 'desc'))
        this.unsubscribePosts = onSnapshot(postsQuery, (snapshot) => {
          const posts = []
          snapshot.forEach((doc) => {
            const data = doc.data()
            posts.push({
              id: doc.id,
              ...data,
              date: data.date?.toDate?.() || new Date(data.date)
            })
          })
          this.blogPosts = posts
          console.log(`Firebase에서 ${posts.length}개 게시글 로드됨`)
        }, (error) => {
          console.error('게시글 로드 오류:', error)
          this.firebaseError = error.message
          this.isFirebaseEnabled = false
          // 오류 시 localStorage로 폴백
          this.loadPostsFromStorage()
        })
        
        // 댓글 실시간 리스너 설정
        const commentsQuery = query(collection(db, 'comments'), orderBy('createdAt', 'asc'))
        this.unsubscribeComments = onSnapshot(commentsQuery, (snapshot) => {
          const comments = []
          snapshot.forEach((doc) => {
            const data = doc.data()
            comments.push({
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
              updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt)
            })
          })
          this.comments = comments
          console.log(`Firebase에서 ${comments.length}개 댓글 로드됨`)
        }, (error) => {
          console.error('댓글 로드 오류:', error)
          this.isFirebaseEnabled = false
          // 오류 시 localStorage로 폴백
          this.loadCommentsFromStorage()
        })
        
        console.log('Firebase 실시간 동기화가 활성화되었습니다!')
        
      } catch (error) {
        console.error('Firebase 초기화 오류:', error)
        console.log('localStorage 모드로 전환합니다.')
        this.firebaseError = error.message
        this.isFirebaseEnabled = false
        // Firebase 오류 시 localStorage로 폴백
        this.loadPostsFromStorage()
        this.loadCommentsFromStorage()
      } finally {
        this.loadingPosts = false
      }
    },
    
    async savePostToFirebase(post) {
      if (!this.isFirebaseEnabled) {
        this.savePostsToStorage()
        return
      }
      
      try {
        const postData = {
          ...post,
          date: serverTimestamp()
        }
        delete postData.id // Firestore에서 자동 생성
        
        const docRef = await addDoc(collection(db, 'posts'), postData)
        console.log('게시글이 Firebase에 저장됨:', docRef.id)
        return docRef.id
      } catch (error) {
        console.error('게시글 저장 오류:', error)
        // 오류 시 localStorage로 폴백
        this.savePostsToStorage()
        throw error
      }
    },
    
    async updatePostInFirebase(postId, updates) {
      if (!this.isFirebaseEnabled) {
        this.savePostsToStorage()
        return
      }
      
      try {
        const postRef = doc(db, 'posts', postId)
        await updateDoc(postRef, {
          ...updates,
          updatedAt: serverTimestamp()
        })
        console.log('게시글이 Firebase에서 업데이트됨:', postId)
      } catch (error) {
        console.error('게시글 업데이트 오류:', error)
        // 오류 시 localStorage로 폴백
        this.savePostsToStorage()
        throw error
      }
    },
    
    async deletePostFromFirebase(postId) {
      if (!this.isFirebaseEnabled) {
        this.savePostsToStorage()
        return
      }
      
      try {
        await deleteDoc(doc(db, 'posts', postId))
        console.log('게시글이 Firebase에서 삭제됨:', postId)
      } catch (error) {
        console.error('게시글 삭제 오류:', error)
        // 오류 시 localStorage로 폴백
        this.savePostsToStorage()
        throw error
      }
    },
    
    async saveCommentToFirebase(comment) {
      if (!this.isFirebaseEnabled) {
        this.saveCommentsToStorage()
        return
      }
      
      try {
        const commentData = {
          ...comment,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }
        delete commentData.id // Firestore에서 자동 생성
        
        const docRef = await addDoc(collection(db, 'comments'), commentData)
        console.log('댓글이 Firebase에 저장됨:', docRef.id)
        return docRef.id
      } catch (error) {
        console.error('댓글 저장 오류:', error)
        // 오류 시 localStorage로 폴백
        this.saveCommentsToStorage()
        throw error
      }
    },
    
    async updateCommentInFirebase(commentId, updates) {
      if (!this.isFirebaseEnabled) {
        this.saveCommentsToStorage()
        return
      }
      
      try {
        const commentRef = doc(db, 'comments', commentId)
        await updateDoc(commentRef, {
          ...updates,
          updatedAt: serverTimestamp()
        })
        console.log('댓글이 Firebase에서 업데이트됨:', commentId)
      } catch (error) {
        console.error('댓글 업데이트 오류:', error)
        // 오류 시 localStorage로 폴백
        this.saveCommentsToStorage()
        throw error
      }
    },
    
    async deleteCommentFromFirebase(commentId) {
      if (!this.isFirebaseEnabled) {
        this.saveCommentsToStorage()
        return
      }
      
      try {
        await deleteDoc(doc(db, 'comments', commentId))
        console.log('댓글이 Firebase에서 삭제됨:', commentId)
      } catch (error) {
        console.error('댓글 삭제 오류:', error)
        // 오류 시 localStorage로 폴백
        this.saveCommentsToStorage()
        throw error
      }
    },
    
    goToSearch() {
      if (this.searchQuery.trim()) {
        // 검색어가 있으면 현재 페이지에서 직접 검색
        this.handleSearch()
      } else {
        this.$router.push('/search')
      }
    },
    handleSearch() {
      const query = this.searchQuery.trim().toLowerCase()
      
      if (!query) {
        this.clearSearch()
        return
      }
      
      this.isSearchActive = true
      this.paginationCurrentPage = 1 // 검색 시 첫 페이지로 이동
      this.filteredPosts = this.blogPosts.filter(post => {
        const searchTerm = query.toLowerCase()
        
        // 제목에서 검색
        const titleMatch = post.title.toLowerCase().includes(searchTerm)
        
        // 내용에서 검색
        const contentMatch = post.content.toLowerCase().includes(searchTerm)
        
        // 카테고리에서 검색
        const categoryMatch = post.category && post.category.toLowerCase().includes(searchTerm)
        
        // 태그에서 검색
        const tagMatch = post.tags && post.tags.some(tag => 
          tag.toLowerCase().includes(searchTerm)
        )
        
        return titleMatch || contentMatch || categoryMatch || tagMatch
      })
      
      console.log(`검색어 "${query}" 검색 결과: ${this.filteredPosts.length}개`)
    },
    
    clearSearch() {
      this.searchQuery = ''
      this.isSearchActive = false
      this.filteredPosts = []
      this.paginationCurrentPage = 1 // 검색 초기화시 첫 페이지로
      console.log('검색 초기화')
    },
    
    // 모바일 관련 메서드들
    checkMobileDevice() {
      this.isMobile = window.innerWidth <= 768
    },
    toggleMobileMenu() {
      this.showMobileMenu = !this.showMobileMenu
    },
    closeMobileMenu() {
      this.showMobileMenu = false
    },
    
    // 페이지네이션 관련 메서드들
    goToPage(pageNumber) {
      if (pageNumber >= 1 && pageNumber <= this.totalPages) {
        this.paginationCurrentPage = pageNumber
        // 페이지 변경시 스크롤을 위로 이동
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    },
    goToPreviousPage() {
      if (this.paginationCurrentPage > 1) {
        this.goToPage(this.paginationCurrentPage - 1)
      }
    },
    goToNextPage() {
      if (this.paginationCurrentPage < this.totalPages) {
        this.goToPage(this.paginationCurrentPage + 1)
      }
    },
    resetPagination() {
      this.paginationCurrentPage = 1
    },
    // 페이지 번호를 표시할지 결정하는 메서드
    shouldShowPageNumber(pageNum) {
      const current = this.paginationCurrentPage
      const total = this.totalPages
      
      // 총 페이지가 7개 이하면 모든 페이지 표시
      if (total <= 7) return true
      
      // 첫 페이지와 마지막 페이지는 항상 표시
      if (pageNum === 1 || pageNum === total) return true
      
      // 현재 페이지 주변 2개씩 표시
      if (Math.abs(pageNum - current) <= 2) return true
      
      return false
    },
    // 생략 표시(...)를 보여줄지 결정하는 메서드
    shouldShowEllipsis(pageNum) {
      const current = this.paginationCurrentPage
      const total = this.totalPages
      
      // 총 페이지가 7개 이하면 생략 표시 안함
      if (total <= 7) return false
      
      // 첫 번째 생략 표시 (1과 현재 페이지 사이)
      if (pageNum === 1 && current > 4) return true
      
      // 두 번째 생략 표시 (현재 페이지와 마지막 페이지 사이)
      if (pageNum === total && current < total - 3) return true
      
      return false
    },
    // 기존 메서드들 (App.vue에서 복사)
    goHome() {
      this.currentPage = 'blog'
      this.selectedPost = null
    },
    goToAdmin() {
      this.currentPage = 'admin'
    },
    goToBlog() {
      this.currentPage = 'blog'
      this.selectedPost = null
    },
    viewPostDetail(post) {
      this.selectedPost = { ...post }
      const postIndex = this.blogPosts.findIndex(p => p.id === post.id)
      if (postIndex !== -1) {
        this.blogPosts[postIndex].views = (this.blogPosts[postIndex].views || 0) + 1
        this.savePostsToStorage()
      }
      this.currentPage = 'detail'
    },
    goBack() {
      this.currentPage = 'blog'
      this.selectedPost = null
    },
    formatContent(content) {
      return content.replace(/\n/g, '<br>')
    },
    getExcerpt(content) {
      return content.length > 100 ? content.substring(0, 100) + '...' : content
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('ko-KR')
    },
    // 좋아요 관련 메서드들
    isLiked(postId) {
      try {
        if (!this.isLoggedIn || !this.currentUser) return false
        const userKey = `user_${this.currentUser.id}`
        return this.userLikes[userKey] && this.userLikes[userKey][postId]
      } catch (error) {
        console.error('좋아요 상태 확인 중 오류:', error)
        return false
      }
    },
    toggleLike(post) {
      if (!this.isLoggedIn) {
        this.showLoginModal()
        return
      }
      
      try {
        const userKey = `user_${this.currentUser.id}`
        
        if (!this.userLikes[userKey]) {
          this.userLikes[userKey] = {}
        }
        
        const isCurrentlyLiked = this.userLikes[userKey][post.id]
        this.userLikes[userKey][post.id] = !isCurrentlyLiked
        
        const postIndex = this.blogPosts.findIndex(p => p.id === post.id)
        if (postIndex !== -1) {
          if (!this.blogPosts[postIndex].likes) {
            this.blogPosts[postIndex].likes = 0
          }
          
          this.blogPosts[postIndex].likes += isCurrentlyLiked ? -1 : 1
          
          if (this.selectedPost && this.selectedPost.id === post.id) {
            this.selectedPost.likes = this.blogPosts[postIndex].likes
          }
        }
        
        this.saveLikesToStorage()
        this.savePostsToStorage()
      } catch (error) {
        console.error('좋아요 처리 중 오류:', error)
      }
    },
    // 인증 관련 메서드들
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
    async generateTempPassword() {
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
        
        // 사용자 데이터베이스에 임시 비밀번호 저장 (해싱)
        const userIndex = this.users.findIndex(u => u.email === this.resetEmail)
        if (userIndex !== -1) {
          const hashedTempPassword = await this.hashPassword(this.tempPassword)
          this.users[userIndex].password = hashedTempPassword
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
    async handleLogin() {
      this.loginError = ''
      
      try {
        // 입력값 검증
        const emailValidation = this.validateInput(this.loginForm.email, 'email')
        if (!emailValidation.isValid) {
          this.loginError = emailValidation.message
          return
        }
        
        // 계정 잠금 상태 확인
        if (this.isAccountLocked(this.loginForm.email)) {
          const remainingTime = this.getRemainingLockTime(this.loginForm.email)
          this.loginError = `계정이 잠겨있습니다. ${remainingTime}분 후에 다시 시도해주세요.`
          return
        }
        
        const user = this.users.find(u => u.email === this.loginForm.email)
        
        if (!user) {
          this.trackLoginAttempt(this.loginForm.email, false)
          this.loginError = '등록되지 않은 이메일입니다.'
          return
        }
        
        // 비밀번호 검증 (해시된 비밀번호와 비교)
        const hashedPassword = await this.hashPassword(this.loginForm.password)
        if (user.password !== hashedPassword) {
          this.trackLoginAttempt(this.loginForm.email, false)
          const attempts = this.loginAttempts[this.loginForm.email]?.count || 0
          const remaining = this.maxLoginAttempts - attempts
          this.loginError = `비밀번호가 일치하지 않습니다. (${remaining}회 남음)`
          return
        }
        
        // 로그인 성공
        this.trackLoginAttempt(this.loginForm.email, true)
        this.currentUser = user
        this.isLoggedIn = true
        this.saveAuthState()
        this.initSessionTimeout() // 세션 타임아웃 시작
        this.closeLoginModal()
        
        console.log('로그인 성공:', user.nickname)
      } catch (error) {
        console.error('로그인 처리 중 오류:', error)
        this.loginError = '로그인 중 오류가 발생했습니다.'
      }
    },
    async handleSignUp() {
      this.signUpError = ''
      
      try {
        // 입력값 검증
        const nicknameValidation = this.validateInput(this.signUpForm.nickname, 'nickname')
        if (!nicknameValidation.isValid) {
          this.signUpError = nicknameValidation.message
          return
        }
        
        const emailValidation = this.validateInput(this.signUpForm.email, 'email')
        if (!emailValidation.isValid) {
          this.signUpError = emailValidation.message
          return
        }
        
        // 닉네임 중복 검사 확인
        if (!this.isNicknameChecked) {
          this.signUpError = '닉네임 중복 확인을 완료해주세요.'
          return
        }
        
        if (!this.isNicknameAvailable) {
          this.signUpError = '사용할 수 없는 닉네임입니다.'
          return
        }
        
        // 이메일 중복 검사 확인
        if (!this.isEmailChecked) {
          this.signUpError = '이메일 중복 확인을 완료해주세요.'
          return
        }
        
        if (!this.isEmailAvailable) {
          this.signUpError = '사용할 수 없는 이메일입니다.'
          return
        }
        
        // 비밀번호 강도 검증
        const passwordValidation = this.validatePasswordStrength(this.signUpForm.password)
        if (!passwordValidation.isValid) {
          this.signUpError = '비밀번호 강도가 부족합니다:\n' + passwordValidation.errors.join('\n')
          return
        }
        
        if (this.signUpForm.password !== this.signUpForm.confirmPassword) {
          this.signUpError = '비밀번호가 일치하지 않습니다.'
          return
        }
        
        // 비밀번호 해싱
        const hashedPassword = await this.hashPassword(this.signUpForm.password)
        
        const newUser = {
          id: Date.now(),
          nickname: this.sanitizeInput(this.signUpForm.nickname),
          email: this.signUpForm.email,
          password: hashedPassword,
          role: 'user', // 기본 역할
          createdAt: new Date()
        }
        
        this.users.push(newUser)
        this.saveUsersToStorage()
        
        this.currentUser = newUser
        this.isLoggedIn = true
        this.saveAuthState()
        this.initSessionTimeout() // 세션 타임아웃 시작
        this.closeSignUpModal()
        
        console.log('회원가입 성공:', newUser.nickname)
      } catch (error) {
        console.error('회원가입 처리 중 오류:', error)
        this.signUpError = '회원가입 중 오류가 발생했습니다.'
      }
    },
    // 닉네임 중복 검사 관련 메서드들
    checkNicknameDuplicate() {
      // 입력값 검증
      const validation = this.validateInput(this.signUpForm.nickname, 'nickname')
      if (!validation.isValid) {
        this.nicknameCheckMessage = validation.message
        this.isNicknameAvailable = false
        this.isNicknameChecked = false
        return
      }
      
      // 중복 검사
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
    // 이메일 중복 검사 관련 메서드들
    checkEmailDuplicate() {
      // 입력값 검증
      const validation = this.validateInput(this.signUpForm.email, 'email')
      if (!validation.isValid) {
        this.emailCheckMessage = validation.message
        this.isEmailAvailable = false
        this.isEmailChecked = false
        return
      }
      
      // 중복 검사
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
      this.clearSessionTimeout() // 세션 타임아웃 정리
      localStorage.removeItem('currentUser')
      localStorage.removeItem('isLoggedIn')
      console.log('로그아웃 완료')
    },
    toggleProfileMenu() {
      this.showProfileMenu = !this.showProfileMenu
    },
    handleOutsideClick(event) {
      if (!event.target.closest('.user-profile')) {
        this.showProfileMenu = false
      }
    },
    handleKeydown(event) {
      if (event.altKey && event.key === 'l') {
        event.preventDefault()
        this.goToAdmin()
      }
    },
    // 관리자 페이지 이벤트 핸들러들
    async handleNewPost(post) {
      try {
        // Firebase에 게시글 저장 (실시간 동기화)
        if (this.isFirebaseEnabled) {
          await this.savePostToFirebase(post)
        } else {
          // Firebase 미사용시 기존 방식
          this.blogPosts.unshift(post)
          this.savePostsToStorage()
        }
        
        this.resetPagination() // 새 글 추가시 첫 페이지로
        console.log('새 게시글이 저장되었습니다.')
      } catch (error) {
        console.error('게시글 저장 중 오류:', error)
        alert('게시글 저장 중 오류가 발생했습니다.')
      }
    },
    async handleDeletePost(postId) {
      try {
        // Firebase에서 게시글 삭제 (실시간 동기화)
        if (this.isFirebaseEnabled) {
          await this.deletePostFromFirebase(postId)
        } else {
          // Firebase 미사용시 기존 방식
          this.blogPosts = this.blogPosts.filter(post => post.id !== postId)
          this.savePostsToStorage()
        }
        
        // 삭제 후 현재 페이지가 범위를 벗어나면 조정
        if (this.paginationCurrentPage > this.totalPages && this.totalPages > 0) {
          this.paginationCurrentPage = this.totalPages
        }
        
        console.log('게시글이 삭제되었습니다.')
      } catch (error) {
        console.error('게시글 삭제 중 오류:', error)
        alert('게시글 삭제 중 오류가 발생했습니다.')
      }
    },
    async handleUpdatePost(updatedPost) {
      try {
        // Firebase에서 게시글 업데이트 (실시간 동기화)
        if (this.isFirebaseEnabled) {
          await this.updatePostInFirebase(updatedPost.id, updatedPost)
        } else {
          // Firebase 미사용시 기존 방식
          const index = this.blogPosts.findIndex(post => post.id === updatedPost.id)
          if (index !== -1) {
            this.blogPosts[index] = updatedPost
            this.savePostsToStorage()
          }
        }
        
        console.log('게시글이 수정되었습니다.')
      } catch (error) {
        console.error('게시글 수정 중 오류:', error)
        alert('게시글 수정 중 오류가 발생했습니다.')
      }
    },
    handleRefreshPosts() {
      this.loadPostsFromStorage()
    },
    // 로컬 스토리지 관련 메서드들
    savePostsToStorage() {
      try {
        localStorage.setItem('blogPosts', JSON.stringify(this.blogPosts))
      } catch (error) {
        console.error('게시글 저장 중 오류:', error)
      }
    },
    loadPostsFromStorage() {
      try {
        const savedPosts = localStorage.getItem('blogPosts')
        if (savedPosts) {
          this.blogPosts = JSON.parse(savedPosts)
        }
      } catch (error) {
        console.error('게시글 로드 중 오류:', error)
      }
    },
    saveUsersToStorage() {
      try {
        localStorage.setItem('users', JSON.stringify(this.users))
      } catch (error) {
        console.error('사용자 데이터 저장 중 오류:', error)
      }
    },
    async loadUsersFromStorage() {
      try {
        const savedUsers = localStorage.getItem('users')
        if (savedUsers) {
          this.users = JSON.parse(savedUsers)
          
          // 기존 사용자 데이터 마이그레이션
          let needsMigration = false
          
          for (let user of this.users) {
            // name -> nickname 마이그레이션
            if (!user.nickname && user.name) {
              user.nickname = user.name
              needsMigration = true
            }
            
            // role 추가 (기본값: user)
            if (!user.role) {
              user.role = 'user'
              needsMigration = true
            }
            
            // 비밀번호 해싱 (평문 비밀번호를 해시로 변환)
            if (user.password && user.password.length < 32) { // 해시되지 않은 비밀번호 감지
              try {
                user.password = await this.hashPassword(user.password)
                needsMigration = true
              } catch (error) {
                console.error('비밀번호 마이그레이션 중 오류:', error)
              }
            }
          }
          
          // 마이그레이션이 필요한 경우 저장
          if (needsMigration) {
            this.saveUsersToStorage()
            console.log('사용자 데이터 마이그레이션 완료')
          }
        }
      } catch (error) {
        console.error('사용자 데이터 로드 중 오류:', error)
      }
    },
    saveAuthState() {
      try {
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser))
        localStorage.setItem('isLoggedIn', 'true')
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
          // 기존 사용자 데이터 마이그레이션 (name -> nickname)
          if (!this.currentUser.nickname && this.currentUser.name) {
            this.currentUser.nickname = this.currentUser.name
            this.saveAuthState()
          }
          this.isLoggedIn = true
        }
      } catch (error) {
        console.error('인증 상태 로드 중 오류:', error)
      }
    },
    // 로그인 상태 실시간 동기화
    handleStorageChange(event) {
      if (event.key === 'isLoggedIn' || event.key === 'currentUser') {
        console.log('로그인 상태 변경 감지, 상태 동기화 중...')
        this.loadAuthState()
      }
    },
    saveLikesToStorage() {
      try {
        localStorage.setItem('userLikes', JSON.stringify(this.userLikes))
      } catch (error) {
        console.error('좋아요 데이터 저장 중 오류:', error)
      }
    },
    loadLikesFromStorage() {
      try {
        const savedLikes = localStorage.getItem('userLikes')
        if (savedLikes) {
          this.userLikes = JSON.parse(savedLikes)
        }
      } catch (error) {
        console.error('좋아요 데이터 로드 중 오류:', error)
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
        
        // 해당 사용자가 작성한 댓글 삭제
        this.deleteUserComments(currentUserId)
        
        // 로그아웃 처리
        this.isLoggedIn = false
        this.currentUser = null
        localStorage.removeItem('currentUser')
        localStorage.removeItem('isLoggedIn')
        
        // 모달 닫기
        this.closeWithdrawModal()
        
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
        // 현재 사용자가 작성한 게시글 필터링해서 제거
        // 작성자 정보가 있는 경우에만 필터링 (기존 데이터 호환성 고려)
        this.blogPosts = this.blogPosts.filter(post => {
          if (post.authorId) {
            return post.authorId !== userId
          }
          if (post.author && this.currentUser && post.author === this.currentUser.nickname) {
            return false
          }
          return true
        })
        
        // 업데이트된 게시글 목록 저장
        this.savePostsToStorage()
        
        console.log('사용자 게시글 삭제 완료')
      } catch (error) {
        console.error('사용자 게시글 삭제 중 오류:', error)
      }
    },

    deleteUserComments(userId) {
      try {
        // 현재 사용자가 작성한 댓글 필터링해서 제거
        this.comments = this.comments.filter(comment => comment.authorId !== userId)
        
        // 업데이트된 댓글 목록 저장
        this.saveCommentsToStorage()
        
        console.log('사용자 댓글 삭제 완료')
      } catch (error) {
        console.error('사용자 댓글 삭제 중 오류:', error)
      }
    },

    // 실제 방문자 추적 시스템
    initializeVisitorTracking() {
      try {
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
        
        // 새로운 방문자 등록
        this.registerNewVisitor()
        
        // Heartbeat 시작 (방문자 활동 상태 유지)
        this.startHeartbeat()
        
        console.log('실제 방문자 추적이 시작되었습니다.')
      } catch (error) {
        console.error('방문자 추적 초기화 중 오류:', error)
      }
    },

    // 새로운 방문자 등록 (실제 방문 시 호출)
    registerNewVisitor() {
      try {
        const visitorData = JSON.parse(localStorage.getItem('blogVisitorData') || '{}')
        const today = this.getTodayString()
        const now = new Date().getTime()
        
        // 기존 방문자인지 확인 (같은 날짜 내에 이미 방문한 경우)
        const existingVisitorId = sessionStorage.getItem('currentVisitorId')
        if (existingVisitorId && visitorData.currentSessions && visitorData.currentSessions[existingVisitorId]) {
          // 기존 방문자는 heartbeat만 갱신
          this.sendHeartbeat()
          return
        }
        
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
        
        console.log('새 방문자 등록:', visitorId)
        console.log('총 방문자 수:', visitorData.totalVisitors)
        console.log('오늘 방문자 수:', visitorData.dailyVisitors[today])
      } catch (error) {
        console.error('새 방문자 등록 중 오류:', error)
      }
    },

    // 날짜 유틸리티 메서드
    getTodayString() {
      const today = new Date()
      return today.toISOString().split('T')[0]
    },

    // Heartbeat 시스템 (현재 방문자의 활동 상태 업데이트)
    sendHeartbeat() {
      const visitorId = sessionStorage.getItem('currentVisitorId')
      if (!visitorId) return
      
      try {
        const visitorData = JSON.parse(localStorage.getItem('blogVisitorData') || '{}')
        if (visitorData.currentSessions && visitorData.currentSessions[visitorId]) {
          visitorData.currentSessions[visitorId].lastHeartbeat = new Date().getTime()
          localStorage.setItem('blogVisitorData', JSON.stringify(visitorData))
        }
      } catch (error) {
        console.error('Heartbeat 전송 중 오류:', error)
      }
    },

    // Heartbeat 시작
    startHeartbeat() {
      // 30초마다 heartbeat 전송
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval)
      }
      
      this.heartbeatInterval = setInterval(() => {
        this.sendHeartbeat()
      }, 30000)
    },

    // Heartbeat 중지
    stopHeartbeat() {
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval)
        this.heartbeatInterval = null
      }
    },

    // 보안 관련 메서드들
    
    // 비밀번호 해싱 (간단한 해시 함수)
    async hashPassword(password) {
      const encoder = new TextEncoder()
      const data = encoder.encode(password + 'blog_salt_2024') // 솔트 추가
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    },

    // 비밀번호 강도 검증
    validatePasswordStrength(password) {
      const minLength = 8
      const hasUpperCase = /[A-Z]/.test(password)
      const hasLowerCase = /[a-z]/.test(password)
      const hasNumbers = /\d/.test(password)
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
      
      const errors = []
      
      if (password.length < minLength) {
        errors.push(`비밀번호는 최소 ${minLength}자 이상이어야 합니다.`)
      }
      if (!hasUpperCase) {
        errors.push('대문자를 포함해야 합니다.')
      }
      if (!hasLowerCase) {
        errors.push('소문자를 포함해야 합니다.')
      }
      if (!hasNumbers) {
        errors.push('숫자를 포함해야 합니다.')
      }
      if (!hasSpecialChar) {
        errors.push('특수문자를 포함해야 합니다.')
      }
      
      return {
        isValid: errors.length === 0,
        errors: errors,
        strength: this.calculatePasswordStrength(password)
      }
    },

    calculatePasswordStrength(password) {
      let score = 0
      
      // 길이 점수
      if (password.length >= 8) score += 1
      if (password.length >= 12) score += 1
      
      // 문자 종류 점수
      if (/[a-z]/.test(password)) score += 1
      if (/[A-Z]/.test(password)) score += 1
      if (/\d/.test(password)) score += 1
      if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1
      
      if (score <= 2) return 'weak'
      if (score <= 4) return 'medium'
      return 'strong'
    },

    // 입력값 Sanitization (XSS 방지)
    sanitizeInput(input) {
      if (typeof input !== 'string') return input
      
      return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;')
    },

    // HTML 태그 제거
    stripHtmlTags(input) {
      if (typeof input !== 'string') return input
      return input.replace(/<[^>]*>/g, '')
    },

    // 로그인 시도 추적
    trackLoginAttempt(email, success = false) {
      const now = Date.now()
      
      if (!this.loginAttempts[email]) {
        this.loginAttempts[email] = {
          count: 0,
          lastAttempt: now,
          firstAttempt: now
        }
      }
      
      if (success) {
        // 성공 시 시도 횟수 초기화
        delete this.loginAttempts[email]
        delete this.lockedAccounts[email]
      } else {
        // 실패 시 시도 횟수 증가
        this.loginAttempts[email].count++
        this.loginAttempts[email].lastAttempt = now
        
        // 최대 시도 횟수 초과 시 계정 잠금
        if (this.loginAttempts[email].count >= this.maxLoginAttempts) {
          this.lockedAccounts[email] = {
            lockedAt: now,
            unlockAt: now + this.lockoutDuration
          }
        }
      }
      
      this.saveSecurityDataToStorage()
    },

    // 계정 잠금 상태 확인
    isAccountLocked(email) {
      const lockInfo = this.lockedAccounts[email]
      if (!lockInfo) return false
      
      const now = Date.now()
      if (now >= lockInfo.unlockAt) {
        // 잠금 해제 시간이 지났으면 잠금 해제
        delete this.lockedAccounts[email]
        delete this.loginAttempts[email]
        this.saveSecurityDataToStorage()
        return false
      }
      
      return true
    },

    // 잠금 해제까지 남은 시간 계산
    getRemainingLockTime(email) {
      const lockInfo = this.lockedAccounts[email]
      if (!lockInfo) return 0
      
      const now = Date.now()
      const remaining = lockInfo.unlockAt - now
      return Math.max(0, Math.ceil(remaining / 1000 / 60)) // 분 단위
    },

    // 세션 타임아웃 관리
    initSessionTimeout() {
      this.lastActivityTime = Date.now()
      
      // 기존 타이머 정리
      if (this.sessionTimeoutInterval) {
        clearInterval(this.sessionTimeoutInterval)
      }
      
      // 1분마다 세션 유효성 검사
      this.sessionTimeoutInterval = setInterval(() => {
        this.checkSessionTimeout()
      }, 60000)
      
      // 사용자 활동 감지 이벤트 리스너 추가
      document.addEventListener('click', this.updateActivity)
      document.addEventListener('keypress', this.updateActivity)
      document.addEventListener('scroll', this.updateActivity)
    },

    updateActivity() {
      this.lastActivityTime = Date.now()
    },

    checkSessionTimeout() {
      if (!this.isLoggedIn) return
      
      const now = Date.now()
      const timeSinceLastActivity = now - this.lastActivityTime
      
      if (timeSinceLastActivity >= this.sessionTimeout) {
        this.handleSessionTimeout()
      }
    },

    handleSessionTimeout() {
      alert('보안을 위해 세션이 만료되었습니다. 다시 로그인해주세요.')
      this.logout()
    },

    clearSessionTimeout() {
      if (this.sessionTimeoutInterval) {
        clearInterval(this.sessionTimeoutInterval)
        this.sessionTimeoutInterval = null
      }
      
      document.removeEventListener('click', this.updateActivity)
      document.removeEventListener('keypress', this.updateActivity)
      document.removeEventListener('scroll', this.updateActivity)
    },

    // 보안 데이터 저장/로드
    saveSecurityDataToStorage() {
      try {
        const securityData = {
          loginAttempts: this.loginAttempts,
          lockedAccounts: this.lockedAccounts
        }
        localStorage.setItem('blogSecurityData', JSON.stringify(securityData))
      } catch (error) {
        console.error('보안 데이터 저장 중 오류:', error)
      }
    },

    loadSecurityDataFromStorage() {
      try {
        const savedData = localStorage.getItem('blogSecurityData')
        if (savedData) {
          const securityData = JSON.parse(savedData)
          this.loginAttempts = securityData.loginAttempts || {}
          this.lockedAccounts = securityData.lockedAccounts || {}
        }
      } catch (error) {
        console.error('보안 데이터 로드 중 오류:', error)
      }
    },

    // 관리자 권한 확인
    isAdmin() {
      return this.isLoggedIn && this.currentUser && this.currentUser.role === 'admin'
    },

    // 입력값 검증 강화
    validateInput(input, type = 'text') {
      if (!input || typeof input !== 'string') {
        return { isValid: false, message: '입력값이 올바르지 않습니다.' }
      }
      
      // 기본 길이 제한
      if (input.length > 10000) {
        return { isValid: false, message: '입력값이 너무 깁니다.' }
      }
      
      // 악성 스크립트 패턴 검사
      const maliciousPatterns = [
        /<script[^>]*>/i,
        /javascript:/i,
        /on\w+\s*=/i,
        /eval\s*\(/i,
        /expression\s*\(/i
      ]
      
      for (const pattern of maliciousPatterns) {
        if (pattern.test(input)) {
          return { isValid: false, message: '보안상 허용되지 않는 내용이 포함되어 있습니다.' }
        }
      }
      
      // 타입별 추가 검증
      switch (type) {
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(input)) {
            return { isValid: false, message: '올바른 이메일 형식이 아닙니다.' }
          }
          break
          
        case 'nickname':
          if (input.length < 2 || input.length > 20) {
            return { isValid: false, message: '닉네임은 2-20자 사이여야 합니다.' }
          }
          const nicknameRegex = /^[가-힣a-zA-Z0-9_-]+$/
          if (!nicknameRegex.test(input)) {
            return { isValid: false, message: '닉네임은 한글, 영문, 숫자, _, - 만 사용할 수 있습니다.' }
          }
          break
          
        case 'content':
          if (input.length > 5000) {
            return { isValid: false, message: '내용은 5000자를 초과할 수 없습니다.' }
          }
          break
      }
      
      return { isValid: true, message: '' }
    },

    // 댓글 관련 메서드들
    async submitComment() {
      if (!this.newComment.trim() || !this.isLoggedIn || !this.selectedPost) {
        return
      }
      
      try {
        // 입력값 검증 및 sanitization
        const contentValidation = this.validateInput(this.newComment.trim(), 'content')
        if (!contentValidation.isValid) {
          alert(contentValidation.message)
          return
        }

        // 하루 댓글 작성 횟수 제한 체크
        if (!this.checkDailyCommentLimit()) {
          alert(`하루에 최대 ${this.maxDailyComments}개의 댓글만 작성할 수 있습니다.`)
          return
        }

        // 욕설 필터링 체크
        console.log('댓글 작성 시 욕설 필터링 체크 중...')
        const profanityCheck = this.checkProfanity(this.newComment.trim())
        console.log('욕설 필터링 체크 완료:', profanityCheck)
        if (!profanityCheck.isClean) {
          console.log('욕설이 감지되어 댓글 작성이 차단됩니다.')
          alert(`부적절한 언어가 포함되어 있습니다: "${profanityCheck.detectedWords.join(', ')}"`)
          return
        }

        // 도배 필터링 체크
        if (!this.checkSpamming(this.newComment.trim())) {
          alert('동일하거나 유사한 댓글을 연속으로 작성할 수 없습니다.')
          return
        }
        
        const sanitizedContent = this.sanitizeInput(this.newComment.trim())
        
        const newComment = {
          postId: this.selectedPost.id,
          content: sanitizedContent,
          authorId: this.currentUser.id,
          authorNickname: this.currentUser.nickname,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        
        // Firebase에 댓글 저장 (실시간 동기화)
        if (this.isFirebaseEnabled) {
          await this.saveCommentToFirebase(newComment)
        } else {
          // Firebase 미사용시 기존 방식
          newComment.id = Date.now()
          this.comments.push(newComment)
          this.saveCommentsToStorage()
        }
        
        // 댓글 작성 후 제한 데이터 업데이트
        this.updateCommentLimitData(sanitizedContent)
        this.saveCommentLimitsToStorage()
        
        this.newComment = ''
        
        console.log('댓글이 작성되었습니다:', newComment)
        alert('댓글이 성공적으로 작성되었습니다!')
      } catch (error) {
        console.error('댓글 작성 중 오류:', error)
        alert('댓글 작성 중 오류가 발생했습니다.')
      }
    },

    startEditComment(comment) {
      this.editingCommentId = comment.id
      this.editingCommentContent = comment.content
    },

    async saveEditComment(commentId) {
      if (!this.editingCommentContent.trim()) {
        return
      }
      
      try {
        // 입력값 검증 및 sanitization
        const contentValidation = this.validateInput(this.editingCommentContent.trim(), 'content')
        if (!contentValidation.isValid) {
          alert(contentValidation.message)
          return
        }

        // 욕설 필터링 체크 (수정 시에도 적용)
        const profanityCheck = this.checkProfanity(this.editingCommentContent.trim())
        if (!profanityCheck.isClean) {
          alert(`부적절한 언어가 포함되어 있습니다: "${profanityCheck.detectedWords.join(', ')}"`)
          return
        }
        
        const sanitizedContent = this.sanitizeInput(this.editingCommentContent.trim())
        
        // Firebase에 댓글 업데이트 (실시간 동기화)
        if (this.isFirebaseEnabled) {
          await this.updateCommentInFirebase(commentId, {
            content: sanitizedContent
          })
        } else {
          // Firebase 미사용시 기존 방식
          const commentIndex = this.comments.findIndex(comment => comment.id === commentId)
          if (commentIndex !== -1) {
            this.comments[commentIndex].content = sanitizedContent
            this.comments[commentIndex].updatedAt = new Date()
            this.saveCommentsToStorage()
          }
        }
        
        this.cancelEditComment()
        console.log('댓글이 수정되었습니다.')
        alert('댓글이 성공적으로 수정되었습니다!')
      } catch (error) {
        console.error('댓글 수정 중 오류:', error)
        alert('댓글 수정 중 오류가 발생했습니다.')
      }
    },

    cancelEditComment() {
      this.editingCommentId = null
      this.editingCommentContent = ''
    },

    async deleteComment(commentId) {
      if (!confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
        return
      }
      
      try {
        // Firebase에서 댓글 삭제 (실시간 동기화)
        if (this.isFirebaseEnabled) {
          await this.deleteCommentFromFirebase(commentId)
        } else {
          // Firebase 미사용시 기존 방식
          this.comments = this.comments.filter(comment => comment.id !== commentId)
          this.saveCommentsToStorage()
        }
        
        // 삭제된 댓글을 수정 중이었다면 수정 상태 초기화
        if (this.editingCommentId === commentId) {
          this.cancelEditComment()
        }
        
        console.log('댓글이 삭제되었습니다.')
      } catch (error) {
        console.error('댓글 삭제 중 오류:', error)
        alert('댓글 삭제 중 오류가 발생했습니다.')
      }
    },

    // 댓글 로컬스토리지 관련 메서드들
    saveCommentsToStorage() {
      try {
        localStorage.setItem('blogComments', JSON.stringify(this.comments))
      } catch (error) {
        console.error('댓글 저장 중 오류:', error)
      }
    },

    loadCommentsFromStorage() {
      try {
        const savedComments = localStorage.getItem('blogComments')
        if (savedComments) {
          this.comments = JSON.parse(savedComments)
        }
      } catch (error) {
        console.error('댓글 로드 중 오류:', error)
      }
    },

    // 실시간 댓글 검증
    checkCommentValidation() {
      if (!this.newComment.trim()) {
        this.currentCommentValidation = {
          hasProfanity: false,
          detectedWords: []
        }
        return
      }
      
      const profanityCheck = this.checkProfanity(this.newComment.trim())
      this.currentCommentValidation = {
        hasProfanity: !profanityCheck.isClean,
        detectedWords: profanityCheck.detectedWords
      }
    },





    // 댓글 제한 관련 메서드들
    checkDailyCommentLimit() {
      if (!this.currentUser) return false
      
      const today = new Date().toDateString()
      const userId = this.currentUser.id
      
      // 일일 제한 데이터가 없거나 날짜가 다르면 초기화
      if (!this.commentLimits[userId] || this.commentLimits[userId].date !== today) {
        this.commentLimits[userId] = {
          date: today,
          count: 0
        }
      }
      
      // 최대 댓글 수 체크
      return this.commentLimits[userId].count < this.maxDailyComments
    },

    checkProfanity(content) {
      console.log('욕설 필터링 체크 시작:', content)
      const detectedWords = []
      const lowerContent = content.toLowerCase()
      
      // 욕설 단어 체크
      for (const word of this.profanityWords) {
        if (lowerContent.includes(word.toLowerCase())) {
          console.log('욕설 감지됨:', word)
          detectedWords.push(word)
        }
      }
      
      // 변형된 욕설 체크 (예: ㅅㅣㅂㅏㄹ, s1bal 등)
      const variations = [
        /ㅅㅣㅂㅏㄹ/g,
        /ㅂㅣㅊㅣㄴ/g,
        /ㅂㅏㅂㅗ/g,
        /[sS][1!][bB][aA@][lL]/g,
        /[fF][uU][cC][kK]/g,
        /[bB][1!][tT][cC][hH]/g,
        // 추가 변형 패턴
        /시[바발팔]/g,
        /개[새놈년자]/g,
        /좆[같나]/g,
        /지[랄]/g,
        /[ㅅㅆ][ㅂㅏ]/g
      ]
      
      for (const pattern of variations) {
        if (pattern.test(content)) {
          console.log('변형된 욕설 감지됨:', pattern)
          detectedWords.push('변형된 욕설')
          break
        }
      }
      
      const result = {
        isClean: detectedWords.length === 0,
        detectedWords: detectedWords
      }
      
      console.log('욕설 필터링 결과:', result)
      return result
    },

    checkSpamming(content) {
      if (!this.currentUser) return false
      
      const userId = this.currentUser.id
      
      // 최근 댓글 목록이 없으면 초기화
      if (!this.recentComments[userId]) {
        this.recentComments[userId] = []
      }
      
      const recentComments = this.recentComments[userId]
      const normalizedContent = content.toLowerCase().trim()
      
      // 완전히 동일한 댓글 체크
      if (recentComments.includes(normalizedContent)) {
        return false
      }
      
      // 유사한 댓글 체크 (80% 이상 일치)
      for (const recentComment of recentComments) {
        const similarity = this.calculateSimilarity(normalizedContent, recentComment)
        if (similarity > 0.8) {
          return false
        }
      }
      
      // 연속된 같은 문자나 숫자 체크 (예: ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ)
      const repeatedPattern = /(.)\1{9,}/g // 같은 문자가 10번 이상 반복
      if (repeatedPattern.test(content)) {
        return false
      }
      
      return true
    },

    calculateSimilarity(str1, str2) {
      const longer = str1.length > str2.length ? str1 : str2
      const shorter = str1.length > str2.length ? str2 : str1
      
      if (longer.length === 0) {
        return 1.0
      }
      
      const editDistance = this.levenshteinDistance(longer, shorter)
      return (longer.length - editDistance) / longer.length
    },

    levenshteinDistance(str1, str2) {
      const matrix = []
      
      for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i]
      }
      
      for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j
      }
      
      for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
          if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
            matrix[i][j] = matrix[i - 1][j - 1]
          } else {
            matrix[i][j] = Math.min(
              matrix[i - 1][j - 1] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j] + 1
            )
          }
        }
      }
      
      return matrix[str2.length][str1.length]
    },

    updateCommentLimitData(content) {
      if (!this.currentUser) return
      
      const today = new Date().toDateString()
      const userId = this.currentUser.id
      
      // 일일 댓글 수 증가
      if (!this.commentLimits[userId] || this.commentLimits[userId].date !== today) {
        this.commentLimits[userId] = {
          date: today,
          count: 1
        }
      } else {
        this.commentLimits[userId].count++
      }
      
      // 최근 댓글 목록 업데이트
      if (!this.recentComments[userId]) {
        this.recentComments[userId] = []
      }
      
      const normalizedContent = content.toLowerCase().trim()
      this.recentComments[userId].unshift(normalizedContent)
      
      // 최대 개수만 유지
      if (this.recentComments[userId].length > this.maxRecentComments) {
        this.recentComments[userId] = this.recentComments[userId].slice(0, this.maxRecentComments)
      }
    },

    saveCommentLimitsToStorage() {
      try {
        localStorage.setItem('commentLimits', JSON.stringify(this.commentLimits))
        localStorage.setItem('recentComments', JSON.stringify(this.recentComments))
      } catch (error) {
        console.error('댓글 제한 데이터 저장 중 오류:', error)
      }
    },

    loadCommentLimitsFromStorage() {
      try {
        const savedLimits = localStorage.getItem('commentLimits')
        if (savedLimits) {
          this.commentLimits = JSON.parse(savedLimits)
        }
        
        const savedRecentComments = localStorage.getItem('recentComments')
        if (savedRecentComments) {
          this.recentComments = JSON.parse(savedRecentComments)
        }
        
        // 오늘이 아닌 날짜의 데이터는 정리
        this.cleanupOldLimitData()
      } catch (error) {
        console.error('댓글 제한 데이터 로드 중 오류:', error)
      }
    },

    cleanupOldLimitData() {
      const today = new Date().toDateString()
      
      // 오늘이 아닌 일일 제한 데이터 정리
      for (const userId in this.commentLimits) {
        if (this.commentLimits[userId].date !== today) {
          delete this.commentLimits[userId]
        }
      }
      
      // 변경된 데이터 저장
      this.saveCommentLimitsToStorage()
    },

    // 비밀번호 강도 체크 관련 메서드들
    checkPasswordStrength() {
      if (!this.signUpForm.password) {
        this.passwordStrength = ''
        this.passwordValidationErrors = []
        return
      }
      
      const validation = this.validatePasswordStrength(this.signUpForm.password)
      this.passwordStrength = validation.strength
      this.passwordValidationErrors = validation.errors
    },

    getStrengthWidth() {
      switch (this.passwordStrength) {
        case 'weak': return '33%'
        case 'medium': return '66%'
        case 'strong': return '100%'
        default: return '0%'
      }
    },

    getStrengthText() {
      switch (this.passwordStrength) {
        case 'weak': return '약함'
        case 'medium': return '보통'
        case 'strong': return '강함'
        default: return ''
      }
    }
  }
}
</script>

<style>
/* 닉네임 중복 검사 스타일 */
.nickname-input-wrapper {
  display: flex;
  gap: 8px;
  align-items: center;
}

.nickname-input-wrapper input {
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

.nickname-message {
  margin-top: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
}

.nickname-message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.nickname-message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

/* 이메일 중복 검사 스타일 */
.email-input-wrapper {
  display: flex;
  gap: 8px;
  align-items: center;
}

.email-input-wrapper input {
  flex: 1;
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

.email-message {
  margin-top: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
}

.email-message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.email-message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
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

/* 페이지네이션 스타일 */
.pagination-container {
  margin-top: 40px;
  padding: 30px 0;
  border-top: 1px solid #eee;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
}

.pagination-btn {
  padding: 10px 16px;
  border: 1px solid #ddd;
  background: white;
  color: #666;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.3s ease;
  min-width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination-btn:hover:not(.disabled) {
  background: #f8f9fa;
  border-color: #3498db;
  color: #3498db;
  transform: translateY(-1px);
}

.pagination-btn.active {
  background: #3498db;
  border-color: #3498db;
  color: white;
  font-weight: 600;
}

.pagination-btn.disabled {
  background: #f8f9fa;
  border-color: #e9ecef;
  color: #adb5bd;
  cursor: not-allowed;
}

.pagination-prev,
.pagination-next {
  font-weight: 600;
  padding: 10px 20px;
}

.pagination-number {
  min-width: 44px;
}

.pagination-ellipsis {
  padding: 10px 8px;
  color: #adb5bd;
  font-weight: 500;
}

.pagination-info {
  text-align: center;
  color: #666;
  font-size: 0.9rem;
  margin-top: 15px;
}



/* 홈페이지용 검색바 스타일 */
.home-search-section {
  padding: 30px 0;
  background: white;
  border-bottom: 1px solid #eee;
}

.home-search-bar {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}

.home-search-wrapper {
  display: flex;
  gap: 8px;
  background: #f8f9fa;
  border-radius: 25px;
  padding: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.home-search-input {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 20px;
  font-size: 1rem;
  background: transparent;
  color: #333;
}

.home-search-input:focus {
  outline: none;
}

.home-search-input::placeholder {
  color: #999;
}

.home-search-btn {
  padding: 12px 16px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background 0.3s;
  min-width: 50px;
}

.home-search-btn:hover {
  background: #2980b9;
}

.search-info {
  text-align: center;
  margin-top: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.search-result-count {
  color: #666;
  font-size: 0.9rem;
  background: white;
  padding: 8px 16px;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.clear-search-btn-small {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background 0.3s;
}

.clear-search-btn-small:hover {
  background: #c0392b;
}

.clear-search-button {
  background: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  margin-top: 15px;
  transition: background-color 0.3s;
}

.clear-search-button:hover {
  background: #2980b9;
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

/* 모바일 최적화 스타일 */

/* 모바일 메뉴 버튼 */
.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.hamburger-line {
  width: 24px;
  height: 3px;
  background-color: #333;
  margin: 2px 0;
  transition: all 0.3s ease;
  border-radius: 2px;
}

.mobile-menu-btn:hover .hamburger-line {
  background-color: #3498db;
}

/* 모바일에서 데스크탑 메뉴 숨기기 */
.nav-menu.mobile-hidden {
  display: none;
}

/* 모바일 메뉴 오버레이 */
.mobile-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
}

/* 모바일 메뉴 */
.mobile-menu {
  background: white;
  width: 280px;
  height: 100vh;
  padding-top: env(safe-area-inset-top);
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  animation: slideInRight 0.3s ease-out;
}

.mobile-menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.mobile-menu-title {
  font-size: 1.2rem;
  font-weight: bold;
  color: #2c3e50;
}

.mobile-menu-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.mobile-menu-close:hover {
  background-color: #f5f5f5;
  color: #e74c3c;
}

.mobile-menu-items {
  padding: 20px 0;
}

.mobile-nav-link {
  display: block;
  padding: 16px 20px;
  color: #2c3e50;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
}

.mobile-nav-link:hover,
.mobile-nav-link.active {
  background-color: #f8f9fa;
  color: #3498db;
  border-left-color: #3498db;
}

/* 모바일 메뉴 애니메이션 */
@keyframes slideInRight {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

/* 모바일 반응형 스타일 */
@media (max-width: 768px) {
  /* 모바일 메뉴 버튼 표시 */
  .mobile-menu-btn {
    display: flex;
  }
  
  /* 네비게이션 최적화 */
  .nav-container {
    padding: 0 15px;
  }
  
  .blog-title {
    font-size: 1.3rem;
  }
  
  /* 검색바 모바일 최적화 */
  .home-search-section {
    padding: 20px 0;
  }
  
  .home-search-wrapper {
    gap: 6px;
    padding: 3px;
  }
  
  .home-search-input {
    padding: 10px 16px;
    font-size: 0.95rem;
  }
  
  .home-search-btn {
    padding: 10px 14px;
    font-size: 1rem;
    min-width: 44px;
  }
  
  /* 블로그 포스트 그리드 모바일 최적화 */
  .blog-posts-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .post-card {
    border-radius: 12px;
  }
  
  .post-image {
    height: 160px;
  }
  
  .post-content {
    padding: 16px;
  }
  
  .post-title {
    font-size: 1.1rem;
    line-height: 1.3;
  }
  
  .post-excerpt {
    font-size: 0.85rem;
    line-height: 1.5;
    height: auto;
    -webkit-line-clamp: 3;
  }
  
  .post-meta {
    font-size: 0.8rem;
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
  
  .post-actions {
    margin-top: 8px;
  }
  
  .like-btn {
    padding: 8px 12px;
    font-size: 0.8rem;
    min-height: 36px;
  }
  
  /* 모달 모바일 최적화 */
  .modal-content {
    width: 95%;
    max-width: 400px;
    margin: 10px auto;
    max-height: 90vh;
    overflow-y: auto;
  }
  
  .modal-header h2 {
    font-size: 1.3rem;
  }
  
  .auth-form {
    padding: 16px 20px;
  }
  
  .form-group {
    margin-bottom: 16px;
  }
  
  .form-group input,
  .form-group textarea {
    padding: 12px 16px;
    font-size: 16px; /* iOS zoom 방지 */
  }
  
  .submit-btn {
    padding: 14px;
    font-size: 1rem;
    min-height: 48px;
  }
  
  .nickname-input-wrapper,
  .email-input-wrapper {
    flex-direction: column;
    gap: 8px;
  }
  
  .nickname-check-btn,
  .email-check-btn {
    width: 100%;
    min-height: 44px;
  }
  
  /* 인증 버튼 모바일 최적화 */
  .auth-buttons {
    gap: 6px;
  }
  
  .auth-btn {
    padding: 10px 14px;
    font-size: 0.9rem;
    min-height: 40px;
  }
  
  /* 프로필 메뉴 모바일 최적화 */
  .user-profile {
    position: relative;
  }
  
  .profile-dropdown {
    padding: 8px 12px;
    font-size: 0.9rem;
  }
  
  .profile-avatar {
    width: 32px;
    height: 32px;
    font-size: 0.8rem;
  }
  
  .profile-name {
    display: none; /* 모바일에서는 이름 숨기기 */
  }
  
  .profile-menu {
    right: 0;
    width: 200px;
    margin-top: 8px;
  }
  
  /* 상세 페이지 모바일 최적화 */
  .post-detail {
    padding: 20px 15px;
  }
  
  .post-title-detail {
    font-size: 1.6rem;
    line-height: 1.3;
  }
  
  .post-meta-detail {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  
  .post-content-detail {
    font-size: 1rem;
    line-height: 1.6;
    margin: 30px 0;
  }
  
  .post-images-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  /* 터치 친화적 버튼 크기 */
  button,
  .nav-link,
  .like-btn,
  .auth-btn {
    min-height: 44px;
    touch-action: manipulation;
  }
  
  /* 텍스트 선택 최적화 */
  .navbar,
  .nav-menu,
  .mobile-menu {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
  
  /* iOS Safari 줌 방지 */
  input[type="text"],
  input[type="email"],
  input[type="password"],
  input[type="search"],
  textarea,
  select {
    font-size: 16px !important;
  }
  
  /* 터치 하이라이트 제거 */
  * {
    -webkit-tap-highlight-color: transparent;
  }
}

@media (max-width: 480px) {
  /* 매우 작은 화면용 추가 최적화 */
  .container {
    padding: 0 12px;
  }
  
  .blog-title {
    font-size: 1.2rem;
  }
  
  .home-search-input {
    font-size: 0.9rem;
    padding: 10px 14px;
  }
  
  .post-content {
    padding: 14px;
  }
  
  .post-title {
    font-size: 1rem;
  }
  
  .post-excerpt {
    font-size: 0.8rem;
  }
  
  .modal-content {
    width: 98%;
    margin: 5px auto;
  }
  
  .mobile-menu {
    width: 100%;
  }
  
  .auth-btn {
    padding: 8px 10px;
    font-size: 0.85rem;
  }
}

/* 가로 모드 최적화 */
@media (max-width: 768px) and (orientation: landscape) {
  .modal-content {
    max-height: 85vh;
  }
  
  .mobile-menu {
    width: 320px;
  }
}

/* PWA 대응 */
@media (display-mode: standalone) {
  .navbar {
    padding-top: calc(env(safe-area-inset-top) + 10px);
  }
  
  .mobile-menu {
    padding-top: calc(env(safe-area-inset-top) + 20px);
  }
}

/* 고해상도 디스플레이 최적화 */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .card-image,
  .post-detail-image {
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
  }
}
</style> 