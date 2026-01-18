// Firebase Configuration for User Data Storage
// This file will be dynamically configured by GitHub Actions
// For local development, create a .env file with your Firebase config

let db;

// Try to initialize Firebase (will be replaced by GitHub Actions)
try {
  // This will be replaced during deployment
  import('https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js').then(({ initializeApp }) => {
    import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js').then(({ getFirestore }) => {
      // Configuration will be injected by GitHub Actions
      const firebaseConfig = {
        apiKey: process.env.FIREBASE_API_KEY || "placeholder",
        authDomain: "peiiiatelb.firebaseapp.com",
        projectId: "peiiiatelb",
        storageBucket: "peiiiatelb.firebasestorage.app",
        messagingSenderId: "130685350684",
        appId: "1:130685350684:web:b203789666a9c4ca4c00d9"
      };
      
      const app = initializeApp(firebaseConfig);
      db = getFirestore(app);
    });
  });
} catch (error) {
  console.warn("Firebase not initialized:", error);
}

// User Data Management Functions
class UserDataManager {
  constructor() {
    this.userId = null;
    this.isInitialized = false;
  }

  // Initialize with Telegram user data
  async init(userData) {
    if (!userData || !userData.id) {
      console.warn('No Telegram user data provided');
      return false;
    }

    this.userId = `tg_${userData.id}`;
    this.userData = userData;
    this.isInitialized = true;
    
    // Load existing user data or create new
    await this.loadOrCreateUser();
    return true;
  }

  // Load existing user or create new
  async loadOrCreateUser() {
    try {
      const userRef = doc(db, "users", this.userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        // User exists - load data
        this.userData = { ...this.userData, ...userSnap.data() };
        console.log('User data loaded:', this.userData);
      } else {
        // New user - create record
        await this.createUserRecord();
      }
      
      return this.userData;
    } catch (error) {
      console.error('Error loading user data:', error);
      return null;
    }
  }

  // Create new user record
  async createUserRecord() {
    try {
      const userRef = doc(db, "users", this.userId);
      const userData = {
        telegramId: this.userData.id,
        firstName: this.userData.first_name || '',
        lastName: this.userData.last_name || '',
        username: this.userData.username || '',
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        gameStats: {
          coin: { heads: 0, tails: 0, edge: 0, total: 0 },
          dice: { total: 0, maxValue: 0, maxHit: 0 },
          wheel: { total: 0, sectorsCreated: 0 },
          achievements: [],
          sessionActions: 0
        }
      };

      await setDoc(userRef, userData);
      this.userData = { ...this.userData, ...userData };
      console.log('User record created:', this.userId);
      return true;
    } catch (error) {
      console.error('Error creating user record:', error);
      return false;
    }
  }

  // Update user game statistics
  async updateGameStats(stats) {
    if (!this.isInitialized) return false;

    try {
      const userRef = doc(db, "users", this.userId);
      const updateData = {
        'gameStats': stats,
        'lastActive': new Date().toISOString()
      };

      await setDoc(userRef, updateData, { merge: true });
      console.log('Game stats updated for:', this.userId);
      return true;
    } catch (error) {
      console.error('Error updating game stats:', error);
      return false;
    }
  }

  // Get user data
  async getUserData() {
    if (!this.isInitialized) return null;

    try {
      const userRef = doc(db, "users", this.userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return userSnap.data();
      }
      return null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  // Save achievements
  async saveAchievements(achievements) {
    if (!this.isInitialized) return false;

    try {
      const userRef = doc(db, "users", this.userId);
      await setDoc(userRef, {
        'gameStats.achievements': achievements,
        'lastActive': new Date().toISOString()
      }, { merge: true });
      
      console.log('Achievements saved for:', this.userId);
      return true;
    } catch (error) {
      console.error('Error saving achievements:', error);
      return false;
    }
  }

  // Get leaderboard data
  async getLeaderboard(limit = 10) {
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, 
        where("gameStats.coin.total", ">", 0)
      );
      
      const querySnapshot = await getDocs(q);
      const leaderboard = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        leaderboard.push({
          username: data.username || data.firstName || 'Anonymous',
          coinTotal: data.gameStats.coin.total,
          achievements: data.gameStats.achievements.length
        });
      });

