"""
Skin Intelligence Platform - Master Automated Test Runner
Milestone 4 Task 3: Testing & Validations

Runs all test suites with clear, friendly, plain-English output:
1. Machine Learning Models: Validates 4 trained Random Forest and regression models.
2. Core Intelligence Engines: Validates product matching, ingredient parsing, progress, and analytics.
3. Data & Schema Validations: Validates Pydantic boundary checks and input hygiene.
4. REST API Endpoints: Validates full FastAPI web service using in-memory SQLite database.
"""

import sys
import os
import time
import unittest

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

# ANSI Color Codes for Clean Terminal Output
GREEN = "\033[92m"
BLUE = "\033[94m"
CYAN = "\033[96m"
YELLOW = "\033[93m"
RED = "\033[91m"
BOLD = "\033[1m"
RESET = "\033[0m"


def print_banner():
    print(f"\n{BOLD}{CYAN}{'='*70}{RESET}")
    print(f"{BOLD}{CYAN}   Skin Intelligence Platform - Automated Test & Validation Suite{RESET}")
    print(f"{CYAN}   Milestone 4: Production Quality Assurance & System Verification{RESET}")
    print(f"{BOLD}{CYAN}{'='*70}{RESET}\n")


def run_suite(suite_name: str, module_path: str):
    print(f"{BOLD}{BLUE}>> Testing: {suite_name}{RESET}")
    loader = unittest.TestLoader()
    suite = loader.loadTestsFromName(module_path)
    
    start_time = time.time()
    runner = unittest.TextTestRunner(verbosity=1)
    result = runner.run(suite)
    elapsed = time.time() - start_time
    
    total = result.testsRun
    failures = len(result.failures)
    errors = len(result.errors)
    passed = total - failures - errors

    if result.wasSuccessful():
        print(f"  {GREEN}[PASS] ALL {total} TESTS PASSED{RESET} ({elapsed:.2f}s)\n")
    else:
        print(f"  {RED}[FAIL] {failures + errors} TESTS FAILED out of {total}{RESET} ({elapsed:.2f}s)\n")

    return {
        "name": suite_name,
        "total": total,
        "passed": passed,
        "failed": failures + errors,
        "elapsed": elapsed,
        "success": result.wasSuccessful()
    }


def main():
    print_banner()

    test_modules = [
        ("1. Machine Learning Models", "tests.test_ml_models"),
        ("2. Core Intelligence Engines", "tests.test_engines"),
        ("3. Input & Schema Validations", "tests.test_validations"),
        ("4. Full-Stack REST API Endpoints", "tests.test_api_endpoints")
    ]

    results = []
    overall_start = time.time()

    for name, mod in test_modules:
        res = run_suite(name, mod)
        results.append(res)

    overall_elapsed = time.time() - overall_start
    total_tests = sum(r["total"] for r in results)
    total_passed = sum(r["passed"] for r in results)
    total_failed = sum(r["failed"] for r in results)

    # Print Summary Table
    print(f"{BOLD}{'='*70}{RESET}")
    print(f"{BOLD}   FINAL VALIDATION SUMMARY{RESET}")
    print(f"{'='*70}")
    for r in results:
        status_tag = f"{GREEN}PASSED{RESET}" if r["success"] else f"{RED}FAILED{RESET}"
        print(f" * {r['name']:<35} : {r['passed']}/{r['total']} passed ({r['elapsed']:.2f}s) [{status_tag}]")
    print(f"{'-'*70}")
    print(f"{BOLD} TOTAL EXECUTED:{RESET} {total_tests} tests in {overall_elapsed:.2f}s")
    print(f"{BOLD} PASS RATE:     {RESET} {GREEN}{total_passed}/{total_tests} (100%){RESET}" if total_failed == 0 else f"{RED}{total_passed}/{total_tests}{RESET}")
    print(f"{'='*70}\n")

    if total_failed == 0:
        print(f"{BOLD}{GREEN}[SUCCESS] All platform validations and test suites successfully passed!{RESET}\n")
        return 0
    else:
        print(f"{BOLD}{RED}[ERROR] Some tests failed. Please review the errors above.{RESET}\n")
        return 1


if __name__ == "__main__":
    sys.exit(main())
