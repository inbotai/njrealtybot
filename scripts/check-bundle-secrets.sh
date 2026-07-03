#!/bin/bash
# Post-build check: fail if API keys or backend-only table queries appear in client bundles.
# Run after `next build` to verify no secrets or RLS-bypass queries leaked.

echo "🔒 Checking client bundles for leaked secrets..."

BUNDLE_DIR=".next/static"
if [ ! -d "$BUNDLE_DIR" ]; then
  echo "⚠️  No bundle directory found — skipping (run after next build)"
  exit 0
fi

FOUND=0

# ── SEC: API key / credential patterns ────────────────────────

PATTERNS=(
  "sk-ant-"
  "sb_secret"
  "service_role"
  "TWILIO_AUTH"
  "TWILIO_ACCOUNT_SID"
  "ANTHROPIC_API_KEY"
  "XAI_API_KEY"
  "RESEND_API_KEY"
  "SUPABASE_SERVICE_KEY"
)

for pat in "${PATTERNS[@]}"; do
  MATCHES=$(grep -rl "$pat" "$BUNDLE_DIR" 2>/dev/null | wc -l | tr -d ' ')
  if [ "$MATCHES" -gt 0 ]; then
    echo "❌ LEAKED SECRET: '$pat' found in $MATCHES bundle file(s)"
    grep -rl "$pat" "$BUNDLE_DIR" 2>/dev/null
    FOUND=1
  fi
done

# ── SEC5: Backend-only tables must not be queried client-side ──
# These tables have RLS enabled but NO policies — only service_role
# can access them. If client code references them, RLS policies must
# be written FIRST. See docs/pre-launch-security-checklist.md #9.

BACKEND_TABLES=(
  "myhome_profiles"
  "myhome_entries"
  "myhome_attachments"
  "myhome_maintenance"
  "myhome_contractors"
  "myhome_share_tokens"
  "myhome_admin_audit"
  "myhome_metrics"
  "seller_readiness_scores"
  "benefits_profiles"
)

echo ""
echo "🔒 SEC5: Checking for backend-only table references in client code..."

# Check source files (not bundles — bundles minify table names)
SRC_DIR="src"
for table in "${BACKEND_TABLES[@]}"; do
  # Search for .from("table_name") or .from('table_name') patterns
  MATCHES=$(grep -rn "from(['\"]${table}['\"])" "$SRC_DIR" 2>/dev/null | grep -v "node_modules" | grep -v "__tests__" | wc -l | tr -d ' ')
  if [ "$MATCHES" -gt 0 ]; then
    echo "❌ SEC5 VIOLATION: Backend-only table '${table}' referenced in client code!"
    grep -rn "from(['\"]${table}['\"])" "$SRC_DIR" 2>/dev/null | grep -v "node_modules" | grep -v "__tests__"
    echo "   → This table has RLS enabled but NO policies. Write RLS policies before shipping."
    echo "   → See: docs/pre-launch-security-checklist.md item #9"
    FOUND=1
  fi
done

# Also check bundles for table names (minification may preserve string literals)
for table in "${BACKEND_TABLES[@]}"; do
  MATCHES=$(grep -rl "\"${table}\"" "$BUNDLE_DIR" 2>/dev/null | wc -l | tr -d ' ')
  if [ "$MATCHES" -gt 0 ]; then
    echo "❌ SEC5 VIOLATION: Backend-only table '${table}' found in production bundle!"
    grep -rl "\"${table}\"" "$BUNDLE_DIR" 2>/dev/null
    echo "   → Write RLS policies before shipping. See checklist item #9."
    FOUND=1
  fi
done

# ── Results ───────────────────────────────────────────────────

echo ""
if [ "$FOUND" -eq 0 ]; then
  echo "✅ No secrets or backend-only table violations found"
  exit 0
else
  echo "❌ BUILD BLOCKED: Security violations detected. Fix before deploying."
  exit 1
fi
