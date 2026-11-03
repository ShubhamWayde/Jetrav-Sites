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
		if errors.Is(err, migrate.ErrNoChange) {
			log.Println("✅ Migrations up to date")
			return
		}

		// Dirty database: a previous migration failed half-way. Re-running it
		// automatically could apply its first statements twice, so stop and let
		// a human check the schema before forcing the version.
		var dirtyErr migrate.ErrDirty
		if errors.As(err, &dirtyErr) {
			log.Fatalf("❌ migration %d is dirty (failed part-way). Inspect the schema, fix it, then run:\n"+
				"   migrate -path migrations -database \"$DB_URL\" force %d\n"+
				"and restart the server.", dirtyErr.Version, dirtyErr.Version-1)
		}

		log.Fatal("migration failed: ", err)
	}

	log.Println("✅ Migrations applied")
}
