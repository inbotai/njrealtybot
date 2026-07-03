#!/bin/bash
# Post-build check: fail if API keys or service credentials appear in client bundles.
# Run after `next build` to verify no secrets leaked into .next/static/

echo "🔒 Checking client bundles for leaked secrets..."

BUNDLE_DIR=".next/static"
if [ ! -d "$BUNDLE_DIR" ]; then
  echo "⚠️  No bundle directory found — skipping (run after next build)"
  exit 0
fi

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

FOUND=0
for pat in "${PATTERNS[@]}"; do
  MATCHES=$(grep -rl "$pat" "$BUNDLE_DIR" 2>/dev/null | wc -l | tr -d ' ')
  if [ "$MATCHES" -gt 0 ]; then
    echo "❌ LEAKED: '$pat' found in $MATCHES bundle file(s)"
    grep -rl "$pat" "$BUNDLE_DIR" 2>/dev/null
    FOUND=1
  fi
done

if [ "$FOUND" -eq 0 ]; then
  echo "✅ No secrets found in client bundles"
  exit 0
else
  echo "❌ BUILD BLOCKED: Secrets detected in client bundles. Fix before deploying."
  exit 1
fi
