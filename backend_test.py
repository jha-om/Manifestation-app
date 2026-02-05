#!/usr/bin/env python3
"""
Backend API Testing for Manifestation & Affirmation App
Tests all backend endpoints with comprehensive scenarios
"""

import requests
import json
from datetime import datetime, date
import time
import os
from pathlib import Path

# Load environment variables to get the backend URL
def load_env_file(file_path):
    env_vars = {}
    if os.path.exists(file_path):
        with open(file_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    env_vars[key] = value.strip('"')
    return env_vars

# Get backend URL from frontend .env
frontend_env = load_env_file('/app/frontend/.env')
BACKEND_URL = frontend_env.get('EXPO_PUBLIC_BACKEND_URL', 'http://localhost:8001')
API_BASE = f"{BACKEND_URL}/api"

print(f"Testing backend at: {API_BASE}")

class BackendTester:
    def __init__(self):
        self.session = requests.Session()
        self.test_results = {
            'passed': 0,
            'failed': 0,
            'errors': []
        }
        self.created_affirmations = []
        
    def log_result(self, test_name, success, message=""):
        if success:
            self.test_results['passed'] += 1
            print(f"✅ {test_name}: PASSED {message}")
        else:
            self.test_results['failed'] += 1
            self.test_results['errors'].append(f"{test_name}: {message}")
            print(f"❌ {test_name}: FAILED - {message}")
    
    def test_api_root(self):
        """Test the root API endpoint"""
        try:
            response = self.session.get(f"{API_BASE}/")
            if response.status_code == 200:
                data = response.json()
                if "message" in data:
                    self.log_result("API Root", True, f"Response: {data['message']}")
                else:
                    self.log_result("API Root", False, "Missing message in response")
            else:
                self.log_result("API Root", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("API Root", False, f"Exception: {str(e)}")
    
    def test_affirmations_crud(self):
        """Test all affirmation CRUD operations"""
        
        # 1. Test GET /api/affirmations (initially empty or with examples)
        try:
            response = self.session.get(f"{API_BASE}/affirmations")
            if response.status_code == 200:
                initial_affirmations = response.json()
                self.log_result("GET Affirmations", True, f"Found {len(initial_affirmations)} affirmations")
            else:
                self.log_result("GET Affirmations", False, f"Status: {response.status_code}")
                return
        except Exception as e:
            self.log_result("GET Affirmations", False, f"Exception: {str(e)}")
            return
        
        # 2. Test POST /api/affirmations - Create new affirmations
        test_affirmations = [
            "I am confident and capable of achieving my goals",
            "I attract abundance and prosperity into my life",
            "I am worthy of love and respect from myself and others"
        ]
        
        for i, text in enumerate(test_affirmations):
            try:
                payload = {"text": text}
                response = self.session.post(f"{API_BASE}/affirmations", json=payload)
                if response.status_code == 200:
                    affirmation = response.json()
                    if 'id' in affirmation and affirmation['text'] == text:
                        self.created_affirmations.append(affirmation['id'])
                        self.log_result(f"POST Affirmation {i+1}", True, f"Created: {affirmation['id']}")
                    else:
                        self.log_result(f"POST Affirmation {i+1}", False, "Invalid response structure")
                else:
                    self.log_result(f"POST Affirmation {i+1}", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_result(f"POST Affirmation {i+1}", False, f"Exception: {str(e)}")
        
        if not self.created_affirmations:
            print("⚠️  No affirmations created, skipping update/delete tests")
            return
        
        # 3. Test PUT /api/affirmations/{id} - Update affirmation
        if self.created_affirmations:
            try:
                affirmation_id = self.created_affirmations[0]
                updated_text = "I am updated and even more powerful"
                payload = {"text": updated_text}
                response = self.session.put(f"{API_BASE}/affirmations/{affirmation_id}", json=payload)
                if response.status_code == 200:
                    updated = response.json()
                    if updated['text'] == updated_text:
                        self.log_result("PUT Affirmation", True, f"Updated: {affirmation_id}")
                    else:
                        self.log_result("PUT Affirmation", False, "Text not updated correctly")
                else:
                    self.log_result("PUT Affirmation", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_result("PUT Affirmation", False, f"Exception: {str(e)}")
        
        # 4. Test POST /api/affirmations/reorder
        if len(self.created_affirmations) >= 2:
            try:
                # Reverse the order of created affirmations
                reorder_payload = {"affirmation_ids": list(reversed(self.created_affirmations))}
                response = self.session.post(f"{API_BASE}/affirmations/reorder", json=reorder_payload)
                if response.status_code == 200:
                    self.log_result("POST Reorder", True, "Affirmations reordered")
                else:
                    self.log_result("POST Reorder", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_result("POST Reorder", False, f"Exception: {str(e)}")
        
        # 5. Test DELETE /api/affirmations/{id} - Delete one affirmation (keep others for progress tests)
        if len(self.created_affirmations) > 1:
            try:
                affirmation_id = self.created_affirmations.pop()  # Remove last one from our list
                response = self.session.delete(f"{API_BASE}/affirmations/{affirmation_id}")
                if response.status_code == 200:
                    self.log_result("DELETE Affirmation", True, f"Deleted: {affirmation_id}")
                else:
                    self.log_result("DELETE Affirmation", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_result("DELETE Affirmation", False, f"Exception: {str(e)}")
    
    def test_seed_affirmations(self):
        """Test seeding example affirmations"""
        try:
            response = self.session.post(f"{API_BASE}/affirmations/seed")
            if response.status_code == 200:
                data = response.json()
                self.log_result("POST Seed Affirmations", True, data.get('message', ''))
            else:
                self.log_result("POST Seed Affirmations", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("POST Seed Affirmations", False, f"Exception: {str(e)}")
    
    def test_progress_endpoints(self):
        """Test daily progress tracking endpoints"""
        
        # 1. Test GET /api/progress/today
        try:
            response = self.session.get(f"{API_BASE}/progress/today")
            if response.status_code == 200:
                progress = response.json()
                required_fields = ['id', 'date', 'completed_affirmations', 'total_affirmations', 'completion_percentage', 'practice_count']
                if all(field in progress for field in required_fields):
                    self.log_result("GET Progress Today", True, f"Progress: {progress['completion_percentage']}%")
                else:
                    self.log_result("GET Progress Today", False, "Missing required fields")
            else:
                self.log_result("GET Progress Today", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("GET Progress Today", False, f"Exception: {str(e)}")
        
        # 2. Test POST /api/progress/mark-complete
        if self.created_affirmations:
            today = date.today().isoformat()
            
            # Mark first affirmation as complete
            try:
                payload = {
                    "date": today,
                    "affirmation_id": self.created_affirmations[0]
                }
                response = self.session.post(f"{API_BASE}/progress/mark-complete", json=payload)
                if response.status_code == 200:
                    progress = response.json()
                    if self.created_affirmations[0] in progress['completed_affirmations']:
                        self.log_result("POST Mark Complete (First)", True, f"Practice count: {progress['practice_count']}")
                    else:
                        self.log_result("POST Mark Complete (First)", False, "Affirmation not marked as completed")
                else:
                    self.log_result("POST Mark Complete (First)", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_result("POST Mark Complete (First)", False, f"Exception: {str(e)}")
            
            # Mark same affirmation again (should increase practice_count but not completion percentage)
            try:
                payload = {
                    "date": today,
                    "affirmation_id": self.created_affirmations[0]
                }
                response = self.session.post(f"{API_BASE}/progress/mark-complete", json=payload)
                if response.status_code == 200:
                    progress = response.json()
                    if progress['practice_count'] >= 2:
                        self.log_result("POST Mark Complete (Repeat)", True, f"Practice count increased: {progress['practice_count']}")
                    else:
                        self.log_result("POST Mark Complete (Repeat)", False, "Practice count not increased")
                else:
                    self.log_result("POST Mark Complete (Repeat)", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_result("POST Mark Complete (Repeat)", False, f"Exception: {str(e)}")
            
            # Mark all remaining affirmations to test streak logic
            for affirmation_id in self.created_affirmations[1:]:
                try:
                    payload = {
                        "date": today,
                        "affirmation_id": affirmation_id
                    }
                    response = self.session.post(f"{API_BASE}/progress/mark-complete", json=payload)
                    if response.status_code == 200:
                        progress = response.json()
                        print(f"   Marked {affirmation_id}: {progress['completion_percentage']}%")
                    else:
                        print(f"   Failed to mark {affirmation_id}: {response.status_code}")
                except Exception as e:
                    print(f"   Error marking {affirmation_id}: {str(e)}")
        
        # 3. Test GET /api/progress/history
        try:
            response = self.session.get(f"{API_BASE}/progress/history?days=7")
            if response.status_code == 200:
                history = response.json()
                self.log_result("GET Progress History", True, f"Found {len(history)} days of history")
            else:
                self.log_result("GET Progress History", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("GET Progress History", False, f"Exception: {str(e)}")
    
    def test_settings_endpoints(self):
        """Test settings management endpoints"""
        
        # 1. Test GET /api/settings
        try:
            response = self.session.get(f"{API_BASE}/settings")
            if response.status_code == 200:
                settings = response.json()
                required_fields = ['id', 'morning_time', 'night_time', 'notifications_enabled', 'current_streak', 'longest_streak']
                if all(field in settings for field in required_fields):
                    self.log_result("GET Settings", True, f"Streak: {settings['current_streak']}/{settings['longest_streak']}")
                else:
                    self.log_result("GET Settings", False, "Missing required fields")
            else:
                self.log_result("GET Settings", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("GET Settings", False, f"Exception: {str(e)}")
        
        # 2. Test PUT /api/settings
        try:
            payload = {
                "notifications_enabled": True,
                "morning_time": "07:30",
                "night_time": "21:00"
            }
            response = self.session.put(f"{API_BASE}/settings", json=payload)
            if response.status_code == 200:
                settings = response.json()
                if (settings['morning_time'] == "07:30" and 
                    settings['night_time'] == "21:00" and 
                    settings['notifications_enabled'] == True):
                    self.log_result("PUT Settings", True, "Settings updated correctly")
                else:
                    self.log_result("PUT Settings", False, "Settings not updated correctly")
            else:
                self.log_result("PUT Settings", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("PUT Settings", False, f"Exception: {str(e)}")
    
    def test_streak_calculation(self):
        """Test streak calculation by checking settings after completing all affirmations"""
        try:
            response = self.session.get(f"{API_BASE}/settings")
            if response.status_code == 200:
                settings = response.json()
                current_streak = settings.get('current_streak', 0)
                longest_streak = settings.get('longest_streak', 0)
                
                if current_streak > 0:
                    self.log_result("Streak Calculation", True, f"Current: {current_streak}, Longest: {longest_streak}")
                else:
                    self.log_result("Streak Calculation", False, "Streak not updated after completing all affirmations")
            else:
                self.log_result("Streak Calculation", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Streak Calculation", False, f"Exception: {str(e)}")
    
    def run_all_tests(self):
        """Run all backend tests in sequence"""
        print("🚀 Starting Backend API Tests...")
        print("=" * 50)
        
        # Test basic connectivity
        self.test_api_root()
        
        # Test affirmation endpoints
        print("\n📝 Testing Affirmation Endpoints...")
        self.test_affirmations_crud()
        self.test_seed_affirmations()
        
        # Test progress endpoints
        print("\n📊 Testing Progress Endpoints...")
        self.test_progress_endpoints()
        
        # Test settings endpoints
        print("\n⚙️  Testing Settings Endpoints...")
        self.test_settings_endpoints()
        
        # Test streak calculation
        print("\n🔥 Testing Streak Logic...")
        self.test_streak_calculation()
        
        # Print summary
        print("\n" + "=" * 50)
        print("📋 TEST SUMMARY")
        print("=" * 50)
        print(f"✅ Passed: {self.test_results['passed']}")
        print(f"❌ Failed: {self.test_results['failed']}")
        
        if self.test_results['errors']:
            print("\n🚨 FAILED TESTS:")
            for error in self.test_results['errors']:
                print(f"   • {error}")
        
        success_rate = (self.test_results['passed'] / (self.test_results['passed'] + self.test_results['failed'])) * 100
        print(f"\n📈 Success Rate: {success_rate:.1f}%")
        
        return self.test_results['failed'] == 0

if __name__ == "__main__":
    tester = BackendTester()
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 All tests passed! Backend API is working correctly.")
    else:
        print(f"\n⚠️  {tester.test_results['failed']} test(s) failed. Check the errors above.")
    
    exit(0 if success else 1)