      // Sort by coin flips
      leaderboard.sort((a, b) => b.coinTotal - a.coinTotal);
      
      return leaderboard.slice(0, limit);
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return [];
    }
  }
}

// Utility function to create test data
async function createTestData() {
  try {
    console.log("🧪 Creating test data...");
    
    // Test user data
    const testUsers = [
      {
        id: 123456789,
        first_name: "Алексей",
        last_name: "Петров",
        username: "alex_petrov"
      },
      {
        id: 987654321,
        first_name: "Мария",
        last_name: "Сидорова", 
        username: "maria_sidorova"
      },
      {
        id: 456789123,
        first_name: "Дмитрий",
        last_name: "Козлов",
        username: "dmitry_kozlov"
      }
    ];
    
    // Create test users with different stats
    for (let i = 0; i < testUsers.length; i++) {
      const user = testUsers[i];
      const userId = `tg_${user.id}`;
      
      // Different stats for each user
      const gameStats = {
        coin: {          heads: 40 + i * 15,
          tails: 35 + i * 12,
          edge: i,
          total: 75 + i * 27
        },
        dice: {
          total: 80 + i * 40,
          maxValue: 6,
          maxHit: 10 + i * 5
        },
        wheel: {
          total: 30 + i * 20,
          sectorsCreated: 15 + i * 8
        },
        achievements: i === 0 ? ["first_coin", "coin_master"] : 
                      i === 1 ? ["first_coin", "lucky_edge"] : 
                      ["first_coin"],
        sessionActions: 150 + i * 75
      };
      
      const userData = {
        telegramId: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        username: user.username,
        createdAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString(), // Разные даты создания
        lastActive: new Date().toISOString(),
        gameStats: gameStats
      };
      
      // Create user document
      const userRef = doc(db, "users", userId);
      await setDoc(userRef, userData, { merge: true });
      
      console.log(`✅ Created test user: ${user.first_name} (${userId})`);
    }
    
    // Create leaderboard document
    const leaderboardRef = doc(db, "leaderboard", "global");
    await setDoc(leaderboardRef, {
      lastUpdated: new Date().toISOString(),
      description: "Тестовый лидерборд"
    }, { merge: true });
    
    // Create stats document
    const statsRef = doc(db, "stats", "app");
    await setDoc(statsRef, {
      totalUsers: 3,
      totalCoinFlips: 321,
      totalDiceRolls: 290,
      totalWheelSpins: 130,
      activeUsersToday: 3,
      lastReset: new Date(new Date().getFullYear(), 0, 1).toISOString()
    }, { merge: true });
    
    console.log("🎉 All test data created successfully!");
    console.log("📊 Users created:", testUsers.length);
    return true;
  } catch (error) {
    console.error("❌ Error creating test data:", error);
    return false;
  }
}

// Utility function to clear test data
async function clearTestData() {
  try {
    console.log("🧹 Clearing test data...");
    
    const testUserIds = [
      "tg_123456789",
      "tg_987654321", 
      "tg_456789123"
    ];
    
    // Delete test users
    for (const userId of testUserIds) {
      const userRef = doc(db, "users", userId);
      await setDoc(userRef, {}); // This will delete the document
      console.log(`🗑️ Deleted test user: ${userId}`);
    }
    
    console.log("🧹 Test data cleared!");
    return true;
  } catch (error) {
    console.error("❌ Error clearing test data:", error);
    return false;
  }
}

// Export singleton instance and utility functions
const userDataManager = new UserDataManager();

export { userDataManager, db, createTestData, clearTestData };