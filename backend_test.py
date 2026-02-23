#!/usr/bin/env python3
"""
Fractal Module Backend API Testing
Tests the specific APIs mentioned in the review request:
- /api/fractal/v2.1/focus-pack
- /api/fractal/v2.1/overlay
- /api/fractal/v2.1/terminal
"""

import requests
import sys
import json
from datetime import datetime
from typing import Dict, List, Any, Optional

class FractalAPITester:
    def __init__(self, base_url="https://fractal-admin-refine.preview.emergentagent.com"):
        self.base_url = base_url.rstrip('/')
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.horizons = ['7d', '14d', '30d', '90d', '180d', '365d']
        
        # Session for connection reuse
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'FractalTester/1.0'
        })

    def run_test(self, name: str, method: str, endpoint: str, expected_status: int = 200, 
                 params: Optional[Dict] = None, data: Optional[Dict] = None) -> tuple[bool, Dict]:
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        if params:
            print(f"   Params: {params}")
        
        try:
            if method == 'GET':
                response = self.session.get(url, params=params, timeout=30)
            elif method == 'POST':
                response = self.session.post(url, json=data, params=params, timeout=30)
            else:
                response = self.session.request(method, url, json=data, params=params, timeout=30)

            success = response.status_code == expected_status
            
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                except:
                    response_data = {"raw_text": response.text[:500]}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                response_data = {"error": response.text}

            # Store test result
            self.test_results.append({
                "name": name,
                "success": success,
                "status_code": response.status_code,
                "expected_status": expected_status,
                "url": url,
                "params": params,
                "response_size": len(response.text) if response.text else 0
            })

            return success, response_data

        except requests.exceptions.Timeout:
            print(f"❌ Failed - Request timeout after 30s")
            self.test_results.append({
                "name": name,
                "success": False,
                "error": "Request timeout",
                "url": url
            })
            return False, {"error": "Request timeout"}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.test_results.append({
                "name": name,
                "success": False,
                "error": str(e),
                "url": url
            })
            return False, {"error": str(e)}

    def test_focus_pack_api(self) -> List[Dict]:
        """Test /api/fractal/v2.1/focus-pack for all horizons"""
        print("\n" + "="*60)
        print("TESTING FOCUS-PACK API FOR ALL HORIZONS")
        print("="*60)
        
        focus_pack_results = []
        
        for horizon in self.horizons:
            params = {
                'symbol': 'BTC',
                'focus': horizon
            }
            
            success, response = self.run_test(
                f"Focus Pack - {horizon}",
                "GET",
                "/api/fractal/v2.1/focus-pack",
                200,
                params=params
            )
            
            result = {
                "horizon": horizon,
                "success": success,
                "response": response
            }
            
            if success:
                # Validate response structure
                if isinstance(response, dict):
                    if 'focusPack' in response:
                        fp = response['focusPack']
                        print(f"   📊 FocusPack keys: {list(fp.keys()) if isinstance(fp, dict) else 'Not a dict'}")
                        
                        # Check for meta data
                        if 'meta' in fp:
                            meta = fp['meta']
                            print(f"   📈 Meta - aftermathDays: {meta.get('aftermathDays', 'N/A')}, tier: {meta.get('tier', 'N/A')}")
                        
                        # Check for overlay data
                        if 'overlay' in fp:
                            overlay = fp['overlay']
                            if isinstance(overlay, dict):
                                matches = overlay.get('matches', [])
                                print(f"   🎯 Overlay - matches: {len(matches) if isinstance(matches, list) else 'N/A'}")
                                
                                # Check windowLen vs horizon
                                window_len = overlay.get('windowLen')
                                display_window = overlay.get('displayWindow')
                                print(f"   📏 WindowLen: {window_len}, DisplayWindow: {display_window}")
                                
                                result["windowLen"] = window_len
                                result["displayWindow"] = display_window
                                result["matches_count"] = len(matches) if isinstance(matches, list) else 0
                        
                        # Check for forecast data
                        if 'forecast' in fp:
                            forecast = fp['forecast']
                            if isinstance(forecast, dict):
                                print(f"   🔮 Forecast keys: {list(forecast.keys())}")
                    else:
                        print(f"   ⚠️  No 'focusPack' key in response")
                else:
                    print(f"   ⚠️  Response is not a dict: {type(response)}")
            
            focus_pack_results.append(result)
        
        return focus_pack_results

    def test_overlay_api(self) -> List[Dict]:
        """Test /api/fractal/v2.1/overlay for different horizons and windowLen"""
        print("\n" + "="*60)
        print("TESTING OVERLAY API")
        print("="*60)
        
        overlay_results = []
        
        # Test different windowLen and displayWindow combinations
        test_cases = [
            {'horizon': 30, 'windowLen': 30, 'displayWindow': 30, 'aftermathDays': 30},
            {'horizon': 90, 'windowLen': 60, 'displayWindow': 90, 'aftermathDays': 90},
            {'horizon': 365, 'windowLen': 90, 'displayWindow': 365, 'aftermathDays': 365},
        ]
        
        for case in test_cases:
            params = {
                'symbol': 'BTC',
                'horizon': case['horizon'],
                'windowLen': case['windowLen'],
                'displayWindow': case['displayWindow'],
                'topK': 10,
                'aftermathDays': case['aftermathDays']
            }
            
            success, response = self.run_test(
                f"Overlay - H{case['horizon']}d W{case['windowLen']} D{case['displayWindow']}",
                "GET",
                "/api/fractal/v2.1/overlay",
                200,
                params=params
            )
            
            result = {
                "test_case": case,
                "success": success,
                "response": response
            }
            
            if success and isinstance(response, dict):
                # Validate symmetric logic
                window_len = response.get('windowLen')
                current_window = response.get('currentWindow', {})
                matches = response.get('matches', [])
                
                print(f"   📏 Returned windowLen: {window_len}")
                print(f"   🎯 Matches found: {len(matches) if isinstance(matches, list) else 'N/A'}")
                print(f"   📊 Current window data points: {len(current_window.get('raw', [])) if isinstance(current_window, dict) else 'N/A'}")
                
                # Check if displayWindow matches request
                if window_len == case['displayWindow']:
                    print(f"   ✅ WindowLen matches displayWindow ({case['displayWindow']})")
                else:
                    print(f"   ❌ WindowLen ({window_len}) does not match displayWindow ({case['displayWindow']})")
                
                # Validate matches structure
                if matches and len(matches) > 0:
                    first_match = matches[0]
                    if isinstance(first_match, dict):
                        print(f"   📈 First match keys: {list(first_match.keys())}")
                        if 'windowNormalized' in first_match and 'aftermathNormalized' in first_match:
                            window_points = len(first_match.get('windowNormalized', []))
                            aftermath_points = len(first_match.get('aftermathNormalized', []))
                            print(f"   📊 Match data: window={window_points}, aftermath={aftermath_points}")
                
                result.update({
                    "windowLen": window_len,
                    "matches_count": len(matches) if isinstance(matches, list) else 0,
                    "window_matches_display": window_len == case['displayWindow']
                })
            
            overlay_results.append(result)
        
        return overlay_results

    def test_terminal_api(self) -> Dict:
        """Test /api/fractal/v2.1/terminal"""
        print("\n" + "="*60)
        print("TESTING TERMINAL API")
        print("="*60)
        
        params = {
            'symbol': 'BTC',
            'set': 'extended',
            'focus': '30d'
        }
        
        success, response = self.run_test(
            "Terminal Data",
            "GET",
            "/api/fractal/v2.1/terminal",
            200,
            params=params
        )
        
        result = {
            "success": success,
            "response": response
        }
        
        if success and isinstance(response, dict):
            # Check for key terminal data sections
            sections = ['volatility', 'decisionKernel', 'horizonStack', 'consensus74', 'phaseSnapshot']
            
            for section in sections:
                if section in response:
                    print(f"   ✅ Found section: {section}")
                    
                    # Detailed checks for specific sections
                    if section == 'decisionKernel' and isinstance(response[section], dict):
                        dk = response[section]
                        print(f"     📊 DecisionKernel keys: {list(dk.keys())}")
                        
                        # Check for sizing, consensus, conflict
                        for subsection in ['sizing', 'consensus', 'conflict']:
                            if subsection in dk:
                                print(f"     ✅ Found {subsection}")
                            else:
                                print(f"     ❌ Missing {subsection}")
                    
                    elif section == 'horizonStack' and isinstance(response[section], list):
                        hs = response[section]
                        print(f"     📈 HorizonStack entries: {len(hs)}")
                        if len(hs) > 0 and isinstance(hs[0], dict):
                            print(f"     📊 First entry keys: {list(hs[0].keys())}")
                            
                else:
                    print(f"   ❌ Missing section: {section}")
            
            # Check data completeness
            result["sections_found"] = [s for s in sections if s in response]
            result["sections_missing"] = [s for s in sections if s not in response]
        
        return result

    def validate_percentile_renaming(self, focus_pack_data: List[Dict]):
        """Check if P10/P25/P50/P75/P90 are renamed to Bear Case/Bull Case etc."""
        print("\n" + "="*60)
        print("VALIDATING PERCENTILE RENAMING")
        print("="*60)
        
        issues = []
        
        for result in focus_pack_data:
            if not result["success"]:
                continue
                
            response = result["response"]
            if not isinstance(response, dict) or 'focusPack' not in response:
                continue
                
            fp = response['focusPack']
            
            # Check overlay distribution
            if 'overlay' in fp and isinstance(fp['overlay'], dict):
                overlay = fp['overlay']
                if 'distribution' in overlay:
                    dist = overlay['distribution']
                    print(f"   📊 {result['horizon']}: Distribution keys: {list(dist.keys()) if isinstance(dist, dict) else 'N/A'}")
                    
                    # Check if old percentile names are still present
                    old_names = ['p10', 'p25', 'p50', 'p75', 'p90']
                    found_old = [name for name in old_names if name in dist]
                    
                    if found_old:
                        issues.append({
                            "horizon": result['horizon'],
                            "issue": f"Found old percentile names: {found_old}",
                            "location": "overlay.distribution"
                        })
                        print(f"   ❌ Found old percentile names: {found_old}")
                    else:
                        print(f"   ✅ No old percentile names found")
        
        return issues

    def run_all_tests(self):
        """Run all fractal API tests"""
        print("🚀 Starting Fractal Module Backend API Testing")
        print(f"🌐 Base URL: {self.base_url}")
        
        start_time = datetime.now()
        
        # Test each API
        focus_pack_results = self.test_focus_pack_api()
        overlay_results = self.test_overlay_api()
        terminal_result = self.test_terminal_api()
        
        # Validate naming conventions
        percentile_issues = self.validate_percentile_renaming(focus_pack_results)
        
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        # Summary
        print("\n" + "="*60)
        print("📊 FINAL RESULTS")
        print("="*60)
        print(f"⏱️  Total time: {duration:.2f} seconds")
        print(f"📈 Tests run: {self.tests_run}")
        print(f"✅ Tests passed: {self.tests_passed}")
        print(f"❌ Tests failed: {self.tests_run - self.tests_passed}")
        print(f"📊 Success rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        # Specific findings
        print("\n🔍 SPECIFIC FINDINGS:")
        
        # Focus-pack horizon coverage
        successful_horizons = [r["horizon"] for r in focus_pack_results if r["success"]]
        failed_horizons = [r["horizon"] for r in focus_pack_results if not r["success"]]
        
        print(f"✅ Focus-pack working horizons: {successful_horizons}")
        if failed_horizons:
            print(f"❌ Focus-pack failing horizons: {failed_horizons}")
        
        # Overlay symmetry check
        symmetric_cases = [r for r in overlay_results if r.get("window_matches_display", False)]
        print(f"✅ Overlay symmetric cases: {len(symmetric_cases)}/{len(overlay_results)}")
        
        # Terminal completeness
        if terminal_result["success"]:
            missing_sections = terminal_result.get("sections_missing", [])
            if missing_sections:
                print(f"⚠️  Terminal missing sections: {missing_sections}")
            else:
                print("✅ Terminal has all expected sections")
        else:
            print("❌ Terminal API failed")
        
        # Percentile naming
        if percentile_issues:
            print(f"❌ Percentile naming issues: {len(percentile_issues)}")
            for issue in percentile_issues:
                print(f"   • {issue['horizon']}: {issue['issue']}")
        else:
            print("✅ No old percentile names found")
        
        return {
            "total_tests": self.tests_run,
            "passed_tests": self.tests_passed,
            "success_rate": self.tests_passed/self.tests_run*100 if self.tests_run > 0 else 0,
            "focus_pack_results": focus_pack_results,
            "overlay_results": overlay_results,
            "terminal_result": terminal_result,
            "percentile_issues": percentile_issues,
            "duration": duration
        }

def main():
    print("🧪 Fractal Module API Testing Suite")
    print("=" * 50)
    
    # Initialize tester with the actual backend URL
    tester = FractalAPITester()
    
    # Run all tests
    results = tester.run_all_tests()
    
    # Return appropriate exit code
    success_rate = results["success_rate"]
    if success_rate >= 80:
        print(f"\n🎉 Testing completed successfully ({success_rate:.1f}% pass rate)")
        return 0
    elif success_rate >= 50:
        print(f"\n⚠️  Testing completed with issues ({success_rate:.1f}% pass rate)")
        return 1
    else:
        print(f"\n❌ Testing failed ({success_rate:.1f}% pass rate)")
        return 2

if __name__ == "__main__":
    sys.exit(main())