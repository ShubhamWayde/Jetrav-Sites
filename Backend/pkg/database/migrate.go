package database

import (
	"errors"
	"log"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
)

func RunMigrations(dbURL string) {
	m, err := migrate.New(
		"file://migrations",
		dbURL,
	)
	if err != nil {
		log.Fatal(err)
	}

	if err := m.Up(); err != nil {
		// No new migrations — perfectly fine.
		if err.Error() == "no change" {
			log.Println("✅ Migrations up to date")
			return
		}

		// Dirty database: a previous migration failed half-way.
		// Force the version back to the last clean state and retry once.
		var dirtyErr migrate.ErrDirty
		if errors.As(err, &dirtyErr) {
			log.Printf("⚠️  Dirty migration at version %d — forcing back to %d and retrying…",
				dirtyErr.Version, dirtyErr.Version-1)

			if ferr := m.Force(dirtyErr.Version - 1); ferr != nil {
				log.Fatalf("failed to force migration version: %v", ferr)
			}

			if rerr := m.Up(); rerr != nil && rerr.Error() != "no change" {
				log.Fatalf("migration retry failed: %v", rerr)
			}

			log.Println("✅ Migrations applied (recovered from dirty state)")
			return
		}

		log.Fatal("migration failed: ", err)
	}

	log.Println("✅ Migrations applied")
}
