<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f8f9fa;
  color: #333;
  line-height: 1.6;
}

#app {
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 네비게이션 스타일 */
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
  text-decoration: none;
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

.nav-right {
  display: flex;
  align-items: center;
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
  text-decoration: none;
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

/* 검색바 스타일 */
.home-search-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60px 0;
  color: white;
}

.home-search-bar {
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.home-search-wrapper {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.home-search-input {
  flex: 1;
  padding: 15px 20px;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  background: rgba(255, 255, 255, 0.95);
}

.home-search-input:focus {
  outline: none;
  background: white;
}

.home-search-btn {
  padding: 15px 30px;
  background: #2c3e50;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.home-search-btn:hover {
  background: #34495e;
}

.advanced-search-link {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.3s;
}

.advanced-search-link:hover {
  color: white;
}

/* 블로그 포스트 그리드 */
.blog-content {
  padding: 40px 0;
  background: #f8f9fa;
}

.blog-posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.post-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid #f0f0f0;
}

.post-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  border-color: #e0e0e0;
}

.post-image {
  height: 180px;
  overflow: hidden;
  position: relative;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.post-card:hover .card-image {
  transform: scale(1.08);
}

.no-image {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: white;
  opacity: 0.8;
}

.post-content {
  padding: 20px;
}

.post-category {
  display: inline-block;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 20px;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.post-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 12px;
  color: #2c3e50;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-excerpt {
  color: #6c757d;
  line-height: 1.6;
  margin-bottom: 16px;
  height: 3.2em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  font-size: 0.9rem;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: #adb5bd;
  margin-bottom: 12px;
  padding-top: 12px;
  border-top: 1px solid #f8f9fa;
}

.post-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.post-actions {
  display: flex;
  gap: 8px;
}

.like-btn {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border-radius: 20px;
  transition: all 0.3s;
  font-size: 0.8rem;
  border: 1px solid #e9ecef;
}

.like-btn:hover {
  background: #f8f9fa;
  border-color: #dee2e6;
}

.like-btn.liked {
  color: #e74c3c;
  background: rgba(231, 76, 60, 0.1);
  border-color: #e74c3c;
}

.like-btn.not-logged-in {
  opacity: 0.6;
}

.post-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 8px;
}

.tag {
  background: #f8f9fa;
  color: #6c757d;
  padding: 4px 10px;
  border-radius: 14px;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid #e9ecef;
}

