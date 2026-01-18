// Firebase Configuration for User Data Storage
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js';
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDNibAES2EnrISueTuUcbJRuRhaXdnrCTE",
  authDomain: "peiiiatelb.firebaseapp.com",
  projectId: "peiiiatelb",
  storageBucket: "peiiiatelb.firebasestorage.app",
  messagingSenderId: "130685350684",
  appId: "1:130685350684:web:b203789666a9c4ca4c00d9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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

// Export singleton instance
const userDataManager = new UserDataManager();

export { userDataManager, db };