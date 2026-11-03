package utils

import (
	"log"
	"os"
	"strings"
	"sync"
	"time"
	_ "time/tzdata" // embed zone data: Windows and minimal containers may not ship it
)

var (
	businessLoc     *time.Location
	businessLocOnce sync.Once
)

// BusinessLocation is the timezone dates are entered in (APP_TIMEZONE, default
// Asia/Kolkata), independent of the server clock — containers usually run on UTC.
func BusinessLocation() *time.Location {
	businessLocOnce.Do(func() {
		name := os.Getenv("APP_TIMEZONE")
		if name == "" {
			name = "Asia/Kolkata"
		}
		loc, err := time.LoadLocation(name)
		if err != nil {
			log.Printf("⚠️  invalid APP_TIMEZONE %q, using Asia/Kolkata: %v", name, err)
			loc, _ = time.LoadLocation("Asia/Kolkata")
		}
		businessLoc = loc
	})
	return businessLoc
}

// BusinessToday returns midnight today in the business timezone.
func BusinessToday() time.Time {
	y, m, d := time.Now().In(BusinessLocation()).Date()
	return time.Date(y, m, d, 0, 0, 0, 0, BusinessLocation())
}

// IsProduction reports whether the server runs with APP_ENV=production.
func IsProduction() bool {
	return os.Getenv("APP_ENV") == "production"
}

// OTPDebugEnabled reports whether OTPs may be logged and returned in API responses.
// Never true in production, regardless of other settings.
func OTPDebugEnabled() bool {
	return !IsProduction() && os.Getenv("APP_ENV") == "development"
}

// CookieDomain is the Domain attribute for auth cookies, e.g. ".jetrav.com" so the
// refresh cookie set by api.jetrav.com is also sent to admin./user.jetrav.com.
// Empty means host-only (fine for localhost).
func CookieDomain() string {
	return os.Getenv("COOKIE_DOMAIN")
}

// IsAdminMobileAllowed reports whether a mobile number may register as an admin.
// ADMIN_MOBILE_NUMBERS is a comma-separated allow-list; empty disables admin signup.
func IsAdminMobileAllowed(mobileNumber string) bool {
	for _, n := range strings.Split(os.Getenv("ADMIN_MOBILE_NUMBERS"), ",") {
		if n = strings.TrimSpace(n); n != "" && n == mobileNumber {
			return true
		}
	}
	return false
}

// defaultOrigins are the production sites, used when ALLOWED_ORIGINS is unset.
var defaultOrigins = []string{
	"https://jetrav.com",
	"https://admin.jetrav.com",
	"https://user.jetrav.com",
	"https://app.jetrav.com",
}

// AllowedOrigins returns the browser origins allowed for CORS and WebSocket upgrades,
// from the comma-separated ALLOWED_ORIGINS env var (defaults to the production sites).
func AllowedOrigins() []string {
	var origins []string
	for _, o := range strings.Split(os.Getenv("ALLOWED_ORIGINS"), ",") {
		if o = strings.TrimRight(strings.TrimSpace(o), "/"); o != "" {
			origins = append(origins, o)
		}
	}
	if len(origins) == 0 {
		return defaultOrigins
	}
	return origins
}
