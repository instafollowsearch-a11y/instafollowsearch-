const API_BASE_URL = 'https://backend-wr1l.onrender.com/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Общий метод для HTTP запросов
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Убеждаемся, что Content-Type остается application/json
    if (options.body && typeof options.body === 'string') {
      config.headers['Content-Type'] = 'application/json';
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Instagram API методы
  async searchInstagram(username, type = 'followers') {
    return this.request('/instagram/search', {
      method: 'POST',
      body: JSON.stringify({ username, type }),
    });
  }

  async advancedSearch(username, type = 'both') {
    return this.request('/instagram/advanced-search', {
      method: 'POST',
      body: JSON.stringify({ username, type }),
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
      },
    });
  }

  async getNextFollowers(userId, nextPageId) {
    return this.request('/instagram/next-followers', {
      method: 'POST',
      body: JSON.stringify({ userId, nextPageId }),
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
      },
    });
  }

  async getNextFollowing(userId, nextPageId) {
    return this.request('/instagram/next-following', {
      method: 'POST',
      body: JSON.stringify({ userId, nextPageId }),
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
      },
    });
  }

  async getUserInfo(username) {
    return this.request(`/instagram/user/${username}`, {
      method: 'GET',
    });
  }

  // Auth методы
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getSharedActivity(username1, username2) {
    return this.request('/instagram/shared-activity', {
      method: 'POST',
      body: JSON.stringify({ username1, username2 }),
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
      },
    });
  }

  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // User методы
  async getUserProfile() {
    return this.request('/users/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
      },
    });
  }

  async getSearchHistory() {
    return this.request('/users/history', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
      },
    });
  }

  async createPaymentSession(priceId) {
    console.log('Creating payment session for plan:', priceId);
    return this.request('/payment/create-session', {
      method: 'POST',
      body: JSON.stringify({ priceId }),
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
      },
    });
  }

  async verifyPayment(sessionId) {
    console.log("sessionId", sessionId);
    return this.request('/payment/verify', {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
      },
    });
  }

  async getSubscription() {
    return this.request('/payment/subscription', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
      },
    });
  }

  async cancelSubscription() {
    return this.request('/payment/cancel-subscription', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
      },
    });
  }

  async upgradeSubscription(newPriceId) {
    return this.request('/payment/change-subscription', {
      method: 'POST',
      body: JSON.stringify({ newPriceId }),
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
        'Content-Type': 'application/json',
      },
    });
  }

  // Utility методы
  getToken() {
    return localStorage.getItem('authToken');
  }

  setToken(token) {
    localStorage.setItem('authToken', token);
  }

  removeToken() {
    localStorage.removeItem('authToken');
  }

  async applyDiscount() {
    return this.request('/payment/apply-discount', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
      },
    });
  }

  isAuthenticated() {
    return !!this.getToken();
  }
}

export default new ApiService(); 