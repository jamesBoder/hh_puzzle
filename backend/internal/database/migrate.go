package database

import (
	"database/sql"
	"fmt"
	"io/ioutil"
	"sort"
	"strings"
	"path/filepath"
)

// RunMigrations executes all migration files in order
func RunMigrations(db *sql.DB, migrationsPath string) error {
	// Read migration files
	files, err := ioutil.ReadDir(migrationsPath)
	if err != nil {
		return fmt.Errorf("failed to read migrations directory: %v", err)
	}

	// sort files to ensure order 
	var migrationFiles []string
	for _, file := range files {
		if !file.IsDir() && strings.HasSuffix(file.Name(), ".sql") {
			migrationFiles = append(migrationFiles, file.Name())
		}
	}
	sort.Strings(migrationFiles)

	// execute each migration

	for _, filename := range migrationFiles {
		fmt.Println("Running migration:", filename)

		filePath := filepath.Join(migrationsPath, filename)
		content, err := ioutil.ReadFile(filePath)
		if err != nil {
			return fmt.Errorf("failed to read migration file %s: %v", filename, err)
		}

		// extract the up migration
		migration := extractUpMigration(string(content))

		// execute the migration
		_, err = db.Exec(migration)
		if err != nil {
			return fmt.Errorf("failed to execute migration %s: %v", filename, err)
		}

		fmt.Printf("✓ Migration %s completed\n", filename)
	}
	return nil
}

// extractUpMigration extracts the SQL between +migrate Up and +migrate Down
func extractUpMigration(content string) string {
    lines := strings.Split(content, "\n")
    var migration []string
    inUpSection := false

    for _, line := range lines {
        if strings.Contains(line, "+migrate Up") {
            inUpSection = true
            continue
        }
        if strings.Contains(line, "+migrate Down") {
            break
        }
        if inUpSection {
            migration = append(migration, line)
        }
    }

    return strings.Join(migration, "\n")
}