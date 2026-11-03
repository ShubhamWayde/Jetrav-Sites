package config

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"
	"sync"

	"github.com/joho/godotenv"
)

var once sync.Once

// requiredVars must be set (via env file or system env) for the server to start.
var requiredVars = []string{"DB_HOST", "DB_PORT", "DB_USER", "DB_NAME", "DB_SSLMODE", "PORT", "JWT_SECRET"}

func LoadEnv() {
	once.Do(func() {
		// Run from the module root so .env.* and ./migrations resolve no matter
		// where the server is started (e.g. `go run .` inside cmd/server).
		if root, ok := findModuleRoot(); ok {
			if err := os.Chdir(root); err != nil {
				log.Printf("⚠️  could not change to module root %s: %v\n", root, err)
			}
		}

		env := os.Getenv("GO_ENV")
		if env == "" {
			env = "local"
		}

		// GO_ENV=local → .env.local, GO_ENV=prod → .env.prod (see .env.example)
		file := fmt.Sprintf(".env.%s", env)
		err := godotenv.Load(file)
		if err != nil {
			log.Printf("⚠️  %s not found, using system env\n", file)
		} else {
			log.Printf("✅ %s loaded\n", file)
		}

		var missing []string
		for _, key := range requiredVars {
			if os.Getenv(key) == "" {
				missing = append(missing, key)
			}
		}
		if len(missing) > 0 {
			log.Fatalf("❌ missing required env vars: %s (set them in %s or the system environment)",
				strings.Join(missing, ", "), file)
		}
	})
}

// findModuleRoot walks up from the working directory to the folder holding go.mod.
// Returns false in deployments that ship only the binary (no go.mod).
func findModuleRoot() (string, bool) {
	dir, err := os.Getwd()
	if err != nil {
		return "", false
	}
	for {
		if _, err := os.Stat(filepath.Join(dir, "go.mod")); err == nil {
			return dir, true
		}
		parent := filepath.Dir(dir)
		if parent == dir {
			return "", false
		}
		dir = parent
	}
}

func GetEnv(key string) string {
	return os.Getenv(key)
}
