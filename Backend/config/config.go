package config

import (
	"fmt"
	"log"
	"os"
	"sync"

	"github.com/joho/godotenv"
)

var once sync.Once

func LoadEnv() {
	once.Do(func() {
		env := os.Getenv("GO_ENV")
		if env == "" {
			env = "local"
		}

		file := fmt.Sprintf(".env.local.%s", env)
		err := godotenv.Load(file)
		if err != nil {
			log.Printf("⚠️  %s not found, using system env\n", file)
		} else {
			log.Printf("✅ %s loaded\n", file)
		}
	})
}

func GetEnv(key string) string {
	return os.Getenv(key)
}