/* 빈 상태 */
.no-posts {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.no-posts h3 {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 1.5rem;
}

.no-posts p {
  color: #666;
  font-size: 1.1rem;
}

/* 상세 페이지 스타일 */
.detail-content {
  background: white;
  min-height: calc(100vh - 70px);
}

.post-detail {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
}

.post-header {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.post-category-detail {
  color: #3498db;
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.post-title-detail {
  font-size: 2.2rem;
  font-weight: 700;
  color: #2c3e50;
  line-height: 1.2;
  margin-bottom: 16px;
}

.post-meta-detail {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 16px;
  font-size: 0.95rem;
  color: #666;
}

.post-actions-detail .like-btn-detail {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.3s;
  font-size: 0.9rem;
}

.post-actions-detail .like-btn-detail:hover {
  background: #f8f9fa;
}

.post-actions-detail .like-btn-detail.liked {
  color: #e74c3c;
}

.post-tags-detail {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag-detail {
  background: #f1f3f4;
  color: #666;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 0.85rem;
  font-weight: 500;
}

.post-images-container {
  margin: 30px 0;
}

.post-images-grid {
  display: grid;
  gap: 15px;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.post-detail-image {
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.post-content-detail {
  margin: 40px 0;
  font-size: 1.1rem;
  line-height: 1.7;
  color: #444;
}

.post-footer {
  margin-top: 40px;
  padding-top: 30px;
  border-top: 1px solid #eee;
  text-align: center;
}

.back-to-list-btn {
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

.back-to-list-btn:hover {
  background: #2980b9;
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

/* 사용자 프로필 */
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
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
}

.profile-name {
  font-weight: 500;
  color: #2c3e50;
}

.dropdown-arrow {
  font-size: 0.7rem;
  color: #999;
  transition: transform 0.3s;
}

.profile-dropdown:hover .dropdown-arrow {
  transform: rotate(180deg);
}

.profile-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  padding: 8px 0;
  min-width: 200px;
  z-index: 1000;
  margin-top: 4px;
}

.profile-info {
  padding: 12px 16px;
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
  margin: 8px 0;
  border: none;
  border-top: 1px solid #eee;
}

.profile-menu-item {
  display: block;
  padding: 8px 16px;
  color: #666;
  text-decoration: none;
  transition: background-color 0.3s;
}

.profile-menu-item:hover {
  background-color: #f8f9fa;
  color: #333;
}





/* 댓글 섹션 스타일 */
.comments-section {
  margin-top: 50px;
  padding-top: 30px;
  border-top: 2px solid #f0f0f0;
}

.comments-header {
  margin-bottom: 25px;
}

.comments-header h3 {
  color: #2c3e50;
  font-size: 1.4rem;
  font-weight: 600;
}

/* 댓글 작성 폼 */
.comment-form {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
  border: 1px solid #e9ecef;
}

.comment-author-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.comment-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1rem;
}

.comment-author-name {
  font-weight: 600;
  color: #2c3e50;
}

.comment-input {
  width: 100%;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  line-height: 1.5;
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
  transition: border-color 0.3s;
}

.comment-input:focus {
  outline: none;
  border-color: #3498db;
}

.comment-input::placeholder {
  color: #999;
}

.comment-form-actions {
  margin-top: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.comment-limit-info {
  font-size: 0.9rem;
  font-weight: 500;
}

.remaining-comments {
  color: #27ae60;
  background: #d4edda;
  border: 1px solid #c3e6cb;
  padding: 6px 12px;
  border-radius: 6px;
}

.limit-reached {
  color: #e74c3c;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  padding: 6px 12px;
  border-radius: 6px;
}

/* 실시간 댓글 검증 스타일 */
.comment-validation-status {
  margin-top: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
}

.validation-error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  animation: shake 0.3s ease-in-out;
}

.validation-success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.comment-submit-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.comment-submit-btn:hover:not(:disabled) {
  background: #2980b9;
}

.comment-submit-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

/* 로그인 프롬프트 */
.comment-login-prompt {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  margin-bottom: 30px;
  border: 1px solid #e9ecef;
}

.comment-login-prompt p {
  color: #666;
  margin: 0;
}

.login-link {
  background: none;
  border: none;
  color: #3498db;
  text-decoration: underline;
  cursor: pointer;
  font-weight: 600;
}

.login-link:hover {
  color: #2980b9;
}

/* 댓글 목록 */
.comments-list {
  space-y: 20px;
}

.no-comments {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.no-comments p {
  margin: 0;
  font-size: 1.1rem;
}

.comment-item {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  transition: box-shadow 0.3s;
}

.comment-item:hover {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.comment-meta {
  margin-left: 10px;
}

.comment-author {
  font-weight: 600;
  color: #2c3e50;
  margin-right: 10px;
}

.comment-date {
  color: #999;
  font-size: 0.9rem;
}

.comment-edited {
  color: #666;
  font-size: 0.85rem;
  font-style: italic;
  margin-left: 5px;
}

.comment-actions {
  display: flex;
  gap: 8px;
}

.comment-edit-btn,
.comment-delete-btn {
  background: none;
  border: 1px solid #ddd;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s;
}

.comment-edit-btn {
  color: #3498db;
  border-color: #3498db;
}

.comment-edit-btn:hover {
  background: #3498db;
  color: white;
}

.comment-delete-btn {
  color: #e74c3c;
  border-color: #e74c3c;
}

.comment-delete-btn:hover {
  background: #e74c3c;
  color: white;
}

.comment-content {
  line-height: 1.6;
  color: #444;
}

.comment-content p {
  margin: 0;
}

/* 댓글 수정 폼 */
.comment-edit-form {
  margin-top: 15px;
}

.comment-edit-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem;
  line-height: 1.5;
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
  transition: border-color 0.3s;
}

.comment-edit-input:focus {
  outline: none;
  border-color: #3498db;
}

.comment-edit-actions {
  margin-top: 10px;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.comment-save-btn,
.comment-cancel-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.comment-save-btn {
  background: #27ae60;
  color: white;
}

.comment-save-btn:hover:not(:disabled) {
  background: #219a52;
}

.comment-save-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.comment-cancel-btn {
  background: #95a5a6;
  color: white;
}

.comment-cancel-btn:hover {
  background: #7f8c8d;
}

/* 반응형 - 댓글 모바일 최적화 */
@media (max-width: 768px) {
  .comments-section {
    padding: 0 15px;
  }
  
  .comments-header h3 {
    font-size: 1.3rem;
    margin-bottom: 20px;
  }
  
  .comment-form {
    padding: 20px;
    background: #f8f9fa;
    border-radius: 16px;
    margin-bottom: 25px;
  }
  
  .comment-author-info {
    margin-bottom: 12px;
  }
  
  .comment-avatar {
    width: 36px;
    height: 36px;
    font-size: 0.9rem;
  }
  
  .comment-input {
    padding: 16px;
    border-radius: 12px;
    font-size: 16px; /* iOS zoom 방지 */
    min-height: 100px;
    resize: none;
  }
  
  .comment-validation-status {
    margin-top: 10px;
    padding: 12px;
    border-radius: 8px;
    font-size: 0.9rem;
  }
  
  .comment-form-actions {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
    margin-top: 16px;
  }
  
  .comment-limit-info {
    text-align: center;
    order: -1;
    padding: 10px;
    border-radius: 8px;
  }
  
  .comment-submit-btn {
    width: 100%;
    padding: 14px;
    font-size: 1rem;
    border-radius: 10px;
    min-height: 48px;
    touch-action: manipulation;
  }
  
  .comment-item {
    padding: 20px;
    margin-bottom: 16px;
    border-radius: 16px;
    background: white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }
  
  .comment-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .comment-actions {
    align-self: flex-end;
    gap: 10px;
  }
  
  .comment-edit-btn,
  .comment-delete-btn {
    padding: 8px 16px;
    font-size: 0.9rem;
    min-height: 36px;
    border-radius: 8px;
  }
  
  .comment-author-info {
    flex-direction: row;
    align-items: center;
    gap: 12px;
    width: 100%;
  }
  
  .comment-meta {
    margin-left: 0;
  }
  
  .comment-author {
    font-size: 1rem;
    margin-right: 8px;
  }
  
  .comment-date {
    font-size: 0.85rem;
  }
  
  .comment-content {
    margin-top: 12px;
    line-height: 1.6;
    font-size: 0.95rem;
  }
  
  .comment-edit-form {
    margin-top: 12px;
  }
  
  .comment-edit-input {
    padding: 14px;
    border-radius: 10px;
    font-size: 16px; /* iOS zoom 방지 */
    min-height: 80px;
  }
  
  .comment-edit-actions {
    margin-top: 12px;
    gap: 10px;
  }
  
  .comment-save-btn,
  .comment-cancel-btn {
    padding: 10px 20px;
    min-height: 40px;
    border-radius: 8px;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .comments-section {
    margin-top: 25px;
    padding: 0 12px;
  }
  
  .comments-header h3 {
    font-size: 1.2rem;
    margin-bottom: 16px;
  }
  
  .comment-form {
    padding: 16px;
    border-radius: 12px;
    margin-bottom: 20px;
  }
  
  .comment-avatar {
    width: 32px;
    height: 32px;
    font-size: 0.8rem;
  }
  
  .comment-author-name {
    font-size: 0.9rem;
  }
  
  .comment-input {
    padding: 14px;
    min-height: 90px;
    font-size: 16px;
  }
  
  .comment-form-actions {
    gap: 10px;
    margin-top: 12px;
  }
  
  .comment-submit-btn {
    padding: 12px;
    font-size: 0.95rem;
    min-height: 44px;
  }
  
  .comment-item {
    padding: 16px;
    margin-bottom: 12px;
    border-radius: 12px;
  }
  
  .comment-header {
    gap: 10px;
  }
  
  .comment-actions {
    gap: 8px;
  }
  
  .comment-edit-btn,
  .comment-delete-btn {
    padding: 6px 12px;
    font-size: 0.8rem;
    min-height: 32px;
  }
  
  .comment-author {
    font-size: 0.9rem;
  }
  
  .comment-date {
    font-size: 0.8rem;
  }
  
  .comment-content {
    font-size: 0.9rem;
    margin-top: 10px;
  }
  
  .comment-edit-input {
    padding: 12px;
    min-height: 70px;
  }
  
  .comment-save-btn,
  .comment-cancel-btn {
    padding: 8px 16px;
    min-height: 36px;
    font-size: 0.85rem;
  }
  
  /* 로그인 프롬프트 모바일 최적화 */
  .comment-login-prompt {
    padding: 16px;
    border-radius: 12px;
    margin-bottom: 20px;
  }
  
  .login-link {
    font-size: 1rem;
    padding: 2px 4px;
  }
}

/* 추가 모바일 최적화 */
@media (max-width: 768px) {
  /* 페이지네이션 모바일 최적화 */
  .pagination-container {
    margin-top: 30px;
    padding: 20px 15px;
  }
  
  .pagination {
    gap: 6px;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .pagination-btn {
    min-width: 40px;
    height: 40px;
    padding: 8px 12px;
    font-size: 0.9rem;
  }
  
  .pagination-prev,
  .pagination-next {
    padding: 8px 16px;
  }
  
  .pagination-info {
    margin-top: 12px;
    font-size: 0.85rem;
  }
  
  /* 검색 결과 모바일 최적화 */
  .search-info {
    flex-direction: column;
    gap: 8px;
    margin-top: 12px;
  }
  
  .search-result-count {
    padding: 6px 12px;
    font-size: 0.85rem;
  }
  
  .clear-search-btn-small {
    padding: 6px 12px;
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .pagination-btn {
    min-width: 36px;
    height: 36px;
    padding: 6px 10px;
    font-size: 0.85rem;
  }
  
  .pagination-prev,
  .pagination-next {
    padding: 6px 12px;
    font-size: 0.85rem;
  }
}

/* 추가 모바일 터치 최적화 */
@media (max-width: 768px) {
  /* 터치 스크롤 개선 */
  * {
    -webkit-overflow-scrolling: touch;
  }
  
  /* 터치 액션 최적화 */
  a, button, input, textarea, select {
    touch-action: manipulation;
  }
  
  /* 선택 방지 (모바일에서 텍스트 선택 오류 방지) */
  .navbar, .nav-menu, .profile-menu, .mobile-menu {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
  
  /* 터치 하이라이트 제거 */
  * {
    -webkit-tap-highlight-color: transparent;
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
  
  /* 모바일 viewport 단위 보정 */
  .modal-overlay {
    height: 100vh;
    height: 100dvh; /* 동적 viewport 높이 */
  }
  
  /* 안전 영역 고려 (노치 폰 대응) */
  .navbar {
    padding-top: env(safe-area-inset-top);
  }
  
  .mobile-menu {
    padding-top: env(safe-area-inset-top);
  }
}

/* PWA 대응 */
@media (display-mode: standalone) {
  .navbar {
    padding-top: calc(env(safe-area-inset-top) + 10px);
  }
}

/* 가로 모드 최적화 */
@media (max-width: 768px) and (orientation: landscape) {
  .modal-content {
    max-height: 80vh;
    margin: 2vh auto;
  }
  
  .mobile-menu {
    width: 320px;
  }
  
  .comments-section {
    padding: 0 20px;
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

/* 보안 관련 스타일 */

/* 비밀번호 강도 표시기 */
.password-strength {
  margin-top: 10px;
}

.strength-meter {
  width: 100%;
  height: 6px;
  background-color: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 8px;
}

.strength-bar {
  height: 100%;
  transition: all 0.3s ease;
  border-radius: 3px;
}

.strength-bar.weak {
  background-color: #e74c3c;
}

.strength-bar.medium {
  background-color: #f39c12;
}

.strength-bar.strong {
  background-color: #27ae60;
}

.strength-text {
  margin-bottom: 8px;
}

.strength-label {
  font-size: 0.85rem;
  font-weight: 600;
}

.strength-label.weak {
  color: #e74c3c;
}

.strength-label.medium {
  color: #f39c12;
}

.strength-label.strong {
  color: #27ae60;
}

.password-requirements {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 6px;
  padding: 10px;
  margin-top: 8px;
}

.requirements-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: #856404;
  margin-bottom: 6px;
}

.password-requirements ul {
  margin: 0;
  padding-left: 16px;
}

.requirement-error {
  color: #856404;
  font-size: 0.8rem;
  margin-bottom: 2px;
}

/* 계정 잠금 알림 */
.account-locked {
  background: #fee;
  border: 1px solid #fcc;
  color: #c33;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 16px;
  font-size: 0.9rem;
}

/* 보안 경고 */
.security-warning {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  color: #856404;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 16px;
  font-size: 0.9rem;
}

.security-warning strong {
  font-weight: 600;
}

/* 세션 타임아웃 알림 */
.session-timeout-warning {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  color: #856404;
  padding: 12px 16px;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1001;
  font-size: 0.9rem;
  max-width: 300px;
}

/* 관리자 표시 */
.admin-badge {
  display: inline-block;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 보안 입력 필드 강화 */
.secure-input {
  position: relative;
}

.input-security-indicator {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.8rem;
}

.input-security-indicator.secure {
  color: #27ae60;
}

.input-security-indicator.warning {
  color: #f39c12;
}

.input-security-indicator.danger {
  color: #e74c3c;
}

/* 보안 정보 패널 */
.security-info-panel {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
}

.security-info-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #495057;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.security-info-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.security-info-item {
  font-size: 0.8rem;
  color: #6c757d;
  margin-bottom: 4px;
  padding-left: 16px;
  position: relative;
}

.security-info-item::before {
  content: "🔒";
  position: absolute;
  left: 0;
  top: 0;
}

/* 보안 레벨 표시 */
.security-level {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.security-level.high {
  background: rgba(39, 174, 96, 0.1);
  color: #27ae60;
  border: 1px solid rgba(39, 174, 96, 0.3);
}

.security-level.medium {
  background: rgba(243, 156, 18, 0.1);
  color: #f39c12;
  border: 1px solid rgba(243, 156, 18, 0.3);
}

.security-level.low {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
  border: 1px solid rgba(231, 76, 60, 0.3);
}
</style> 