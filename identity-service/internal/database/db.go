package database

import (
	"fmt"

	"github.com/namdang-fdp/seal-copilot/identity-service/internal/config"
	"github.com/namdang-fdp/seal-copilot/identity-service/internal/models"
	"github.com/namdang-fdp/seal-copilot/identity-service/pkg/logger"
	"go.uber.org/zap"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDB() {
	// build connection string
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=%s",
		config.Cfg.DBHost,
		config.Cfg.DBUser,
		config.Cfg.DBPassword,
		config.Cfg.DBName,
		config.Cfg.DBPort,
		config.Cfg.DBSSLMode,
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		logger.Log.Fatal("Panic: Cannot connect to Database", zap.Error(err))
	}

	DB = db
	logger.Log.Info("Successfully connect to database!")

	err = db.AutoMigrate(&models.Role{}, &models.User{})
	if err != nil {
		logger.Log.Fatal("Failed to run AutoMigrate", zap.Error(err))
	}

	logger.Log.Info("Database AutoMigrate completed successfully!")
	SeedData()
}
