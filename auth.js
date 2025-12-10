// Authentication functionality
document.addEventListener('DOMContentLoaded', function() {
  setupAuthForms();
  setupMobileNav();
});

// Setup authentication forms
function setupAuthForms() {
  const loginForm = document.getElementById('loginFormElement');
  const signupForm = document.getElementById('signupFormElement');

  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  if (signupForm) {
    signupForm.addEventListener('submit', handleSignup);
  }
}

// Handle login
async function handleLogin(e) {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const credentials = {
    email: formData.get('email'),
    password: formData.get('password')
  };

  // Basic validation
  if (!credentials.email || !credentials.password) {
    showNotification('Please fill in all fields', 'error');
    return;
  }

  const submitBtn = e.target.querySelector('.auth-btn');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Signing in...';
  submitBtn.disabled = true;

  try {
    console.log('Attempting login with:', credentials);
    const result = await API.login(credentials);
    console.log('Login result:', result);
    
    if (result && result.user) {
      // Store user data
      localStorage.setItem('user', JSON.stringify(result.user));
      showNotification('Login successful! Redirecting...');
      
      // Redirect to home page
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
    } else {
      showNotification(result?.error || 'Login failed', 'error');
    }
  } catch (error) {
    console.error('Login error:', error);
    
    // Check if it's a timeout error
    if (error.message.includes('timeout') || error.message.includes('server may be slow')) {
      showNotification('Server is processing your request, please wait...', 'warning');
      return;
    }
    // Check if it's a network error or server error
    else if (error.name === 'TypeError' || error.message.includes('fetch') || error.message.includes('NetworkError')) {
      showNotification('Connection error. Make sure Flask server is running on port 5000.', 'error');
    } else if (error.message.includes('Invalid credentials')) {
      showNotification('Invalid email or password. Please try again.', 'error');
    } else {
      showNotification(error.message || 'Login failed. Please try again.', 'error');
    }
  } finally {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
}

// Handle signup
async function handleSignup(e) {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const userData = {
    name: `${formData.get('firstName')} ${formData.get('lastName')}`,
    email: formData.get('email'),
    password: formData.get('password')
  };
  
  const confirmPassword = formData.get('confirmPassword');
  const agreeTerms = formData.get('agreeTerms');
  const subscribeNewsletter = formData.get('subscribeNewsletter');

  // Validation
  if (!userData.name || !userData.email || !userData.password || !confirmPassword) {
    showNotification('Please fill in all required fields', 'error');
    return;
  }

  if (userData.password !== confirmPassword) {
    showNotification('Passwords do not match', 'error');
    return;
  }

  if (userData.password.length < 8) {
    showNotification('Password must be at least 8 characters long', 'error');
    return;
  }

  if (!agreeTerms || agreeTerms !== 'on') {
    showNotification('Please agree to the Terms of Service', 'error');
    return;
  }

  const submitBtn = e.target.querySelector('.auth-btn');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Creating account...';
  submitBtn.disabled = true;

  try {
    console.log('Attempting registration with:', userData);
    const result = await API.register(userData);
    console.log('Registration result:', result);
    
    if (result && result.user) {
      // Store user data
      localStorage.setItem('user', JSON.stringify(result.user));
      
      // Also store in localStorage for admin tracking (backup)
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const newUser = {
        name: userData.name,
        email: userData.email,
        registrationDate: new Date().toISOString().split('T')[0]
      };
      
      const existingUser = registeredUsers.find(u => u.email === userData.email);
      if (!existingUser) {
        registeredUsers.push(newUser);
        localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
      }
      
      showNotification('Account created successfully! Redirecting...');
      
      // Subscribe to newsletter if checked
      if (subscribeNewsletter) {
        try {
          await API.subscribeNewsletter(userData.email);
        } catch (error) {
          console.error('Newsletter subscription error:', error);
        }
      }
      
      // Redirect to home page
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
    } else {
      showNotification(result?.error || 'Registration failed', 'error');
    }
  } catch (error) {
    console.error('Registration error:', error);
    
    // Check if it's a timeout error
    if (error.message.includes('timeout') || error.message.includes('server may be slow')) {
      showNotification('Server is processing your request, please wait...', 'warning');
      // Don't return here, let the process continue
      return;
    }
    // Check if it's a network error or server error
    else if (error.name === 'TypeError' || error.message.includes('fetch') || error.message.includes('NetworkError')) {
      showNotification('Connection error. Make sure Flask server is running on port 5000.', 'error');
    } else if (error.message.includes('User already exists')) {
      showNotification('Email already registered. Please use a different email or login.', 'error');
    } else {
      showNotification(error.message || 'Registration failed. Please try again.', 'error');
    }
  } finally {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
}

// Switch between login and signup forms
function switchToSignup() {
  document.getElementById('loginForm').classList.add('hidden');
  document.getElementById('signupForm').classList.remove('hidden');
}

function switchToLogin() {
  document.getElementById('signupForm').classList.add('hidden');
  document.getElementById('loginForm').classList.remove('hidden');
}

// Setup mobile navigation
function setupMobileNav() {
  const mobileToggle = document.getElementById('mobileToggle');
  if (mobileToggle) {
    mobileToggle.addEventListener('click', function() {
      const nav = document.getElementById('mainNav');
      if (nav) {
        nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
      }
    });
  }
}

// Notification system
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  let backgroundColor;
  switch(type) {
    case 'success': backgroundColor = '#10b981'; break;
    case 'error': backgroundColor = '#ef4444'; break;
    case 'warning': backgroundColor = '#f59e0b'; break;
    default: backgroundColor = '#10b981';
  }
  
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    background: ${backgroundColor};
    color: white;
    border-radius: 8px;
    z-index: 1000;
    animation: slideIn 0.3s ease;
    max-width: 400px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 4000);
}

// Forgot password functions
function showForgotPassword() {
  document.getElementById('forgotPasswordModal').style.display = 'flex';
}

function closeForgotPassword() {
  document.getElementById('forgotPasswordModal').style.display = 'none';
  document.getElementById('forgotPasswordForm').reset();
}

// Handle forgot password form
document.addEventListener('DOMContentLoaded', function() {
  const forgotForm = document.getElementById('forgotPasswordForm');
  if (forgotForm) {
    forgotForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const email = document.getElementById('resetEmail').value;
      
      // Simulate sending reset email
      showNotification('Password reset link sent to your email!', 'success');
      closeForgotPassword();
    });
  }
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);